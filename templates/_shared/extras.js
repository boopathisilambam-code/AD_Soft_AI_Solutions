/* Shared by every invitation template:
   1. AD Soft Technologies footer with Instagram + Facebook icons (added only if the template has none; links are normalised)
   2. Optional background music (data.bgMusic = uploaded audio URL) with a small floating play/pause button */
(function () {
  'use strict';
  var IG = 'https://www.instagram.com/adsofttechnologies?hvrq=MW12Z3lsNTJvMnV2Yw==';
  var FB = 'https://www.facebook.com/adsofttechnologies2020';
  var SITE = 'https://www.adsofttechnologies.com';
  var QS = new URLSearchParams(location.search), CARD = QS.get('card') === '1';

  /* ---------- footer ---------- */
  function footer() {
    var links = document.querySelectorAll('a[href*="instagram.com"],a[href*="facebook.com"]');
    for (var i = 0; i < links.length; i++) links[i].href = /instagram/.test(links[i].href) ? IG : FB;
    if (links.length || document.getElementById('adsftFooter')) return;
    var f = document.createElement('footer'); f.id = 'adsftFooter';
    f.style.cssText = 'background:#1d1a17;color:#d9cdb8;text-align:center;padding:34px 20px calc(30px + env(safe-area-inset-bottom,0px));font:400 14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;position:relative;z-index:5;clear:both';
    var a = 'display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;border:1px solid #d9cdb8;color:#d9cdb8;margin:0 6px;text-decoration:none';
    var ic = 'width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round';
    f.innerHTML = '<div style="font:600 17px Georgia,serif;color:#f2d79b;margin-bottom:12px">Made with ❤ by <a href="' + SITE + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">AD Soft Technologies</a></div>' +
      '<div>Follow us</div><div style="margin-top:12px">' +
      '<a href="' + IG + '" target="_blank" rel="noopener" aria-label="Instagram" style="' + a + '"><svg viewBox="0 0 24 24" style="' + ic + '"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>' +
      '<a href="' + FB + '" target="_blank" rel="noopener" aria-label="Facebook" style="' + a + '"><svg viewBox="0 0 24 24" style="' + ic + '"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg></a></div>' +
      '<p style="margin-top:16px;font-size:12px;opacity:.7">© ' + new Date().getFullYear() + ' AD Soft Technologies</p>';
    document.body.appendChild(f);
  }

  /* ---------- background music ---------- */
  var audio = null, btn = null, wanted = false, armed = false, src = '';
  function ensureBtn() {
    if (btn) return;
    btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('aria-label', 'Play or pause music');
    btn.style.cssText = 'position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;width:46px;height:46px;border-radius:50%;border:0;background:rgba(30,26,22,.82);color:#fff;font-size:20px;line-height:1;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.3);display:grid;place-items:center';
    btn.onclick = function () { if (audio.paused) { wanted = true; play(); } else { wanted = false; audio.pause(); } paint(); };
    document.body.appendChild(btn);
  }
  function paint() { if (btn) btn.textContent = audio && !audio.paused ? '🔊' : '🔇'; }
  function play() { var p = audio.play(); if (p && p.then) p.then(paint, paint); }
  function arm() {
    if (armed) return; armed = true;
    var go = function () {
      ['pointerdown', 'keydown', 'touchend'].forEach(function (e) { removeEventListener(e, go, true); });
      wanted = true;
      var v = document.getElementById('v'); /* chocolate: let the intro video finish first */
      if (v && v.src && !v.ended && !v.paused) { v.addEventListener('ended', function () { if (wanted) play(); }, { once: true }); } else play();
    };
    ['pointerdown', 'keydown', 'touchend'].forEach(function (e) { addEventListener(e, go, true); });
  }
  function music(url) {
    url = String(url || '').trim();
    if (CARD || url === src) return;
    src = url;
    if (!url) { if (audio) { audio.pause(); audio.removeAttribute('src'); } if (btn) btn.hidden = true; return; }
    if (!audio) { audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.addEventListener('play', paint); audio.addEventListener('pause', paint); }
    audio.src = url; ensureBtn(); btn.hidden = false; paint();
    if (wanted) play(); else arm();
  }

  addEventListener('message', function (e) {
    if (e.source !== window.parent || e.origin !== location.origin || !e.data || e.data.type !== 'inv:data') return;
    music((e.data.data || {}).bgMusic);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', footer); else footer();
})();
