/*
 * service-icons.js
 * 事業内容アイコンの Lottie 昇格＋発火配線（静的フラットSVG → Lottie ブリッジ）。
 *
 * 設計:
 * - 各アイコンは `.lottie-icon[data-lottie="/assets/lottie/xxx.json"]` で、
 *   中に単色フラットSVG（.lottie-fallback）を常時表示している。
 * - JSONが存在する場合のみ（HEADで確認）dotLottieプレーヤを動的生成し、
 *   静止SVGを隠す（.lottie-ready）。未配置なら静止SVGのまま＝壊れず無音。
 * - dotlottie-player.js（重い）は JSON が見つかった時だけ遅延ロードする。
 * - prefers-reduced-motion: reduce のときは一切アニメせず静止SVGのまま。
 * - data-trigger="scroll" | "hover" | "scroll hover"（既定は scroll hover）。
 *
 * WordPress 移植時もこのファイルをそのまま enqueue すれば動作する。
 */
(function () {
  var PLAYER_SRC = '/assets/js/dotlottie-player.js';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = document.querySelectorAll('.lottie-icon[data-lottie]');
  if (!nodes.length) return;

  // reduced-motion: 静止フラットSVGのみ。プレーヤも読み込まない。
  if (reduce) return;

  var playerPromise = null;
  function loadPlayer() {
    if (playerPromise) return playerPromise;
    playerPromise = new Promise(function (resolve, reject) {
      if (window.customElements && customElements.get('dotlottie-player')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = PLAYER_SRC;
      s.async = true;
      s.onload = function () {
        if (window.customElements && customElements.whenDefined) {
          customElements.whenDefined('dotlottie-player').then(resolve, resolve);
        } else { resolve(); }
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return playerPromise;
  }

  function triggersOf(el) {
    return (el.getAttribute('data-trigger') || 'scroll hover').split(/\s+/);
  }

  function mount(el, src) {
    if (el.__player) return el.__player;
    var trig = triggersOf(el);
    var p = document.createElement('dotlottie-player');
    p.setAttribute('src', src);
    p.setAttribute('aria-hidden', 'true');
    if (el.hasAttribute('data-loop')) p.setAttribute('loop', '');
    // スクロール発火対象は表示時に一度自動再生（hoverは下のリスナーで再再生）
    if (trig.indexOf('scroll') !== -1) p.setAttribute('autoplay', '');
    el.appendChild(p);
    el.classList.add('lottie-ready');
    el.__player = p;
    return p;
  }

  function ensure(el) {
    if (el.dataset.lottieReady) return Promise.resolve(el.__player || null);
    el.dataset.lottieReady = 'pending';
    var src = el.getAttribute('data-lottie');
    return fetch(src, { method: 'HEAD' }).then(function (r) {
      if (!r.ok) { el.dataset.lottieReady = ''; return null; }   // 未配置: 静止SVGのまま
      return loadPlayer().then(function () { return mount(el, src); });
    }).catch(function () { el.dataset.lottieReady = ''; return null; });
  }

  function activate(el) {
    el.classList.add('in-view');   // CSS発火アニメ（チェック描画/コード打込/歯車回転）
    ensure(el);                    // Lottie JSON があれば昇格
  }

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);   // 一度きり（サイト既存の reveal 挙動に一致）
      activate(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;

  nodes.forEach(function (el) {
    var trig = triggersOf(el);
    el.classList.add('anim-ready');   // 開始状態を有効化（JSなし時は完成状態で静止）

    if (trig.indexOf('hover') !== -1) {
      el.addEventListener('mouseenter', function () {
        ensure(el).then(function (p) {
          if (!p || !p.play) return;
          try { if (p.seek) p.seek(0); } catch (e) {}
          p.play();
        });
      });
      el.addEventListener('mouseleave', function () {
        var p = el.__player;
        if (p && p.stop) p.stop();
      });
    }

    if (trig.indexOf('scroll') !== -1) {
      if (io) io.observe(el);
      else activate(el);   // IO非対応: 即発火
    }
  });
})();
