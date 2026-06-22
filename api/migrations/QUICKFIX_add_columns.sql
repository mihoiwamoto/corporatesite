-- クイックフィックス: 最小限のカラム追加
-- 既存のfeedback APIを動作させるために必要な最小限のカラムのみ追加

-- feedback テーブルに新しいカラムを追加
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'feedback',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS assignee VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS notify_on_update BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 確認クエリ
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;
