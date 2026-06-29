(function () {
  // サイト共通の背景アニメ（FloatingLines）を全ページで起動する。
  // three は CDN(ESM) をフルURLで直importするため、モジュールscriptを動的注入すれば足りる
  // （importmap 不要）。本体は assets/js/floating-lines.js。
  if (!document.querySelector('script[data-floating-lines]')) {
    var flScript = document.createElement('script');
    flScript.type = 'module';
    flScript.src = '/assets/js/floating-lines.js?v=3';
    flScript.setAttribute('data-floating-lines', '');
    document.head.appendChild(flScript);
  }

  var NAV_ITEMS = [
    { href: '/about.html',   label: '会社について', key: 'about' },
    { href: '/service.html',  label: '私たちの事業', key: 'service' },
    { href: '/recruit.html',  label: '採用情報', key: 'recruit' },
    { href: '/news.html',     label: 'お知らせ', key: 'news' }
  ];

  var path = location.pathname;
  var currentKey = '';
  if (path.match(/\/about\.html/))          currentKey = 'about';
  else if (path.match(/\/service\.html/))   currentKey = 'service';
  else if (path.match(/\/recruit\.html/))   currentKey = 'recruit';
  else if (path.match(/\/news(\.html|\/)/)) currentKey = 'news';
  else if (path.match(/\/contact\.html/))   currentKey = 'contact';

  var desktopLinks = NAV_ITEMS.map(function (item) {
    var cls = 'nav-link' + (item.key === currentKey ? ' current' : '');
    return '<a href="' + item.href + '" class="' + cls + '">' + item.label + '</a>';
  }).join('\n    ');

  var mobileLinks = NAV_ITEMS.map(function (item) {
    return '<a href="' + item.href + '">' + item.label + '</a>';
  }).join('\n    ');

  var menuOverlayHTML =
    '<div class="menu-overlay-body">\n' +
    '  <div class="menu-nav-grid">\n' +
    '    <div class="menu-col">\n' +
    '      <p class="menu-col-title">Company</p>\n' +
    '      <a href="/about.html" class="menu-page-link">会社について</a>\n' +
    '      <a href="/about.html#message" class="menu-section-link">社長メッセージ</a>\n' +
    '      <a href="/about.html#vision" class="menu-section-link">ビジョン</a>\n' +
    '      <a href="/about.html#values" class="menu-section-link">バリュー</a>\n' +
    '      <a href="/about.html#company" class="menu-section-link">会社情報</a>\n' +
    '      <a href="/about.html#history" class="menu-section-link">沿革</a>\n' +
    '    </div>\n' +
    '    <div class="menu-col">\n' +
    '      <p class="menu-col-title">Business</p>\n' +
    '      <a href="/service.html" class="menu-page-link">私たちの事業</a>\n' +
    '      <a href="/service.html#planning" class="menu-section-link">企画・要件定義</a>\n' +
    '      <a href="/service.html#development" class="menu-section-link">設計・開発</a>\n' +
    '      <a href="/service.html#operation" class="menu-section-link">保守・運用</a>\n' +
    '      <a href="/service.html#works" class="menu-section-link">開発実績</a>\n' +
    '    </div>\n' +
    '    <div class="menu-col">\n' +
    '      <p class="menu-col-title">Recruit</p>\n' +
    '      <a href="/recruit.html" class="menu-page-link">採用情報</a>\n' +
    '      <a href="/recruit.html#jobs" class="menu-section-link">募集職種</a>\n' +
    '      <a href="/recruit.html#data" class="menu-section-link">数字で見る</a>\n' +
    '      <a href="/recruit.html#workstyle" class="menu-section-link">働き方について</a>\n' +
    '      <a href="/recruit.html#requirements" class="menu-section-link">募集要項</a>\n' +
    '    </div>\n' +
    '    <div class="menu-col">\n' +
    '      <p class="menu-col-title">News</p>\n' +
    '      <a href="/news.html" class="menu-page-link">お知らせ</a>\n' +
    '      <a href="/news.html#社員インタビュー" class="menu-section-link">社員インタビュー</a>\n' +
    '      <a href="/news.html#実績・事例" class="menu-section-link">実績・事例</a>\n' +
    '    </div>\n' +
    '    <div class="menu-col">\n' +
    '      <p class="menu-col-title">Contact</p>\n' +
    '      <a href="/contact.html" class="menu-page-link">お問い合わせ</a>\n' +
    '      <a href="/privacy.html" class="menu-section-link">プライバシーポリシー</a>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="menu-group-row">\n' +
    '    <span class="menu-group-label">Group</span>\n' +
    '    <a class="menu-group-link" href="https://www.nishihara-shokai.co.jp/" target="_blank" rel="noopener noreferrer">\n' +
    '      <img src="/assets/images/nishihara_logo.svg" alt="" class="menu-group-logo">\n' +
    '      <span>西原商会グループ Webサイト</span>\n' +
    '      <span class="menu-group-arrow" aria-hidden="true">↗</span>\n' +
    '    </a>\n' +
    '  </div>\n' +
    '</div>';

  var headerHTML =
    '<header class="site-nav" id="top">\n' +
    '  <div class="nav-row">\n' +
    '    <div class="wrap">\n' +
    '      <div class="logo">\n' +
    '        <a href="/"><img src="/assets/images/lanstech_logo_yoko.svg" alt="株式会社ランステック"></a>\n' +
    '      </div>\n' +
    '      ' + desktopLinks + '\n' +
    '      <a href="/contact.html" class="nav-cta">お問い合わせ</a>\n' +
    '    </div>\n' +
    '    <button class="nav-standalone-btn" id="hamburger" aria-label="メニューを開く" aria-expanded="false">\n' +
    '      <span></span><span></span><span></span>\n' +
    '    </button>\n' +
    '  </div>\n' +
    '</header>\n' +
    '<div class="menu-logo-fixed" id="menu-logo-fixed" aria-hidden="true">\n' +
    '  <a href="/" tabindex="-1"><img src="/assets/images/lanstech_logo_yoko.svg" alt="株式会社ランステック"></a>\n' +
    '</div>\n' +
    '<nav class="mobile-nav" id="mobile-nav" aria-hidden="true">\n' +
    '  <div class="mobile-nav-scroll">\n' +
    menuOverlayHTML +
    '  </div>\n' +
    '</nav>';

  var placeholder = document.getElementById('site-header');
  if (placeholder) {
    placeholder.outerHTML = headerHTML;
  }

  var btn = document.getElementById('hamburger');
  var nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  var wrap = document.querySelector('.site-nav .wrap');
  var logoFixed = document.getElementById('menu-logo-fixed');

  var backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  document.body.appendChild(backdrop);

  function openMenu() {
    nav.classList.add('open');
    backdrop.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    if (wrap) wrap.classList.add('nav-hidden');
    if (logoFixed) logoFixed.classList.add('visible');
  }

  function closeMenu() {
    nav.classList.remove('open');
    backdrop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (wrap) wrap.classList.remove('nav-hidden');
    if (logoFixed) logoFixed.classList.remove('visible');
  }

  btn.addEventListener('click', function () {
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
})();

// ── ページ遷移ディゾルブ（全ブラウザ共通・JS 制御）──────────────────────────
// html::before にグラデ背景があるため opacity:0 でも真っ白にならない
(function () {
  var D = 600; // CSS transition(.6s) と揃える
  var b = document.body;

  function show() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { b.classList.add('pgt-visible'); });
    });
  }

  // reduced-motion: 即時表示・遷移なし
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    b.classList.add('pgt-visible');
    return;
  }

  // ページ入場：フェードイン
  show();

  // bfcache（ブラウザの戻る/進む）
  window.addEventListener('pageshow', function (e) { if (e.persisted) show(); });

  // クリック瞬時にフェードアウト開始 → D ms 後に遷移（即座に視覚フィードバック）
  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.indexOf('mailto:') === 0 ||
        href.indexOf('tel:') === 0 ||
        href.indexOf('javascript:') === 0 ||
        a.getAttribute('target') === '_blank') return;
    var url;
    try { url = new URL(href, location.href); } catch (ex) { return; }
    if (url.hostname !== location.hostname) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (url.href === location.href) return;
    e.preventDefault();
    b.classList.remove('pgt-visible');
    var dest = url.href;
    setTimeout(function () { window.location.assign(dest); }, D);
  }, true);
})();
