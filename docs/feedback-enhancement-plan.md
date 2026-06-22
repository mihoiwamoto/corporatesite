# フィードバック機能拡張計画

## 実装日: 2026-06-18

## 概要
既存のSupabaseベースのフィードバックシステムを拡張し、以下の機能を追加します：
- コメントスレッド機能
- フィードバックタイプ分類（バグ報告・機能リクエスト・質問・その他）
- 優先度設定
- 担当者アサイン
- タグ管理
- 投稿者向けダッシュボード
- メール通知機能（Slack通知は除外）

## データベーススキーマ設計

### 1. 既存 `feedback` テーブル拡張

```sql
-- 既存カラム（保持）
id, page, label, original, suggestion, author, created_at, status

-- 新規追加カラム
ALTER TABLE feedback
ADD COLUMN type VARCHAR(50) DEFAULT 'feedback',  -- 'bug', 'feature', 'question', 'feedback'
ADD COLUMN priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
ADD COLUMN assignee VARCHAR(100),                 -- 担当者名（将来的にユーザーテーブルとリンク）
ADD COLUMN tags TEXT[],                           -- タグ配列
ADD COLUMN email VARCHAR(255),                    -- 投稿者メールアドレス（通知用）
ADD COLUMN notify_on_update BOOLEAN DEFAULT true, -- ステータス変更時に通知を受け取るか
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();    -- 更新日時
```

### 2. 新規 `feedback_comments` テーブル

```sql
CREATE TABLE feedback_comments (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_comments_feedback_id ON feedback_comments(feedback_id);
```

### 3. 新規 `feedback_notifications` テーブル（通知履歴）

```sql
CREATE TABLE feedback_notifications (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'status_change', 'new_comment', 'assigned'
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

CREATE INDEX idx_feedback_notifications_feedback_id ON feedback_notifications(feedback_id);
CREATE INDEX idx_feedback_notifications_status ON feedback_notifications(status);
```

## API設計

### 既存APIの拡張: `/api/feedback.js`

#### GET /api/feedback
- **クエリパラメータ追加**:
  - `?type=bug` - タイプ別フィルタ
  - `?priority=high` - 優先度フィルタ
  - `?assignee=山田` - 担当者フィルタ
  - `?tags=デザイン` - タグフィルタ
  - `?author_email=user@example.com` - 投稿者メールでフィルタ

#### POST /api/feedback
- **リクエストボディ追加**:
  ```json
  {
    "type": "bug",
    "priority": "high",
    "email": "user@example.com",
    "notify_on_update": true,
    "tags": ["デザイン", "トップページ"]
  }
  ```

#### PATCH /api/feedback?id=123
- **リクエストボディ追加**:
  ```json
  {
    "assignee": "山田",
    "priority": "urgent",
    "tags": ["緊急", "修正中"]
  }
  ```
- ステータス変更時に自動でメール通知を送信

### 新規API: `/api/comments.js`

#### GET /api/comments?feedback_id=123
- 指定したフィードバックのコメント一覧を取得

#### POST /api/comments
```json
{
  "feedback_id": 123,
  "author": "山田太郎",
  "author_email": "yamada@example.com",
  "body": "コメント内容"
}
```

#### PATCH /api/comments?id=456
```json
{
  "body": "更新後のコメント"
}
```

#### DELETE /api/comments?id=456
- 自分のコメントを削除

### 新規API: `/api/notify.js`

#### POST /api/notify
```json
{
  "feedback_id": 123,
  "type": "status_change",
  "recipients": ["user@example.com"]
}
```

メール送信にはVercel Edge Functionsを使用し、Resend APIまたはSendGrid APIと連携します。

## UI設計

### 1. フィードバック投稿フォーム拡張

**review-mode.js の変更点**:
- タイプ選択（バグ報告・機能リクエスト・質問・その他）
- 優先度選択（低・中・高・緊急）
- メールアドレス入力欄（任意）
- 「更新を通知する」チェックボックス
- 画像添付機能（Supabase Storageと連携）

### 2. 投稿者向けダッシュボード（新規）

**my-feedback.html**:
- 自分が投稿したフィードバックの一覧
- ステータス別フィルタ
- 各フィードバックのコメントスレッド表示
- 編集・削除機能
- メール通知設定の変更

### 3. 管理画面の機能強化

**review-admin.html の追加機能**:
- タイプ・優先度・担当者によるフィルタリング
- タグ管理UI
- 担当者アサインUI
- コメントスレッド表示・返信機能
- 一括操作（一括ステータス変更・一括アサインなど）

### 4. コメントスレッドコンポーネント

**新規ファイル: /assets/js/comment-thread.js**

貿易システムの `CommentList.tsx` を参考に、vanilla JSで実装:
- コメント一覧表示
- 新規コメント投稿
- 自分のコメント編集・削除
- 投稿者ごとの色分けアバター

## メール通知設計

### 通知トリガー
1. **ステータス変更時**: 投稿者にメール送信
2. **新規コメント投稿時**: 投稿者と過去のコメント投稿者にメール送信
3. **担当者アサイン時**: 担当者にメール送信

### メールテンプレート

#### ステータス変更通知
```
件名: [ランステック] フィードバックのステータスが更新されました

{author} 様

ご投稿いただいたフィードバックのステータスが更新されました。

【フィードバック】
{label} - {page}

【ステータス】
{old_status} → {new_status}

詳細はこちら:
{url}

---
株式会社ランステック
```

#### 新規コメント通知
```
件名: [ランステック] フィードバックに新しいコメントが投稿されました

{author} 様

ご投稿いただいたフィードバックに新しいコメントが投稿されました。

【フィードバック】
{label} - {page}

【コメント】
{commenter}: {body_preview}

詳細はこちら:
{url}

---
株式会社ランステック
```

## 実装順序

1. ✅ 既存システム調査
2. ⏳ データベーススキーマ設計
3. Supabaseマイグレーション実行
4. コメントAPI実装
5. 既存feedback API拡張
6. メール通知API実装
7. コメントスレッドコンポーネント実装
8. 投稿フォームUI拡張
9. 投稿者ダッシュボード作成
10. 管理画面機能強化
11. 動作確認とテスト

## 後方互換性の確保

- 既存の `feedback` テーブルのデータは全て保持
- 新規カラムは全てDEFAULT値を設定し、既存レコードに影響なし
- 既存APIのレスポンス形式は維持（新規フィールドを追加）
- フロントエンドは段階的に機能追加
