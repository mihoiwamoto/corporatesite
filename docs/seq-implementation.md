# 連番（seq）実装ドキュメント

フィードバックシステムに固定連番（No.1, No.2, ...）を追加した実装の記録です。

## 実装日
2026-06-18

## 目的
- フィードバックに固定の連番を付与して、参照しやすくする
- フィルター状態に関係なく、一貫した番号で識別できるようにする

## 変更内容

### 1. データベース（Supabase）

**マイグレーションファイル**: `api/migrations/003_add_seq_column.sql`

```sql
-- seqカラムを追加
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS seq INTEGER;

-- 既存データに連番を割り当て（作成日時順）
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM feedback
)
UPDATE feedback SET seq = numbered.row_num
FROM numbered WHERE feedback.id = numbered.id;

-- NOT NULL制約とユニーク制約を追加
ALTER TABLE feedback ALTER COLUMN seq SET NOT NULL;
ALTER TABLE feedback ADD CONSTRAINT feedback_seq_unique UNIQUE (seq);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_feedback_seq ON feedback(seq DESC);
```

**実行方法**:
Supabase SQL Editorで上記SQLを実行してください。

---

### 2. API（`api/feedback.js`）

#### POST（新規作成）
自動採番処理を追加：

```javascript
// 連番を採番（最大値+1）
const { data: maxSeqData } = await supabase
  .from('feedback')
  .select('seq')
  .order('seq', { ascending: false })
  .limit(1)
  .single();

const nextSeq = maxSeqData?.seq ? maxSeqData.seq + 1 : 1;

const insertData = {
  seq: nextSeq,  // ← 追加
  page,
  label,
  // ... その他のフィールド
};
```

**レスポンス**に`seq`を追加：
```javascript
return res.status(200).json({ ok: true, id: data.id, seq: data.seq });
```

#### GET（一覧取得）
SELECT文に`seq`を追加：

```javascript
let query = supabase
  .from('feedback')
  .select('id, seq, page, label, ...');  // ← seqを追加
```

---

### 3. フロントエンド（`assets/js/feedback-panel-v2.js`）

#### 一覧表示
```javascript
// createListItem関数
var seqNumber = item.seq || '?';

div.innerHTML = `
  <div class="fbp-item-header">
    <span class="fbp-item-number">No.${seqNumber}</span>
    // ...
  </div>
`;
```

#### 詳細表示
```javascript
// showDetail関数
var seqNumber = item.seq || '?';

bodyEl.innerHTML = `
  <div class="fbp-detail">
    <div class="fbp-detail-header">
      <div class="fbp-detail-meta-top">
        <span class="fbp-detail-number">No.${seqNumber}</span>
        // ...
      </div>
    </div>
  </div>
`;
```

#### フォーム送信成功メッセージ
```javascript
// handleFormSubmit関数
var successEl = document.getElementById('fbp-form-success');
successEl.textContent = `✓ フィードバックを送信しました（No.${data.seq || '?'}）`;
successEl.style.display = 'block';
```

---

## 動作確認

### ✅ 確認項目

1. **マイグレーション実行**
   - Supabase SQL Editorで`003_add_seq_column.sql`を実行
   - 既存データに連番が割り当てられることを確認

2. **新規投稿**
   - フィードバックを投稿
   - 成功メッセージに「No.X」が表示されることを確認
   - DBで`seq`が正しく採番されていることを確認

3. **一覧表示**
   - 各アイテムに「No.X」が表示されることを確認
   - フィルターを変更しても連番が変わらないことを確認

4. **詳細表示**
   - 詳細画面で「No.X」が表示されることを確認
   - 正しい連番が表示されることを確認

---

## 注意事項

### 採番の競合について
現在の実装では`SELECT MAX(seq) + 1`で採番していますが、同時に複数のリクエストが来た場合、同じ連番が割り当てられる可能性があります。

**対策**:
- Supabaseのユニーク制約（`feedback_seq_unique`）により、重複は防止されます
- エラーが発生した場合は、リトライする仕組みが望ましい

**将来の改善案**:
```javascript
// リトライ処理付き採番
async function getNextSeq(supabase, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const { data: maxSeqData } = await supabase
      .from('feedback')
      .select('seq')
      .order('seq', { ascending: false })
      .limit(1)
      .single();
    
    const nextSeq = maxSeqData?.seq ? maxSeqData.seq + 1 : 1;
    
    try {
      // ユニーク制約チェック付きで採番
      return nextSeq;
    } catch (error) {
      if (error.code === '23505' && i < maxRetries - 1) {
        // ユニーク制約違反の場合はリトライ
        continue;
      }
      throw error;
    }
  }
}
```

---

## まとめ

✅ **実装完了**:
- データベースに`seq`カラムを追加
- API（POST/GET）で`seq`の採番・取得
- UI（一覧・詳細・送信成功メッセージ）で`seq`を表示

✅ **メリット**:
- フィードバックを一貫した番号で参照可能
- フィルター状態に関係なく、固定の識別子として利用可能
- 口頭やメールでの参照が容易（「No.15の件」など）

✅ **今後の改善案**:
- 採番の競合処理（リトライ機構）
- 連番でのソート機能
- 連番での検索機能
