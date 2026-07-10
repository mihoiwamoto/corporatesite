# Lanstech デザインガイドライン

**対象**: 株式会社ランステック コーポレートサイト
**最終更新**: 2026年7月10日
**基準**: 実装済み CSS（`assets/css/`）に準拠

> このドキュメントは実装されている CSS トークン・パターンをそのまま記述したものです。新規ページ・要素を追加する際は、以下のトークンとルールを再利用してください。

---

## 1. ブランドアイデンティティ

### Mission
> 業務に溶け込む、システムをつくる。

企画・要件定義から設計・開発、保守・運用までワンストップで対応。システムは納品後もお客様の業務の中で生き続ける、という思想を軸にする。

### トーン & マナー
| 特性 | 表現への落とし込み |
|------|------|
| プロフェッショナル | 余白を広く取り、情報密度を上げすぎない |
| 信頼性 | 落ち着いたインク色のテキスト、控えめな影 |
| 一貫性 | 全ページで同一のトークン・共通クラスを使用 |
| 先進性 | 繊細なアニメーション、グラデーション、タイピング演出 |
| 誠実 | 過度な装飾を避け、可読性を最優先 |

---

## 2. カラーシステム

全ページ共通で `:root` に定義。**色の直書きは禁止**、必ず変数を参照する。

### プライマリ（ピンク）
コーポレートカラー。CTA・強調・ブランド表現に使用。
```css
--pink:          #D4637E;  /* メインアクション / ブランド */
--pink-dark:     #B84A66;  /* ホバー / 強調 */
--pink-light:    #FDF2F5;  /* 淡い背景 / アイコン地色 */
--pink-gradient: #F9E4EC;  /* グラデーション用 */
```

### セカンダリ（グリーン）
成長・安定・技術を示す補助色。アクセント、成功状態に使用。
```css
--green:       #1A9D57;
--green-dark:  #147A44;
--green-light: #ECF7F1;
```

### ニュートラル
```css
--ink:      #243040;  /* 見出し・本文の基本色 */
--sub:      #4A5568;  /* 補足テキスト / リード文 */
--bg:       #ffffff;  /* 基本背景 */
--bg-soft:  #F7F8FA;  /* セクション背景 / 淡いカード */
--line:     #E8ECF0;  /* ボーダー / 区切り線 */
```

### 状態色
```css
--red: #E53935;  /* フォームエラー等（contact のみ定義） */
```

### 使い分けの原則
- **テキスト**: 見出し・本文は `--ink`、補足は `--sub`
- **CTA / ブランド**: `--pink`、ホバーで `--pink-dark`
- **アクセント / 成功**: `--green` 系
- **背景の切り替え**: 白と `--bg-soft` を交互に使いリズムを作る
- グリーンとピンクを同一要素で競合させない（主役は常にピンク）

---

## 3. タイポグラフィ

### フォントファミリー
Google Fonts から読み込む。`<head>` で以下を preconnect + 読み込み。
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Outfit:wght@700&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap" rel="stylesheet">
```

| 用途 | ファミリー | 補足 |
|------|-----------|------|
| 本文・基本 | `'Noto Sans JP', 'Hiragino Sans', sans-serif` | 全体のベース |
| 英字見出し・ロゴ | `'Outfit', sans-serif` | 数字・英語のディスプレイ用（700） |
| リード / サブ見出し | `'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif` | やわらかい印象の日本語 |
| コード表現 | `'Courier New', monospace` | 装飾的なコードモチーフ |

### ベース設定
```css
body {
  font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
  font-size: 16px;
  color: var(--ink);
  line-height: 1.8;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### タイプスケール（共通クラス）
```css
.eyebrow {              /* セクション上部の小ラベル */
  font-size: 11px; font-weight: 700;
  color: var(--pink-dark);
  letter-spacing: .25em; text-transform: uppercase;
  margin-bottom: 20px;
}
h2.title {              /* セクション見出し */
  font-size: 38px; font-weight: 700;
  line-height: 1.5; letter-spacing: -.02em;
  margin-bottom: 24px;
}
p.lead {                /* リード文 */
  font-size: 16px; color: var(--sub);
  line-height: 2.0; max-width: 640px;
}
```

- **ファーストビュー h1**: `font-size: clamp(2.5rem, 7.2vw, 6rem)` / `'Outfit'` / `line-height: 1.26`
- 見出しは詰め気味（`letter-spacing: -.02em`）、本文は広め（`line-height: 1.8〜2.0`）
- ウェイトは 300 / 400 / 500 / 700 の4段階のみ

---

## 4. スペーシング & レイアウト

### コンテナ
```css
--maxw: 1200px;   /* 標準（interview のみ 1360px） */
.wrap { max-width: var(--maxw); margin: 0 auto; padding: 0 40px; }
```

### セクション余白
縦リズムは 3段階。基本は 120px、詰める場合 100px / 80px。
```css
section { padding: 120px 0; }   /* 標準 */
/* 100px 0 … やや詰め   80px 0 … コンパクト */
section.soft { background: linear-gradient(180deg, var(--bg-soft) 0%, #ffffff 100%); }
section[id] { scroll-margin-top: 96px; }  /* アンカー用オフセット */
```

### 角丸
```css
--radius: 12px;   /* カード等の標準 */
/* ボタン等の完全な丸みは border-radius: 9999px */
```

---

## 5. エレベーション（影）

4段階。用途に応じて使い分ける。
```css
--shadow-sm: 0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.06);   /* カード通常時 */
--shadow-md: 0 4px 16px rgba(0,0,0,.05), 0 2px 6px rgba(0,0,0,.04);  /* 軽いホバー */
--shadow-lg: 0 12px 40px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04);/* カードホバー */
--shadow-xl: 0 20px 60px rgba(0,0,0,.08), 0 8px 20px rgba(0,0,0,.04);/* 強い浮き */
```
- 影は常に低コントラスト（黒の不透明度 4〜8%）。強い影・濃い影は使わない。
- ピンクボタンのみカラーシャドウ可: `box-shadow: 0 4px 16px rgba(212,99,126,.2)`

---

## 6. コンポーネント

### ボタン
```css
.btn { padding: 18px 40px; border-radius: 9999px; font-size: 15px;
       font-weight: 500; letter-spacing: .02em;
       transition: all .35s cubic-bezier(.4,0,.2,1); }

.btn-primary { background: var(--pink); color: #fff;
               box-shadow: 0 4px 16px rgba(212,99,126,.2); }
.btn-primary:hover { background: var(--pink-dark); transform: translateY(-2px);
                     box-shadow: 0 8px 28px rgba(212,99,126,.3); }

.btn-ghost { background: transparent; color: var(--ink);
             border: 1.5px solid var(--line); }
.btn-ghost:hover { background: var(--bg-soft); border-color: var(--pink);
                   color: var(--pink); transform: translateY(-2px);
                   box-shadow: var(--shadow-md); }
```
- 主 CTA は `.btn-primary`、対の副アクションは `.btn-ghost`。
- ホバーは `translateY(-2px)` で持ち上げる（全コンポーネント共通の作法）。

### カード
```css
.card { background: #fff; border: 1px solid var(--line);
        border-radius: var(--radius); padding: 32px;
        box-shadow: var(--shadow-sm);
        transition: all .4s cubic-bezier(.4,0,.2,1); }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg);
              border-color: transparent; }
```

### アイコンリンク（円形）
```css
.icon-link { width: 48px; height: 48px; border-radius: 50%;
             background: var(--pink-light); color: var(--pink); }
.icon-link:hover { background: var(--pink); color: #fff; transform: scale(1.1);
                   box-shadow: 0 6px 20px rgba(212,99,126,.3); }
.icon-link:active { transform: scale(0.92); }
```

---

## 7. モーション

### イージング
共通のイージングは `cubic-bezier(.4,0,.2,1)`（ease-out 系）。
| 用途 | duration |
|------|----------|
| アイコン・小要素 | `.3s` |
| ボタン | `.35s` |
| カード | `.4s` |

### 原則
- ホバーの浮き上がりは `translateY(-2px 〜 -6px)`、押下は `scale(0.92)`。
- ファーストビューにはタイピング演出（`.fv-typed`）、グラデーション文字（`.fv-hl`）を使用。
- **必ず `prefers-reduced-motion` に対応**（既存 CSS 4ファイルで実装済み）:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 8. レスポンシブ

### ブレークポイント
実装で使われている順に、以下を標準とする。
| 幅 | 用途 |
|------|------|
| `max-width: 768px` | **主要**。タブレット縦〜スマホ。レイアウト再構成 |
| `max-width: 480px` | スマホ小。フォント・余白の微調整 |
| `max-width: 900px` / `1024px` | 中間調整（必要時のみ） |
| `min-width: 1440px` / `1920px` | 大画面での拡大 |

### 原則
- モバイルでは `.wrap` の padding を縮小、セクション余白を 120px → 80px 前後に。
- ファーストビュー h1 は `clamp()` で流動的にスケール（メディアクエリ不要）。
- グリッドは 768px 以下で 1カラムに落とす。

---

## 9. アクセシビリティ

```css
:focus-visible { outline: 2px solid var(--pink); outline-offset: 3px; }
```
- フォーカスリングを消さない（`:focus-visible` で明示）。
- テキストは `--ink` / `--sub` を使い、`--bg` 上でコントラストを確保。
- 装飾目的の要素は `pointer-events: none` / `aria-hidden` を付与。
- `prefers-reduced-motion` を尊重（第7章）。

---

## 10. 実装ルール（チェックリスト）

新規ページ / 要素を追加するときは以下を守る。

- [ ] `:root` のトークンを**丸ごとコピー**して再利用（色・角丸・影・maxw）
- [ ] 色・余白・影はハードコードせず変数を参照
- [ ] Google Fonts の読み込みタグを `<head>` に含める
- [ ] セクションは `.wrap` でラップし `padding: 120px 0` を基本に
- [ ] 見出しは `.eyebrow` + `h2.title`、リードは `p.lead`
- [ ] ボタンは `.btn` + `.btn-primary` / `.btn-ghost`
- [ ] ホバーは `translateY(-2px)` + `cubic-bezier(.4,0,.2,1)`
- [ ] `max-width: 768px` のレスポンシブ対応を必ず実装
- [ ] `:focus-visible` と `prefers-reduced-motion` を維持

---

## 付録: ファイル構成

| CSS | 対象ページ |
|------|-----------|
| `index.css` | トップ（`:root` の正本） |
| `about.css` / `service.css` / `recruit.css` | 各下層ページ |
| `news.css` / `news-article.css` | ニュース一覧 / 記事 |
| `interview.css` | インタビュー（`--maxw: 1360px`） |
| `contact.css` / `privacy.css` / `thanks.css` | フォーム / 規約系 |
| `header.css` / `footer.css` | 共通ヘッダー・フッター |
| `background.css` / `orb.css` / `threads.css` 他 | 背景・演出エフェクト |
