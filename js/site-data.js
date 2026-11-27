/* =========================================================
   AD Soft – live website content from Firestore
   - our-work.html  -> collection  showcaseProjects
                       (#workGrid, .work-filter, #logoWall, hero stats)
   - about.html     -> collection  teamMembers       (#teamRoot)
   Content is managed in admin.html.
   Our Work and About have no hard-coded projects / team members any more:
   cards, filter buttons, hero logo wall, hero counters and the team all come from Firestore.
   ========================================================= */
(function () {
  'use strict';

  var FB_VER = '10.12.2';
  var COLS = { projects: 'showcaseProjects', team: 'teamMembers' };

  var hasProjects = !!document.getElementById('workGrid');
  var hasTeam = !!document.getElementById('teamRoot');
  if (!hasProjects && !hasTeam) return;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function byOrder(a, b) { return (Number(a.order) || 0) - (Number(b.order) || 0); }
  function visible(x) { return x && x.visible !== false; }
  function num(v) { v = Number(v); return v > 0 ? v : null; }
  function cld(url, w) {
    url = String(url || '');
    return (url.indexOf('res.cloudinary.com') > -1 && /\/upload\/v\d+\//.test(url))
      ? url.replace('/upload/', '/upload/f_auto,q_auto,w_' + w + '/') : url;
  }
  function niceCat(c) {
    c = String(c || '').replace(/[-_]+/g, ' ').trim();
    return c.charAt(0).toUpperCase() + c.slice(1);
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.onload = res; s.onerror = function () { rej(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }

  /* ---------- Firestore (loaded quietly, after the page is idle) ---------- */
  var dbPromise = null;
  function getDb() {
    if (dbPromise) return dbPromise;
    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    dbPromise = Promise.resolve()
      .then(function () { return window.INV_CONFIG ? null : loadScript('js/inv-config.js'); })
      .then(function () { return window.firebase ? null : loadScript(base + 'firebase-app-compat.js'); })
      .then(function () { return (window.firebase && firebase.firestore) ? null : loadScript(base + 'firebase-firestore-compat.js'); })
      .then(function () {
        var cfg = (window.INV_CONFIG || {}).firebase;
        if (!cfg) throw new Error('Firebase config missing');
        /* use a separate named app so it never clashes with other scripts on the page */
        var app;
        try { app = firebase.app('adsoft-site'); } catch (e) { app = firebase.initializeApp(cfg, 'adsoft-site'); }
        return app.firestore();
      });
    return dbPromise;
  }
  function fetchList(db, col) {
    return db.collection(col).get().then(function (snap) {
      return snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; }).filter(visible).sort(byOrder);
    });
  }

  /* ---------- OUR WORK ---------- */
  function projectCard(p) {
    var name = p.name || '';
    var logo = cld(p.logo, 600);
    var w = num(p.logoW), h = num(p.logoH);
    var open = p.url ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener"' : '';
    return '<a class="work-card"' + open + ' data-cat="' + esc(p.category || '') + '" aria-label="' + esc(name) + (p.url ? ' (opens website)' : '') + '">' +
      '<span class="work-logo">' + (logo ? '<img src="' + esc(logo) + '"' + (w && h ? ' width="' + w + '" height="' + h + '"' : '') + ' alt="' + esc(name) + ' logo" loading="lazy">' : '') + '</span>' +
      '<span class="work-meta"><span class="work-name">' + esc(name) + '</span>' +
      (p.tag ? '<span class="work-tag">' + esc(p.tag) + '</span>' : '') +
      '<span class="work-arrow"><i class="feather icon-feather-arrow-up-right"></i></span></span></a>';
  }

  function showWorkMsg(text) {
    var grid = document.getElementById('workGrid');
    if (grid) grid.innerHTML = '<p class="work-msg" id="workMsg">' + esc(text) + '</p>';
  }

  /* hero logo wall: 3 columns, each list is doubled so the CSS scroll loops seamlessly */
  function logoTile(l) {
    return '<div class="logo-tile"><img loading="lazy" decoding="async" src="' + esc(l.src) + '"' +
      (l.w && l.h ? ' width="' + l.w + '" height="' + l.h + '"' : '') + ' alt=""></div>';
  }
  function renderLogoWall(list) {
    var wall = document.getElementById('logoWall');
    if (!wall) return;
    var wrap = wall.parentNode;
    var logos = list.filter(function (p) { return p.logo; }).map(function (p) {
      return { src: cld(p.logo, 300), w: num(p.logoW), h: num(p.logoH) };
    });
    if (!logos.length) { if (wrap) wrap.style.display = 'none'; return; }
    if (wrap) wrap.style.display = '';
    var cols = [[], [], []];
    logos.forEach(function (l, i) { cols[i % 3].push(l); });
    wall.innerHTML = cols.map(function (c, i) {
      if (!c.length) c = logos.slice();
      var items = c.slice();
      while (items.length < 5) items = items.concat(c);
      var all = items.concat(items);
      return '<div class="logo-col' + (i === 1 ? ' rev' : '') + '"><div class="logo-track">' + all.map(logoTile).join('') + '</div></div>';
    }).join('');
  }

  /* hero counters */
  function setStat(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (typeof window.adsoftCount === 'function') window.adsoftCount(el, value);
    else el.textContent = value;
  }
  function renderStats(list) {
    var cats = [];
    list.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    setStat('statProjects', list.length);
    setStat('statIndustries', cats.length);
  }

  function renderProjects(list) {
    var grid = document.getElementById('workGrid');
    var filter = document.querySelector('.work-filter');
    if (!list.length) {
      showWorkMsg('No projects to show right now. Please check back soon.');
      renderLogoWall([]);
      renderStats([]);
      return;
    }
    var cats = [];
    list.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    if (filter) {
      filter.innerHTML = '<button class="active" data-filter="*" role="tab">All</button>' +
        cats.map(function (c) { return '<button data-filter="' + esc(c) + '" role="tab">' + esc(niceCat(c)) + '</button>'; }).join('');
    }
    grid.innerHTML = list.map(projectCard).join('');
    if (typeof window.adsoftWorkRefresh === 'function') window.adsoftWorkRefresh();
    renderLogoWall(list);
    renderStats(list);
  }

  /* ---------- ABOUT / TEAM ---------- */
  function paras(text) {
    var parts = String(text || '').split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    return parts.map(function (s, i) {
      return '<p class="' + (i === parts.length - 1 ? 'mb-0' : 'mb-15px') + '">' + esc(s).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function photoTag(m, cls) {
    var src = m.photo ? (/^https?:/.test(m.photo) ? cld(m.photo, m.tier === 'lead' ? 1000 : 700) : m.photo) : '';
    if (!src) return '';
    var w = num(m.photoW), h = num(m.photoH);
    var alt = m.photoAlt || (m.name + (m.role ? ', ' + m.role : ''));
    return '<img loading="lazy" decoding="async" class="' + cls + '" src="' + esc(src) + '"' +
      (m.photoSrcset ? ' srcset="' + esc(m.photoSrcset) + '"' : '') +
      (m.photoSrcset && m.photoSizes ? ' sizes="' + esc(m.photoSizes) + '"' : '') +
      (w && h ? ' width="' + w + '" height="' + h + '"' : '') + ' alt="' + esc(alt) + '">';
  }
  function leadCard(m, idx) {
    return '<div class="row justify-content-center mb-40px"><div class="col-12">' +
      '<div class="bg-white border-radius-6px box-shadow-large overflow-hidden d-flex flex-column ' + (idx % 2 ? 'flex-md-row-reverse' : 'flex-md-row') + '">' +
      photoTag(m, 'team-photo lead') +
      '<div class="p-50px lg-p-40px sm-p-30px d-flex flex-column justify-content-center">' +
      '<h4 aria-level="3" class="fw-800 text-dark-gray mb-5px ls-minus-1px">' + esc(m.name) + '</h4>' +
      '<span class="text-base-color fw-600 fs-18 d-block mb-20px">' + esc(m.role) + '</span>' +
      (m.subtitle ? '<span class="fw-500 text-dark-gray d-block mb-15px">' + esc(m.subtitle) + '</span>' : '') +
      paras(m.bio) + '</div></div></div></div>';
  }
  function memberCard(m) {
    return '<div class="col mb-30px"><div class="bg-white border-radius-6px box-shadow-large overflow-hidden h-100 d-flex flex-column flex-md-row">' +
      photoTag(m, 'team-photo') +
      '<div class="p-35px d-flex flex-column justify-content-center">' +
      '<h5 aria-level="3" class="fw-700 text-dark-gray mb-5px ls-minus-05px">' + esc(m.name) + '</h5>' +
      '<span class="text-base-color fw-600 d-block mb-10px">' + esc(m.role) + '</span>' +
      (m.subtitle ? '<span class="fw-500 text-dark-gray d-block mb-15px">' + esc(m.subtitle) + '</span>' : '') +
      paras(m.bio) + '</div></div></div>';
  }
  function showTeamMsg(text) {
    var root = document.getElementById('teamRoot');
    if (root) root.innerHTML = '<p class="team-msg">' + esc(text) + '</p>';
  }
  function renderTeam(list) {
    if (!list.length) { showTeamMsg('Team details will be updated soon.'); return; }
    var leads = list.filter(function (m) { return m.tier === 'lead'; });
    var members = list.filter(function (m) { return m.tier !== 'lead'; });
    var html = leads.map(leadCard).join('');
    if (members.length) {
      html += '<div class="row row-cols-1 row-cols-lg-2 justify-content-center">' + members.map(memberCard).join('') + '</div>';
    }
    document.getElementById('teamRoot').innerHTML = html;
  }

  /* ---------- run ---------- */
  function workFailed(e) {
    if (window.console) console.warn('[site-data]', e && e.message);
    showWorkMsg('Unable to load projects right now. Please refresh the page.');
    renderLogoWall([]);
    ['statProjects', 'statIndustries'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '–';
    });
  }
  function run() {
    getDb().then(function (db) {
      var jobs = [];
      if (hasProjects) jobs.push(fetchList(db, COLS.projects).then(renderProjects).catch(workFailed));
      if (hasTeam) jobs.push(
        fetchList(db, COLS.team)
          .then(renderTeam)
          .catch(function (e) {
            if (window.console) console.warn('[site-data]', e && e.message);
            showTeamMsg('Unable to load the team right now. Please refresh the page.');
          })
      );
      return Promise.all(jobs);
    }).catch(function (e) {
      if (window.console) console.warn('[site-data]', e && e.message);
      if (hasProjects) workFailed(e);
      if (hasTeam) showTeamMsg('Unable to load the team right now. Please refresh the page.');
    });
  }
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1500 }); else setTimeout(run, 300);
})();