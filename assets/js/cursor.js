/*
 * cursor.js — カーソル追従ドット（x-garden 同等の仕様）。
 *
 * - ネイティブカーソルは残したまま、少し遅れて追従するピンクのドットを重ねる。
 * - リンク/ボタン等にホバーすると、ドットが拡大（半透明のピンク円）。
 * - マウス環境のみ（pointer: fine）。タッチ端末では出さない。
 * - prefers-reduced-motion: reduce では無効（ネイティブカーソルのまま）。
 * - 追従は rAF + lerp（線形補間）。pointer-events:none でクリックを妨げない。
 * - WordPress 移行時もこのファイルを enqueue すれば動く（要素はJSが自動生成）。
 */
(function () {
  if (document.getElementById('cursorBox')) return; // 二重初期化を防止
  var mqFine = window.matchMedia && window.matchMedia('(pointer: fine)');
  var mqReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mqFine || !mqFine.matches) return;        // マウス環境のみ
  if (mqReduce && mqReduce.matches) return;      // 視差軽減はネイティブのまま

  // 必要CSSをJSで注入（自己完結）
  var style = document.createElement('style');
  style.textContent =
    '#cursorBox{position:fixed;top:0;left:0;width:0;height:0;z-index:9999;pointer-events:none;opacity:0;transition:opacity .25s ease}' +
    '#cursorBox.is-active{opacity:1}' +
    '#cursorBox .cf{position:fixed;top:0;left:0;will-change:transform}' +
    '#cursorBox .cf-dot{position:absolute;left:0;top:0;width:8px;height:8px;border-radius:50%;' +
      'background:var(--pink,#D4637E);transform:translate(-50%,-50%);' +
      'transition:width .4s cubic-bezier(.215,.61,.355,1),height .4s cubic-bezier(.215,.61,.355,1),background-color .3s ease,opacity .3s ease}' +
    '#cursorBox .cf.is-hover .cf-dot{width:44px;height:44px;background:rgba(212,99,126,.18)}' +
    '#cursorBox.is-down .cf-dot{width:14px;height:14px}';
  document.head.appendChild(style);

  var box = document.createElement('div');
  box.id = 'cursorBox';
  box.setAttribute('aria-hidden', 'true');
  var cf = document.createElement('div');
  cf.className = 'cf';
  var dot = document.createElement('div');
  dot.className = 'cf-dot';
  cf.appendChild(dot);
  box.appendChild(cf);
  document.body.appendChild(box);

  var tx = window.innerWidth / 2, ty = window.innerHeight / 2; // 目標位置
  var cx = tx, cy = ty;                                        // 現在位置（補間）
  var active = false;
  var LERP = 0.18;
  var SEL = 'a,button,input,textarea,select,label,summary,[role="button"],.icon-link,.filter-btn,.btn';

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!active) { active = true; box.classList.add('is-active'); }
  }, { passive: true });

  document.addEventListener('mouseleave', function () { active = false; box.classList.remove('is-active'); });
  document.addEventListener('mousedown', function () { box.classList.add('is-down'); });
  document.addEventListener('mouseup', function () { box.classList.remove('is-down'); });

  // ホバーで拡大（mouseover を毎回判定＝抜けも自動で戻る）
  document.addEventListener('mouseover', function (e) {
    var hit = e.target && e.target.closest ? e.target.closest(SEL) : null;
    cf.classList.toggle('is-hover', !!hit);
  });

  function raf() {
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;
    cf.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
