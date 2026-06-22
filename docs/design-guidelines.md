# Lanstech Design System

**Version**: 1.0  
**最終更新**: 2025年6月22日  
**対象**: 株式会社ランステック コーポレートサイト

---

## 1. Brand Identity

### Mission
「業務に溶け込む、システムをつくる。」

企画・要件定義から設計・開発、保守・運用まで、ワンストップで対応します。システムは納品した後も、お客様の仕事の中で生き続けます。

### Target Audience
- **一次**: 西原商会グループ各社の情報システム部門・経営企画部門
- **二次**: グループ外のシステム開発ニーズを持つ企業（食品流通・製造業）
- **三次**: システムエンジニア・開発者（採用対象）

### Brand Personality

| 特性 | 説明 |
|------|------|
| **プロフェッショナル** | 企画から運用まで一貫した品質保証 |
| **信頼性** | 西原商会グループの安定した経営基盤 |
| **一貫性** | 分業せず、同じチームが最後まで担当 |
| **先進性** | AIツール活用による効率化 |
| **誠実** | 業務の課題に真摯に向き合う姿勢 |

---

## 2. Color System

### Primary Colors

#### Pink（メインカラー）
```css
--pink:        #E07898  /* Primary actions, brand identity */
--pink-dark:   #C0587A  /* Hover states, emphasis */
--pink-light:  #FBF0F4  /* Backgrounds, badges, subtle accents */
```

**使用用途**:
- プライマリCTA（お問い合わせ、採用応募等）
- ブランドアイデンティティ要素（ロゴ、アイコン）
- ホバーステート（リンク、ボタン）
- ラベル・バッジ背景

#### Green（セカンダリカラー）
```css
--green:       #009944  /* Nishihara Group affiliation */
--green-dark:  #007a36  /* Hover/active states */
--green-light: #eaf5ef  /* Backgrounds for group context */
```

**使用用途**:
- 西原商会グループ関連要素
- グループセクションのアクセント
- 環境・安定性を象徴する場面

### Neutral Colors

```css
--ink:         #1a2633  /* Primary text */
--sub:         #5a6872  /* Secondary text, captions */
--bg:          #ffffff  /* Primary background */
--bg-soft:     #f8f9fa  /* Section backgrounds */
--line:        #e5e7eb  /* Borders, dividers */
```

**使用ルール**:
- **本文**: `var(--ink)` - 高コントラストで可読性確保
- **説明文・キャプション**: `var(--sub)` - 階層的に情報を整理
- **背景の交互配置**: `#fff` → `var(--bg-soft)` → `#fff` でセクション区切り

### Semantic Colors

```css
--red: #E53935  /* Errors, required fields */
```

---

## 3. Typography

### Font Family

```css
font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
```

**理由**:  
- Noto Sans JP: Googleフォント、読みやすく現代的
- Hiragino Sans: macOSフォールバック
- 日本語に最適化されたサンセリフで統一

### Font Weights

| Weight | 用途 |
|--------|------|
| **300 (Light)** | 本文（説明文、リード文）|
| **400 (Regular)** | 標準テキスト |
| **500 (Medium)** | ナビゲーション、小見出し |
| **700 (Bold)** | 見出し、強調要素 |

### Type Scale

| 要素 | サイズ | Weight | Line Height | 用途 |
|------|--------|--------|-------------|------|
| **Display (H1)** | 68px | 700 | 1.35 | FVメインヘッドライン |
| **H2 (Title)** | 36px | 700 | 1.5 | セクションタイトル |
| **H3** | 20-26px | 700 | 1.5-1.6 | サブセクション、カード見出し |
| **Body Large** | 18px | 300 | 2.1 | FVサブテキスト |
| **Body** | 15-16px | 300-400 | 2.0 | 本文、説明文 |
| **Small** | 13-14px | 400 | 1.75 | カード内テキスト |
| **Caption** | 12px | 400-500 | 1.5 | Eyebrow、ラベル |
| **Tiny** | 11px | 500 | 1.4 | バッジ、メタ情報 |

### Typography Usage Rules

#### 見出し
- **Letter-spacing**: -0.01em ~ -0.03em（大きな見出しほどタイト）
- **Color**: `var(--ink)` または グラデーション効果
- **Margin-bottom**: 見出しサイズの0.5-0.7倍

#### 本文
- **Font-weight**: 300 (Light) を基本に
- **Line-height**: 2.0以上で読みやすさ確保
- **Max-width**: 520-640px（1行の最適文字数: 50-70文字）

#### Eyebrow（上付きラベル）
- **Size**: 12px
- **Weight**: 500
- **Transform**: uppercase
- **Letter-spacing**: 0.2em
- **Color**: `var(--sub)`
- **Margin-bottom**: 20px

---

## 4. Spacing System

### Base Unit
**8px grid system** を採用

### Spacing Scale

| 値 | CSS変数 | 用途 |
|----|---------|------|
| 4px | `--space-xs` | アイコン間、tight spacing |
| 8px | `--space-sm` | 小要素間 |
| 16px | `--space-md` | カード内余白、標準gap |
| 24px | `--space-lg` | セクション内要素間 |
| 32px | `--space-xl` | カード間、グループ間 |
| 48px | `--space-2xl` | サービスカード間 |
| 64px | `--space-3xl` | ラップ左右padding（デスクトップ） |
| 80px | `--space-4xl` | セクション上下margin |
| 120px | `--space-5xl` | 大セクション上部padding |
| 180px | `--space-6xl` | セクションpadding（デスクトップ） |

### Section Padding

**デスクトップ**:
```css
section { padding: 180px 0; }
```

**モバイル**:
```css
section { padding: 100px 0; }
```

### Wrap/Container

**Max-width**: `1200px`  
**Horizontal padding**: `64px`（デスクトップ）/ `32px`（モバイル）

---

## 5. Components

### 5.1 Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--pink);
  color: #fff;
  padding: 18px 40px;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: rgba(26,38,51,.1) 0px 6px 24px 0px;
  transition: all .2s;
}
.btn-primary:hover {
  background: var(--pink-dark);
  box-shadow: rgba(26,38,51,.15) 0px 8px 32px 0px;
}
```

**使用場面**: お問い合わせ、資料ダウンロード、採用応募等の主要CTA

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--ink);
  padding: 18px 40px;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 500;
  transition: all .2s;
}
.btn-ghost:hover {
  background: var(--bg-soft);
}
```

**使用場面**: 詳細ページへの遷移、セカンダリアクション

#### Circular Link Button
```css
.service-link {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--pink-light);
  color: var(--pink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.service-link:hover {
  background: var(--pink);
  color: #fff;
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(224,120,152,.25);
}
```

**使用場面**: サービスカード内のナビゲーション

---

### 5.2 Cards

#### Service Card
```css
.service-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 56px;
  transition: border-color .3s, box-shadow .3s;
}
.service-item:hover {
  border-color: var(--pink);
  box-shadow: 0 8px 32px rgba(224,120,152,.08);
}
```

**構成要素**:
- `.service-label`: ピンク背景のバッジ
- `h3`: サービス名（20-26px）
- `.service-catch`: キャッチコピー（26px, bold）
- `.service-desc`: 説明文（15px, light）
- `.service-link`: 円形リンクボタン
- `.service-visual`: 画像（4:3比率）

#### Job Card（採用）
```css
.job-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 36px 40px;
  transition: border-color .3s;
}
.job-card:hover {
  border-color: var(--pink);
}
```

---

### 5.3 Badges & Labels

#### Service Label
```css
.service-label {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: var(--pink);
  background: var(--pink-light);
  padding: 6px 14px;
  border-radius: 4px;
}
```

#### Eyebrow
```css
.eyebrow {
  font-size: 12px;
  font-weight: 500;
  color: var(--sub);
  letter-spacing: .2em;
  text-transform: uppercase;
}
```

#### Job Badge
```css
.job-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--pink-light);
  color: var(--pink);
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}
```

---

### 5.4 Navigation

#### Site Nav（Header）
```css
.site-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(16px);
  height: 80px;
}
```

**要素**:
- ロゴ（左寄せ、height: 30px）
- ナビリンク（中央、font-size: 14px, weight: 400）
- CTAボタン（右寄せ、ピンク背景）
- ハンバーガーメニュー（モバイル）

---

## 6. Layout Patterns

### 6.1 Grid System

#### 2-Column Layout
```css
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60-100px;
}
```

**使用場面**: About, Group, Services（デスクトップ）

#### 3-Column Layout（廃止）
※現在は使用していない。サービスは縦積み2カラムに変更済み。

---

### 6.2 Section Structure

#### 標準セクション
```html
<section class="section-name">
  <div class="wrap">
    <p class="eyebrow">SECTION NAME</p>
    <hr class="section-divider">
    <h2 class="title">セクションタイトル</h2>
    <p class="lead">リード文...</p>
    <!-- コンテンツ -->
  </div>
</section>
```

#### 背景色の交互配置
```css
section { background: #fff; }
section.soft { background: var(--bg-soft); }
```

**パターン**:  
FV(白) → About(白) → Services(soft) → Group(白) → Recruit(soft) → News(白)

---

### 6.3 Breakpoints

| Size | Width | 用途 |
|------|-------|------|
| Mobile | < 768px | スマートフォン |
| Tablet | 768px - 1024px | タブレット、小型ノートPC |
| Desktop | > 1024px | デスクトップ |
| Large | > 1440px | 大画面（vw単位でスケール） |

---

## 7. Animation & Interaction

### 7.1 Transitions

#### 標準トランジション
```css
transition: all .2s;
```

#### ホバーアニメーション
```css
transition: all .25s cubic-bezier(.4,0,.2,1);
```

### 7.2 Scroll Reveals

#### Reveal Class
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity .6s ease-out, transform .6s ease-out;
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}
```

#### Delay Classes
```css
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
```

### 7.3 Hover States

#### リンク
```css
a:hover { color: var(--pink); }
```

#### ボタン
- Primary: 背景を`--pink-dark`に、シャドウ強化
- Ghost: 背景を`--bg-soft`に
- Circular: 背景を`--pink`に、1.08倍スケール

#### カード
```css
.card:hover {
  border-color: var(--pink);
  box-shadow: 0 8px 32px rgba(224,120,152,.08);
}
```

---

## 8. Imagery

### 8.1 Photography Style

**トーン**: クリーン、プロフェッショナル、自然光  
**色調**: ナチュラル、高コントラスト避ける  
**対象**: オフィス風景、チームワーク、画面作業

### 8.2 Illustrations

**スタイル**: シンプルな線画またはジオメトリック  
**色**: ピンク・グリーンを基調  
**用途**: サービス説明、概念図

**既存アセット**:
- `service-planning.svg`
- `service-development.svg`
- `service-operation.svg`

### 8.3 Icons

**スタイル**: Feather Icons風（2px stroke, rounded）  
**サイズ**: 16px, 20px, 24px（用途に応じて）  
**色**: `currentColor`（親要素のcolorを継承）

---

## 9. Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--pink);
  outline-offset: 3px;
}
```

### Color Contrast
- 本文: `--ink` (#1a2633) on white → **AAA**
- サブテキスト: `--sub` (#5a6872) on white → **AA以上**

### Semantic HTML
- `<section>`, `<article>`, `<nav>` を適切に使用
- `<h1>`-`<h6>` の階層を正しく
- `<button>` vs `<a>` を用途に応じて区別

### ARIA
- モバイルメニュー: `aria-expanded`
- アイコンのみボタン: `aria-label`

---

## 10. Performance

### Image Optimization
- **Format**: WebP優先、PNG/JPGフォールバック
- **Retina**: @2x画像を用意
- **Lazy loading**: スクロール位置に応じて読み込み

### CSS
- **Minify**: 本番環境では圧縮
- **Critical CSS**: Above the fold のCSSをインライン化検討

### Fonts
- **Preconnect**: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- **Display**: `font-display: swap`

---

## 11. File Structure

```
lanstech-corporatesite/
├── index.html                 # トップページ
├── about.html                 # 会社概要
├── service.html               # 事業内容
├── recruit.html               # 採用情報
├── news.html                  # お知らせ一覧
├── contact.html               # お問い合わせ
├── privacy.html               # プライバシーポリシー
├── assets/
│   ├── images/
│   │   ├── lanstech_logo_yoko.svg
│   │   ├── nishihara_logo.svg
│   │   ├── service-*.svg
│   │   └── bg-lines.svg
│   ├── css/                   # (将来的に分離検討)
│   └── js/
│       ├── main.js            # スクロールアニメーション等
│       └── feedback-panel-v2.js
└── docs/
    ├── design-guidelines.md   # このファイル
    ├── design-research.md     # BtoB SaaS調査レポート
    └── image-board.md         # イメージボード（次作成）
```

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-06-22 | 初版作成。カラー統一後の状態を文書化 |

---

## 13. References

- **参考サイト**: SmartHR, LayerX, freee, Sansan, Notion
- **調査レポート**: `/docs/design-research.md`
- **カラーパレット**: Coolors.co で検証済み
- **タイポグラフィ**: Type Scale (https://typescale.com/) 参考

---

**作成者**: Claude  
**レビュー**: 要確認  
**次回更新**: ビジュアル刷新後に改訂予定
