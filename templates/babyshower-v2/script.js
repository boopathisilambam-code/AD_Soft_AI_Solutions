/* babyshower-v2 — renders everything from INV.data (see register.js for the fields) */
(() => {
const $ = s => document.querySelector(s), all = s => [...document.querySelectorAll(s)], rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const E = s => INV.esc(s), BR = s => E(s).replace(/\n/g, '<br>');
const LINES = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
const cssv = v => INV.bg(v).replace(/'/g, '%27');
const stock = v => !v || /^\.?\/?assets\//.test(v);               // bundled cut-out art vs. a photo the user uploaded
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const dmy = d => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? [+m[3], MON[+m[2] - 1], m[1]] : null };
INV.defaults = (window.INV_DEF || {}).defaults || {};
document.documentElement.classList.add('js');
let first = true, opened = false, T = null, D = INV.defaults, vb = 7, vg = 6;

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
function rv(el, instant) { if (!el.classList.contains('gold')) el.classList.add('rv'); el.style.setProperty('--d', [...el.parentNode.children].indexOf(el) % 4); if (instant) el.classList.add('in'); else io.observe(el) }
all('section:not(.px):not(.hero) h2,section>p,.gold,.sc,.cd,.mi,.cr,.teams,.bar,.say,form,.map,section>.btn,.px .gold').forEach(el => rv(el));

/* ---------- progress bar + dock ---------- */
const bar = document.createElement('div'); bar.id = 'bar'; document.body.append(bar);
const S = all('section');
const dock = document.createElement('nav'); dock.className = 'dock';
dock.innerHTML = [['Date', 'date'], ['Events', 'events'], ['Game', 'game'], ['RSVP', 'rsvp'], ['Venue', 'venue']].map(m => `<a href="#${m[1]}">${m[0]}</a>`).join(''); document.body.append(dock);
function sc() {
  const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`;
  let c = ''; S.forEach(s => { if (!s.hidden && s.getBoundingClientRect().top < innerHeight * .5) c = s.id });
  dock.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + c)); par()
}
const ps = all('[data-p]'); function par() { const h = innerHeight; ps.forEach(e => { const r = e.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return; e.style.transform = `translateY(${((r.top + r.height / 2 - h / 2) * e.dataset.p).toFixed(1)}px)` }) }
addEventListener('scroll', sc, { passive: true }); sc();

/* ---------- petals ---------- */
const c = document.createElement('canvas'); c.id = 'pt'; document.body.append(c); const x = c.getContext('2d'); let W, H, P = [], run = false;
const cols = ['#e86a9a', '#f7b6cf', '#fff4f0', '#e3b94d', '#6aa5e8'];
function rs() { W = c.width = innerWidth; H = c.height = innerHeight } rs(); addEventListener('resize', rs);
const mk = (y, b, cl) => ({ x: Math.random() * W, y: y ?? -20, s: 5 + Math.random() * 7, v: .5 + Math.random() * .9, r: Math.random() * 6, ph: Math.random() * 6, c: cl || cols[Math.random() * 4 | 0], vx: 0, b });
for (let i = 0; i < 14; i++) P.push(mk(Math.random() * H));
function tick() {
  x.clearRect(0, 0, W, H); P = P.filter(p => !(p.b && (p.y > H + 20 || p.y < -60)));
  P.forEach(p => { p.y += p.v; p.ph += .02; p.x += Math.sin(p.ph) * .7 + p.vx; p.r += .03; p.vx *= .985; if (p.b) p.v += .05; if (!p.b && (p.y > H + 20 || p.x < -30 || p.x > W + 30)) Object.assign(p, mk(), { x: Math.random() * W });
    x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.scale(1, Math.abs(Math.sin(p.r * 1.3)) * .6 + .4); x.fillStyle = p.c; x.globalAlpha = .85; x.beginPath(); x.ellipse(0, 0, p.s, p.s * .55, 0, 0, 7); x.fill(); x.restore() }); requestAnimationFrame(tick)
}
function burst(cx, cy, cl) { if (rm) return; for (let i = 0; i < 50; i++) { const p = mk(cy, true, cl && cl[i % cl.length]); p.x = cx; p.vx = (Math.random() - .5) * 8; p.v = -2 - Math.random() * 6; P.push(p) } }

/* ---------- open the cover ---------- */
const sm = $('#smoke'), sx = sm.getContext('2d'); let SW, SH, puffs = [];
const SC = ['#ff5fa2', '#ffb347', '#8a6cf6', '#38c8e8', '#ffd93d', '#6fe08a', '#ff7a7a'];
function srs() { SW = sm.width = innerWidth; SH = sm.height = innerHeight } srs(); addEventListener('resize', srs);
const spr = SC.map(c => { const o = document.createElement('canvas'); o.width = o.height = 128; const g = o.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, c + 'ee'); r.addColorStop(.5, c + '88'); r.addColorStop(1, c + '00'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return o });
function mkp(b) { const a = Math.random() * 6.28, sp = b ? 1 + Math.random() * 3 : .15 + Math.random() * .3, ctr = Math.random() < .4;
  return { x: b ? (ctr ? SW / 2 : Math.random() * SW) : Math.random() * SW, y: b ? (ctr ? SH / 2 : Math.random() * SH) : SH + 40, vx: Math.cos(a) * sp, vy: b ? Math.sin(a) * sp : -.3 - Math.random() * .4, s: b ? 50 : 120, gs: b ? 3 + Math.random() * 3 : .4, sp: spr[Math.random() * 7 | 0], life: 0, max: b ? 150 + Math.random() * 60 : 300, k: Math.random() * 6, b } }
function sloop() {
  sx.clearRect(0, 0, SW, SH); if (!opened && puffs.length < 7 && Math.random() < .05) puffs.push(mkp(false));
  puffs = puffs.filter(p => p.life < p.max); puffs.forEach(p => { p.life++; const u = p.life / p.max; p.k += .03; p.x += p.vx + Math.sin(p.k) * .6; p.y += p.vy + Math.cos(p.k * .8) * .5; p.vx *= .992; p.vy *= .992; p.s = Math.min(520, p.s + p.gs);
    const a = p.b ? Math.min(1, u * 6) * (u > .65 ? 1 - (u - .65) / .35 : 1) * .92 : Math.sin(u * Math.PI) * .3; sx.globalAlpha = Math.max(0, a); sx.drawImage(p.sp, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s) });
  if (opened && !puffs.length) { sm.remove(); return } requestAnimationFrame(sloop)
}
if (!rm) sloop(); else sm.remove();
function reveal() { const ev = $('#envo'); if (ev) { ev.classList.add('open'); setTimeout(() => ev.remove(), 900) } document.body.classList.remove('lock'); document.body.classList.add('go'); sizeCv(true); if (!run && !rm) { run = true; tick() } INV.playMusic() }
function openEnv(instant) { if (opened) return; opened = true; if (rm || instant) { reveal(); return } for (let i = 0; i < 110; i++) puffs.push(mkp(true)); setTimeout(reveal, 650) }
INV.openFn = () => openEnv(false);
$('#envo').onclick = () => openEnv(false);

/* ---------- scratch card ---------- */
const cv = $('#cv'), cx = cv.getContext('2d'); let done = false, dn = false, hintDrawn = null;
function sizeCv(force) {
  if (done) return; const hint = D.scratchHint || 'Scratch to reveal date & time ✦';
  if (!force && hint === hintDrawn) return; hintDrawn = hint;
  const r = cv.parentElement.getBoundingClientRect(); if (!r.width) return; cv.width = r.width; cv.height = r.height;
  const g = cx.createLinearGradient(0, 0, r.width, r.height); g.addColorStop(0, '#d9b45f'); g.addColorStop(.5, '#f6e1a0'); g.addColorStop(1, '#b8923f');
  cx.globalCompositeOperation = 'source-over'; cx.fillStyle = g; cx.fillRect(0, 0, r.width, r.height); cx.fillStyle = '#5a1840'; cx.font = 'italic 600 22px Cormorant Garamond,serif'; cx.textAlign = 'center'; cx.fillText(hint, r.width / 2, r.height / 2 + 7)
}
function scr(e) { if (!dn || done) return; const r = cv.getBoundingClientRect(); cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); cx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, 7); cx.fill();
  if (Math.random() < .15) { const d = cx.getImageData(0, 0, cv.width, cv.height).data; let k = 0; for (let i = 3; i < d.length; i += 64) if (!d[i]) k++; if (k / (d.length / 64) > .4) { done = true; cv.style.opacity = 0; cv.style.pointerEvents = 'none'; burst(r.left + r.width / 2, r.top + r.height / 2) } } }
cv.onpointerdown = e => { dn = true; cv.setPointerCapture(e.pointerId); scr(e) }; cv.onpointermove = scr; cv.onpointerup = () => dn = false;

/* ---------- countdown ---------- */
function cd() { if (!T) return; let s = Math.max(0, (T - Date.now()) / 1000 | 0);
  $('#cd').innerHTML = [[s / 86400 | 0, 'Days'], [s % 86400 / 3600 | 0, 'Hours'], [s % 3600 / 60 | 0, 'Mins'], [s % 60, 'Secs']].map(v => `<div><b>${v[0]}</b><i>${v[1]}</i></div>`).join('') }
setInterval(cd, 1000);

/* ---------- cradle push ---------- */
const cr = $('#cr'); let ct; cr.onclick = () => { cr.classList.add('fast'); clearTimeout(ct); ct = setTimeout(() => cr.classList.remove('fast'), 4000); const r = cr.getBoundingClientRect(); burst(r.left + cr.offsetWidth / 2, r.top + cr.offsetHeight * .55, ['#f7b6cf', '#e3b94d', '#fff4f0']) };

/* ---------- gallery lightbox ---------- */
$('#tr').onclick = e => { const t = e.target.closest('.tile'); if (!t) return; const b = $('#lbi'); b.style.setProperty('--i', t.style.getPropertyValue('--i')); b.classList.toggle('ph', t.classList.contains('ph')); $('#lbt').textContent = t.dataset.t; $('#lb').classList.add('on'); $('#tr').classList.add('p') };
$('#lb').onclick = () => { $('#lb').classList.remove('on'); $('#tr').classList.remove('p') };

/* ---------- boy or girl game ---------- */
let F = { b: [], g: [] }, Q = [];
function upd() { $('#bb').style.flexGrow = vb; $('#gg').style.flexGrow = vg; $('#bb').textContent = Math.round(vb / (vb + vg) * 100) + '%'; $('#gg').textContent = Math.round(vg / (vb + vg) * 100) + '%' } upd();
function say(t) { const s = $('#say'); s.textContent = t; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop') }
const pick = a => a.length ? a[Math.random() * a.length | 0] : '';
all('.team').forEach(b => b.onclick = () => { const t = b.dataset.t; all('.team').forEach(z => z.classList.remove('sel')); b.classList.add('sel'); t == 'b' ? vb++ : vg++; upd(); say(pick(F[t])); const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, t == 'b' ? ['#5aa0e8', '#fff4f0', '#e3b94d'] : ['#f27aa8', '#fff4f0', '#e3b94d']) });
$('#ask').onclick = () => say(pick(Q));

/* ---------- RSVP ---------- */
$('#rf').onsubmit = async e => {
  e.preventDefault(); const btn = $('#rbtn'), err = $('#rerr'); err.textContent = ''; btn.disabled = true;
  const p = { name: $('#rn').value.trim(), attendance: $('#ra').value, guests: +$('#rg').value || 1, message: $('#rm').value.trim() };
  try { await INV.rsvp(p); $('#rf').style.display = 'none'; $('#thx').style.display = 'block'; burst(innerWidth / 2, innerHeight * .6) }
  catch (er) {
    if (D.whatsapp) { const t = `Hi! This is ${p.name}. ${p.attendance} (${p.guests} guest/s) for the baby shower. ${p.message}`; location.href = 'https://wa.me/' + String(D.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(t) }
    else err.textContent = 'Sorry, we could not send your reply. Please try again.'
  }
  btn.disabled = false
};

/* ---------- render ---------- */
const img = (name, v) => { const r = document.documentElement.style; v ? r.setProperty('--' + name, INV.bg(v)) : r.removeProperty('--' + name) };
function render(d) {
  D = d;
  document.title = `${d.momName} & ${d.dadName} · Baby Shower`;
  img('bg', d.heroBg); img('pink', d.coverBg); img('foot', d.heartArt); img('flw', d.flowerArt); img('mom', d.momPhoto); img('baby', d.cradleImage);

  INV.text('#coverTitle', d.coverTitle); INV.text('#coverHint', d.coverHint);
  INV.text('#eventTag', d.eventTag); INV.text('#nA', d.momName); INV.text('#nB', d.dadName); INV.text('#heroLine', d.heroLine);
  const dm = dmy(d.date); INV.text('#heroDate', dm ? dm.join(' · ') : '');

  INV.text('#dateTitle', d.dateTitle); INV.text('#dateSub', d.dateSub);
  INV.text('#dMain', dm ? `${dm[0]} ${dm[1][0] + dm[1].slice(1).toLowerCase()} ${dm[2]}${d.time ? ' · ' + INV.fmt.time(d.time) : ''}` : '');
  INV.text('#dNote', [INV.fmt.weekday(d.date), d.city].filter(Boolean).join(' · '));
  T = INV.dt(d.date, d.time); cd(); sizeCv(false);

  INV.show('#mom', !!d.momOn); INV.text('#momTitle', d.momTitle); $('#momText').innerHTML = BR(d.momText) + ' <span class="hb">♥</span>';
  $('#momPic').classList.toggle('ph', !stock(d.momPhoto));

  INV.text('#evTitle', d.eventsTitle);
  const evs = d.events || [];
  $('#evList').innerHTML = evs.map(e => `<div class="ev"><div class="im${stock(e.image) ? '' : ' ph'}" style='--i:${cssv(e.image)}'></div><div><h3>${E(e.title)}</h3><p class="t">${E(INV.fmt.time(e.time) || e.time || '')}</p>${e.desc ? `<p>${E(e.desc)}</p>` : ''}</div></div>`).join('');
  all('#evList .ev').forEach(el => rv(el, !first));
  INV.show('#events', evs.length > 0);

  INV.text('#blessTitle', d.blessTitle); INV.text('#blessText', d.blessText); INV.show('#bless', !!d.blessOn);

  INV.show('#cradle', !!d.cradleOn); INV.text('#crTitle', d.cradleTitle); INV.text('#crSub', d.cradleSub);
  const ci = INV.asset(d.cradleImage); if ($('#crImg').getAttribute('src') !== ci) $('#crImg').setAttribute('src', ci);

  const G = (d.gallery || []).filter(g => g && g.image);
  $('#tr').innerHTML = (G.length ? [...G, ...G] : []).map(g => `<button class="tile${stock(g.image) ? '' : ' ph'}" style='--i:${cssv(g.image)}' data-t="${E(g.title)}" aria-label="${E(g.title)}"><span>${E(g.title)}</span></button>`).join('');
  INV.text('#jTitle', d.journeyTitle); INV.text('#jSub', d.journeySub); INV.show('#journey', G.length > 0);

  INV.show('#game', !!d.gameOn); INV.text('#gameTitle', d.gameTitle); INV.text('#gameSub', d.gameSub);
  $('#tb').innerHTML = `${E(d.boyLabel)}<i>${E(d.boyTag)}</i>`; $('#tg').innerHTML = `${E(d.girlLabel)}<i>${E(d.girlTag)}</i>`;
  F = { b: LINES(d.boyReplies), g: LINES(d.girlReplies) }; Q = LINES(d.babyReplies);
  INV.text('#ask', d.askText); if (!all('.team.sel').length) INV.text('#say', d.gameIdle);

  INV.show('#rsvp', !!d.rsvpOn); INV.text('#rTitle', d.rsvpTitle); INV.text('#rSub', d.rsvpSub); INV.text('#thx', d.rsvpThanks);

  INV.text('#vTitle', d.venueTitle); $('#vText').innerHTML = [d.venueName, [d.venueAddress, d.venueNote].filter(Boolean).join(' · ')].filter(Boolean).map(E).join('<br>');
  INV.text('#vName', d.venueName); INV.text('#vAddr', d.venueAddress); $('#vLink').href = INV.mapLink(d);
  INV.show('#venue', !!(d.venueName || d.venueAddress));
  all('.dock a').forEach(a => { const s = $(a.getAttribute('href')); a.style.display = s && s.hidden ? 'none' : '' });
  INV.setMusic(d.music);
}
INV.on(d => { render(d); if (first) { first = false; if (INV.skip) openEnv(true) } sc() });
INV.start();
})();
