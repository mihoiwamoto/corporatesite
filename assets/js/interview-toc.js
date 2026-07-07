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

  // ---- スクロールスパイ（現在地の見出しをハイライト）----
  if ('IntersectionObserver' in window) {
    var visible = {};

    function chooseActive() {
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

  // ---- 目次クリックでスムーススクロール（固定ヘッダー分オフセット）----
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = (link.getAttribute('href') || '').replace('#', '');
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setActive(id);
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(target, { offset: -96 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  });
})();
