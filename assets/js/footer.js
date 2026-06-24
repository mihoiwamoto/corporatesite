(function () {
  var footerHTML =
    '<footer class="footer">\n' +
    '  <div class="wrap">\n' +
    '    <div class="footer-inner">\n' +
    '      <div class="footer-brand">\n' +
    '        <a href="/" class="footer-logo"><img src="/assets/images/lanstech_logo_yoko.svg" alt="株式会社ランステック"></a>\n' +
    '        <address>〒135-0044 東京都江東区越中島1-1-1<br>ヤマタネ深川1号館 2F</address>\n' +
    '        <div class="footer-group">\n' +
    '          <span class="footer-group-label">Group</span>\n' +
    '          <a class="footer-group-link" href="https://www.nishihara-shokai.co.jp/" target="_blank" rel="noopener noreferrer">\n' +
    '            <img src="/assets/images/nishihara_logo.svg" alt="">\n' +
    '            <span>西原商会グループ Webサイト</span>\n' +
    '            <span class="fg-arrow" aria-hidden="true">↗</span>\n' +
    '          </a>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="footer-end">\n' +
    '        <a class="footer-pagetop" href="#top" onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false;">\n' +
    '          <span>PAGE TOP</span>\n' +
    '          <span class="footer-pagetop-btn" aria-hidden="true">↑</span>\n' +
    '        </a>\n' +
    '        <nav class="footer-nav">\n' +
    '          <a href="/about.html">会社概要</a>\n' +
    '          <a href="/service.html">事業内容</a>\n' +
    '          <a href="/recruit.html">採用情報</a>\n' +
    '          <a href="/news.html">お知らせ</a>\n' +
    '          <a href="/contact.html">お問い合わせ</a>\n' +
    '        </nav>\n' +
    '      </div>\n' +
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
