/* ================================================================
   GDPR Cookie Consent Banner
   ================================================================ */
(function() {
  var CONSENT_KEY = 'cookie_consent';
  var consent = localStorage.getItem(CONSENT_KEY);
  if (consent === 'accepted' || consent === 'rejected') return;

  var banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.innerHTML =
    '<div class="cookie-banner-container">' +
      '<div class="cookie-banner-text">' +
        '<strong>本网站使用 Cookie</strong>' +
        '<p>我们使用 Cookie 和类似技术来改善您的浏览体验、分析网站流量以及通过 Google AdSense 和 PropellerAds 展示个性化广告。点击"全部接受"即表示您同意我们使用所有 Cookie。您可以随时通过隐私政策页面更改偏好。</p>' +
        '<a href="privacy.html" class="cookie-link">隐私政策</a>' +
        '<span style="margin:0 8px;color:var(--text-muted)">|</span>' +
        '<a href="terms.html" class="cookie-link">服务条款</a>' +
      '</div>' +
      '<div class="cookie-banner-btns">' +
        '<button class="cookie-btn cookie-btn-settings" id="cookieReject">仅必要 Cookie</button>' +
        '<button class="cookie-btn cookie-btn-accept" id="cookieAccept">全部接受</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(banner);
  banner.style.display = 'block';

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(20px)';
    setTimeout(function() { banner.remove(); }, 300);
  }

  document.getElementById('cookieAccept').addEventListener('click', function() {
    setConsent('accepted');
  });

  document.getElementById('cookieReject').addEventListener('click', function() {
    setConsent('rejected');
  });
})();
