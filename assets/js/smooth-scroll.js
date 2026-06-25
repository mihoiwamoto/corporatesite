/*
 * smooth-scroll.js — Lenis による慣性スムーススクロール。
 *
 * - Lenis は「実際のページスクロール位置」を rAF で補間して動かす方式。
 *   transform 方式ではないので position:sticky / IntersectionObserver /
 *   ネイティブスクロールバー / 固定canvas(WebGL背景) と共存できる。
 * - prefers-reduced-motion: reduce のときは初期化しない（ネイティブスクロール）。
 * - 同ページ内アンカー（#id）クリックは Lenis でスムーズ移動。スティッキー
 *   ヘッダー分のオフセットを付ける。フッターの PAGE TOP（インラインの
 *   window.scrollTo）はキャプチャ段階で抑止し、Lenis 側で処理する。
 * - WordPress 移行時も lenis.min.js と本ファイルを enqueue すれば同様に動く。
 */
(function () {
  if (!window.Lenis) return;
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) return;

  // Lenis 推奨CSS（自己完結のため JS で注入）
  var style = document.createElement('style');
  style.textContent =
    'html.lenis,html.lenis body{height:auto}' +
    '.lenis.lenis-smooth{scroll-behavior:auto!important}' +
    '.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}' +
    '.lenis.lenis-stopped{overflow:hidden}' +
    '.lenis.lenis-smooth iframe{pointer-events:none}';
  document.head.appendChild(style);

  var lenis = new Lenis({
    duration: 1.5,        // 慣性の伸び（大きいほど滑らか・ゆったり）
    smoothWheel: true,
    wheelMultiplier: 0.9, // 1ノッチの移動量を少し抑えて滑らかに
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
  });
  window.__lenis = lenis; // 他スクリプトから参照できるよう公開

  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // 同ページ内アンカー（#id）を Lenis でスムーズ移動（ヘッダー分オフセット）
  var HEADER_OFFSET = 96;
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#' || href.length < 2) return;
    var target;
    try { target = document.querySelector(href); } catch (err) { return; }
    if (!target) return;
    e.preventDefault();
    e.stopPropagation(); // 既存インライン onclick(window.scrollTo) を抑止
    lenis.scrollTo(target, { offset: -HEADER_OFFSET });
  }, true);
})();
