'use strict';
/* =========================================================
   ROYAL IVORY — renderer
   Pure view: receives data from the parent page (editor preview or
   public viewer) via postMessage, and renders it. No Firebase here.
   Messages in : inv:data {data, base} · inv:scrollTo {selector} · inv:rsvp:result
   Messages out: inv:ready · inv:rsvp {id, payload}
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const enc = encodeURIComponent;
  const ORIGIN = location.origin;
  const hasParent = window.parent !== window && ORIGIN !== 'null';

  let D = null;              // current data
  let BASE = document.baseURI;
  let opened = false;
  let firstData = true;

  /* ---------- url helpers (Cloudinary-aware) ---------- */
  const abs = (u) => (!u ? '' : /^(https?:|data:|blob:|\/\/)/i.test(u) ? u : new URL(u, BASE).href);
  const img = (u, w) => {
    u = abs(u);
    return /res\.cloudinary\.com\/.+\/image\/upload\//.test(u) && !/\/upload\/(f_|q_|w_|c_)/.test(u)
      ? u.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${w}/`) : u;
  };
  const cssUrl = (u) => `url("${String(u).replace(/"/g, '%22')}")`;

  /* ---------- colour helpers ---------- */
  const hex = (h) => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); const n = parseInt(h, 16); return Number.isNaN(n) || h.length !== 6 ? null : [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (h, t, a) => { const c = hex(h); if (!c) return null; return '#' + c.map((v, i) => Math.round(v + (t[i] - v) * a).toString(16).padStart(2, '0')).join(''); };

  /* ---------- date helpers ---------- */
  const longDate = (iso, weekday) => {
    const d = new Date(`${iso}T12:00:00`);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { weekday: weekday ? 'long' : undefined, day: 'numeric', month: 'long', year: 'numeric' });
  };
  const getPath = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
  const setText = (el, v) => { v = v == null ? '' : String(v); if (el.textContent !== v) el.textContent = v; };

  /* =========================================================
     RENDER (idempotent — called on every data change)
     ========================================================= */
  const timelineEl = $('#timeline');
  const galleryEl = $('#gallery');
  const guestsSel = $('#fGuests');
  const ICONS = {
    arrival: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20.5c.6-3.7 3.2-5.8 6.5-5.8s5.9 2.1 6.5 5.8"/>',
    ceremony: '<circle cx="9" cy="15" r="5"/><circle cx="15.5" cy="15" r="5"/><path d="M10.2 6.6l1.8-3 1.8 3-1.8 2z"/>',
    photo: '<path d="M3.5 8.5h3.2l1.6-2.3h7.4l1.6 2.3h3.2v11h-17z"/><circle cx="12" cy="14" r="3.6"/>',
    lunch: '<path d="M7 3v7.5M4.8 3v5a2.2 2.2 0 004.4 0V3M7 11v10M17 21V3c-2.4 1.6-3 4.6-3 8h3"/>',
    reception: '<path d="M7.5 3h9v5.2a4.5 4.5 0 01-9 0z"/><path d="M12 12.7V20M8.2 21h7.6"/>',
    celebration: '<path d="M11 3l1.9 5.4L18.3 10.3 12.9 12.2 11 17.6 9.1 12.2 3.7 10.3l5.4-1.9z"/><path d="M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  };
  const SHAPES = ['wide', 'tall', '', '', '', 'tall', '', 'wide'];
  let mapTimer = null;

  function render() {
    const d = D;
    const ini = (s) => String(s || '').trim().charAt(0).toUpperCase();
    const cer = d.ceremony || {}, rec = d.reception || {}, map = d.map || {};

    /* theme */
    const root = document.documentElement.style;
    const t = d.theme || {};
    const olive = hex(t.primary) ? t.primary : '#76795a';
    const gold = hex(t.accent) ? t.accent : '#b08d57';
    root.setProperty('--olive', olive);
    root.setProperty('--olive-deep', mix(olive, [0, 0, 0], 0.26));
    root.setProperty('--gold', gold);
    root.setProperty('--gold-soft', mix(gold, [255, 255, 255], 0.32));
    root.setProperty('--line', `${mix(gold, [255, 255, 255], 0.0)}61`);

    /* text bindings */
    const V = {
      groom: d.groom, bride: d.bride,
      sealInitials: `${ini(d.groom)}&${ini(d.bride)}`,
      dateLong: longDate(d.weddingDate),
      tagline: d.tagline, familiesLine: d.familiesLine, invitationMessage: d.invitationMessage,
      coupleLine: `${d.groom || ''} & ${d.bride || ''}`,
      ceremony: { ...cer, dateLabel: longDate(cer.date || d.weddingDate, true) },
      reception: { ...rec, dateLabel: longDate(rec.date || d.weddingDate, true) },
      mapTitle: map.title, mapAddress: map.address, thanks: d.thanks || {}, labels: d.labels || {},
    };
    $$('[data-bind]').forEach((el) => { const v = getPath(V, el.dataset.bind); if (v != null && v !== '') setText(el, v); });

    /* images */
    root.setProperty('--hero-img', d.heroImage ? cssUrl(img(d.heroImage, 1600)) : 'none');
    root.setProperty('--closing-img', d.closingImage ? cssUrl(img(d.closingImage, 1600)) : 'none');

    /* sections on / off */
    const sec = d.sections || {};
    const show = {
      countdown: sec.countdown !== false,
      timeline: sec.timeline !== false && (d.timeline || []).length > 0,
      gallery: sec.gallery !== false && (d.gallery || []).length > 0,
      map: sec.map !== false,
      rsvp: !!(d.rsvp && d.rsvp.enabled),
    };
    $$('[data-section]').forEach((s) => { s.hidden = !show[s.dataset.section]; });

    /* directions + map */
    const venueTarget = (v) => v.mapQuery || `${v.venue || ''}, ${v.address || ''}`;
    const mainTarget = map.coordinates || map.query || `${map.title || ''} ${map.address || ''}`;
    const dir = (q) => `https://www.google.com/maps/dir/?api=1&destination=${enc(q)}`;
    $$('[data-directions]').forEach((a) => { const k = a.dataset.directions; a.href = dir(k === 'main' ? mainTarget : venueTarget(k === 'ceremony' ? cer : rec)); });
    $$('[data-openmap]').forEach((a) => { a.href = map.url || `https://www.google.com/maps/search/?api=1&query=${enc(mainTarget)}`; });
    clearTimeout(mapTimer);
    mapTimer = setTimeout(() => {
      const frame = $('#mapFrame'); const src = `https://www.google.com/maps?q=${enc(mainTarget)}&z=15&output=embed`;
      if (show.map && frame.getAttribute('src') !== src) frame.src = src;
    }, 500);

    /* timeline */
    const tlSeen = timelineEl.classList.contains('in');
    timelineEl.innerHTML = '';
    (d.timeline || []).forEach((e, i) => {
      const li = document.createElement('li');
      li.className = 'tl-item reveal' + (tlSeen ? ' in' : '');
      li.style.setProperty('--i', i);
      const time = Object.assign(document.createElement('span'), { className: 'tl-time', textContent: e.time || '' });
      const dot = Object.assign(document.createElement('span'), { className: 'tl-dot' });
      dot.setAttribute('aria-hidden', 'true');
      const body = document.createElement('div');
      body.className = 'tl-body';
      body.innerHTML = `<svg class="tl-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[e.icon] || ICONS.celebration}</svg>`;
      const txt = document.createElement('div');
      txt.append(
        Object.assign(document.createElement('h3'), { className: 'tl-title', textContent: e.title || '' }),
        Object.assign(document.createElement('p'), { className: 'tl-desc', textContent: e.desc || '' }));
      body.append(txt);
      li.append(time, dot, body);
      timelineEl.append(li);
      if (!tlSeen) io.observe(li);
    });

    /* gallery */
    const galSeen = galleryEl.dataset.built === '1';
    galleryEl.innerHTML = '';
    (d.gallery || []).forEach((g, i) => {
      const shape = SHAPES[i % SHAPES.length];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `g-item reveal${shape ? ' g-item--' + shape : ''}${galSeen ? ' in' : ''}`;
      b.style.setProperty('--i', i % 3);
      b.setAttribute('aria-label', `Open photo ${i + 1}`);
      const im = document.createElement('img');
      im.src = img(g.src, shape === 'wide' ? 1000 : 600); im.alt = g.alt || 'Wedding photo'; im.loading = 'lazy'; im.decoding = 'async';
      b.append(im);
      b.addEventListener('click', () => openLightbox(i, b));
      galleryEl.append(b);
      if (!galSeen) io.observe(b);
    });
    galleryEl.dataset.built = '1';

    /* RSVP config */
    const maxG = Math.max(1, Math.min(20, Number(d.rsvp && d.rsvp.maxGuests) || 6));
    if (guestsSel.options.length !== maxG) {
      const cur = guestsSel.value; guestsSel.innerHTML = '';
      for (let i = 1; i <= maxG; i++) guestsSel.append(new Option(i === 1 ? '1 Guest' : `${i} Guests`, i));
      if (cur && Number(cur) <= maxG) guestsSel.value = cur;
    }
    const dl = d.rsvp && d.rsvp.deadline;
    setText($('#rsvpNote'), dl ? `Kindly respond by ${dl}` : '');
    $('#rsvpNote').hidden = !dl;

    /* music */
    setMusic(d.music && d.music.url);

    /* countdown */
    startCountdown();
  }

  /* =========================================================
     COUNTDOWN
     ========================================================= */
  const cd = {};
  $$('[data-cd]').forEach((el) => { cd[el.dataset.cd] = el; });
  const pad = (n) => String(n).padStart(2, '0');
  const setNum = (el, v) => { if (el.textContent === v) return; el.textContent = v; el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); };
  let cdTimer = null;
  function startCountdown() {
    clearInterval(cdTimer);
    const target = new Date(`${D.weddingDate}T${D.weddingTime || '10:00'}:00${D.utcOffset || '+05:30'}`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (Number.isNaN(target)) { Object.values(cd).forEach((e) => setNum(e, '00')); return; }
      if (diff <= 0) {
        clearInterval(cdTimer);
        $('#countdownGrid').hidden = true;
        const days = (Date.now() - target) / 864e5;
        setText($('#countdownDoneTitle'), days < 1 ? 'Today Is The Day' : 'We Are Married');
        setText($('#countdownDoneText'), days < 1 ? `${D.groom} & ${D.bride} are getting married today. Thank you for celebrating with us.` : 'Thank you for being part of our beautiful beginning.');
        $('#countdownDone').hidden = false;
        return;
      }
      $('#countdownGrid').hidden = false; $('#countdownDone').hidden = true;
      const s = Math.floor(diff / 1000);
      setNum(cd.days, pad(Math.floor(s / 86400)));
      setNum(cd.hours, pad(Math.floor((s % 86400) / 3600)));
      setNum(cd.minutes, pad(Math.floor((s % 3600) / 60)));
      setNum(cd.seconds, pad(s % 60));
    };
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  /* =========================================================
     SCROLL REVEAL, PETALS, PARALLAX
     ========================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
  new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { timelineEl.classList.add('in'); obs.disconnect(); } }, { threshold: 0.1 }).observe(timelineEl);

  if (!reduced) {
    $$('[data-petals]').forEach((box) => {
      for (let i = 0; i < 14; i++) {
        const p = document.createElement('span');
        const size = 8 + Math.random() * 12;
        p.className = 'petal' + (i % 4 === 0 ? ' petal--leaf' : '');
        p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size * 1.25}px;animation-duration:${11 + Math.random() * 10}s;animation-delay:${-Math.random() * 18}s;--dx:${(Math.random() - 0.5) * 160}px;--rot:${(Math.random() > 0.5 ? 1 : -1) * (240 + Math.random() * 300)}deg;`;
        box.append(p);
      }
    });
  }
  const parallax = $$('[data-parallax]');
  let ticking = false;
  function updateParallax() {
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.transform = `translate3d(0, ${(-r.top * 0.16).toFixed(1)}px, 0)`;
    });
    ticking = false;
  }
  if (!reduced) addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); } }, { passive: true });

  /* =========================================================
     LIGHTBOX
     ========================================================= */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
  let lbIndex = 0, lbOpener = null;
  const photos = () => (D && D.gallery) || [];
  const showPhoto = (i, animate = true) => {
    const n = photos().length; if (!n) return;
    lbIndex = (i + n) % n;
    const apply = () => { lbImg.src = img(photos()[lbIndex].src, 1800); lbImg.alt = photos()[lbIndex].alt || ''; lbCount.textContent = `${lbIndex + 1} / ${n}`; lbImg.classList.remove('swap'); };
    if (animate && !reduced) { lbImg.classList.add('swap'); setTimeout(apply, 280); } else apply();
  };
  function openLightbox(i, opener) {
    lbOpener = opener; lb.hidden = false; showPhoto(i, false);
    requestAnimationFrame(() => lb.classList.add('open'));
    document.body.classList.add('no-scroll'); $('#lbClose').focus();
  }
  function closeLightbox() {
    lb.classList.remove('open'); setTimeout(() => { lb.hidden = true; }, reduced ? 0 : 500);
    document.body.classList.remove('no-scroll'); if (lbOpener) lbOpener.focus({ preventScroll: true });
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => showPhoto(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showPhoto(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => { if (touchX == null) return; const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1)); touchX = null; });

  /* =========================================================
     TOAST + MUSIC
     ========================================================= */
  const toastEl = $('#toast'); let toastTimer;
  const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600); };

  const musicBtn = $('#musicBtn');
  const audio = new Audio();
  audio.loop = true; audio.preload = 'none'; audio.volume = 0.55;
  let playing = false, musicUrl = '';
  const syncMusicUi = () => {
    musicBtn.classList.toggle('is-playing', playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  };
  function setMusic(url) {
    url = abs(url || '');
    if (url !== musicUrl) {
      musicUrl = url;
      const was = playing;
      audio.pause(); playing = false;
      if (url) audio.src = url; else audio.removeAttribute('src');
      syncMusicUi();
      if (was && url) playMusic();
    }
    musicBtn.hidden = !(musicUrl && opened);
  }
  audio.addEventListener('error', () => { if (musicUrl) { playing = false; syncMusicUi(); } });
  async function playMusic(user) {
    if (!musicUrl) return;
    try { await audio.play(); playing = true; } catch (e) { playing = false; if (user) toast('Music is unavailable right now.'); }
    syncMusicUi();
  }
  musicBtn.addEventListener('click', () => { if (playing) { audio.pause(); playing = false; syncMusicUi(); } else playMusic(true); });

  /* =========================================================
     ENVELOPE OPENING
     ========================================================= */
  const intro = $('#intro'), envelope = $('#envelope'), main = $('#invitation');
  function openInvitation(instant) {
    if (opened) return;
    opened = true;
    const k = instant ? 0 : reduced ? 0.15 : 1;
    const at = (ms, fn) => (k === 0 ? fn() : setTimeout(fn, ms * k));
    if (!instant) playMusic();
    envelope.classList.add('is-opening'); intro.classList.add('is-opening');
    at(650, () => envelope.classList.add('is-flap-open'));
    at(1100, () => envelope.classList.add('is-flap-behind'));
    at(1500, () => envelope.classList.add('is-card-out'));
    at(3500, () => {
      main.removeAttribute('inert'); main.setAttribute('aria-hidden', 'false'); main.classList.add('is-live');
      window.scrollTo(0, 0); intro.classList.add('is-leaving');
    });
    at(4600, () => { intro.hidden = true; document.body.classList.remove('is-locked'); musicBtn.hidden = !musicUrl; updateParallax(); });
  }
  $('#seal').addEventListener('click', () => openInvitation());
  $('#openBtn').addEventListener('click', () => openInvitation());

  /* =========================================================
     RSVP  (delegated to the parent page, which owns Firebase)
     ========================================================= */
  const pending = new Map();
  function sendRsvp(payload) {
    if (!hasParent) return Promise.reject(new Error('Open this invitation from its link to RSVP.'));
    return new Promise((res, rej) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      pending.set(id, { res, rej });
      window.parent.postMessage({ type: 'inv:rsvp', id, payload }, ORIGIN);
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('Timed out')); } }, 20000);
    });
  }

  const form = $('#rsvpForm');
  const attending = $('#attendingFields');
  const errEl = (n) => $(`.error[data-for="${n}"]`, form);
  function setError(name, msg) {
    const e = errEl(name); if (e) e.textContent = msg;
    const inp = form.elements[name];
    if (inp && inp.tagName) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  $$('input[name="attendance"]').forEach((r) => r.addEventListener('change', () => {
    attending.classList.toggle('is-hidden', r.value === 'Regretfully Declines' && r.checked);
    setError('attendance', '');
  }));
  ['name', 'email', 'phone'].forEach((n) => form.elements[n].addEventListener('input', () => setError(n, '')));

  function validate() {
    let ok = true, first = null;
    const fail = (n, m) => { setError(n, m); ok = false; if (!first) first = form.elements[n]; };
    const name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), phone = form.elements.phone.value.trim();
    if (name.length < 2) fail('name', 'Please enter your full name.'); else setError('name', '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail('email', 'Please enter a valid email address.'); else setError('email', '');
    if (!/^\+?[\d\s()-]{7,18}$/.test(phone) || phone.replace(/\D/g, '').length < 7) fail('phone', 'Please enter a valid phone number.'); else setError('phone', '');
    if (!form.elements.attendance.value) { setError('attendance', 'Please let us know if you can join us.'); ok = false; if (!first) first = $('input[name="attendance"]', form); }
    if (first) first.focus();
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements._gotcha.value || !validate()) return;
    const declines = form.elements.attendance.value === 'Regretfully Declines';
    const data = {
      name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), phone: form.elements.phone.value.trim(),
      attendance: form.elements.attendance.value, guests: declines ? 0 : Number(form.elements.guests.value),
      dietary: declines ? '' : form.elements.dietary.value, message: form.elements.message.value.trim(),
    };
    const btn = $('#rsvpSubmit');
    btn.disabled = true; btn.classList.add('is-loading');
    try {
      await sendRsvp(data);
      form.hidden = true;
      const first = data.name.split(' ')[0];
      setText($('#successTitle'), declines ? 'We Will Miss You' : 'Thank You');
      setText($('#successText'), declines ? `Thank you for letting us know, ${first}. You will be in our hearts on our special day.` : `We are delighted you can join us, ${first}. Your RSVP has been received.`);
      const ok = $('#rsvpSuccess'); ok.hidden = false; ok.focus();
      toast('Your RSVP has been sent.');
    } catch (err) {
      toast(err.message === 'Timed out' || !err.message ? 'Something went wrong. Please try again.' : err.message);
      btn.disabled = false; btn.classList.remove('is-loading');
    }
  });

  /* =========================================================
     MESSAGES FROM PARENT
     ========================================================= */
  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN || e.source !== window.parent) return;
    const m = e.data || {};
    if (m.type === 'inv:data' && m.data) {
      D = m.data; if (m.base) BASE = m.base;
      render();
      if (firstData) { firstData = false; if (params.get('skip') === '1') openInvitation(true); }
    } else if (m.type === 'inv:open') {
      openInvitation(true);                       /* editor preview: open the card without waiting for a tap */
    } else if (m.type === 'inv:scrollTo' && typeof m.selector === 'string') {
      openInvitation(true);                       /* no-op when already open */
      requestAnimationFrame(() => { const t = $(m.selector); if (t && !t.hidden) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    } else if (m.type === 'inv:rsvp:result') {
      const p = pending.get(m.id);
      if (p) { pending.delete(m.id); if (m.ok) p.res(); else p.rej(new Error(m.error || 'Could not send RSVP')); }
    }
  });
  if (hasParent) window.parent.postMessage({ type: 'inv:ready' }, ORIGIN);
})();
