/* =========================================================
   inv-runtime.js  — shared by every editable template
   - receives live data from the editor / viewer (postMessage "inv:data")
   - falls back to Firestore REST when opened as ?id=<invitation>
   - helpers: assets, dates, music, RSVP
   ========================================================= */
(function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const DIR = new URL('.', document.currentScript.src).href;           // this template's folder
  const INV = (window.INV = {
    embed: q.get('embed') === 'preview', skip: q.get('skip') === '1', id: q.get('id'),
    data: null, defaults: {}, site: new URL('../../', DIR).href, _h: [], _rs: {}, _started: false,
  });
  const inFrame = window.parent !== window;

  /* hide the demo content until real data arrives (no flash of "Priya & Karthik") */
  document.documentElement.classList.add('inv-wait');
  const st = document.createElement('style');
  st.textContent = 'html.inv-wait body{opacity:0}body{transition:opacity .35s}' +
    '.inv-music{position:fixed;right:14px;bottom:14px;z-index:200;width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);background:rgba(20,20,20,.55);color:#fff;font-size:20px;line-height:1;cursor:pointer;display:none;align-items:center;justify-content:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +
    '.inv-music.on{display:flex}.inv-music.play{animation:invspin 4s linear infinite}@keyframes invspin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);

  /* ---------- helpers ---------- */
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const merge = (a, b) => {
    const o = JSON.parse(JSON.stringify(a || {}));
    (function w(t, s) { for (const k of Object.keys(s || {})) { if (isObj(s[k]) && isObj(t[k])) w(t[k], s[k]); else t[k] = JSON.parse(JSON.stringify(s[k])); } })(o, b || {});
    return o;
  };
  INV.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  INV.asset = (v) => {
    if (!v) return '';
    if (/^(https?:|data:|blob:|\/\/)/i.test(v)) return v;
    if (/^(templates|images|videos|assets)\//.test(v) || v[0] === '/') return new URL(v, INV.site).href;
    return new URL(v, DIR).href;
  };
  INV.bg = (v) => (v ? `url("${INV.asset(v).replace(/"/g, '%22')}")` : '');
  const $ = (s, r) => (r || document).querySelector(s);
  INV.$ = $;
  INV.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  INV.text = (sel, v) => { const n = $(sel); if (n) n.textContent = v == null ? '' : v; };
  INV.show = (sel, on) => { INV.$$(sel).forEach((n) => { n.hidden = !on; n.style.display = on ? '' : 'none'; }); };

  /* dates are treated as Indian Standard Time */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  INV.dt = (date, time) => (date ? new Date(`${date}T${time || '00:00'}:00+05:30`) : null);
  INV.fmt = {
    long: (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : ''; },
    short: (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]}` : ''; },
    dots: (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${m[3]} · ${m[2]} · ${m[1]}` : ''; },
    weekday: (d) => (/^\d{4}-\d\d-\d\d/.test(d || '') ? DAYS[new Date(d.slice(0, 10) + 'T12:00:00Z').getUTCDay()] : ''),
    time: (t) => { const m = /^(\d{1,2}):(\d\d)/.exec(t || ''); if (!m) return ''; let h = +m[1]; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m[2]} ${ap}`; },
  };
  INV.when = (date, time) => [INV.fmt.long(date), INV.fmt.time(time)].filter(Boolean).join(' · ');
  INV.mapEmbed = (d) => { const qy = d.mapQuery || [d.venueName, d.venueAddress].filter(Boolean).join(', '); return `https://maps.google.com/maps?q=${encodeURIComponent(qy)}&output=embed`; };
  INV.mapLink = (d) => (/^https?:\/\//i.test(d.mapLink || '') ? d.mapLink : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.mapQuery || [d.venueName, d.venueAddress].filter(Boolean).join(', '))}`);

  /* ---------- background music ---------- */
  let audio = null, mbtn = null;
  INV.setMusic = (url) => {
    if (!mbtn) {
      mbtn = document.createElement('button'); mbtn.type = 'button'; mbtn.className = 'inv-music'; mbtn.setAttribute('aria-label', 'Play or pause music'); mbtn.textContent = '♪';
      mbtn.onclick = () => { if (!audio) return; if (audio.paused) audio.play().catch(() => {}); else audio.pause(); };
      document.body.appendChild(mbtn);
    }
    if (!url) { if (audio) { audio.pause(); audio = null; } mbtn.classList.remove('on', 'play'); return; }
    const src = INV.asset(url);
    if (!audio || audio.dataset.src !== src) {
      if (audio) audio.pause();
      audio = new Audio(src); audio.loop = true; audio.preload = 'none'; audio.dataset.src = src;
      audio.onplay = () => mbtn.classList.add('play'); audio.onpause = () => mbtn.classList.remove('play');
    }
    mbtn.classList.add('on');
  };
  INV.playMusic = () => { if (audio && audio.paused) audio.play().catch(() => {}); };

  /* ---------- data in ---------- */
  INV.on = (fn) => { INV._h.push(fn); if (INV.data) fn(INV.data); };
  INV.set = (d) => {
    INV.data = merge(INV.defaults, d || {});
    document.documentElement.classList.remove('inv-wait');
    INV._h.forEach((fn) => { try { fn(INV.data); } catch (e) { console.error('[inv]', e); } });
  };
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    const m = e.data; if (!m || typeof m !== 'object') return;
    if (m.type === 'inv:data') { if (m.base) INV.site = m.base; INV.set(m.data); }
    else if (m.type === 'inv:open') { if (INV.openFn) INV.openFn(); }
    else if (m.type === 'inv:scrollTo') { const n = m.selector && $(m.selector); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (m.type === 'inv:rsvp:result') { const r = INV._rs[m.id]; if (r) { delete INV._rs[m.id]; m.ok === false ? r.rej(new Error(m.error || 'RSVP failed')) : r.res(); } }
  });

  /* ---------- Firestore REST fallback (opened directly as ?id=...) ---------- */
  const fsVal = (v) => {
    if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return +v.integerValue; if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue; if ('timestampValue' in v) return v.timestampValue; if ('nullValue' in v) return null;
    if (v.mapValue) return fsMap(v.mapValue.fields || {}); if (v.arrayValue) return (v.arrayValue.values || []).map(fsVal); return null;
  };
  const fsMap = (f) => { const o = {}; Object.keys(f).forEach((k) => { o[k] = fsVal(f[k]); }); return o; };
  const fsEnc = (v) => (typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v == null ? '' : v) });
  function loadCfg() {
    if (window.INV_CONFIG) return Promise.resolve(window.INV_CONFIG);
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = new URL('../../js/inv-config.js', DIR).href; s.onload = () => res(window.INV_CONFIG); s.onerror = rej; document.head.appendChild(s); });
  }
  async function fetchDoc() {
    const c = await loadCfg(); const f = c.firebase || {};
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${f.projectId}/databases/(default)/documents/${c.collection || 'premiumInvitations'}/${encodeURIComponent(INV.id)}?key=${f.apiKey}`);
    if (!r.ok) throw new Error('not found');
    const j = await r.json(); return (fsMap(j.fields || {}).data) || {};
  }

  /* ---------- RSVP ---------- */
  INV.rsvp = async (p) => {
    p = Object.assign({ name: '', email: '', phone: '', attendance: '', guests: 1, dietary: '', message: '' }, p);
    if (inFrame) {
      const rid = 'r' + Date.now() + Math.random().toString(36).slice(2, 6);
      try {
        await new Promise((res, rej) => {
          INV._rs[rid] = { res, rej };
          window.parent.postMessage(Object.assign({ type: 'inv:rsvp', id: rid, invitationId: INV.id, data: p, payload: p }, p), location.origin);
          setTimeout(() => { if (INV._rs[rid]) { delete INV._rs[rid]; rej(new Error('timeout')); } }, 4000);
        });
        return true;
      } catch (e) { if (INV.embed) throw e; }
    }
    if (!INV.id) throw new Error('no id');
    const c = await loadCfg(); const f = c.firebase || {};
    const body = { fields: { name: fsEnc(p.name), email: fsEnc(p.email), phone: fsEnc(p.phone), attendance: fsEnc(p.attendance), guests: { integerValue: String(Math.max(0, Math.min(50, +p.guests || 0))) }, dietary: fsEnc(p.dietary), message: fsEnc(String(p.message).slice(0, 600)), createdAt: { timestampValue: new Date().toISOString() } } };
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${f.projectId}/databases/(default)/documents/${c.collection || 'premiumInvitations'}/${encodeURIComponent(INV.id)}/rsvps?key=${f.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('rsvp failed');
    return true;
  };

  /* ---------- boot (called by each template at the end of its script) ---------- */
  INV.start = () => {
    if (INV._started) return; INV._started = true;
    if (inFrame) window.parent.postMessage({ type: 'inv:ready' }, location.origin);
    setTimeout(async () => {
      if (INV.data) return;
      if (INV.id) { try { INV.set(await fetchDoc()); return; } catch (e) { /* fall through */ } }
      if (!INV.data && !INV.embed) INV.set({});                     // plain preview: show the demo content
    }, inFrame && !INV.id ? 1800 : 600);
  };
})();
