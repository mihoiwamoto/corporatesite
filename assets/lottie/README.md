# /assets/lottie/

事業内容アイコンの Lottie モーションファイルを置く場所です。

## 配置するファイル（ファイル名固定）
- `planning.json`（または `planning.lottie`） … 企画・要件定義
- `development.json`（または `development.lottie`） … 設計・開発
- `operation.json`（または `operation.lottie`） … 保守・運用

ファイル名は service.html / index.html の `data-lottie="/assets/lottie/xxx.json"` と
section id（#planning / #development / #operation）に対応しています。

## 仕組み（重要）
- ここに JSON/.lottie を**置くだけ**で、`assets/js/service-icons.js` が存在を検知して
  自動的に dotLottie プレーヤをマウントし、静止SVGをアニメに差し替えます。**HTML 変更不要。**
- 未配置の間は、各HTMLにインラインで埋め込んだ**単色フラットSVG**が表示されます（壊れません）。
- `.lottie` で書き出した場合は `data-lottie` の拡張子も `.lottie` に合わせてください
  （プレーヤは両対応。1ファイルだけ拡張子を変えればOK）。

## 作り方（外部ツール作業）
1. 各HTMLのインライン単色SVGを Figma に取り込む（または再現）。
2. LottieFiles for Figma / Jitter / After Effects+Bodymovin で 1〜2秒の短いモーションを付与。
   - 色はブランドピンク #D4637E を**焼き込む**（Lottie は CSS の currentColor を継ぎません）。
3. `.lottie`（推奨・軽い）か `.json` で書き出し、上記ファイル名でこのフォルダに配置。
4. 目安サイズ 各 < 30〜50KB。

## reduced-motion
OSの「視差効果を減らす」設定時は Lottie を読み込まず、静止SVGのまま表示します。
