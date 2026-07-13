(function () {
  var footerHTML =
    '<footer class="footer">\n' +
    '  <div class="wrap">\n' +
    '    <div class="footer-top">\n' +
    '      <div class="footer-brand">\n' +
    '        <a href="/" class="footer-logo"><img src="/assets/images/lanstech_logo_yoko.svg" alt="株式会社ランステック"></a>\n' +
    '        <address>〒135-0044<br>東京都江東区越中島1-1-1 ヤマタネ深川1号館 2F</address>\n' +
    '        <div class="footer-group">\n' +
    '          <span class="footer-group-label">Group</span>\n' +
    '          <a class="footer-group-link" href="https://www.nishihara-shokai.co.jp/" target="_blank" rel="noopener noreferrer">\n' +
    '            <img src="/assets/images/nishihara_logo.svg" alt="">\n' +
    '            <span>西原商会グループ Webサイト</span>\n' +
    '            <span class="fg-arrow" aria-hidden="true">↗</span>\n' +
    '          </a>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <nav class="footer-cols" aria-label="フッターナビゲーション">\n' +
    '        <div class="footer-col">\n' +
    '          <p class="footer-col-title">Company</p>\n' +
    '          <a href="/about.html#message">社長メッセージ</a>\n' +
    '          <a href="/about.html#vision">ビジョン・バリュー</a>\n' +
    '          <a href="/about.html#history">沿革</a>\n' +
    '          <a href="/about.html#group">グループ会社</a>\n' +
    '          <a href="/about.html#company">会社情報</a>\n' +
    '        </div>\n' +
    '        <div class="footer-col">\n' +
    '          <p class="footer-col-title">Business</p>\n' +
    '          <a href="/service.html#planning">企画・要件定義</a>\n' +
    '          <a href="/service.html#development">設計・開発</a>\n' +
    '          <a href="/service.html#operation">保守・運用</a>\n' +
    '          <a href="/service.html#ai-strength">AI開発</a>\n' +
    '          <a href="/service.html#works">開発実績</a>\n' +
    '        </div>\n' +
    '        <div class="footer-col">\n' +
    '          <p class="footer-col-title">News</p>\n' +
    '          <a href="/news.html#news">お知らせ一覧</a>\n' +
    '        </div>\n' +
    '        <div class="footer-col">\n' +
    '          <p class="footer-col-title">Contact</p>\n' +
    '          <a href="/contact.html">お問い合わせ</a>\n' +
    '        </div>\n' +
    '      </nav>\n' +
    '    </div>\n' +
    '    <hr class="footer-divider">\n' +
    '    <div class="footer-bottom">\n' +
    '      <p class="footer-copy">&copy; 2026 Lans Tech Co., Ltd. All rights reserved.</p>\n' +
    '      <a class="footer-privacy" href="/privacy.html">プライバシーポリシー</a>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</footer>';

  var placeholder = document.getElementById('site-footer');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  }
})();
