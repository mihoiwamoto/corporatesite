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

  // hash から対象要素とスクロール種別を判定して Lenis で移動する。
  // hash: "#message" 形式 / smooth: true=慣性移動 false=即時移動
  // 戻り値: 処理できたら true（呼び出し側で preventDefault する）
  function scrollToHash(hash, smooth) {
    if (!hash || hash.charAt(0) !== '#') return false;
    // ページ最上部へ（#top ヘッダーは position:fixed のため要素指定だと正しく算出できない）
    if (hash === '#top' || hash === '#') {
      lenis.scrollTo(0, smooth ? { duration: 2.2 } : { immediate: true });
      return true;
    }
    if (hash.length < 2) return false;
    var target;
    // id に日本語（例: #お知らせ）が含まれてもマッチできるよう getElementById を優先
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (err) { target = null; }
    if (!target) return false;
    lenis.scrollTo(target, smooth
      ? { offset: -HEADER_OFFSET }
      : { offset: -HEADER_OFFSET, immediate: true });
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;

    // "#..." だけでなく "/about.html#message" のような同一ページ内の
    // フルパス付きリンク（ヘッダー/フッターのメニュー）も拾う。
    var hash = '';
    if (href.charAt(0) === '#') {
      hash = href;
    } else if (href.indexOf('#') > 0) {
      var url;
      try { url = new URL(href, location.href); } catch (ex) { return; }
      // 遷移先が別ページなら通常の画面遷移に任せる（on-load 側で処理）
      if (url.pathname !== location.pathname || url.hostname !== location.hostname) return;
      hash = url.hash;
    } else {
      return;
    }

    if (scrollToHash(hash, true)) {
      e.preventDefault();
      e.stopPropagation(); // 既存インライン onclick(window.scrollTo) を抑止
      if (history.replaceState) history.replaceState(null, '', hash);
    }
  }, true);

  // 別ページからハッシュ付き URL で来た場合（例: /about.html#message）、
  // Lenis がスクロールを制御しているためブラウザ標準のジャンプが失われる。
  // レイアウト確定後にヘッダー分オフセットを付けて移動する。
  if (location.hash && location.hash.length > 1) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var pendingHash = location.hash;

    // 画像/フォント読込やGSAP ScrollTriggerの初期化でレイアウトが確定するまで
    // 位置がずれる/0に戻ることがあるため、短時間くり返し対象位置へ合わせ直す。
    // ただしユーザーが自分でスクロール操作を始めたら追従を中止する。
    var applyInitialHash = function () {
      var attempts = 0;
      var maxAttempts = 12;   // 約1.2秒間（100ms間隔）追従
      var cancelled = false;
      var cancel = function () { cancelled = true; };
      // ユーザー由来の操作を検知して追従キャンセル（passive で妨げない）
      window.addEventListener('wheel', cancel, { passive: true, once: true });
      window.addEventListener('touchstart', cancel, { passive: true, once: true });
      window.addEventListener('keydown', cancel, { once: true });
      var tick = function () {
        if (cancelled) return;
        var ok = scrollToHash(pendingHash, false);
        attempts++;
        if (!ok || attempts >= maxAttempts) return;
        setTimeout(tick, 100);
      };
      tick();
    };

    if (document.readyState === 'complete') {
      setTimeout(applyInitialHash, 0);
    } else {
      window.addEventListener('load', function () {
        // 画像・フォント読込後の再レイアウトを少し待ってから移動
        setTimeout(applyInitialHash, 0);
      });
    }
  }
})();
