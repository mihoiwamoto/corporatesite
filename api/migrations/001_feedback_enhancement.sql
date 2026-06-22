-- フィードバック機能拡張マイグレーション
-- 実行日: 2026-06-18
-- 目的: 既存データを保持しつつ、コメント機能・タイプ分類・優先度・担当者・タグ機能を追加

-- ================================================================
-- 1. 既存 feedback テーブルの拡張
-- ================================================================

-- 新規カラム追加（既存データに影響を与えないようDEFAULT値を設定）
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'feedback'
  CHECK (type IN ('bug', 'feature', 'question', 'feedback')),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium'
  CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS assignee VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS notify_on_update BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- updated_at自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- feedback テーブルのupdated_at自動更新トリガー
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- インデックス追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_assignee ON feedback(assignee);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- ================================================================
-- 2. コメント機能用テーブル作成
-- ================================================================

CREATE TABLE IF NOT EXISTS feedback_comments (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT feedback_comments_body_not_empty CHECK (body <> '')
);

-- コメント数カウント用のインデックス
CREATE INDEX IF NOT EXISTS idx_feedback_comments_feedback_id ON feedback_comments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_created_at ON feedback_comments(created_at);

-- コメントのupdated_at自動更新トリガー
DROP TRIGGER IF EXISTS update_feedback_comments_updated_at ON feedback_comments;
CREATE TRIGGER update_feedback_comments_updated_at
BEFORE UPDATE ON feedback_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 3. 通知履歴テーブル作成
-- ================================================================

CREATE TABLE IF NOT EXISTS feedback_notifications (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('status_change', 'new_comment', 'assigned', 'mention')),
  subject VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  CONSTRAINT feedback_notifications_recipient_not_empty CHECK (recipient_email <> '')
);

CREATE INDEX IF NOT EXISTS idx_feedback_notifications_feedback_id ON feedback_notifications(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_notifications_status ON feedback_notifications(status);
CREATE INDEX IF NOT EXISTS idx_feedback_notifications_sent_at ON feedback_notifications(sent_at);

-- ================================================================
-- 4. 便利なビュー作成（コメント数を含むフィードバック一覧）
-- ================================================================

CREATE OR REPLACE VIEW feedback_with_comment_count AS
SELECT
  f.*,
  COALESCE(c.comment_count, 0) AS comment_count
FROM feedback f
LEFT JOIN (
  SELECT feedback_id, COUNT(*) AS comment_count
  FROM feedback_comments
  GROUP BY feedback_id
) c ON f.id = c.feedback_id;

-- ================================================================
-- 5. RLS (Row Level Security) ポリシー設定
-- ================================================================

-- 既存のポリシーを削除（もし存在すれば）
DROP POLICY IF EXISTS "Allow public read access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public insert access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public update access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public delete access to feedback" ON feedback;

-- 新規ポリシー（全ての操作を許可 - APIレイヤーで制御）
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on feedback"
ON feedback FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- コメントテーブルのRLS
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on feedback_comments"
ON feedback_comments FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 通知テーブルのRLS（API経由のみアクセス可能）
ALTER TABLE feedback_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on feedback_notifications"
ON feedback_notifications FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ================================================================
-- 6. データ整合性確認用の関数
-- ================================================================

-- 特定のフィードバックのコメント数を取得
CREATE OR REPLACE FUNCTION get_comment_count(p_feedback_id INTEGER)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM feedback_comments WHERE feedback_id = p_feedback_id;
$$ LANGUAGE SQL STABLE;

-- 特定のフィードバックの未送信通知数を取得
CREATE OR REPLACE FUNCTION get_pending_notification_count(p_feedback_id INTEGER)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM feedback_notifications
  WHERE feedback_id = p_feedback_id AND status = 'pending';
$$ LANGUAGE SQL STABLE;

-- ================================================================
-- 7. マイグレーション完了確認用クエリ
-- ================================================================

-- マイグレーション後に実行して確認
-- SELECT
--   'feedback' AS table_name,
--   column_name,
--   data_type,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'feedback'
-- ORDER BY ordinal_position;

COMMENT ON TABLE feedback IS 'フィードバック・バグ報告・機能リクエストなどを管理するメインテーブル';
COMMENT ON TABLE feedback_comments IS 'フィードバックに対するコメントスレッドを管理するテーブル';
COMMENT ON TABLE feedback_notifications IS 'メール通知の送信履歴を管理するテーブル';

COMMENT ON COLUMN feedback.type IS 'フィードバックのタイプ: bug（バグ報告）, feature（機能リクエスト）, question（質問）, feedback（一般的なフィードバック）';
COMMENT ON COLUMN feedback.priority IS '優先度: low（低）, medium（中）, high（高）, urgent（緊急）';
COMMENT ON COLUMN feedback.assignee IS '担当者名（将来的にユーザーテーブルと連携予定）';
COMMENT ON COLUMN feedback.tags IS 'タグの配列（例: ["デザイン", "トップページ", "緊急"]）';
COMMENT ON COLUMN feedback.email IS '投稿者のメールアドレス（通知用・任意）';
COMMENT ON COLUMN feedback.notify_on_update IS 'ステータス変更時にメール通知を受け取るかどうか';
