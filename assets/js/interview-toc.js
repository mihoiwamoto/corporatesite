// 社員インタビュー特設ページ：左追従目次のスクロールスパイ＋スムーススクロール
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.iv2-toc-link'));
  if (!links.length) return;

  // href(#id) → リンク要素 / 対象セクションのマップ
  var linkById = {};
  var sections = [];
  links.forEach(function (link) {
    var id = (link.getAttribute('href') || '').replace('#', '');
    if (!id) return;
    var sec = document.getElementById(id);
    if (!sec) return;
    linkById[id] = link;
    sections.push(sec);
  });
  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (l) { l.classList.remove('active'); });
    if (linkById[id]) linkById[id].classList.add('active');
  }

  // 目次クリック直後、スムーススクロールのアニメーション中は
  // スクロールスパイによるハイライト上書きを抑制する（クリック先を保持）。
  var spyLockUntil = 0;
  function lockSpy(ms) { spyLockUntil = Date.now() + ms; }
  function isSpyLocked() { return Date.now() < spyLockUntil; }

  // ---- スクロールスパイ（現在地の見出しをハイライト）----
  if ('IntersectionObserver' in window) {
    var visible = {};

    function chooseActive() {
      if (isSpyLocked()) return;
      // 最下部付近では、最後のセクション（短くて判定ゾーンに入りきらない）を
      // 強制的にアクティブにする。これがないと直前の見出しが残ってしまう。
      var docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      if (window.innerHeight + window.pageYOffset >= docHeight - 2) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      // 表示中セクションのうち、DOM順で最初のものをアクティブに
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { setActive(sections[i].id); return; }
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting;
      });
      chooseActive();
    }, { rootMargin: '-96px 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });

    // 最下部まで到達したときに最後の見出しをハイライトするための監視
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { chooseActive(); ticking = false; });
    }, { passive: true });
  }

  // ---- 目次クリック時のハイライト制御 ----
  // 実際のスクロールは smooth-scroll.js（Lenis）が document のキャプチャ段階で
  // 処理し stopPropagation() する。そのためリンク要素のバブリング段階リスナーは
  // 呼ばれない。ここでも同じキャプチャ段階で拾い、クリック先を即座にアクティブ化
  // したうえでスパイをロックし、スクロール中に手前のセクションで上書きされるのを防ぐ。
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('.iv2-toc-link') : null;
    if (!link) return;
    var id = (link.getAttribute('href') || '').replace('#', '');
    if (!linkById[id]) return;
    setActive(id);
    // Lenis の duration(1.5s) より少し長めにロックして、着地までクリック先を保持。
    lockSpy(1800);
    // Lenis が無い環境（prefers-reduced-motion 等）では自前でスクロール。
    if (!window.__lenis) {
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      }
    }
  }, true);
})();
