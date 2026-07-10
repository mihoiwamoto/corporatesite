# Lanstech フォントサイズ・ガイドライン（タイプスケール）

**対象**: 株式会社ランステック コーポレートサイト
**最終更新**: 2026年7月10日
**基準**: 実装済み CSS（`assets/css/`）から実測・集計

> 本ドキュメントは実装で使われているフォントサイズを役割ごとに体系化したもの。新規要素は下表のいずれかのステップに寄せ、中間値の乱立を避ける。

---

## 0. 原則

### 基準サイズ（必須）
| 役割 | サイズ |
|------|:--:|
| **本文** | **16px** |
| **注釈** | **14px** |
| **タグ** | **12px** |

- **本文の基準は 16px**（`body`）。すべてのサイズはこの基準からの相対で捉える。
- 大見出し（ヒーロー・セクションタイトル）は **`clamp()` で流動化**し、メディアクエリでの上書きを最小化する。
- 小さい UI テキスト（ラベル・キャプション）は **letter-spacing を広げ**、大きい見出しは **詰める**（`-.02em`前後）。
- サイズは下記スケールから選ぶ。`13.5px` `14.5px` のような半端値は原則使わない（既存の例外は微調整目的のみ）。

---

## 1. タイプスケール一覧

固定サイズの体系。数値は px。使用頻度は実装での出現数（多い＝サイト全体の基調）。

| Step | サイズ | 主な用途 | ウェイト | 使用頻度 |
|------|-------|---------|---------|:--:|
| **Display** | 52–96px | ページヒーロー h1、装飾大見出し | 700–800 | 大画面のみ |
| **H1** | 42–52px | 下層ページのページタイトル | 700 | 中 |
| **H2** | 38px | セクション見出し（`h2.title`） | 700 | 高 |
| **H3** | 24–30px | サブ見出し・カードタイトル | 700 | 高 |
| **H4** | 20–22px | 小見出し・強調リード | 500–700 | 中 |
| **Body L** | 18px | やや大きい本文・重要な段落 | 400 | 中 |
| **Body** | **16px** | 標準本文・リード文（基準） | 400 | 最多 |
| **Body S** | 15px | 密度の高い本文・ボタン・リスト | 400–500 | 最多 |
| **注釈 (Caption)** | **14px** | 注釈・補足・メタ情報 | 400 | 高 |
| **Label** | 13px | ラベル・日付 | 500–700 | 高 |
| **タグ (Tag)** | **12px** | タグ・小ラベル | 500–700 | 高 |
| **Micro** | 11px | eyebrow・最小ラベル | 700 | 中 |
| **Micro XS** | 9–10px | 装飾コード・極小注記 | 600 | 低 |

> **使用頻度の実態**: `15px`(73) `16px`(66) `14px`(61) `12px`(61) `13px`(60) `11px`(45) が全体の基調。**12〜16px の帯がサイト本文の中心**で、見出しはその上に段階的に積み上がる。

---

## 2. 見出し（Heading）

### Display / ヒーロー h1
最大の視覚的インパクト。`clamp()` で流動化する。
```css
/* トップページ FV */
.fv h1 {
  font-family: 'Outfit', 'Noto Sans JP', sans-serif;
  font-size: clamp(2.5rem, 7.2vw, 6rem);   /* 40px → 96px */
  font-weight: 700; line-height: 1.26; letter-spacing: -.025em;
}
```
- 英字主体の見出しは `'Outfit'`。
- 装飾用の巨大英字（背景の飾り文字）は `clamp(100px, 16vw, 220px)` / `font-weight: 800` / 低不透明度。

### H1 / ページタイトル
下層ページのヒーロー見出し。
```css
.page-hero h1 { font-size: clamp(34px, 5vw, 52px);
                font-weight: 700; line-height: 1.35; letter-spacing: -.02em; }
```

### H2 / セクション見出し（`h2.title`）
サイトで最も多用される見出し。**基準は 38px**。
```css
h2.title { font-size: 38px; font-weight: 700;
           line-height: 1.5; letter-spacing: -.02em; margin-bottom: 24px; }

/* 流動版（下層ページで使用） */
h2.title { font-size: clamp(28px, 3.5vw, 38px); }
/* モバイル */
@media (max-width: 768px) { h2.title { font-size: clamp(1.75rem, 1.25rem + 1.5vw, 2.25rem); } }
```

### H3 / サブ見出し・カードタイトル
```css
/* 24〜30px。カードや小節の見出し */
.card-title { font-size: 24px; font-weight: 700; line-height: 1.5; }
```

### H4 / 小見出し
```css
/* 20〜22px。強調したいリードや小節タイトル */
font-size: 20px; font-weight: 500; line-height: 1.6;
```

---

## 3. 本文・UI テキスト（Body / UI）

### Body（16px・基準）
```css
body { font-size: 16px; line-height: 1.8; font-weight: 400; }
p.lead { font-size: 16px; color: var(--sub); line-height: 2.0; max-width: 640px; }
```
- 通常の段落は `line-height: 1.8`、リード文は `2.0` とやや広げる。

### Body S（15px）
ボタン・密度の高いテキストの標準。
```css
.btn { font-size: 15px; font-weight: 500; }
```

### 注釈 / Caption（14px）
注釈・補足・メタ情報。
```css
font-size: 14px; color: var(--sub); line-height: 1.7;
```

### Label（13px）
日付・小さな UI ラベル。字間をやや広げる。
```css
font-size: 13px; font-weight: 500; letter-spacing: .02em;
```

### タグ / Tag（12px）
タグ・カテゴリラベル。
```css
font-size: 12px; font-weight: 500; letter-spacing: .02em;
```

### Micro（11px）— eyebrow
セクション上部の小ラベル。**大文字＋広い字間**が定石。
```css
.eyebrow { font-size: 11px; font-weight: 700;
           letter-spacing: .25em; text-transform: uppercase;
           color: var(--pink-dark); }
```

### Micro XS（9–10px）
装飾的なコードモチーフ、極小の注記のみ。本文には使わない。

---

## 4. 行間（line-height）の対応表

サイズが大きいほど行間は詰める。

| 役割 | サイズ帯 | line-height |
|------|---------|:--:|
| Display / ヒーロー | 40px+ | 1.26–1.35 |
| セクション見出し | 30–38px | 1.5 |
| サブ見出し | 20–28px | 1.5–1.6 |
| 本文 | 16px | 1.8 |
| リード文 | 16px | 2.0 |
| 注釈・タグ・ラベル | 11–14px | 1.5–1.7 |

---

## 5. 字間（letter-spacing）の対応表

| 役割 | letter-spacing |
|------|:--:|
| Display / 大見出し | `-.025em 〜 -.02em`（詰める） |
| セクション見出し | `-.02em` |
| サブ見出し | `-.01em` |
| 本文 | `0`（既定） |
| ボタン・ラベル | `.02em` |
| eyebrow / 極小ラベル | `.25em`（大きく開ける） |

---

## 6. レスポンシブ方針

- **見出しは `clamp(最小, ビューポート比, 最大)` を第一選択**にし、メディアクエリでの上書きを減らす。
  - 例: `clamp(28px, 3.5vw, 38px)`（H2）、`clamp(34px, 5vw, 52px)`（H1）
- 固定サイズの本文・UI は、必要に応じて `max-width: 768px` / `480px` で 1〜2px 下げる程度に留める。
- モバイルでヒーロー h1 は改行許可（`white-space: normal; text-wrap: wrap`）に切り替える。

### clamp の目安（実装で使われている代表値）
| 役割 | clamp |
|------|------|
| トップ FV h1 | `clamp(2.5rem, 7.2vw, 6rem)` |
| 下層ページ h1 | `clamp(34px, 5vw, 52px)` |
| セクション H2 | `clamp(28px, 3.5vw, 38px)` |
| サブ見出し | `clamp(22px, 2.6vw, 28px)` |
| リード / サブ | `clamp(1.0625rem, 0.9rem + 0.6vw, 1.375rem)` |

---

## 7. チェックリスト

- [ ] 新規テキストのサイズは §1 のスケールから選んだか（半端値を作っていないか）
- [ ] 見出しは `clamp()` で流動化したか
- [ ] サイズに応じた line-height / letter-spacing を §4・§5 から適用したか
- [ ] eyebrow は 11px / 700 / `.25em` / uppercase になっているか
- [ ] 本文は 16px・`line-height: 1.8` を基準にしているか
- [ ] `!important` での強制上書きを増やしていないか（既存の例外を除く）
