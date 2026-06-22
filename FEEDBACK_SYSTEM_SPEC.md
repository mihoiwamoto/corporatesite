# フィードバックシステム 実装仕様書

プロトタイプで実装しているフィードバックパネル機能の完全な仕様書です。他のプロジェクトで同じ機能を再現する際の参考にしてください。

---

## 📋 目次

1. [概要](#概要)
2. [機能一覧](#機能一覧)
3. [技術スタック](#技術スタック)
4. [ファイル構成](#ファイル構成)
5. [型定義](#型定義)
6. [コンポーネント仕様](#コンポーネント仕様)
7. [API仕様](#api仕様)
8. [デザイン仕様](#デザイン仕様)
9. [セットアップ手順](#セットアップ手順)
10. [使い方（プロンプト例）](#使い方プロンプト例)

---

## 概要

### 目的
プロトタイプ段階で先方からのフィードバックを効率的に収集・管理するためのシステム。画面上の任意の場所から簡単にフィードバックを送信でき、開発側と先方で双方向にコメントできる仕組み。

### 主な特徴
- **画面右下に固定されたフローティングボタン**（全ページ共通）
- **2つのUI**：投稿用ダイアログ + 管理用オーバーレイパネル
- **リアルタイム絞り込み検索**（ステータス・カテゴリ・ページ・キーワード）
- **双方向コメント機能**（ランステック側・先方側で所属を選択してコメント）
- **連番管理**（No.1, No.2... で参照しやすく）
- **Slack連携**（フィードバック投稿時に自動でSlackに通知。コメントもスレッドに反映）

---

## 機能一覧

### 1. フローティングボタン（`FeedbackButton`）
- 画面右下に固定表示
- クリックでポップアップメニューを表示
  - **「パネルを開く」**：オーバーレイパネルを開く
  - **「フィードバックを送る」**：投稿ダイアログを開く
- パネル展開中は「×」アイコンに変化

### 2. 投稿ダイアログ（`FeedbackDialog`）
- **入力項目**
  - お名前（任意・localStorage保存）
  - カテゴリ（バグ / 改善 / 質問 / 要望）
  - タイトル（必須・120文字）
  - 内容（必須・4000文字）
- **自動記録**
  - 現在のページURL
  - ブラウザ・OS情報（UserAgent）
- **使い方ヘルプ**（ヘルプボタンで切り替え）
  - カテゴリの選び方
  - 内容の書き方のコツ
  - 自動記録される情報
  - 送信後の流れ

### 3. オーバーレイパネル（`FeedbackOverlayPanel`）
- **一覧ビュー**
  - ステータスピル（複数選択可・件数バッジ付き）
  - 検索バー（タイトル・ページ・報告者名で部分一致）
  - 絞り込みトグル（カテゴリ・ページ）
  - 各アイテムに番号・ステータス・ページ・日時・コメント数を表示
- **詳細ビュー**
  - フィードバックの全情報表示
  - ステータス変更（ワンクリック）
  - ページへの直接遷移ボタン
  - コメントスレッド（編集・削除可能）

### 4. コメント機能（`FeedbackCommentThread`）
- 所属選択（ランステック / 西原商会）
- 名前入力（localStorage保存）
- コメント本文（2000文字）
- インライン編集・削除（確認ダイアログ付き）
- 所属ごとに配色を変えて視覚的に区別

### 5. 管理画面（`/admin/feedback`）
- フィードバック一覧をテーブル形式で表示
- ステータス変更・メモ追加・削除機能
- 詳細モーダルでコメントの読み書き

---

## 技術スタック

### フロントエンド
- **Next.js 14+**（App Router）
- **TypeScript**
- **React Context API**（パネルの開閉状態管理）
- **localStorage / sessionStorage**（フィルター状態・名前の保存）

### バックエンド
- **Next.js API Routes**（`/api/feedback`, `/api/feedback/[id]`）
- **Vercel KV**（Redis互換・フィードバックデータの永続化）
- **nanoid**（ID生成）

### 外部連携
- **Slack Webhook**（フィードバック投稿時・コメント追加時にSlackへ通知）

---

## ファイル構成

```
src/
├── types/
│   └── feedback.ts                        # 型定義（カテゴリ・ステータス・FeedbackItem等）
├── lib/
│   ├── feedback-store.ts                  # KVストアへのCRUD処理
│   ├── feedback-overlay.tsx               # Context（パネル開閉状態）
│   ├── feedback-format.ts                 # 表示フォーマット・バッジスタイル
│   └── url-to-page-label.ts               # URLを日本語ページ名に変換
├── components/feedback/
│   ├── FeedbackButton.tsx                 # フローティングボタン
│   ├── FeedbackDialog.tsx                 # 投稿ダイアログ
│   ├── FeedbackOverlayPanel.tsx           # オーバーレイパネル（一覧・詳細）
│   ├── FeedbackCommentThread.tsx          # コメントスレッド
│   └── FeedbackStatusPills.tsx            # ステータス選択ピル
├── app/api/feedback/
│   ├── route.ts                           # POST（新規作成）、GET（一覧取得）
│   └── [id]/route.ts                      # PATCH（更新）、DELETE（削除）
└── app/(app)/admin/feedback/
    ├── page.tsx                           # 管理画面エントリー
    └── FeedbackAdminClient.tsx            # 管理画面のクライアントコンポーネント
```

---

## 型定義

### `FeedbackCategory`
```typescript
export const FEEDBACK_CATEGORIES = ["bug", "improvement", "question", "request"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "バグ",
  improvement: "改善",
  question: "質問",
  request: "要望",
};
```

### `FeedbackStatus`
```typescript
export const FEEDBACK_STATUSES = [
  "open",
  "investigating",
  "in-progress",
  "pending-review",
  "completed",
  "on-hold"
] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "未対応",
  investigating: "調査中",
  "in-progress": "対応中",
  "pending-review": "確認待ち",
  completed: "完了",
  "on-hold": "保留",
};
```

### `FeedbackItem`
```typescript
export type FeedbackItem = {
  id: string;
  seq?: number;                    // 連番（No.1, No.2...）
  title: string;
  category: FeedbackCategory;
  body: string;
  reporterName: string;
  url: string;
  userAgent: string;
  createdAt: string;               // ISO8601
  status: FeedbackStatus;
  memo?: string;                   // 管理側のメモ
  comments?: FeedbackComment[];
  slackThreadTs?: string;          // Slackスレッド用のタイムスタンプ
};
```

### `FeedbackComment`
```typescript
export type CommentRole = "lanstech" | "nishihara";

export type FeedbackComment = {
  id: string;
  role: CommentRole;
  authorName: string;
  body: string;
  createdAt: string;
};
```

---

## コンポーネント仕様

### 1. `FeedbackButton`
**配置場所**：`layout.tsx`（SidebarLayoutの外側）

**Props**: なし

**機能**
- 固定位置：`bottom: 84px; right: 24px;`（safe-area対応）
- ポップアップメニュー（上に展開）
- パネル開閉状態に応じてアイコン切り替え

**注意点**
- `main`要素に`container-type: inline-size`が設定されている場合、内側に置くとfixedがcontainer基準になるため、**必ず外側に配置する**

---

### 2. `FeedbackDialog`
**Props**
```typescript
type Props = {
  open: boolean;
  onClose: () => void;
  currentUrl: string;  // 現在のページURL
};
```

**機能**
- モーダルダイアログ（Portal経由でbodyに描画）
- フォームビュー ⇄ ヘルプビューの切り替え
- 送信時にlocalStorageに名前を保存
- 成功時に連番（No.X）をトーストで表示

**バリデーション**
- タイトル・本文は必須（空白のみ不可）
- カテゴリは選択必須

---

### 3. `FeedbackOverlayPanel`
**配置場所**：`layout.tsx`（SidebarLayoutの外側）

**Context**: `useFeedbackOverlay()`

**機能**
- 右端に固定表示（幅340px）
- 一覧ビュー ⇄ 詳細ビューの切り替え
- フィルター状態をsessionStorageに保存（ページリロードで復元）

**フィルター仕様**
- **ステータス**：複数選択可・ピル形式・件数バッジ付き・常時表示
- **検索**：タイトル・ページ・報告者名で部分一致
- **カテゴリ**：単一選択（すべて / バグ / 改善 / 質問 / 要望）
- **ページ**：単一選択（すべて / 各ページ名）

**一覧表示項目**
- 連番（No.X）
- ステータスバッジ
- ページバッジ
- タイトル
- 報告者名
- コメント数
- 作成日時（M/DD形式）

---

### 4. `FeedbackCommentThread`
**Props**
```typescript
type Props = {
  comments: FeedbackComment[];
  authorName: string;
  onAuthorNameChange: (name: string) => void;
  onSubmit: (body: string, role: CommentRole) => Promise<void>;
  onEditComment?: (commentId: string, body: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isSubmitting?: boolean;
  compact?: boolean;       // コンパクト表示
  stickyForm?: boolean;    // 入力フォームを下部固定
};
```

**機能**
- 所属選択（localStorage保存）
- 名前入力（localStorage保存）
- コメント本文（2000文字・自動高さ調整）
- インライン編集・削除（確認ダイアログ付き）
- 所属ごとの配色（ランステック：紫系、西原商会：緑系）

---

## API仕様

### POST `/api/feedback`
**リクエスト**
```json
{
  "title": "商品名の検索結果が見つけにくい",
  "body": "検索しても該当商品が下の方に表示されて見つけにくい",
  "category": "improvement",
  "reporterName": "田中",
  "url": "/cost-calculation",
  "userAgent": "Mozilla/5.0..."
}
```

**レスポンス**
```json
{
  "item": {
    "id": "abc123",
    "seq": 12,
    "title": "...",
    "category": "improvement",
    "status": "open",
    "createdAt": "2026-06-18T10:30:00.000Z",
    ...
  }
}
```

**処理**
1. 連番を原子的に採番（`kv.incr`）
2. KVに保存
3. Slackに通知（Webhook）
4. SlackのtsをKVに追記

---

### GET `/api/feedback`
**クエリパラメータ**
- `status` (optional): ステータス絞り込み
- `category` (optional): カテゴリ絞り込み

**レスポンス**
```json
{
  "items": [
    { "id": "...", "seq": 12, "title": "...", ... },
    { "id": "...", "seq": 11, "title": "...", ... }
  ]
}
```

---

### PATCH `/api/feedback/[id]`
**リクエスト（ステータス変更）**
```json
{
  "status": "in-progress"
}
```

**リクエスト（コメント追加）**
```json
{
  "comment": {
    "role": "lanstech",
    "authorName": "花本",
    "body": "確認しました。次回のリリースで対応します。"
  }
}
```

**リクエスト（コメント編集）**
```json
{
  "editComment": {
    "commentId": "xyz789",
    "body": "修正しました。"
  }
}
```

**リクエスト（コメント削除）**
```json
{
  "deleteComment": {
    "commentId": "xyz789"
  }
}
```

**処理**
- コメント追加時にSlackのスレッドにも投稿（`slackThreadTs`を使用）

---

### DELETE `/api/feedback/[id]`
**レスポンス**
```json
{
  "success": true
}
```

---

## デザイン仕様

### カラーパレット

#### ステータスバッジ
```typescript
const STATUS_BADGE_STYLE: Record<FeedbackStatus, CSSProperties> = {
  open:             { backgroundColor: "#dbeafe", color: "#1d4ed8" },  // 青
  investigating:    { backgroundColor: "#fed7aa", color: "#c2410c" },  // オレンジ
  "in-progress":    { backgroundColor: "#ccfbf1", color: "#0f766e" },  // ティール
  "pending-review": { backgroundColor: "#ede9fe", color: "#7c3aed" },  // 紫
  completed:        { backgroundColor: "#dcfce7", color: "#15803d" },  // 緑
  "on-hold":        { backgroundColor: "#f1f5f9", color: "#475569" },  // グレー
};
```

#### カテゴリバッジ
```typescript
const CATEGORY_BADGE_STYLE: Record<FeedbackCategory, CSSProperties> = {
  bug:         { backgroundColor: "#fef2f2", color: "#b91c1c" },  // 薄赤
  improvement: { backgroundColor: "#eff6ff", color: "#1d4ed8" },  // 薄青
  question:    { backgroundColor: "#fefce8", color: "#a16207" },  // 薄黄
  request:     { backgroundColor: "#faf5ff", color: "#7e22ce" },  // 薄紫
};
```

#### コメント所属バッジ
```typescript
const ROLE_STYLE: Record<CommentRole, { bg: string; color: string }> = {
  lanstech:  { bg: "#fdf4fb", color: "#BA76AA" },  // 紫系
  nishihara: { bg: "#f0faf4", color: "#009944" },  // 緑系（西原商会のコーポレートカラー）
};
```

### レイアウト寸法
- **パネル幅**：340px
- **ボタン位置**：`bottom: 84px; right: 24px;`
- **ダイアログ最大幅**：520px

---

## セットアップ手順

### 1. 依存パッケージのインストール
```bash
npm install @vercel/kv nanoid
```

### 2. 環境変数の設定（`.env.local`）
```env
# Vercel KV
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# Slack Webhook（任意）
SLACK_FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 3. ファイルのコピー
以下のファイルを新しいプロジェクトにコピー：

```
src/types/feedback.ts
src/lib/feedback-store.ts
src/lib/feedback-overlay.tsx
src/lib/feedback-format.ts
src/components/feedback/FeedbackButton.tsx
src/components/feedback/FeedbackDialog.tsx
src/components/feedback/FeedbackOverlayPanel.tsx
src/components/feedback/FeedbackCommentThread.tsx
src/components/feedback/FeedbackStatusPills.tsx
src/app/api/feedback/route.ts
src/app/api/feedback/[id]/route.ts
```

### 4. `layout.tsx`に追加
```tsx
import { FeedbackOverlayProvider } from "@/lib/feedback-overlay";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import FeedbackOverlayPanel from "@/components/feedback/FeedbackOverlayPanel";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FeedbackOverlayProvider>
          {/* 既存のレイアウト */}
          {children}
          
          {/* フィードバックUI（SidebarLayoutの外側に配置） */}
          <FeedbackButton />
          <FeedbackOverlayPanel />
        </FeedbackOverlayProvider>
      </body>
    </html>
  );
}
```

### 5. `url-to-page-label.ts`の実装
プロジェクト固有のURL→ページ名変換ロジックを実装：

```typescript
export function urlToPageLabel(url: string): string {
  if (url.startsWith("/cost-calculation")) return "原価計算書";
  if (url.startsWith("/sales-plan")) return "販売予定表";
  // ... 各ページのマッピング
  return "その他";
}
```

### 6. Slack連携の設定（任意）
`route.ts`内の`notifySlack`関数を有効化：

```typescript
async function notifySlack(item: FeedbackItem): Promise<string | undefined> {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  const message = {
    text: `新しいフィードバック No.${item.seq}: ${item.title}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*No.${item.seq} ${FEEDBACK_CATEGORY_LABELS[item.category]}*\n${item.title}`
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*報告者*\n${item.reporterName || "（匿名）"}` },
          { type: "mrkdwn", text: `*ページ*\n${urlToPageLabel(item.url)}` }
        ]
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*内容*\n${item.body}` }
      }
    ]
  };
  
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });
  
  if (!res.ok) throw new Error("Slack notification failed");
  
  const data = await res.json();
  return data.ts; // スレッド用のタイムスタンプ
}
```

---

## 使い方（プロンプト例）

### 新規プロジェクトにフィードバックシステムを追加したい場合

**プロンプト例1：完全セットアップ**
```
このプロジェクトにフィードバックシステムを追加してください。
仕様は `/path/to/FEEDBACK_SYSTEM_SPEC.md` を参照してください。

要件：
1. 画面右下にフローティングボタンを配置
2. フィードバック投稿ダイアログの実装
3. オーバーレイパネル（一覧・詳細・絞り込み）の実装
4. コメント機能（所属選択・インライン編集）
5. Vercel KVでのデータ永続化
6. Slack連携（Webhook通知）

既存のファイル構成を維持し、必要なファイルのみ追加してください。
```

**プロンプト例2：段階的な実装**
```
フィードバックシステムを段階的に実装したいです。

Phase 1: 基本的な投稿機能
- フローティングボタン
- 投稿ダイアログ
- API（POST /api/feedback）
- Vercel KVへの保存

Phase 2: 一覧・詳細表示
- オーバーレイパネル
- 一覧ビュー
- 詳細ビュー
- ステータス変更

Phase 3: コメント機能
- コメントスレッド
- インライン編集・削除
- 所属選択

Phase 4: 高度な機能
- 絞り込み検索
- Slack連携
- 管理画面

まずPhase 1から実装してください。
仕様は `/path/to/FEEDBACK_SYSTEM_SPEC.md` を参照してください。
```

**プロンプト例3：既存システムのカスタマイズ**
```
既存のフィードバックシステムをこのプロジェクト用にカスタマイズしてください。

変更点：
1. ステータスを「未対応/対応中/完了」の3種類に簡略化
2. カテゴリに「デザイン」を追加
3. コメントの所属を「開発側/お客様側」に変更
4. パネルの幅を400pxに変更
5. URL→ページ名のマッピングを追加

仕様書: `/path/to/FEEDBACK_SYSTEM_SPEC.md`
既存コード: `src/components/feedback/`, `src/types/feedback.ts`
```

---

## 補足情報

### localStorage / sessionStorageの使用箇所
- **localStorage**
  - `feedback:reporterName`：フィードバック報告者の名前
  - `feedback:comment:role`：コメントの所属（ランステック/西原商会）
- **sessionStorage**
  - `feedback:listFilter`：オーバーレイパネルのフィルター状態

### Vercel KVのキー構造
- `feedback:{id}`：個別フィードバックデータ
- `feedback:index`：Sorted Set（作成日時順の一覧）
- `feedback:seq`：連番カウンタ（原子的インクリメント）

### レスポンシブ対応
- フローティングボタン：safe-area対応（iOS/Androidのノッチ・バー対応）
- ダイアログ：モバイルでは`calc(100dvh - 32px)`でビューポート全体を活用
- オーバーレイパネル：モバイルでは全幅表示（340px固定ではなくフルスクリーン）

### アクセシビリティ
- ダイアログに`role="dialog"`, `aria-modal="true"`, `aria-labelledby`を設定
- キーボード操作対応（Tab移動・Enterで送信）
- フォーカストラップ（ダイアログ内でフォーカスが循環）

---

## ライセンス

このドキュメントと関連コードは、プロジェクト内でのみ使用可能です。外部への転載・再配布は禁止されています。

---

**最終更新日**: 2026-06-18  
**作成者**: Claude Code (Anthropic)  
**プロジェクト**: NISHIHARA TRADE SYSTEM (NTS)
