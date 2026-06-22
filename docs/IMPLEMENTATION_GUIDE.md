# フィードバック機能拡張 実装ガイド

## 📋 実装済み項目

✅ **データベーススキーマ設計完了**
- マイグレーションSQL: [`/api/migrations/001_feedback_enhancement.sql`](../api/migrations/001_feedback_enhancement.sql)
- 既存データを保持しつつ、新しいカラムとテーブルを追加

✅ **APIエンドポイント実装完了**
- [`/api/feedback.js`](../api/feedback.js) - 既存APIを拡張（タイプ・優先度・担当者・タグ対応）
- [`/api/comments.js`](../api/comments.js) - コメント機能の新規API
- [`/api/notify.js`](../api/notify.js) - メール通知API（Resend使用）

## 🚀 実装手順

### ステップ1: Supabaseマイグレーション実行

#### 1-1. スキーマ拡張（必須）

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. 「New Query」をクリック
5. [`/api/migrations/001_feedback_enhancement.sql`](../api/migrations/001_feedback_enhancement.sql) の内容を貼り付け
6. 「Run」をクリックして実行

#### 1-2. 既存データへの拡張データ追加（推奨）

既存の13件のフィードバックにタイプ・優先度・タグ・コメントを追加:

1. 「New Query」をクリック
2. [`/api/migrations/002_populate_enhanced_data.sql`](../api/migrations/002_populate_enhanced_data.sql) の内容を貼り付け
3. 「Run」をクリックして実行

**このマイグレーションで追加される内容:**
- ✅ 全13件にタイプ（bug/feature/question）を設定
- ✅ 全13件に優先度（low/medium/high/urgent）を設定
- ✅ 全13件に関連タグを設定（デザイン、採用、トップページ等）
- ✅ 投稿者のメールアドレスを設定（荒井さん、足澤さん等）
- ✅ いくつかのフィードバックに担当者をアサイン
- ✅ 主要なフィードバックに合計13件のコメントを追加
- ✅ いくつかのステータスを更新（未対応→対応中→対応済み）

**確認クエリ:**
```sql
-- 新しいカラムが追加されたか確認
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- コメントテーブルが作成されたか確認
SELECT * FROM feedback_comments LIMIT 1;

-- 通知テーブルが作成されたか確認
SELECT * FROM feedback_notifications LIMIT 1;
```

### ステップ2: 環境変数の設定

`.env.local` ファイルに以下を追加:

```bash
# Supabase（既存）
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend API（メール通知用・新規）
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_FROM_EMAIL=noreply@lanstech.co.jp
SITE_URL=https://lanstech.co.jp

# 管理者キー（既存）
ADMIN_KEY=your_admin_key
```

**Resend APIキーの取得方法:**
1. https://resend.com/ でアカウント作成
2. ダッシュボードから「API Keys」→「Create API Key」
3. キーをコピーして `.env.local` に設定

### ステップ3: APIのデプロイ

Vercelにデプロイ済みの場合:

```bash
# 環境変数を設定
vercel env add RESEND_API_KEY
vercel env add NOTIFICATION_FROM_EMAIL
vercel env add SITE_URL

# デプロイ
vercel --prod
```

### ステップ4: 動作確認

#### 4-1. コメントAPI確認

```bash
# コメント投稿テスト
curl -X POST https://your-site.vercel.app/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_id": 1,
    "author": "テストユーザー",
    "author_email": "test@example.com",
    "body": "テストコメント"
  }'

# コメント一覧取得
curl "https://your-site.vercel.app/api/comments?feedback_id=1"
```

#### 4-2. 拡張されたフィードバックAPI確認

```bash
# タイプ付きフィードバック投稿
curl -X POST https://your-site.vercel.app/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "page": "トップページ",
    "label": "ヘッダー",
    "text": "テストフィードバック",
    "author": "テストユーザー",
    "type": "bug",
    "priority": "high",
    "email": "user@example.com",
    "tags": ["デザイン", "緊急"]
  }'

# タイプでフィルタ
curl "https://your-site.vercel.app/api/feedback?type=bug"

# 優先度でフィルタ
curl "https://your-site.vercel.app/api/feedback?priority=high"
```

#### 4-3. メール通知API確認

```bash
# ステータス変更通知テスト
curl -X POST https://your-site.vercel.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_id": 1,
    "type": "status_change",
    "recipients": ["your-email@example.com"],
    "old_status": "未対応",
    "new_status": "対応中"
  }'
```

## 🎨 UI実装（未完了・今後の作業）

### 残りの実装タスク

#### 1. review-mode.js の拡張
- [ ] タイプ選択ドロップダウン追加（バグ報告・機能リクエスト・質問・その他）
- [ ] 優先度選択追加（低・中・高・緊急）
- [ ] メールアドレス入力欄追加
- [ ] 「更新を通知する」チェックボックス追加
- [ ] タグ入力欄追加

**実装場所:** [`/assets/js/review-mode.js`](../assets/js/review-mode.js)

**参考実装:**
```javascript
// フォーム内に追加
'<div>' +
  '<label class="rv-label" for="rv-type">種別</label>' +
  '<select class="rv-input" id="rv-type">' +
    '<option value="feedback">フィードバック</option>' +
    '<option value="bug">バグ報告</option>' +
    '<option value="feature">機能リクエスト</option>' +
    '<option value="question">質問</option>' +
  '</select>' +
'</div>' +
'<div>' +
  '<label class="rv-label" for="rv-priority">優先度</label>' +
  '<select class="rv-input" id="rv-priority">' +
    '<option value="low">低</option>' +
    '<option value="medium" selected>中</option>' +
    '<option value="high">高</option>' +
    '<option value="urgent">緊急</option>' +
  '</select>' +
'</div>' +
'<div>' +
  '<label class="rv-label" for="rv-email">メールアドレス（任意・通知用）</label>' +
  '<input class="rv-input" id="rv-email" type="email" placeholder="example@lanstech.co.jp">' +
'</div>'
```

**送信時の変更:**
```javascript
fetch('/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    page: pageTitle,
    label: loc,
    current: cur,
    text: text,
    author: author,
    type: document.getElementById('rv-type').value,
    priority: document.getElementById('rv-priority').value,
    email: document.getElementById('rv-email').value.trim() || null,
    notify_on_update: true,
  }),
})
```

#### 2. コメントスレッドコンポーネント実装

新規ファイル: `/assets/js/comment-thread.js`

貿易システムの [`CommentList.tsx`](../../Library/CloudStorage/OneDrive-株式会社ランステック/貿易システム/src/components/ui/CommentList.tsx) を参考に、vanilla JSで実装。

**主な機能:**
- コメント一覧表示（時系列順）
- 投稿者ごとのアバター表示（色分け）
- 新規コメント投稿フォーム
- 自分のコメント編集・削除

#### 3. 投稿者向けダッシュボード

新規ファイル: `/my-feedback.html`

**主な機能:**
- 自分が投稿したフィードバック一覧
- メールアドレスでフィルタ（URLパラメータまたはlocalStorage）
- ステータス別タブ
- 各フィードバックの詳細とコメントスレッド表示
- 編集・削除機能

#### 4. 管理画面の機能強化

既存ファイル: [`/review-admin.html`](../review-admin.html)

**追加機能:**
- タイプ・優先度・担当者でフィルタリング
- タグ管理UI
- 担当者アサインUI
- コメントスレッド表示
- 一括操作（一括ステータス変更など）

## 📊 データ構造

### feedback テーブル（拡張後）

| カラム名 | 型 | 説明 | デフォルト値 |
|---------|---|------|------------|
| id | INTEGER | ID | AUTO |
| page | VARCHAR | ページ名 | |
| label | VARCHAR | 箇所ラベル | |
| original | TEXT | 元の内容 | |
| suggestion | TEXT | フィードバック内容 | |
| author | VARCHAR | 投稿者名 | '匿名' |
| **type** | VARCHAR | タイプ（bug/feature/question/feedback） | 'feedback' |
| **priority** | VARCHAR | 優先度（low/medium/high/urgent） | 'medium' |
| **assignee** | VARCHAR | 担当者名 | NULL |
| **tags** | TEXT[] | タグ配列 | [] |
| **email** | VARCHAR | 投稿者メールアドレス | NULL |
| **notify_on_update** | BOOLEAN | 通知を受け取るか | true |
| status | VARCHAR | ステータス | '未対応' |
| created_at | TIMESTAMP | 作成日時 | NOW() |
| **updated_at** | TIMESTAMP | 更新日時 | NOW() |

### feedback_comments テーブル（新規）

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | SERIAL | ID |
| feedback_id | INTEGER | フィードバックID（外部キー） |
| author | VARCHAR | コメント投稿者名 |
| author_email | VARCHAR | コメント投稿者メール |
| body | TEXT | コメント本文 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### feedback_notifications テーブル（新規）

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | SERIAL | ID |
| feedback_id | INTEGER | フィードバックID（外部キー） |
| recipient_email | VARCHAR | 受信者メールアドレス |
| type | VARCHAR | 通知タイプ（status_change/new_comment/assigned） |
| subject | VARCHAR | メール件名 |
| body | TEXT | メール本文 |
| sent_at | TIMESTAMP | 送信日時 |
| status | VARCHAR | 送信ステータス（pending/sent/failed） |
| error_message | TEXT | エラーメッセージ（失敗時） |

## 🔧 トラブルシューティング

### マイグレーションが失敗する

- エラーメッセージを確認
- `IF NOT EXISTS` が使われているため、再実行は安全
- テーブル名やカラム名の typo がないか確認

### メール通知が送信されない

1. RESEND_API_KEY が正しく設定されているか確認
2. NOTIFICATION_FROM_EMAIL が Resend で認証されたドメインか確認
3. Resend ダッシュボードでログを確認
4. `feedback_notifications` テーブルでエラーメッセージを確認:
   ```sql
   SELECT * FROM feedback_notifications WHERE status = 'failed';
   ```

### コメントが表示されない

1. ブラウザのコンソールでエラーを確認
2. `/api/comments?feedback_id=1` に直接アクセスしてAPIが動作しているか確認
3. Supabase RLS（Row Level Security）ポリシーが正しく設定されているか確認

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Resend API Documentation](https://resend.com/docs)
- [貿易システムのCommentList実装](../../Library/CloudStorage/OneDrive-株式会社ランステック/貿易システム/src/components/ui/CommentList.tsx)

## ⚠️ 注意事項

### セキュリティ

- 本番環境では必ず `.env.local` を `.gitignore` に追加
- Resend API キーは秘匿情報として扱う
- Supabase の RLS ポリシーを適切に設定
- ADMIN_KEY は強力なランダム文字列を使用

### パフォーマンス

- フィードバック一覧取得時はページネーションを検討（現在は全件取得）
- コメント数が多い場合は一覧ページでは件数のみ表示
- 画像添付機能を追加する場合は Supabase Storage を使用し、ファイルサイズ制限を設ける

### データ整合性

- 既存データは全て保持され、新しいカラムはDEFAULT値が設定される
- マイグレーション前にバックアップを推奨
- `updated_at` は自動更新トリガーで管理される

## 🎯 今後の拡張案

- [ ] ユーザー認証機能（Supabase Auth連携）
- [ ] 画像添付機能（Supabase Storage）
- [ ] フィードバックの検索機能
- [ ] エクスポート機能（CSV/PDF）
- [ ] ダッシュボードでの統計表示
- [ ] Webhook連携（外部ツールへの通知）
- [ ] カスタムフィールド機能

## 📝 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-06-18 | 1.0.0 | 初版リリース・API実装完了 |
