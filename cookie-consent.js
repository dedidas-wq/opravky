/**
 * Cookie Consent Manager — Matika s Hankou
 * GDPR / ePrivacy compliant, Google Consent Mode v2
 */
(function () {
  var CONSENT_KEY = 'msh_consent';
  var CONSENT_VERSION = '2';

  /* ── helpers ──────────────────────────────────────────── */
  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); }
    catch (e) { return null; }
  }

  function saveConsent(analytics, marketing) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      v: CONSENT_VERSION,
      analytics: analytics,
      marketing: marketing,
      ts: Date.now()
    }));
  }

  function pushGtag(analytics, marketing) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage:     analytics  ? 'granted' : 'denied',
        ad_storage:            marketing  ? 'granted' : 'denied',
        ad_user_data:          marketing  ? 'granted' : 'denied',
        ad_personalization:    marketing  ? 'granted' : 'denied'
      });
    }
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        analytics_consent: analytics,
        marketing_consent: marketing
      });
    }
  }

  function deleteCookies() {
    var names = ['_ga', '_gid', '_fbp', '_ttp'];
    var host  = window.location.hostname;
    names.forEach(function (n) {
      ['/', ''].forEach(function (p) {
        ['', host, '.' + host].forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/' + (d ? '; domain=' + d : '');
        });
      });
    });
    document.cookie.split(';').forEach(function (c) {
      var n = c.trim().split('=')[0];
      if (n.startsWith('_ga_')) {
        [host, '.' + host].forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + d;
        });
      }
    });
  }

  /* ── banner actions ───────────────────────────────────── */
  function hide()  { var b = document.getElementById('cc-banner'); if (b) b.remove(); }

  function acceptAll() {
    saveConsent(true, true);
    pushGtag(true, true);
    hide();
  }

  function rejectAll() {
    saveConsent(false, false);
    pushGtag(false, false);
    deleteCookies();
    hide();
  }

  function saveCustom() {
    var a = document.getElementById('cc-chk-analytics');
    var m = document.getElementById('cc-chk-marketing');
    var analytics = a ? a.checked : false;
    var marketing = m ? m.checked : false;
    saveConsent(analytics, marketing);
    pushGtag(analytics, marketing);
    if (!analytics || !marketing) deleteCookies();
    hide();
  }

  function toggleDetails() {
    var d = document.getElementById('cc-details');
    if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
  }

  /* ── public: revoke (used on cookies.html) ────────────── */
  window.revokeConsent = function () {
    localStorage.removeItem(CONSENT_KEY);
    deleteCookies();
    pushGtag(false, false);
    injectBanner();
  };

  /* ── banner HTML ──────────────────────────────────────── */
  function injectBanner() {
    if (document.getElementById('cc-banner')) return;
    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Nastavení cookies');
    el.innerHTML = '<div id="cc-wrap">'
      + '<div id="cc-main">'
      +   '<div id="cc-text">'
      +     '<strong>Tento web používá cookies</strong>'
      +     '<p>Nezbytné cookies jsou vždy aktivní. Analytické a marketingové cookies (Google Analytics, Meta Pixel, TikTok Pixel) zapneme jen s vaším souhlasem. <a href="/cookies.html">Více informací</a></p>'
      +   '</div>'
      +   '<div id="cc-btns">'
      +     '<button class="cc-btn cc-btn--ghost" id="cc-btn-settings">Nastavení</button>'
      +     '<button class="cc-btn cc-btn--ghost" id="cc-btn-reject">Odmítnout vše</button>'
      +     '<button class="cc-btn cc-btn--primary" id="cc-btn-accept">Přijmout vše</button>'
      +   '</div>'
      + '</div>'
      + '<div id="cc-details" style="display:none">'
      +   '<label class="cc-check"><input type="checkbox" disabled checked> <span>Nezbytné <em>(vždy aktivní)</em></span></label>'
      +   '<label class="cc-check"><input type="checkbox" id="cc-chk-analytics" checked> <span>Analytické <em>(Google Analytics)</em></span></label>'
      +   '<label class="cc-check"><input type="checkbox" id="cc-chk-marketing" checked> <span>Marketingové <em>(Meta Pixel, TikTok Pixel)</em></span></label>'
      +   '<button class="cc-btn cc-btn--primary cc-btn--sm" id="cc-btn-save">Uložit nastavení</button>'
      + '</div>'
      + '</div>';

    var style = document.createElement('style');
    style.textContent = '#cc-banner{position:fixed;bottom:0;left:0;right:0;z-index:999999;background:#1A1438;color:#E8E2F8;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:14px;box-shadow:0 -2px 20px rgba(0,0,0,.25);padding:16px}'
      + '#cc-wrap{max-width:1100px;margin:0 auto}'
      + '#cc-main{display:flex;flex-wrap:wrap;align-items:center;gap:12px}'
      + '#cc-text{flex:1;min-width:260px}'
      + '#cc-text strong{font-size:15px;display:block;margin-bottom:4px}'
      + '#cc-text p{margin:0;color:#B8AEDC;line-height:1.55}'
      + '#cc-text a{color:#A594F9}'
      + '#cc-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}'
      + '.cc-btn{padding:9px 18px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;transition:.15s}'
      + '.cc-btn--ghost{background:transparent;color:#B8AEDC;border:1.5px solid rgba(184,174,220,.3)}'
      + '.cc-btn--ghost:hover{border-color:#A594F9;color:#fff}'
      + '.cc-btn--primary{background:#5B3FD9;color:#fff;border:none}'
      + '.cc-btn--primary:hover{background:#4A30BC}'
      + '.cc-btn--sm{padding:7px 14px;font-size:12px;margin-top:12px}'
      + '#cc-details{padding-top:14px;margin-top:12px;border-top:1px solid rgba(255,255,255,.1)}'
      + '.cc-check{display:inline-flex;align-items:center;gap:8px;margin-right:20px;cursor:pointer;color:#B8AEDC}'
      + '.cc-check input{width:15px;height:15px;accent-color:#5B3FD9}'
      + '.cc-check em{font-size:12px;color:#8A80A8}';

    document.head.appendChild(style);
    document.body.appendChild(el);

    document.getElementById('cc-btn-accept').addEventListener('click', acceptAll);
    document.getElementById('cc-btn-reject').addEventListener('click', rejectAll);
    document.getElementById('cc-btn-settings').addEventListener('click', toggleDetails);
    document.getElementById('cc-btn-save').addEventListener('click', saveCustom);
  }

  /* ── init ─────────────────────────────────────────────── */
  function init() {
    var saved = getConsent();
    if (saved && saved.v === CONSENT_VERSION) {
      pushGtag(saved.analytics, saved.marketing);
      return;
    }
    injectBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CookieConsent = { acceptAll: acceptAll, rejectAll: rejectAll, saveCustom: saveCustom, toggleDetails: toggleDetails };
})();
