/* =========================================================
   INVITATION PLATFORM  (inv-platform.js)
   - Template registry (plug-in system)
   - Popup editor: auto-generated form + live preview
   - Cloudinary uploads (images + audio)
   - Firebase: publish, update, RSVP storage
   Public API: window.InvitationPlatform
   ========================================================= */
(function () {
  'use strict';

  const CFG = window.INV_CONFIG || {};
  const COL = CFG.collection || 'premiumInvitations';
  const LEADS = CFG.leadsCollection || 'invitationLeads';          /* e-mails entered in the "send me the link" popup */
  const MAIL_ENDPOINT = CFG.mailEndpoint || 'send-invitation.php';  /* PHP script that e-mails the link */
  const SITE = new URL(CFG.siteRoot || '.', document.baseURI).href;

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const getPath = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
  const setPath = (o, p, v) => {
    const ks = p.split('.'); const last = ks.pop();
    const t = ks.reduce((x, k) => (x[k] == null || typeof x[k] !== 'object' ? (x[k] = {}) : x[k]), o);
    t[last] = v;
  };
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const mergeData = (base, over) => {
    const out = clone(base || {});
    (function walk(t, s) {
      for (const k of Object.keys(s || {})) {
        if (isObj(s[k]) && isObj(t[k])) walk(t[k], s[k]); else t[k] = clone(s[k]);
      }
    })(out, over || {});
    return out;
  };
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === false || v == null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
    return n;
  };
  const preparePreviewFrame = (frame) => {
    const doc = frame.contentDocument;
    if (!doc || !doc.head) return;
    const style = doc.createElement('style');
    style.textContent = 'html,body{overflow-x:hidden!important;scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}';
    doc.head.append(style);
    const mediaPrototype = frame.contentWindow && frame.contentWindow.HTMLMediaElement && frame.contentWindow.HTMLMediaElement.prototype;
    if (mediaPrototype && !mediaPrototype.play.__ipSilent) {
      const play = mediaPrototype.play;
      const silentPlay = function (...args) {
        this.muted = true;
        this.volume = 0;
        return play.apply(this, args);
      };
      silentPlay.__ipSilent = true;
      mediaPrototype.play = silentPlay;
    }
    doc.querySelectorAll('audio,video').forEach((media) => { media.muted = true; media.volume = 0; });
  };
  const randId = (n = 6) => {
    const a = new Uint8Array(n); crypto.getRandomValues(a);
    return Array.from(a, (b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
  };
  const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let ASSET_DIR = SITE; /* set while an editor is open: bare file names (e.g. "boat.jpg") live inside the template folder */
  const assetUrl = (v) => {
    if (!v) return '';
    if (/^(https?:|data:|blob:|\/\/)/i.test(v)) return v;
    if (/^(templates|images|videos|assets)\//.test(v) || v.startsWith('/')) return new URL(v, SITE).href;
    return new URL(v, ASSET_DIR).href;
  };
  const thumb = (v, w = 400) => {
    const u = assetUrl(v);
    return /res\.cloudinary\.com\/.+\/image\/upload\//.test(u) && !/\/upload\/(f_|q_|w_|c_)/.test(u)
      ? u.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${w}/`) : u;
  };
  const shareUrl = (id) => `${CFG.viewerUrl ? new URL(CFG.viewerUrl, SITE).href : SITE + 'invitation.html'}?id=${encodeURIComponent(id)}`;

  /* ---------------- template registry ---------------- */
  const registry = new Map();
  function register(def) {
    def.entry = def.entry || `templates/${def.id}/index.html`;
    def.thumb = def.thumb || `templates/${def.id}/thumb.svg`;
    registry.set(def.id, def);
  }
  const entryUrl = (def) => new URL(def.entry, SITE).href;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
      document.head.append(s);
    });
  }
  async function loadTemplate(id) {
    if (!/^[A-Za-z0-9-]+$/.test(id || '')) return null;
    if (!registry.has(id)) { try { await loadScript(`${SITE}templates/${id}/register.js`); } catch (e) { return null; } }
    return registry.get(id) || null;
  }

  /* ---------------- Firebase ---------------- */
  let _db = null;
  const FB_VER = '10.12.2';
  let _fbLoad = null;
  /* Firebase SDK is loaded on demand (never blocks the first paint) */
  function ensureFirebase(withAuth) {
    const need = ['app', 'firestore'].concat(withAuth ? ['auth'] : []);
    const have = (n) => (n === 'app' ? !!window.firebase : !!(window.firebase && firebase[n]));
    _fbLoad = _fbLoad || {};
    return need.reduce((chain, n) => chain.then(() => {
      if (have(n)) return;
      _fbLoad[n] = _fbLoad[n] || loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${n}-compat.js`);
      return _fbLoad[n];
    }), Promise.resolve());
  }
  function app() {
    if (!window.firebase) throw new Error('Firebase SDK is not loaded on this page.');
    const f = CFG.firebase || {};
    if (!f.projectId || /YOUR_/.test(f.apiKey || '')) throw new Error('Firebase is not configured yet (js/inv-config.js).');
    return firebase.apps.find((a) => a.name === 'inv-platform') || firebase.initializeApp(f, 'inv-platform');
  }
  const db = () => _db || (_db = app().firestore());
  async function currentUser() {
    await ensureFirebase(true);
    const a = app();
    if (!firebase.auth) throw new Error('Add firebase-auth-compat.js to this page.');
    const auth = a.auth();
    let u = auth.currentUser;
    if (!u) u = await new Promise((r) => { const off = auth.onAuthStateChanged((x) => { off(); r(x); }); });
    if (!u) u = (await auth.signInAnonymously()).user;
    return u;
  }
  async function getInvitation(id) {
    await ensureFirebase();
    const s = await db().collection(COL).doc(id).get();
    return s.exists ? { id: s.id, ...s.data() } : null;
  }
  const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
  async function saveRsvp(id, p) {
    await ensureFirebase();
    const doc = {
      name: clip(p.name, 120), email: clip(p.email, 160), phone: clip(p.phone, 40),
      attendance: clip(p.attendance, 40), guests: Math.max(0, Math.min(50, Number(p.guests) || 0)),
      dietary: clip(p.dietary, 60), message: clip(p.message, 600),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await db().collection(COL).doc(id).collection('rsvps').add(doc);
  }
  async function listRsvps(id) {
    await ensureFirebase();
    const s = await db().collection(COL).doc(id).collection('rsvps').orderBy('createdAt', 'desc').limit(500).get();
    return s.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  /* ---------------- Cloudinary ---------------- */
  const cloudReady = () => { const c = CFG.cloudinary || {}; return !!(c.cloudName && c.uploadPreset && !/YOUR_/.test(c.cloudName)); };
  async function shrinkImage(file, maxDim = 2200) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return file;
    try {
      const bmp = await createImageBitmap(file);
      const s = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
      if (s === 1 && file.size < 2.5e6) return file;
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
      const blob = await new Promise((r) => c.toBlob(r, type, 0.88));
      return blob && blob.size < file.size ? blob : file;
    } catch (e) { return file; }
  }
  async function upload(file, { kind = 'image', onProgress } = {}) {
    if (!cloudReady()) throw new Error('Cloudinary is not configured yet (js/inv-config.js).');
    const isAudio = kind === 'audio';
    if (isAudio ? !/^audio\//.test(file.type) : !/^image\//.test(file.type)) throw new Error(isAudio ? 'Please choose an audio file (mp3, m4a, wav).' : 'Please choose an image file.');
    const maxMB = isAudio ? (CFG.maxAudioMB || 12) : (CFG.maxImageMB || 10);
    if (file.size > maxMB * 1048576) throw new Error(`File is too large (max ${maxMB} MB).`);
    const blob = isAudio ? file : await shrinkImage(file);
    const c = CFG.cloudinary;
    return new Promise((res, rej) => {
      const fd = new FormData();
      fd.append('file', blob); fd.append('upload_preset', c.uploadPreset);
      if (c.folder) fd.append('folder', c.folder);
      const x = new XMLHttpRequest();
      x.open('POST', `https://api.cloudinary.com/v1_1/${c.cloudName}/${isAudio ? 'video' : 'image'}/upload`);
      x.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      x.onload = () => {
        let j = {}; try { j = JSON.parse(x.responseText); } catch (e) { /* ignore */ }
        if (x.status >= 200 && x.status < 300 && j.secure_url) res(j.secure_url);
        else rej(new Error((j.error && j.error.message) || 'Upload failed'));
      };
      x.onerror = () => rej(new Error('Network error while uploading.'));
      x.send(fd);
    });
  }

  /* ---------------- "my invitations" (this browser) ---------------- */
  const MINE = 'inv:mine';
  const readMine = () => { try { return JSON.parse(localStorage.getItem(MINE) || '[]'); } catch (e) { return []; } };
  const addMine = (x) => { try { const l = readMine().filter((i) => i.id !== x.id); l.unshift(x); localStorage.setItem(MINE, JSON.stringify(l.slice(0, 20))); } catch (e) { /* ignore */ } };

  /* ---------------- icons ---------------- */
  const SVG = (d, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const IC = {
    heart: '<path d="M12 20s-7-4.4-9-9.2C1.6 7 4 4 7 4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3 0 5.4 3 4 6.8-2 4.8-9 9.2-9 9.2z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    pin: '<path d="M12 21s7-5.6 7-11.2A7 7 0 0 0 5 9.8C5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.5"/>',
    img: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7.5 8 6 8-6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 1.5-2.2-.6-1.3.2-2.6 1.7-2.6H17a3.5 3.5 0 0 0 3.5-3.5C20.5 7 16.8 3.5 12 3.5z"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="7.8" r="1"/><circle cx="15.2" cy="8.6" r="1"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
    gift: '<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M12 9v11M3.5 13h17"/><path d="M12 9c-2.5 0-4-1-4-2.5S9 4 10.5 4C12 4 12 9 12 9zm0 0c2.5 0 4-1 4-2.5S15 4 13.5 4C12 4 12 9 12 9z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    full: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
    exit: '<path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M11 18.5h2"/>',
    desk: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.6-5.9L4 8.5"/><path d="M4 4v4.5h4.5"/>',
    skip: '<path d="M5 5l9 7-9 7zM18 5v14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    undo: '<path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/>',
    edit: '<path d="M4 20l4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"/>',
  };
  const iconFor = (t) => {
    t = String(t || '').toLowerCase();
    if (/colou?r|style|theme/.test(t)) return IC.palette;
    if (/photo|gallery|picture/.test(t)) return /music/.test(t) ? IC.img : IC.img;
    if (/music|song|audio/.test(t)) return IC.music;
    if (/venue|map|location|ceremony|reception/.test(t)) return IC.pin;
    if (/timeline|schedule|celebration|event/.test(t)) return IC.clock;
    if (/date|calendar/.test(t)) return IC.cal;
    if (/story|journey/.test(t)) return IC.book;
    if (/rsvp|gift|invitation message|message/.test(t)) return /gift|rsvp/.test(t) ? IC.gift : IC.mail;
    if (/couple|envelope|bride|groom/.test(t)) return IC.heart;
    if (/closing|thank/.test(t)) return IC.sparkle;
    return IC.sparkle;
  };
  const cleanTitle = (t) => String(t || '').replace(/^[\s\p{Extended_Pictographic}️‍]+/u, '').trim();

  /* ---------------- gallery card image ----------------
     Cards are plain images (templates/<id>/card.jpg) – they paint instantly, nothing is loaded
     in the background and there is no loading state. The real live preview lives in the editor. */
  const cardImg = (def) => assetUrl(def.card || `templates/${def.id}/card.jpg`);
  const splitName = (def) => {
    const [t, ...r] = String(def.name || def.id).split(/\s+[—–-]\s+/);
    return { title: t, sub: r.join(' — ') };
  };

  /* =========================================================
     POPUP EDITOR
     ========================================================= */
  let uidc = 0;
  let openModal = null;

  async function openEditor(templateId, { doc } = {}) {
    if (openModal) openModal.close();
    const def = await loadTemplate(templateId);
    if (!def) { alert('Template not found.'); return; }

    ASSET_DIR = new URL(`templates/${def.id}/`, SITE).href;
    const draftKey = `inv:draft:${def.id}`;
    let state; let editingId = null; let notice = '';
    if (doc) {
      state = mergeData(def.defaults, doc.data);
      editingId = doc.id;
      try { const u = await currentUser(); if (doc.ownerUid !== u.uid) { editingId = null; notice = 'This invitation was created in another browser, so it opened as a new copy.'; } } catch (e) { editingId = null; }
    } else {
      let draft = null; try { draft = JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch (e) { /* ignore */ }
      state = mergeData(def.defaults, draft || {});
    }
    let skipIntro = false;

    /* ----- shell ----- */
    const modal = el('div', { class: 'ip-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Customize invitation', 'data-tab': 'edit' });
    modal.innerHTML = `
      <header class="ip-bar">
        <button type="button" class="ip-iconbtn" data-act="close" aria-label="Close">${SVG(IC.close)}</button>
        <div class="ip-bar__title"><b></b><small>Customize &amp; preview</small></div>
        <button type="button" class="ip-btn ip-btn--ghost" data-act="reset">${SVG(IC.undo)}Reset</button>
        <button type="button" class="ip-btn ip-btn--primary" data-act="publish">Publish &amp; get link</button>
      </header>
      <div class="ip-body">
        <nav class="ip-rail" aria-label="Sections"></nav>
        <aside class="ip-edit">
          <div class="ip-edit__head"><div class="ip-edit__step"></div><h3></h3><div class="ip-edit__bar"><i></i></div></div>
          <div class="ip-edit__scroll"></div>
          <div class="ip-edit__foot">
            <button type="button" class="ip-btn ip-btn--ghost" data-act="prev">${SVG(IC.left)}Back</button>
            <button type="button" class="ip-btn ip-btn--primary" data-act="next">Next${SVG(IC.arrow)}</button>
          </div>
        </aside>
        <div class="ip-stage">
          <button type="button" class="ip-exit" data-act="full">${SVG(IC.exit)}Exit full screen</button>
          <div class="ip-tools" role="toolbar" aria-label="Preview controls">
            <button type="button" class="ip-tool on" data-dev="phone" data-tip="Phone view" aria-label="Phone view">${SVG(IC.phone)}</button>
            <button type="button" class="ip-tool" data-dev="desktop" data-tip="Desktop view" aria-label="Desktop view">${SVG(IC.desk)}</button>
            <hr class="d">
            <button type="button" class="ip-tool" data-act="replay" data-tip="Replay envelope" aria-label="Replay envelope">${SVG(IC.replay)}</button>
            <button type="button" class="ip-tool m-hide" data-act="skip" data-tip="Skip envelope" aria-pressed="false" aria-label="Skip envelope">${SVG(IC.skip)}</button>
            <hr>
            <button type="button" class="ip-tool" data-act="full" data-tip="Full screen" aria-label="Full screen preview"><span class="i-in">${SVG(IC.full)}</span><span class="i-out">${SVG(IC.exit)}</span></button>
          </div>
          <div class="ip-phone" data-dev="phone"><div class="ip-device"><iframe class="ip-frame" title="Live preview" allow="autoplay; fullscreen"></iframe></div></div>
        </div>
      </div>
      <div class="ip-tabs" role="tablist">
        <button type="button" role="tab" data-tab="edit" class="on">${SVG(IC.edit)}Edit</button>
        <button type="button" role="tab" data-tab="preview">${SVG(IC.eye)}Preview</button>
      </div>
      <div class="ip-toast" role="status" aria-live="polite"></div>`;
    $('.ip-bar__title b', modal).textContent = def.name;
    const scroller = $('.ip-edit__scroll', modal);
    const frame = $('.ip-frame', modal);
    const phone = $('.ip-phone', modal);
    const toastEl = $('.ip-toast', modal);
    let toastT;
    const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 3800); };

    /* ----- live preview wiring ----- */
    const post = (msg) => { try { frame.contentWindow.postMessage(msg, location.origin); } catch (e) { /* ignore */ } };
    const sendData = () => post({ type: 'inv:data', data: state, base: SITE });
    const queueSend = debounce(sendData, 120);
    const saveDraft = debounce(() => { if (!editingId) { try { localStorage.setItem(draftKey, JSON.stringify(state)); } catch (e) { /* ignore */ } } }, 400);
    const changed = () => { queueSend(); saveDraft(); };
    const loadFrame = () => { frame.src = `${entryUrl(def)}?embed=preview${skipIntro ? '&skip=1' : ''}&t=${Date.now()}`; };
    /* Auto-open the card in the preview (same as the guest tapping the seal) and then scroll to the section being edited.
       Templates that understand `inv:open` open themselves; for any other template we tap its visible opener button. */
    const OPENERS = ['#open', '#seal', '#openBtn', '#skip', '[data-open]'];
    const isShown = (n) => {
      if (!n) return false;
      const cs = n.ownerDocument.defaultView.getComputedStyle(n), r = n.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0' && r.width > 0 && r.height > 0 && !n.closest('[hidden]');
    };
    const tapOpener = () => {
      try {
        const doc = frame.contentDocument; if (!doc) return false;
        for (const s of OPENERS) { const n = doc.querySelector(s); if (isShown(n)) { n.click(); return true; } }
      } catch (e) { /* ignore */ }
      return false;
    };
    let goTimer = null, goToken = 0;
    /* true while the template still shows its envelope / gift / seal screen */
    const isLocked = () => {
      try {
        const d = frame.contentDocument; if (!d || !d.body) return true;
        const h = d.documentElement.classList, b = d.body.classList;
        return h.contains('locked') || b.contains('locked') || b.contains('lock');
      } catch (e) { return false; }
    };
    const goToTarget = (selector) => {
      clearTimeout(goTimer);                       /* only the latest step wins if the user clicks Next quickly */
      const token = ++goToken;
      let tries = 0, tapped = false;
      post({ type: 'inv:open' });                  /* templates that understand it open themselves */
      const step = () => {
        if (token !== goToken) return;
        tries++;
        if (isLocked()) {
          if (tries === 4 && !tapped) tapped = tapOpener();   /* old templates: tap the visible opener once */
          if (tries === 8) post({ type: 'inv:open' });
          if (tries < 60) { goTimer = setTimeout(step, 250); return; }   /* give up after ~15 s */
        }
        /* card is open now -> let the layout settle, then go to the section */
        goTimer = setTimeout(() => { if (token === goToken && selector) post({ type: 'inv:scrollTo', selector }); }, tries > 1 ? 350 : 0);
      };
      goTimer = setTimeout(step, 150);
    };
    const onMsg = (e) => {
      if (e.source !== frame.contentWindow) return;
      const m = e.data || {};
      if (m.type === 'inv:ready') { preparePreviewFrame(frame); sendData(); }
      if (m.type === 'inv:rsvp') post({ type: 'inv:rsvp:result', id: m.id, ok: true });
    };
    window.addEventListener('message', onMsg);

    /* ----- field builders ----- */
    const wrap = (f, control, id) => el('div', { class: 'ip-field' + (f.type === 'toggle' ? ' ip-field--toggle' : '') },
      f.type === 'toggle' ? null : el('label', { for: id, text: f.label }), control,
      f.hint ? el('p', { class: 'ip-hint', text: f.hint }) : null);

    function fInput(f) {
      const id = 'ipf' + (++uidc);
      let c;
      if (f.type === 'textarea') c = el('textarea', { id, rows: f.rows || 3, maxlength: f.max || false, placeholder: f.placeholder || false });
      else if (f.type === 'select') c = el('select', { id }, (f.options || []).map(([v, l]) => el('option', { value: v, text: l })));
      else if (f.type === 'toggle') {
        c = el('label', { class: 'ip-toggle' }, el('input', { type: 'checkbox', id }), el('span', { text: f.label }));
        const i = $('input', c); i.checked = !!getPath(state, f.path);
        i.addEventListener('change', () => { setPath(state, f.path, i.checked); changed(); });
        return wrap(f, c, id);
      } else c = el('input', { id, type: f.type || 'text', maxlength: f.max || false, min: f.min != null ? f.min : false, max: f.maxValue != null ? f.maxValue : false, placeholder: f.placeholder || false });
      const v = getPath(state, f.path);
      c.value = v == null ? '' : v;
      const ev = f.type === 'select' || f.type === 'date' || f.type === 'time' || f.type === 'color' ? 'change' : 'input';
      const handler = () => { setPath(state, f.path, f.type === 'number' ? Number(c.value) : c.value); changed(); };
      c.addEventListener(ev, handler);
      if (ev === 'change') c.addEventListener('input', handler);
      return wrap(f, c, id);
    }

    function uploader({ kind, accept, multiple, onDone, label }) {
      const file = el('input', { type: 'file', accept, multiple: !!multiple, hidden: true });
      const btn = el('button', { type: 'button', class: 'ip-btn ip-btn--sm', text: label });
      const prog = el('div', { class: 'ip-prog', hidden: true }, el('i'));
      const msg = el('p', { class: 'ip-err', hidden: true });
      btn.addEventListener('click', () => file.click());
      file.addEventListener('change', async () => {
        const files = Array.from(file.files || []); file.value = '';
        if (!files.length) return;
        msg.hidden = true; btn.disabled = true; prog.hidden = false;
        let n = 0;
        for (const fl of files) {
          n++;
          btn.textContent = files.length > 1 ? `Uploading ${n}/${files.length}…` : 'Uploading…';
          try {
            const url = await upload(fl, { kind, onProgress: (p) => { $('i', prog).style.width = Math.round(p * 100) + '%'; } });
            onDone(url, fl);
          } catch (e) { msg.textContent = e.message; msg.hidden = false; break; }
        }
        btn.disabled = false; btn.textContent = label; prog.hidden = true; $('i', prog).style.width = '0';
      });
      return { nodes: [btn, file, prog, msg] };
    }

    function fImage(f) {
      const id = 'ipf' + (++uidc);
      const prev = el('div', { class: 'ip-img__prev' });
      const url = el('input', { id, type: 'text', placeholder: '…or paste an image URL' });
      const paint = () => {
        const v = getPath(state, f.path) || '';
        url.value = v;
        prev.style.backgroundImage = v ? `url("${thumb(v, 400)}")` : 'none';
        prev.classList.toggle('empty', !v);
      };
      const up = uploader({ kind: 'image', accept: 'image/*', label: 'Upload photo', onDone: (u) => { setPath(state, f.path, u); paint(); changed(); } });
      url.addEventListener('change', () => { setPath(state, f.path, url.value.trim()); paint(); changed(); });
      paint();
      return wrap(f, el('div', { class: 'ip-img' }, prev, el('div', { class: 'ip-img__side' }, up.nodes, url)), id);
    }

    function fAudio(f) {
      const id = 'ipf' + (++uidc);
      const url = el('input', { id, type: 'text', placeholder: 'Upload below or paste an mp3 URL' });
      const player = el('audio', { controls: true, preload: 'none' });
      const clear = el('button', { type: 'button', class: 'ip-btn ip-btn--sm ip-btn--ghost', text: 'Remove music' });
      const paint = () => {
        const v = getPath(state, f.path) || '';
        url.value = v; player.hidden = !v; clear.hidden = !v;
        if (v) player.src = assetUrl(v); else player.removeAttribute('src');
      };
      const up = uploader({ kind: 'audio', accept: 'audio/*', label: 'Upload music', onDone: (u) => { setPath(state, f.path, u); paint(); changed(); } });
      url.addEventListener('change', () => { setPath(state, f.path, url.value.trim()); paint(); changed(); });
      clear.addEventListener('click', () => { setPath(state, f.path, ''); paint(); changed(); });
      paint();
      return wrap(f, el('div', { class: 'ip-audio' }, el('div', { class: 'ip-row' }, up.nodes.slice(0, 1), clear), up.nodes.slice(1), url, player), id);
    }

    function fGallery(f) {
      const list = el('div', { class: 'ip-gal' });
      const arr = () => { let a = getPath(state, f.path); if (!Array.isArray(a)) { a = []; setPath(state, f.path, a); } return a; };
      const move = (i, d) => { const a = arr(); const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; paint(); changed(); };
      const paint = () => {
        list.innerHTML = '';
        arr().forEach((g, i) => {
          const alt = el('input', { type: 'text', value: g.alt || '', placeholder: 'Caption (optional)', 'aria-label': 'Photo caption' });
          alt.addEventListener('input', () => { g.alt = alt.value; changed(); });
          list.append(el('div', { class: 'ip-gal__item' },
            el('div', { class: 'ip-gal__img', style: `background-image:url("${thumb(g.src, 240)}")` }), alt,
            el('div', { class: 'ip-mini' },
              el('button', { type: 'button', 'aria-label': 'Move up', text: '↑', onclick: () => move(i, -1) }),
              el('button', { type: 'button', 'aria-label': 'Move down', text: '↓', onclick: () => move(i, 1) }),
              el('button', { type: 'button', 'aria-label': 'Remove photo', text: '×', onclick: () => { arr().splice(i, 1); paint(); changed(); } }))));
        });
        count.textContent = `${arr().length}/${f.max || 12} photos`;
      };
      const count = el('span', { class: 'ip-hint' });
      const up = uploader({
        kind: 'image', accept: 'image/*', multiple: true, label: 'Add photos',
        onDone: (u) => { if (arr().length >= (f.max || 12)) return; arr().push({ src: u, alt: '' }); paint(); changed(); },
      });
      paint();
      return wrap(f, el('div', {}, list, el('div', { class: 'ip-row' }, up.nodes.slice(0, 1), count), up.nodes.slice(1)), 'x');
    }

    function fList(f) {
      const list = el('div', { class: 'ip-list' });
      const arr = () => { let a = getPath(state, f.path); if (!Array.isArray(a)) { a = []; setPath(state, f.path, a); } return a; };
      const move = (i, d) => { const a = arr(); const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; paint(); changed(); };
      const paint = () => {
        list.innerHTML = '';
        arr().forEach((item, i) => {
          const box = el('details', { class: 'ip-list__item' });
          const sum = el('summary', {}, el('span', { text: item[f.itemTitle] || `Item ${i + 1}` }));
          const tools = el('span', { class: 'ip-mini' },
            el('button', { type: 'button', 'aria-label': 'Move up', text: '↑', onclick: (e) => { e.preventDefault(); move(i, -1); } }),
            el('button', { type: 'button', 'aria-label': 'Move down', text: '↓', onclick: (e) => { e.preventDefault(); move(i, 1); } }),
            el('button', { type: 'button', 'aria-label': 'Remove', text: '×', onclick: (e) => { e.preventDefault(); arr().splice(i, 1); paint(); changed(); } }));
          sum.append(tools); box.append(sum);
          const inner = el('div', { class: 'ip-list__fields' });
          f.fields.forEach((sf) => {
            const id = 'ipf' + (++uidc);
            if (sf.type === 'image') {
              const prev = el('div', { class: 'ip-img__prev' });
              const url = el('input', { id, type: 'text', placeholder: '…or paste an image URL' });
              const paint = () => { const v = item[sf.key] || ''; url.value = v; prev.style.backgroundImage = v ? `url("${thumb(v, 300)}")` : 'none'; prev.classList.toggle('empty', !v); };
              const up = uploader({ kind: 'image', accept: 'image/*', label: 'Upload photo', onDone: (u) => { item[sf.key] = u; paint(); changed(); } });
              url.addEventListener('change', () => { item[sf.key] = url.value.trim(); paint(); changed(); });
              paint();
              inner.append(el('div', { class: 'ip-field' }, el('label', { for: id, text: sf.label }), el('div', { class: 'ip-img' }, prev, el('div', { class: 'ip-img__side' }, up.nodes, url))));
              return;
            }
            const c = sf.type === 'select' ? el('select', { id }, sf.options.map(([v, l]) => el('option', { value: v, text: l })))
              : sf.type === 'textarea' ? el('textarea', { id, rows: 2 }) : el('input', { id, type: /^(date|time|url)$/.test(sf.type || '') ? sf.type : 'text' });
            c.value = item[sf.key] || '';
            c.addEventListener('input', () => { item[sf.key] = c.value; if (sf.key === f.itemTitle) $('summary span', box).textContent = c.value || `Item ${i + 1}`; changed(); });
            inner.append(el('div', { class: 'ip-field' }, el('label', { for: id, text: sf.label }), c));
          });
          box.append(inner); list.append(box);
        });
      };
      const add = el('button', { type: 'button', class: 'ip-btn ip-btn--sm', text: '+ Add ' + (f.itemName || 'item'), onclick: () => { if (arr().length >= (f.max || 20)) return; arr().push(clone(f.itemDefaults || {})); paint(); const last = list.lastElementChild; if (last) last.open = true; changed(); } });
      paint();
      return wrap(f, el('div', {}, list, add), 'x');
    }

    const builders = { image: fImage, audio: fAudio, gallery: fGallery, list: fList };
    const buildField = (f) => (builders[f.type] || fInput)(f);

    const rail = $('.ip-rail', modal);
    const stepEl = $('.ip-edit__step', modal), headTitle = $('.ip-edit__head h3', modal), barFill = $('.ip-edit__bar i', modal);
    const prevBtn = $('[data-act="prev"]', modal), nextBtn = $('[data-act="next"]', modal);
    let cur = 0;
    function showStep(i, { scroll = true } = {}) {
      const groups = def.schema; cur = Math.max(0, Math.min(groups.length - 1, i));
      const g = groups[cur];
      scroller.innerHTML = '';
      if (notice) scroller.append(el('div', { class: 'ip-note', text: notice }));
      const pane = el('div', { class: 'ip-pane ip-fields' });
      if (g.help) pane.append(el('p', { class: 'ip-hint', text: g.help }));
      g.fields.forEach((f) => pane.append(buildField(f)));
      scroller.append(pane); scroller.scrollTop = 0;
      stepEl.textContent = `Step ${cur + 1} of ${groups.length}`;
      headTitle.textContent = cleanTitle(g.title);
      barFill.style.width = `${((cur + 1) / groups.length) * 100}%`;
      rail.querySelectorAll('button').forEach((b, k) => { b.classList.toggle('on', k === cur); if (k === cur) b.scrollIntoView({ block: 'nearest', inline: 'center' }); });
      prevBtn.disabled = cur === 0; prevBtn.style.display = cur === 0 ? 'none' : '';
      const last = cur === groups.length - 1;
      nextBtn.innerHTML = last ? 'Publish &amp; get link' : `Next${SVG(IC.arrow)}`;
      nextBtn.dataset.last = last ? '1' : '';
      if (scroll) goToTarget(g.target);
    }
    function renderForm(keep) {
      rail.innerHTML = '';
      def.schema.forEach((g, i) => {
        const b = el('button', { type: 'button', 'aria-label': cleanTitle(g.title), html: `${SVG(iconFor(g.title))}<span></span>` });
        $('span', b).textContent = cleanTitle(g.title).replace(/\s*&\s*/g, ' & ');
        b.addEventListener('click', () => showStep(i));
        rail.append(b);
      });
      showStep(keep ? cur : 0, { scroll: false });
    }
    prevBtn.addEventListener('click', () => showStep(cur - 1));
    nextBtn.addEventListener('click', () => { if (nextBtn.dataset.last) openSheet(); else showStep(cur + 1); });

    /* ----- publish sheet ----- */
    function openSheet() {
      const sheet = el('div', { class: 'ip-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Publish invitation' });
      const box = el('div', { class: 'ip-sheet__box' });
      sheet.append(box); modal.append(sheet);
      const close = () => sheet.remove();
      sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });

      const showForm = () => {
        const g = slugify(state.groom || state.couple?.groom || state.celebrant || '') || 'our';
        const b = slugify(state.bride || state.couple?.bride || '') || 'invitation';
        /* the link name is generated automatically and never shown: the person gets the link by e-mail */
        const autoSlug = () => slugify(`${g}-${b}`).slice(0, 30).replace(/-$/, '') + '-' + randId(5);
        const err = el('p', { class: 'ip-err', hidden: true });
        const go = el('button', { type: 'button', class: 'ip-btn ip-btn--primary ip-btn--block', text: editingId ? 'Update invitation' : 'Publish invitation' });
        box.innerHTML = '';
        box.append(
          el('button', { type: 'button', class: 'ip-iconbtn ip-sheet__x', 'aria-label': 'Close', text: '×', onclick: close }),
          el('h3', { text: editingId ? 'Update your invitation' : 'Publish your invitation' }),
          el('p', { class: 'ip-hint', text: editingId ? 'Your link stays the same. Guests will see the new version.' : 'We will create your private invitation link and email it to you in the next step.' }),
          err, go);
        go.addEventListener('click', async () => {
          err.hidden = true; go.disabled = true; go.textContent = 'Publishing…';
          let tries = 0, lastErr;
          while (tries++ < 3) {
            try { showDone(await publish(editingId ? null : autoSlug())); return; }
            catch (e) { lastErr = e; if (!/already taken/.test(e.message)) break; }
          }
          err.textContent = lastErr.message; err.hidden = false; go.disabled = false; go.textContent = editingId ? 'Update invitation' : 'Publish invitation';
        });
      };

      /* ----- "send me the link" popup (the link itself is never shown on the page) ----- */
      const EMAIL_KEY = 'inv:email';
      const askEmail = (id, onSent) => {
        const pop = el('div', { class: 'ip-sheet ip-sheet--top', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Get invitation link' });
        const card = el('div', { class: 'ip-sheet__box ip-sheet__box--sm' });
        pop.append(card); modal.append(pop);
        const shut = () => pop.remove();
        pop.addEventListener('click', (e) => { if (e.target === pop) shut(); });
        let saved = ''; try { saved = localStorage.getItem(EMAIL_KEY) || ''; } catch (e) { /* ignore */ }
        const email = el('input', { type: 'email', inputmode: 'email', autocomplete: 'email', placeholder: 'yourname@gmail.com', maxlength: 160, value: saved, 'aria-label': 'Your email address', required: true });
        const err = el('p', { class: 'ip-err', hidden: true });
        const send = el('button', { type: 'submit', class: 'ip-btn ip-btn--primary ip-btn--block', text: 'Send me the link' });
        const form = el('form', { novalidate: true },
          el('div', { class: 'ip-field' }, el('label', { text: 'Your Gmail / email address' }), email), err, el('div', { style: 'margin-top:14px' }, send));
        card.append(
          el('button', { type: 'button', class: 'ip-iconbtn ip-sheet__x', 'aria-label': 'Close', text: '×', onclick: shut }),
          el('h3', { text: 'Get your invitation link' }),
          el('p', { class: 'ip-hint', text: 'Enter your email. We will send the invitation link straight to your inbox.' }),
          form);
        setTimeout(() => email.focus(), 60);
        let leadSaved = '';
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const addr = email.value.trim().toLowerCase();
          if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(addr) || addr.length > 160) { err.textContent = 'Please enter a valid email address.'; err.hidden = false; email.focus(); return; }
          err.hidden = true; send.disabled = true; send.textContent = 'Sending…';
          try {
            const user = await currentUser();
            if (leadSaved !== addr) {                       /* 1) keep the e-mail in Firebase, even if the mail fails */
              await db().collection(LEADS).add({
                email: addr, invitationId: id, ownerUid: user.uid, templateId: def.id,
                title: String(def.title ? def.title(state) : def.name).slice(0, 200), source: 'publish-sheet',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              });
              leadSaved = addr;
            }
            const idToken = await user.getIdToken();       /* 2) server e-mails the link */
            const r = await fetch(new URL(MAIL_ENDPOINT, SITE).href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, email: addr, idToken }) });
            let j = null; try { j = await r.json(); } catch (x) { /* not json */ }
            if (!r.ok || !j || !j.ok) throw new Error((j && j.error) || 'Email could not be sent right now. Please try again in a minute.');
            try { localStorage.setItem(EMAIL_KEY, addr); } catch (x) { /* ignore */ }
            card.innerHTML = '';
            card.append(
              el('button', { type: 'button', class: 'ip-iconbtn ip-sheet__x', 'aria-label': 'Close', text: '×', onclick: shut }),
              el('div', { class: 'ip-sent' }, '✉️'),
              el('h3', { text: 'Link sent!' }),
              el('p', { class: 'ip-hint' }, 'We emailed your invitation link to ', el('b', { text: addr }), '. If you do not see it in a minute, check the Spam / Promotions folder.'),
              el('div', { style: 'margin-top:16px' }, el('button', { type: 'button', class: 'ip-btn ip-btn--primary ip-btn--block', text: 'Done', onclick: shut })));
            if (onSent) onSent(addr);
          } catch (x) {
            err.textContent = x.code === 'permission-denied' ? 'Could not save your email (Firestore rules). Please contact support.' : (x.message || 'Something went wrong.');
            err.hidden = false; send.disabled = false; send.textContent = 'Send me the link';
          }
        });
      };

      const showDone = (id) => {
        const names = state.groom && state.bride ? `${state.groom} & ${state.bride}` : (state.celebrant || def.name);
        const copy = el('button', { type: 'button', class: 'ip-btn ip-btn--primary ip-btn--block', text: '🔗 Copy invitation link' });
        copy.addEventListener('click', () => askEmail(id));
        const rsvpBox = el('div', { class: 'ip-rsvps', hidden: true });
        const rsvpBtn = el('button', { type: 'button', class: 'ip-btn ip-btn--ghost', text: 'View RSVPs' });
        rsvpBtn.addEventListener('click', async () => {
          rsvpBtn.disabled = true; rsvpBtn.textContent = 'Loading…';
          try { showRsvps(rsvpBox, await listRsvps(id), id); rsvpBox.hidden = false; } catch (e) { toast(e.message); }
          rsvpBtn.disabled = false; rsvpBtn.textContent = 'Refresh RSVPs';
        });
        const editBtn = el('button', { type: 'button', class: 'ip-btn ip-btn--ghost', text: 'Edit again', onclick: () => { location.href = `${location.pathname}?edit=${encodeURIComponent(id)}`; } });
        box.innerHTML = '';
        box.append(
          el('button', { type: 'button', class: 'ip-iconbtn ip-sheet__x', 'aria-label': 'Close', text: '×', onclick: close }),
          el('h3', { text: 'Your invitation is live 🎉' }),
          el('p', { class: 'ip-hint', text: `${names} — tap the button below. Enter your email and we will send the link to your inbox, ready to share with your guests.` }),
          el('div', { style: 'margin:16px 0 10px' }, copy),
          el('div', { class: 'ip-row ip-row--wrap' }, rsvpBtn, editBtn),
          rsvpBox);
      };
      showForm();
    }

    function showRsvps(box, rows, id) {
      box.innerHTML = '';
      if (!rows.length) { box.append(el('p', { class: 'ip-hint', text: 'No responses yet.' })); return; }
      const yes = rows.filter((r) => /Accepts/.test(r.attendance));
      box.append(el('p', { class: 'ip-hint', text: `${rows.length} responses · ${yes.length} attending · ${yes.reduce((s, r) => s + (r.guests || 0), 0)} guests` }));
      const t = el('table', { class: 'ip-table' }, el('thead', {}, el('tr', {}, ['Name', 'Reply', 'Guests', 'Phone', 'Diet', 'Message'].map((h) => el('th', { text: h })))));
      const tb = el('tbody');
      rows.forEach((r) => tb.append(el('tr', {}, [r.name, /Accepts/.test(r.attendance) ? 'Yes' : 'No', r.guests, r.phone, r.dietary, r.message].map((c) => el('td', { text: c == null ? '' : String(c) })))));
      t.append(tb);
      const csvBtn = el('button', { type: 'button', class: 'ip-btn ip-btn--sm', text: 'Download CSV' });
      csvBtn.addEventListener('click', () => {
        const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
        const head = ['name', 'email', 'phone', 'attendance', 'guests', 'dietary', 'message', 'date'];
        const lines = [head.join(',')].concat(rows.map((r) => head.map((h) => q(h === 'date' && r.createdAt ? r.createdAt.toDate().toISOString() : r[h])).join(',')));
        const a = el('a', { href: URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })), download: `rsvps-${id}.csv` });
        document.body.append(a); a.click(); a.remove();
      });
      box.append(el('div', { class: 'ip-table-wrap' }, t), csvBtn);
    }

    async function publish(slug) {
      const missing = (def.required || []).filter((p) => !String(getPath(state, p) || '').trim());
      if (missing.length) throw new Error('Please fill in: ' + missing.map((p) => (def.requiredLabels || {})[p] || p).join(', '));
      const user = await currentUser();
      const payload = clone(state);
      const title = def.title ? def.title(payload) : def.name;
      const ref = (id) => db().collection(COL).doc(id);
      try {
        if (editingId) {
          await ref(editingId).update({ data: payload, title, templateId: def.id, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        } else {
          if (!slug || !/^[a-z0-9][a-z0-9-]{2,38}[a-z0-9]$/.test(slug)) throw new Error('Link name must be 4–40 characters: letters, numbers and dashes.');
          if ((await ref(slug).get()).exists) throw new Error('That link name is already taken. Try another.');
          const ts = firebase.firestore.FieldValue.serverTimestamp();
          await ref(slug).set({ templateId: def.id, title, data: payload, ownerUid: user.uid, status: 'published', schemaVersion: 1, createdAt: ts, updatedAt: ts });
          editingId = slug;
          try { localStorage.removeItem(draftKey); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        if (e.code === 'permission-denied') throw new Error('Permission denied. Check the Firestore rules (see firestore.rules).');
        throw e;
      }
      addMine({ id: editingId, templateId: def.id, title, at: Date.now() });
      return editingId;
    }

    /* ----- chrome interactions ----- */
    const setTab = (t) => { modal.dataset.tab = t; modal.querySelectorAll('.ip-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t)); };
    modal.querySelectorAll('.ip-tabs button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
    modal.querySelectorAll('[data-dev]').forEach((b) => b.addEventListener('click', () => {
      modal.querySelectorAll('[data-dev]').forEach((x) => x.classList.toggle('on', x === b));
      phone.dataset.dev = b.dataset.dev;
    }));
    const skipBtn = $('.ip-tool[data-act="skip"]', modal);
    $('.ip-tool[data-act="replay"]', modal).addEventListener('click', loadFrame);
    skipBtn.addEventListener('click', () => { skipIntro = !skipIntro; skipBtn.classList.toggle('on', skipIntro); skipBtn.setAttribute('aria-pressed', String(skipIntro)); loadFrame(); });
    /* full-screen mobile preview */
    const setFull = (on) => {
      modal.classList.toggle('is-full', on);
      if (on) {
        setTab('preview'); phone.dataset.dev = 'phone';
        modal.querySelectorAll('[data-dev]').forEach((x) => x.classList.toggle('on', x.dataset.dev === 'phone'));
        try { if (modal.requestFullscreen && matchMedia('(max-width:900px)').matches) modal.requestFullscreen().catch(() => {}); } catch (e) { /* ignore */ }
      } else if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) { /* ignore */ } }
    };
    modal.querySelectorAll('[data-act="full"]').forEach((b) => b.addEventListener('click', () => setFull(!modal.classList.contains('is-full'))));
    $('[data-act="reset"]', modal).addEventListener('click', () => {
      if (!confirm('Reset everything back to the demo content?')) return;
      state = clone(def.defaults); try { localStorage.removeItem(draftKey); } catch (e) { /* ignore */ }
      renderForm(true); sendData();
    });
    $('[data-act="publish"]', modal).addEventListener('click', openSheet);
    const onKey = (e) => { if (e.key !== 'Escape' || modal.querySelector('.ip-sheet')) return; if (modal.classList.contains('is-full')) setFull(false); else close(); };
    document.addEventListener('keydown', onKey);
    function close() {
      window.removeEventListener('message', onMsg); document.removeEventListener('keydown', onKey);
      modal.remove(); document.documentElement.classList.remove('ip-lock'); openModal = null;
    }
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && modal.classList.contains('is-full') && matchMedia('(max-width:900px)').matches) modal.classList.remove('is-full'); });
    $('[data-act="close"]', modal).addEventListener('click', close);

    renderForm();
    document.documentElement.classList.add('ip-lock');
    document.body.append(modal);
    openModal = { close };
    loadFrame();
    $('[data-act="close"]', modal).focus({ preventScroll: true });
  }

  /* =========================================================
     TEMPLATE GALLERY (cards that open the popup)
     ========================================================= */
  async function renderGrid(host) {
    host.classList.add('ip-grid');
    const ids = CFG.templates || [];
    const defs = (await Promise.all(ids.map(loadTemplate))).filter(Boolean);
    host.innerHTML = '';
    const categories = ['All', 'Wedding', 'Engagement', 'Save the date', 'Reception', 'Birthday', 'Baby shower'];
    const filters = el('nav', { class: 'ip-filters', 'aria-label': 'Filter invitation templates' });
    const cards = [];
    let activeCategory = 'All';
    const filterCards = () => {
      let visible = 0;
      cards.forEach(({ card, values }) => {
        const show = activeCategory === 'All' || values.includes(activeCategory.toLowerCase());
        card.hidden = !show;
        if (show) visible++;
      });
      empty.hidden = visible > 0;
      const visibleCards = cards.filter(({ card }) => !card.hidden);
      const currentOrder = Array.from(host.children).filter((node) => node.classList.contains('ip-card') && !node.hidden);
      for (let i = visibleCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [visibleCards[i], visibleCards[j]] = [visibleCards[j], visibleCards[i]];
      }
      if (visibleCards.length > 1 && visibleCards.every(({ card }, i) => card === currentOrder[i])) {
        [visibleCards[0], visibleCards[1]] = [visibleCards[1], visibleCards[0]];
      }
      visibleCards.forEach(({ card }, i) => {
        card.style.setProperty('--ip-shuffle-delay', `${i * 45}ms`);
        card.classList.remove('ip-card--shuffling');
        void card.offsetWidth;
        card.classList.add('ip-card--shuffling');
        host.append(card);
        const clearShuffle = (event) => {
          if (event.target !== card || event.animationName !== 'ipCardShuffle') return;
          card.classList.remove('ip-card--shuffling');
          card.removeEventListener('animationend', clearShuffle);
        };
        card.addEventListener('animationend', clearShuffle);
      });
    };
    categories.forEach((category, i) => {
      const button = el('button', { type: 'button', text: category, 'aria-pressed': i === 0 ? 'true' : 'false' });
      button.addEventListener('click', () => {
        activeCategory = category;
        filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        filterCards();
      });
      filters.append(button);
    });
    host.before(filters);
    const empty = el('p', { class: 'ip-empty', text: 'No templates in this category yet.', hidden: true });
    host.after(empty);
    const mine = readMine();
    if (mine.length) {
      host.before(el('div', { class: 'ip-mine' }, el('b', { text: 'Your invitations: ' }),
        mine.map((m) => el('a', { class: 'ip-chip', href: `${location.pathname}?edit=${encodeURIComponent(m.id)}`, text: m.title || m.id }))));
    }
    defs.forEach((def, i) => {
      const values = (def.categories || [def.occasion || '']).map((value) => String(value).toLowerCase());
      const { title, sub } = splitName(def);
      const tagLine = String(def.tag || '').split('·').slice(1).join('·').trim() || sub;
      const img = el('img', { class: 'ip-card__img', src: cardImg(def), alt: `${def.name} invitation template`, width: 390, height: 540, decoding: 'async', loading: i < 3 ? 'eager' : 'lazy' });
      if (i < 3) img.setAttribute('fetchpriority', 'high');
      const card = el('button', { type: 'button', class: 'ip-card', 'aria-label': `Customize ${def.name}` },
        el('span', { class: 'ip-card__stage' },
          img,
          el('span', { class: 'ip-card__occ', text: def.occasion || 'Invitation' }),
          el('span', { class: 'ip-card__anim' }, el('i'), 'Animated')),
        el('span', { class: 'ip-card__body' },
          el('span', { class: 'ip-card__info' }, el('b', { text: title }), tagLine ? el('small', { text: tagLine }) : null),
          el('span', { class: 'ip-card__go', 'aria-hidden': 'true', html: SVG(IC.arrow) })));
      card.addEventListener('click', () => openEditor(def.id));
      host.append(card);
      cards.push({ card, values });
    });
    if (!defs.length) host.append(el('p', { text: 'No templates found.' }));
  }

  async function init() {
    const host = $('#ipGrid');
    const q = new URLSearchParams(location.search);
    if (host) await renderGrid(host);
    if (!host && !q.get('edit')) return;
    if (q.get('edit')) {
      try {
        const doc = await getInvitation(q.get('edit'));
        if (doc) return openEditor(doc.templateId, { doc });
      } catch (e) { console.warn('[InvitationPlatform]', e.message); }
    }
    if (q.get('template')) openEditor(q.get('template'));
  }

  window.InvitationPlatform = {
    register, loadTemplate, entryUrl, mergeData, getInvitation, saveRsvp, listRsvps, upload,
    openEditor, renderGrid, shareUrl, config: CFG,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  if (document.getElementById('ipGrid') || /[?&](edit|template)=/.test(location.search)) {
    const warm = () => ensureFirebase(true).catch(() => {});
    window.addEventListener('load', () => (window.requestIdleCallback ? requestIdleCallback(warm, { timeout: 4000 }) : setTimeout(warm, 2500)));
  }
})();
