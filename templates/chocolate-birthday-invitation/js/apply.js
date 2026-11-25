/* Chocolate Birthday — applies the editor's data to the page (inv:data) and talks to the platform. */
(function () {
  'use strict';
  var base = location.href, last = {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  function url(src) {
    if (!src) return '';
    if (/^(https?:|data:|blob:|\/\/)/i.test(src)) return src;
    try { return new URL(src, base).href; } catch (e) { return src; }
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function img(src, alt, eager) {
    var i = el('img'); i.alt = alt || ''; i.decoding = 'async'; if (!eager) i.loading = 'lazy'; i.src = url(src);
    i.onerror = function () { i.style.visibility = 'hidden'; }; return i;
  }
  /* re-render a list only when its data really changed (no flicker while typing) */
  function changed(key, val) { var j = JSON.stringify(val); if (last[key] === j) return false; last[key] = j; return true; }
  function reveal(root) { $$('.rv', root).forEach(function (n) { if (EMB || PREV) n.classList.add('in'); else if (window.io) io.observe(n); }); }

  function apply(d) {
    d = d || {};
    var name = (d.celebrant || 'Mithra').trim(), kind = d.eventTitle != null ? d.eventTitle : 'Birthday Bash';
    var dt = new Date((d.eventDate || '2026-12-20') + 'T00:00:00'), ok = !isNaN(dt.getTime());
    var short = ok ? pad(dt.getDate()) + ' · ' + MON[dt.getMonth()] + ' · ' + dt.getFullYear() : '20 · DEC · 2026';
    var longDate = ok ? DAYL[dt.getDay()] + ', ' + dt.getDate() + ' ' + MONL[dt.getMonth()] + ' ' + dt.getFullYear() : '';
    var tm = /^(\d{1,2}):(\d{2})$/.exec(d.eventTime || ''), timeText = '';
    if (tm) { var h = +tm[1]; timeText = (h % 12 || 12) + ':' + tm[2] + ' ' + (h >= 12 ? 'PM' : 'AM') + (d.timeNote ? ' ' + d.timeNote : ''); }
    INV.title = name + "'s " + kind; INV.dateText = ok ? dt.getDate() + ' ' + MON[dt.getMonth()].charAt(0) + MON[dt.getMonth()].slice(1).toLowerCase() + ' ' + dt.getFullYear() : '';
    INV.gameWin = d.gameWin;
    document.title = INV.title;

    /* plain text bindings */
    $$('[data-b]').forEach(function (n) { var k = n.getAttribute('data-b'); if (d[k] != null) n.textContent = d[k]; });
    $$('[data-t="title"]').forEach(function (n) { n.textContent = INV.title; });
    $$('[data-t="dateShort"]').forEach(function (n) { n.textContent = short; });
    var h1 = $('#heroTitle'); h1.textContent = ''; h1.appendChild(document.createTextNode(name + "'s")); h1.appendChild(document.createElement('br')); h1.appendChild(document.createTextNode(kind));

    /* date boxes + countdown */
    if (ok) {
      var b = $$('#s-date .dbox b'); b[0].textContent = pad(dt.getDate()); b[1].textContent = MON[dt.getMonth()]; b[2].textContent = dt.getFullYear();
      var t = new Date((d.eventDate) + 'T' + (tm ? pad(+tm[1]) + ':' + tm[2] : '00:00') + ':00+05:30'); if (!isNaN(t.getTime())) T = t;
    }

    /* venue */
    var addr = d.venueAddress || d.venue || '', q = d.mapQuery || addr || d.venue || '';
    $('#venueName').textContent = d.venue || '';
    $('#vDate').textContent = longDate; $('#vTime').textContent = timeText; $('#vAddr').textContent = addr;
    var phone = (d.phone || '').trim(); $('#vPhone').textContent = phone;
    $('#vPhoneRow').hidden = !phone; $('#vCall').hidden = !phone;
    if (phone) $('#vCall').href = 'tel:' + phone.replace(/[^\d+]/g, '');
    $('#vDir').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
    var map = $('#s-venue iframe'), mu = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
    if (q && map && map.getAttribute('data-u') !== mu) { map.setAttribute('data-u', mu); map.src = mu; }

    /* games / rsvp */
    if (d.gameText != null) $('#gameText').textContent = d.gameText;
    $('#rsvpKick').textContent = d.rsvpDeadline ? (d.rsvpKickPrefix != null ? d.rsvpKickPrefix : 'Kindly reply by') + ' ' + d.rsvpDeadline : '';
    if (d.rsvpYes) $('#optYes').textContent = d.rsvpYes; if (d.rsvpNo) $('#optNo').textContent = d.rsvpNo;
    if (d.rsvpButton) $('#rb').textContent = d.rsvpButton;
    WA = String(d.rsvpWhatsApp || '').replace(/\D/g, '');

    /* lists */
    var any = false;
    if (Array.isArray(d.timeline) && changed('tl', d.timeline)) {
      var tl = $('#tlList'); tl.innerHTML = '';
      d.timeline.forEach(function (x) {
        var r = el('div', 'ti rv'); if (x.image) r.appendChild(img(x.image, x.title));
        var w = el('div'); w.appendChild(el('time', '', x.time || '')); w.appendChild(el('h3', '', x.title || '')); w.appendChild(el('p', '', x.description || ''));
        r.appendChild(w); tl.appendChild(r);
      }); reveal(tl); any = true;
    }
    if (Array.isArray(d.dress) && changed('dress', d.dress)) {
      var dr = $('#dressList'); dr.innerHTML = '';
      d.dress.forEach(function (x) {
        var c = el('div', 'dr rv'), sw = el('div', 'sw');
        (String(x.colors || '').match(/#[0-9a-fA-F]{3,8}\b/g) || []).slice(0, 5).forEach(function (col) { var i = el('i'); i.style.background = col; sw.appendChild(i); });
        c.appendChild(sw); c.appendChild(el('h3', '', x.title || '')); c.appendChild(el('p', '', x.description || '')); dr.appendChild(c);
      }); reveal(dr); any = true;
    }
    if (Array.isArray(d.journey) && changed('jr', d.journey)) {
      var jt2 = $('#jt'); jt2.innerHTML = '';
      d.journey.forEach(function (x, i) {
        var c = el('div', 'jc'); if (x.image) c.appendChild(img(x.image, x.title, true));
        var w = el('div'); w.appendChild(el('b', '', pad(i + 1))); w.appendChild(el('h3', '', x.title || '')); w.appendChild(el('p', '', x.description || '')); c.appendChild(w); jt2.appendChild(c);
      });
      jt2.dataset.base = jt2.innerHTML; dupJourney(); any = true;
    }
    if (Array.isArray(d.gallery) && changed('gal', d.gallery)) {
      var g = $('#galList'); g.innerHTML = '';
      d.gallery.filter(function (x) { return x && x.src; }).forEach(function (x, i) { var im = img(x.src, x.alt || 'Moment ' + (i + 1)); im.className = 'rv'; g.appendChild(im); });
      reveal(g); any = true;
    }
    /* layout changed -> re-measure the travelling chocolate once things settle */
    clearTimeout(apply.t); apply.t = setTimeout(function () { if (window.calc) calc(); }, any ? 250 : 60);
  }

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || e.origin !== location.origin || !e.data) return;
    var m = e.data;
    if (m.type === 'inv:data') { if (m.base) base = m.base; apply(m.data); }
    else if (m.type === 'inv:open') {            /* editor preview: open the gift card by itself (no guest tap needed) */
      if (document.getElementById('gate') && typeof window.openGate === 'function') window.openGate();
    }
    else if (m.type === 'inv:scrollTo' && typeof m.selector === 'string' && !root.classList.contains('locked')) {
      var t = null; try { t = document.querySelector(m.selector); } catch (x) { /* ignore */ }
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  if (window.parent !== window) window.parent.postMessage({ type: 'inv:ready' }, location.origin);
})();
