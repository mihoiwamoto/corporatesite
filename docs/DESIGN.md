---
version: alpha
name: Lanstech
description: Corporate marketing design system for lanstech.co.jp. Minimal white-first layout, dark text, pink accent, clean card UI, and Japanese-first typography. Restrained, trustworthy tone for a group-internal IT company.
colors:
  primary: "#E07898"
  primary-dark: "#C0587A"
  primary-light: "#FBF0F4"
  secondary: "#333333"
  sub: "#666666"
  tertiary: "#e0e0e0"
  neutral: "#ffffff"
  surface: "#ffffff"
  surface-soft: "#f5f5f5"
  on-surface: "#333333"
  background: "#ffffff"
  text: "#333333"
  green: "#009944"
  green-dark: "#007a36"
  green-light: "#eaf5ef"
typography:
  headline-display:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "Hiragino Kaku Gothic ProN"
      - "Meiryo"
      - "sans-serif"
    fontSize: "42px"
    fontWeight: 700
    lineHeight: "1.45"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "1.5"
    letterSpacing: "0"
  headline-md:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "1.5"
    letterSpacing: "0"
  headline-sm:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "1.6"
    letterSpacing: "0"
  body-lg:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.85"
    letterSpacing: "0"
  body-md:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.75"
    letterSpacing: "0"
  body-sm:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.75"
    letterSpacing: "0"
  label-lg:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "1.5"
    letterSpacing: "0.03em"
  label-md:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "1.5"
    letterSpacing: "0.03em"
  label-sm:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.5"
    letterSpacing: "0.12em"
  eyebrow:
    fontFamily: "Noto Sans JP"
    fontFallbacks:
      - "Hiragino Sans"
      - "sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.5"
    letterSpacing: "0.12em"
    textTransform: "uppercase"
    color: "#E07898"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "56px"
  xl: "88px"
  xxl: "120px"
components:
  button:
    primary:
      backgroundColor: "{colors.primary}"
      color: "#ffffff"
      borderColor: "transparent"
      borderRadius: "{rounded.sm}"
      borderWidth: "0px"
      borderStyle: "none"
      padding: "14px 32px"
      fontSize: "14px"
      fontWeight: 700
      minWidth: "0px"
      minHeight: "0px"
      textDecoration: "none"
      boxShadow: "none"
      fontFamily: "Noto Sans JP"
      hoverBackground: "{colors.primary-dark}"
    secondary:
      backgroundColor: "#ffffff"
      color: "{colors.on-surface}"
      borderColor: "{colors.on-surface}"
      borderRadius: "{rounded.sm}"
      borderWidth: "1.5px"
      borderStyle: "solid"
      padding: "14px 32px"
      fontSize: "14px"
      fontWeight: 700
      minWidth: "0px"
      minHeight: "0px"
      textDecoration: "none"
      boxShadow: "none"
      fontFamily: "Noto Sans JP"
      hoverBackground: "{colors.surface-soft}"
    dark:
      backgroundColor: "{colors.secondary}"
      color: "#ffffff"
      borderColor: "transparent"
      borderRadius: "{rounded.sm}"
      borderWidth: "0px"
      borderStyle: "none"
      padding: "16px 40px"
      fontSize: "14px"
      fontWeight: 700
      minWidth: "0px"
      minHeight: "0px"
      textDecoration: "none"
      boxShadow: "none"
      fontFamily: "Noto Sans JP"
      hoverBackground: "#555555"
    link:
      backgroundColor: "transparent"
      color: "{colors.primary}"
      borderColor: "transparent"
      borderRadius: "{rounded.none}"
      borderWidth: "0px"
      borderStyle: "none"
      padding: "0px"
      fontSize: "13px"
      fontWeight: 500
      minWidth: "0px"
      minHeight: "0px"
      textDecoration: "none"
      boxShadow: "none"
      fontFamily: "Noto Sans JP"
      hoverTextDecoration: "underline"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.tertiary}"
    borderRadius: "{rounded.md}"
    borderWidth: "1px"
    borderStyle: "solid"
    padding: "28px 24px"
    boxShadow: "none"
    textColor: "{colors.on-surface}"
    hoverBoxShadow: "0 4px 20px rgba(0,0,0,0.08)"
    hoverTransform: "translateY(-2px)"
  badge:
    backgroundColor: "{colors.primary-light}"
    color: "{colors.primary}"
    borderColor: "{colors.tertiary}"
    borderRadius: "{rounded.sm}"
    borderWidth: "1px"
    borderStyle: "solid"
    padding: "3px 10px"
    fontSize: "11px"
    fontWeight: 700
---

# Overview

Lanstech is a clean, white-first corporate site for an internal IT company within the Nishihara Group. The design communicates stability, reliability, and technical competence without flash. The tone is restrained and professional, with a single pink accent color and structured, generous whitespace.

Use this system for all pages: top, about, service, recruit, news, and contact. Favor clarity, left-aligned editorial structure, and simple card-based layouts.

# Colors

Use white as the default canvas and dark gray (#333) for all primary text.

- **Primary / accent:** `#E07898` (pink)
- **Primary dark:** `#C0587A` (hover/active states)
- **Primary light:** `#FBF0F4` (badge backgrounds, soft highlights)
- **Secondary / text:** `#333333` (ink)
- **Sub text:** `#666666` (secondary copy, dates, meta)
- **Surface:** `#ffffff`
- **Surface soft:** `#f5f5f5` (alternating section backgrounds)
- **Border:** `#e0e0e0`
- **Group green:** `#009944` (Nishihara Group affiliation only)

Guidance:
- Apply the pink accent for CTAs, eyebrow labels, link hovers, and badge text.
- Keep body copy in dark gray (#333), supporting text in sub gray (#666).
- Use green exclusively for Nishihara Group references (logo area, group badge).
- Avoid introducing additional saturated colors. Status badges (if needed) should use desaturated tints.
- Soft backgrounds (#f5f5f5) alternate with white for visual rhythm between sections.

# Typography

All text uses Noto Sans JP. No Latin display font is mixed in.

## Scale
- **headline-display:** 42px / weight 700 / tight tracking (-0.02em) — FV hero only
- **headline-lg:** 30px / weight 700 — section headings with large presence (e.g. recruit)
- **headline-md:** 28px / weight 700 — standard section headings (h2.title)
- **headline-sm:** 22px / weight 700 — subsection headings (about, card titles)
- **body-lg:** 15px / weight 400 / line-height 1.85 — lead paragraphs, hero sub
- **body-md:** 14px / weight 400 / line-height 1.75 — default body text
- **body-sm:** 13px / weight 400 / line-height 1.75 — card descriptions, meta text
- **label-lg:** 14px / weight 500 — navigation links
- **label-md:** 13px / weight 500 — card link text, CTA labels
- **label-sm:** 12px / weight 500 / wide tracking (0.12em) — footer labels
- **eyebrow:** 12px / weight 500 / tracking 0.12em / uppercase / pink — section eyebrows

Notes:
- Japanese headlines are confident and direct. One line preferred; two at most.
- Sub-text and descriptions should be concise. Avoid long paragraphs.
- Line-heights are generous (1.75-1.85) for comfortable reading of Japanese text.
- Apply `text-wrap: pretty` and `word-break: auto-phrase` on body for natural Japanese line breaks.

# Layout

The page is clean and structured with generous vertical spacing.

- Max content width: **1080px**, centered with 32px side padding (20px on mobile).
- Sticky header: 64px height, white with backdrop blur, logo left, nav center/right.
- Sections alternate between white and `#f5f5f5` backgrounds.
- Content is left-aligned by default. Center alignment only for short CTA blocks.
- Grid: 2-column or 3-column for cards; single-column for editorial text.
- Mobile: all multi-column grids collapse to single column at 768px.

Spacing tokens:
- `xs` 8px — tight internal gaps
- `sm` 16px — compact clusters, card internal spacing
- `md` 32px — section padding sides, gaps between elements
- `lg` 56px — grid gaps, major separations within a section
- `xl` 88px — section vertical padding (desktop)
- `xxl` 120px — hero top padding

# Elevation & Depth

Depth is minimal. Most surfaces are flat.

- Default cards have no shadow and a subtle border (`#e0e0e0`).
- Hover: cards lift with `translateY(-2px)` and gain `box-shadow: 0 4px 20px rgba(0,0,0,0.08)`.
- The sticky nav uses `backdrop-filter: blur(8px)` with semi-transparent white.
- No layered overlays, glass effects, or gradient surfaces (except the FV hero gradient).
- The FV hero uses a single directional gradient: `linear-gradient(150deg, #fff 0%, #FBF0F4 60%, #fff 100%)`.

# Shapes

Shapes are simple and conservative.

- **none:** `0px`
- **sm:** `4px` — buttons, badges, card corners
- **md:** `8px` — cards, containers (default radius)
- **lg:** `12px` — icons, special containers
- **xl:** `20px` — pill badges (e.g. fv-badge, job-badge)
- **full:** `9999px` — not used in primary UI

Guidance:
- Buttons use `4px` radius (not pills). Clean and corporate.
- Cards use `8px` radius.
- Badges use `4px` for rectangular labels, `20px` for pill-shaped status labels.
- Do not use full-round pill buttons for primary actions.

# Components

## Primary button
Use for the main page CTA (e.g. "お問い合わせ", "募集職種を見る").

- Pink background (`#E07898`)
- White text
- 4px radius
- Padding: 14px 32px
- Font: 14px / weight 700
- Hover: darker pink (`#C0587A`)

## Secondary button (ghost)
Use for adjacent or lower-priority CTAs.

- White background
- 1.5px dark border
- Dark text
- 4px radius
- Same padding as primary

## Dark button
Use for CTA blocks in colored sections (recruit, contact CTA).

- Dark background (`#333`)
- White text
- 4px radius
- Padding: 16px 40px
- Hover: lighter (`#555`)

## Link button
Use for inline navigation and "see more" actions.

- No border or background
- Pink text
- No padding
- Hover: underline
- Font: 13px / weight 500

## Card
Use for service items, job listings, interview previews, and news items.

- White background
- 1px border (`#e0e0e0`)
- 8px radius
- Padding: 28px 24px
- No shadow at rest
- Hover: lift + soft shadow

## Badge / Tag
Use for category labels, status indicators, and job type tags.

- Pink-light background (`#FBF0F4`)
- Pink text or dark text depending on context
- 1px border
- 4px radius (rectangular) or 20px (pill)
- Font: 11px / weight 700

## Eyebrow
Use above section headings as a category identifier.

- Pink text
- 12px / weight 500 / tracking 0.12em / uppercase
- Margin-bottom: 10px before the heading

# Navigation

## Desktop
- Sticky top bar, 64px, semi-transparent white with blur
- Logo left (32px height SVG)
- Nav links: 14px / weight 500 / sub gray / hover to dark
- Right-aligned CTA button: pink, small (13px, 9px 20px padding)

## Mobile (< 768px)
- Nav links hidden, hamburger icon shown
- Overlay menu: full-width, stacked links, bordered
- Same CTA style available in mobile menu

# Section patterns

## Hero (FV)
- Pink-light gradient background
- Group badge (green border pill with Nishihara logo)
- Large headline (42px), left-aligned, max 600px
- Sub text below (15px, sub color)
- No image/video currently (planned for future)

## Service cards
- 3-column grid (1-col on mobile)
- Icon box (48px, pink-light bg, pink SVG)
- Title + description + link

## Two-column layout
- Used for: Group section, Recruit section, Service detail
- 56px gap, items aligned start
- One side editorial text, other side visual/cards

## Contact CTA
- Flexbox: text left, button right
- Dark button style
- Border-top separator

# Do's and Don'ts

## Do
- Keep pages white-first with alternating soft gray sections for rhythm.
- Use pink as the single accent for actions and highlights.
- Write concise, confident Japanese headlines (1-2 lines max).
- Preserve generous whitespace between sections (88px desktop).
- Use flat cards with subtle borders; lift on hover for interactivity.
- Left-align content by default.
- Use eyebrow labels (pink, uppercase, tracked) above section headings.
- Keep navigation minimal and functional.

## Don't
- Don't introduce additional brand colors or decorative gradients.
- Don't use pill-shaped buttons for primary actions (4px radius only).
- Don't center body text or create symmetrical layouts without purpose.
- Don't add heavy shadows, glass effects, or complex textures.
- Don't use display fonts or mix in Latin-only typefaces.
- Don't crowd sections — let content breathe.
- Don't use green for anything other than Nishihara Group affiliation.
- Don't use emojis anywhere in the UI.
