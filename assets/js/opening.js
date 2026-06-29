(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (sessionStorage.getItem('op-done')) return;

  // FVアニメーションをオーバーレイ終了後に揃える
  // オーバーレイ消滅: ~3.3s / h1上昇: 3.5s / タイピング: 3.7s / p.sub上昇: 4.2s
  var h1    = document.querySelector('.fv-inner > h1');
  var sub   = document.querySelector('.fv-inner > p.sub');
  var typed = document.querySelector('[data-text-type]');
  if (h1)    h1.style.animationDelay    = '3.5s';
  if (sub)   sub.style.animationDelay   = '4.2s';
  if (typed) typed.dataset.initialDelay = '3700';

  var overlay = document.getElementById('opening-overlay');
  if (!overlay) return;

  var logo    = overlay.querySelector('.opening-logo-img');
  var barWrap = overlay.querySelector('.opening-bar-wrap');
  var barFill = overlay.querySelector('.opening-bar-fill');

  // ロゴ・バーをフェードイン（スケール＋フェードで着地感）→ バー進行スタート
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (logo)    logo.classList.add('in');
      if (barWrap) barWrap.classList.add('in');
      if (barFill) barFill.classList.add('run');
    });
  });

  // バー満タン直後にディゾルブ（背景が先、ロゴが0.2s遅れてフェードアウト）
  // CSS: .opening-bg 0.55s / .opening-content 0.5s + 0.2s delay → 最遅 0.7s
  setTimeout(function () {
    overlay.classList.add('dissolve');
    sessionStorage.setItem('op-done', '1');
    setTimeout(function () { overlay.remove(); }, 800);
  }, 2450);
})();
