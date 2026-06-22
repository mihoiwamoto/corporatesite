-- 既存フィードバックに拡張データを追加するマイグレーション
-- 実行日: 2026-06-18
-- 目的: 既存の13件のフィードバックに type, priority, tags, email などを設定

-- ================================================================
-- 1. 既存フィードバックにタイプ・優先度・タグを設定
-- ================================================================

-- トップページ関連のフィードバック（ID: f4ac335c, da67dfef, 16344ef5, c839aea9, 42ff399e）
UPDATE feedback
SET
  type = 'feature',
  priority = 'high',
  tags = ARRAY['デザイン', 'トップページ', 'ビジュアル'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true
WHERE id = 'f4ac335c-a258-416a-ac0d-f868625551c3'; -- メインビジュアル・動画

UPDATE feedback
SET
  type = 'feature',
  priority = 'high',
  tags = ARRAY['コピー', 'トップページ'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true
WHERE id = 'da67dfef-8031-45c5-9d94-24ca63a978e8'; -- キャッチコピー

UPDATE feedback
SET
  type = 'feature',
  priority = 'medium',
  tags = ARRAY['デザイン', 'トップページ', '西原商会'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true
WHERE id = '16344ef5-3dbe-4fae-97f3-41af4faed65f'; -- 西原カラー

UPDATE feedback
SET
  type = 'question',
  priority = 'low',
  tags = ARRAY['お知らせ', 'トップページ'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true
WHERE id = 'c839aea9-01f8-4954-94ff-c1a17b1bd241'; -- お知らせセクション

UPDATE feedback
SET
  type = 'feature',
  priority = 'medium',
  tags = ARRAY['トップページ', '事業内容'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true
WHERE id = '42ff399e-4900-447c-8ce8-ed8d397f259a'; -- 事業内容

-- 採用情報関連のフィードバック（ID: 577ff688, 9fd291db, 1c18027a, e8602c02）
UPDATE feedback
SET
  type = 'feature',
  priority = 'high',
  tags = ARRAY['採用', 'コンテンツ'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true
WHERE id = '577ff688-28aa-4301-86d9-41aadc1e01f1'; -- 社員インタビュー

UPDATE feedback
SET
  type = 'feature',
  priority = 'medium',
  tags = ARRAY['採用', 'コンテンツ'],
  email = 'ashizawa@lanstech.co.jp',
  notify_on_update = true
WHERE id = '9fd291db-33e8-4b6a-815b-e6a86bfcc5d6'; -- メンバー紹介ページ

UPDATE feedback
SET
  type = 'feature',
  priority = 'medium',
  tags = ARRAY['採用', 'デザイン', 'VALUES'],
  email = 'ashizawa@lanstech.co.jp',
  notify_on_update = true
WHERE id = '1c18027a-8232-452c-901c-21853c746acf'; -- VALUES 目立たせる

UPDATE feedback
SET
  type = 'bug',
  priority = 'low',
  tags = ARRAY['採用', 'デザイン', 'CSS'],
  email = 'ashizawa@lanstech.co.jp',
  notify_on_update = true
WHERE id = 'e8602c02-3918-4535-bec4-2344de996ad1'; -- セクション色の交互

-- 事業内容関連（ID: 023c5879）
UPDATE feedback
SET
  type = 'feature',
  priority = 'high',
  tags = ARRAY['事業内容', '技術スタック'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true,
  assignee = '花本'
WHERE id = '023c5879-dea4-4904-bbd7-d6056d5ed3f9'; -- 開発言語・ツール

-- お問い合わせ関連（ID: fadfaff6, bbadf604）
UPDATE feedback
SET
  type = 'feature',
  priority = 'urgent',
  tags = ARRAY['問い合わせ', '採用', 'UI'],
  email = 'arai@lanstech.co.jp',
  notify_on_update = true,
  assignee = '足澤'
WHERE id = 'fadfaff6-f471-4ca4-9d5b-516d2a3f4e0e'; -- 採用サイトへの導線

UPDATE feedback
SET
  type = 'question',
  priority = 'medium',
  tags = ARRAY['問い合わせ', '事業方針'],
  email = 'ashizawa@lanstech.co.jp',
  notify_on_update = true
WHERE id = 'bbadf604-cf69-4545-8101-4f4e6831be3b'; -- 開発相談の要否

-- お知らせ関連（ID: fccae0a1）
UPDATE feedback
SET
  type = 'feature',
  priority = 'high',
  tags = ARRAY['お知らせ', 'AI', '採用'],
  email = 'ashizawa@lanstech.co.jp',
  notify_on_update = true,
  assignee = '荒井'
WHERE id = 'fccae0a1-0235-4dc1-8f45-0d3765ce6eb0'; -- AI活用アピール

-- ================================================================
-- 2. サンプルコメントを追加
-- ================================================================

-- メインビジュアル・動画のフィードバックにコメント
INSERT INTO feedback_comments (feedback_id, author, author_email, body, created_at) VALUES
('f4ac335c-a258-416a-ac0d-f868625551c3', '花本', 'hanamoto@lanstech.co.jp', '動画素材は既に撮影済みです。編集して組み込みましょう。', NOW() - INTERVAL '2 hours'),
('f4ac335c-a258-416a-ac0d-f868625551c3', '荒井', 'arai@lanstech.co.jp', 'いいですね！ローディング時間が気になるので、軽量化もお願いします。', NOW() - INTERVAL '1 hour');

-- キャッチコピーのフィードバックにコメント
INSERT INTO feedback_comments (feedback_id, author, author_email, body, created_at) VALUES
('da67dfef-8031-45c5-9d94-24ca63a978e8', '松本', 'matsumoto@lanstech.co.jp', '「1%の業務効率化が数億円の利益」は具体的で良いですね！数字の根拠を添えるとさらに説得力が増すかも。', NOW() - INTERVAL '3 hours'),
('da67dfef-8031-45c5-9d94-24ca63a978e8', '足澤', 'ashizawa@lanstech.co.jp', '西原商会の実績を具体例として載せられるといいですね。', NOW() - INTERVAL '2 hours');

-- 社員インタビューのフィードバックにコメント
INSERT INTO feedback_comments (feedback_id, author, author_email, body, created_at) VALUES
('577ff688-28aa-4301-86d9-41aadc1e01f1', '花本', 'hanamoto@lanstech.co.jp', 'インタビュー撮影のスケジュール調整しますね。', NOW() - INTERVAL '4 hours'),
('577ff688-28aa-4301-86d9-41aadc1e01f1', '荒井', 'arai@lanstech.co.jp', 'ありがとうございます！できれば今週中にお願いしたいです。', NOW() - INTERVAL '3 hours'),
('577ff688-28aa-4301-86d9-41aadc1e01f1', '小林', 'kobayashi@lanstech.co.jp', 'インタビュー対象者のリストアップしましたので共有します。', NOW() - INTERVAL '1 hour');

-- 開発言語・ツールのフィードバックにコメント
INSERT INTO feedback_comments (feedback_id, author, author_email, body, created_at) VALUES
('023c5879-dea4-4904-bbd7-d6056d5ed3f9', '花本', 'hanamoto@lanstech.co.jp', '技術スタックのセクション追加しました。Next.js, TypeScript, PHP, Laravel などを掲載予定です。', NOW() - INTERVAL '30 minutes');

-- 採用サイトへの導線のフィードバックにコメント
INSERT INTO feedback_comments (feedback_id, author, author_email, body, created_at) VALUES
('fadfaff6-f471-4ca4-9d5b-516d2a3f4e0e', '足澤', 'ashizawa@lanstech.co.jp', '採用ページへのフローティングボタン実装します。デザイン案を共有しますね。', NOW() - INTERVAL '5 hours'),
('fadfaff6-f471-4ca4-9d5b-516d2a3f4e0e', '荒井', 'arai@lanstech.co.jp', 'お願いします！目立つけど邪魔にならないデザインでお願いします。', NOW() - INTERVAL '4 hours');

-- AI活用アピールのフィードバックにコメント
INSERT INTO feedback_comments (feedback_id, author, author_email, body, created_at) VALUES
('fccae0a1-0235-4dc1-8f45-0d3765ce6eb0', '荒井', 'arai@lanstech.co.jp', '確かに！お知らせセクションに「AI活用事例」の記事を定期的に投稿するのはどうでしょう？', NOW() - INTERVAL '2 hours'),
('fccae0a1-0235-4dc1-8f45-0d3765ce6eb0', '井坂', 'isaka@lanstech.co.jp', '良いですね。Claude Code の活用事例や、AI駆動開発のブログ記事を書きましょう。', NOW() - INTERVAL '1 hour');

-- ================================================================
-- 3. いくつかのフィードバックのステータスを更新
-- ================================================================

-- 対応中に変更
UPDATE feedback
SET status = '対応中', updated_at = NOW()
WHERE id IN (
  '023c5879-dea4-4904-bbd7-d6056d5ed3f9', -- 開発言語・ツール（花本担当）
  'fadfaff6-f471-4ca4-9d5b-516d2a3f4e0e'  -- 採用サイトへの導線（足澤担当）
);

-- 対応済みに変更
UPDATE feedback
SET status = '対応済み', updated_at = NOW()
WHERE id IN (
  'f4ac335c-a258-416a-ac0d-f868625551c3'  -- メインビジュアル・動画
);

-- ================================================================
-- 4. 確認クエリ
-- ================================================================

-- 更新されたフィードバックを確認
-- SELECT
--   id,
--   LEFT(suggestion, 30) as suggestion,
--   type,
--   priority,
--   assignee,
--   tags,
--   status,
--   (SELECT COUNT(*) FROM feedback_comments WHERE feedback_id = feedback.id) as comment_count
-- FROM feedback
-- ORDER BY created_at DESC;

COMMENT ON COLUMN feedback.type IS '✅ 既存データに設定完了: bug（バグ報告）, feature（機能リクエスト）, question（質問）, feedback（一般）';
COMMENT ON COLUMN feedback.priority IS '✅ 既存データに設定完了: low（低）, medium（中）, high（高）, urgent（緊急）';
COMMENT ON COLUMN feedback.tags IS '✅ 既存データに設定完了: デザイン, 採用, トップページ, 事業内容, AI 等';
COMMENT ON COLUMN feedback.assignee IS '✅ 担当者をいくつかのフィードバックに設定済み';
