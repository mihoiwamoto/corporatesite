-- 連番（seq）カラムの追加
-- フィードバックに固定の連番を付与（No.1, No.2, ...）

-- 1. seqカラムを追加
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS seq INTEGER;

-- 2. 既存データに連番を割り当て（作成日時順）
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM feedback
)
UPDATE feedback
SET seq = numbered.row_num
FROM numbered
WHERE feedback.id = numbered.id;

-- 3. seqカラムにNOT NULL制約を追加
ALTER TABLE feedback
ALTER COLUMN seq SET NOT NULL;

-- 4. seqにユニーク制約を追加
ALTER TABLE feedback
ADD CONSTRAINT feedback_seq_unique UNIQUE (seq);

-- 5. seqのインデックスを作成（高速検索用）
CREATE INDEX IF NOT EXISTS idx_feedback_seq ON feedback(seq DESC);

-- 注意: 新規挿入時の連番採番は、アプリケーション側で制御します
-- （Supabaseの場合、シーケンスではなくSELECT MAX(seq)+1を使用）
