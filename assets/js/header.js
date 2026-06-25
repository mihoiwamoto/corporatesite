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
    { href: '/about.html',   label: '会社概要', key: 'about' },
    { href: '/service.html',  label: '事業内容', key: 'service' },
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

  var headerHTML =
    '<header class="site-nav" id="top">\n' +
    '  <div class="wrap">\n' +
    '    <div class="logo">\n' +
    '      <a href="/"><img src="/assets/images/lanstech_logo_yoko.svg" alt="株式会社ランステック"></a>\n' +
    '    </div>\n' +
    '    ' + desktopLinks + '\n' +
    '    <button class="nav-hamburger" id="hamburger" aria-label="メニューを開く" aria-expanded="false">\n' +
    '      <span></span><span></span><span></span>\n' +
    '    </button>\n' +
    '    <a href="/contact.html" class="nav-cta">お問い合わせ</a>\n' +
    '  </div>\n' +
    '</header>\n' +
    '<nav class="mobile-nav" id="mobile-nav" aria-hidden="true">\n' +
    '  <div class="mobile-nav-inner">\n' +
    '    ' + mobileLinks + '\n' +
    '    <a href="/contact.html" class="nav-cta-mobile">お問い合わせ</a>\n' +
    '  </div>\n' +
    '</nav>';

  var placeholder = document.getElementById('site-header');
  if (placeholder) {
    placeholder.outerHTML = headerHTML;
  }

  var btn = document.getElementById('hamburger');
  var nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    nav.setAttribute('aria-hidden', String(!open));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    });
  });
})();
