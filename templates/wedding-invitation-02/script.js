/* wedding-invitation-02 — renders everything from INV.data (see register.js for the fields) */
(() => {
const $ = s => document.querySelector(s), all = s => [...document.querySelectorAll(s)], rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const E = s => INV.esc(s), BR = s => E(s).replace(/\n/g, '<br>');
const cssv = v => INV.bg(v).replace(/'/g, '%27');
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const cap = s => s[0] + s.slice(1).toLowerCase();
const dmy = d => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? { d: +m[3], m: MONTHS[+m[2] - 1], y: m[1] } : null };
INV.defaults = (window.INV_DEF || {}).defaults || {};
document.documentElement.classList.add('js');
let first = true, opened = false, D = INV.defaults, T = null;

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
function rv(el, instant) { if (!el.classList.contains('gold')) el.classList.add('rv'); el.style.setProperty('--d', [...el.parentNode.children].indexOf(el) % 4); if (instant) el.classList.add('in'); else io.observe(el) }
all('section:not(.px):not(.hero) h2,section>p,.gold,.pt,.gift,form,.sc,.cd,.map,section>.btn,.px .gold').forEach(el => rv(el));

/* ---------- progress bar + dock ---------- */
const bar = document.createElement('div'); bar.id = 'bar'; document.body.append(bar);
const S = all('section');
const dock = document.createElement('nav'); dock.className = 'dock';
dock.innerHTML = [['Date', 'date'], ['Events', 'events'], ['Journey', 'journey'], ['RSVP', 'rsvp'], ['Venue', 'venue']].map(m => `<a href="#${m[1]}">${m[0]}</a>`).join(''); document.body.append(dock);
function onScroll() {
  const h = document.documentElement, max = h.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  let cur = ''; S.forEach(s => { if (!s.hidden && s.getBoundingClientRect().top < innerHeight * .5) cur = s.id });
  dock.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur))
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- parallax ---------- */
const ps = all('[data-p]');
function par() { const h = innerHeight; ps.forEach(e => { const r = e.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return; e.style.transform = `translateY(${((r.top + r.height / 2 - h / 2) * e.dataset.p).toFixed(1)}px)` }) }
addEventListener('scroll', par, { passive: true }); par();

/* ---------- 3D tilt on portraits ---------- */
all('.ph').forEach(el => {
  el.onpointermove = e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)` };
  el.onpointerleave = () => el.style.transform = ''
});

/* ---------- petals ---------- */
const c = document.createElement('canvas'); c.id = 'pt'; document.body.append(c); const x = c.getContext('2d'); let W, H, P = [], run = false;
const cols = ['#7b1a2c', '#9b2a3d', '#fff8ee', '#d9b45f'];
function rs() { W = c.width = innerWidth; H = c.height = innerHeight } rs(); addEventListener('resize', rs);
const mk = (y, b) => ({ x: Math.random() * W, y: y ?? -20, s: 5 + Math.random() * 7, v: .5 + Math.random() * .9, r: Math.random() * 6, ph: Math.random() * 6, c: cols[Math.random() * 4 | 0], vx: 0, b });
for (let i = 0; i < 14; i++) P.push(mk(Math.random() * H));
function tick() {
  x.clearRect(0, 0, W, H); P = P.filter(p => !(p.b && (p.y > H + 20 || p.y < -40)));
  P.forEach(p => { p.y += p.v; p.ph += .02; p.x += Math.sin(p.ph) * .7 + p.vx; p.r += .03; p.vx *= .985; if (p.b) p.v += .05;
    if (!p.b && (p.y > H + 20 || p.x < -30 || p.x > W + 30)) Object.assign(p, mk(), { x: Math.random() * W });
    x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.scale(1, Math.abs(Math.sin(p.r * 1.3)) * .6 + .4); x.fillStyle = p.c; x.globalAlpha = .85; x.beginPath(); x.ellipse(0, 0, p.s, p.s * .55, 0, 0, 7); x.fill(); x.restore() });
  requestAnimationFrame(tick)
}
function burst(cx, cy) { if (rm) return; for (let i = 0; i < 45; i++) { const p = mk(cy, true); p.x = cx; p.vx = (Math.random() - .5) * 7; p.v = -2 - Math.random() * 5; P.push(p) } }

/* ---------- open the envelope ---------- */
function openEnv() {
  if (opened) return; opened = true; const ev = $('#envo');
  if (ev) { ev.classList.add('open'); setTimeout(() => ev.remove(), 1700) }
  document.body.classList.remove('lock'); document.body.classList.add('go'); sizeCv(true);
  if (!run && !rm) { run = true; tick() } INV.playMusic()
}
INV.openFn = openEnv; $('#seal').onclick = openEnv;

/* ---------- scratch card ---------- */
const cv = $('#cv'), cx = cv.getContext('2d'); let done = false, dn = false, hintDrawn = null;
function sizeCv(force) {
  if (done) return; const hint = D.scratchHint || 'Scratch here ✦'; if (!force && hint === hintDrawn) return;
  const r = cv.parentElement.getBoundingClientRect(); if (!r.width) return; hintDrawn = hint; cv.width = r.width; cv.height = r.height;
  const g = cx.createLinearGradient(0, 0, r.width, r.height); g.addColorStop(0, '#d9b45f'); g.addColorStop(.5, '#f3dc9a'); g.addColorStop(1, '#b8923f');
  cx.globalCompositeOperation = 'source-over'; cx.fillStyle = g; cx.fillRect(0, 0, r.width, r.height);
  cx.fillStyle = '#5e1020'; cx.font = 'italic 600 22px Cormorant Garamond,serif'; cx.textAlign = 'center'; cx.fillText(hint, r.width / 2, r.height / 2 + 7)
}
function sc(e) {
  if (!dn || done) return; const r = cv.getBoundingClientRect(); cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); cx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, 7); cx.fill();
  if (Math.random() < .15) { const d = cx.getImageData(0, 0, cv.width, cv.height).data; let k = 0; for (let i = 3; i < d.length; i += 64) if (!d[i]) k++; if (k / (d.length / 64) > .4) { done = true; cv.style.opacity = 0; cv.style.pointerEvents = 'none'; if (!rm) { const r2 = cv.getBoundingClientRect(); burst(r2.left + r2.width / 2, r2.top + r2.height / 2) } } }
}
cv.onpointerdown = e => { dn = true; cv.setPointerCapture(e.pointerId); sc(e) }; cv.onpointermove = sc; cv.onpointerup = () => dn = false;

/* ---------- countdown ---------- */
function cd() { if (!T) return; const s = Math.max(0, (T - Date.now()) / 1000 | 0); const v = [[s / 86400 | 0, 'Days'], [s % 86400 / 3600 | 0, 'Hours'], [s % 3600 / 60 | 0, 'Mins'], [s % 60, 'Secs']]; $('#cd').innerHTML = v.map(q => `<div><b>${q[0]}</b><i>${q[1]}</i></div>`).join('') }
setInterval(cd, 1000);

/* ---------- gallery lightbox ---------- */
$('#tr').onclick = e => { const t = e.target.closest('.tile'); if (!t) return; $('#lbi').style.backgroundImage = t.style.backgroundImage; $('#lbt').textContent = t.dataset.t; $('#lb').classList.add('on'); $('#tr').classList.add('p') };
$('#lb').onclick = () => { $('#lb').classList.remove('on'); $('#tr').classList.remove('p') };

/* ---------- gift + RSVP ---------- */
$('#cp').onclick = async () => { try { await navigator.clipboard.writeText($('#upi').textContent); $('#cp').textContent = 'Copied' } catch (e) { $('#cp').textContent = 'Select and copy above' } };
$('#rf').onsubmit = async e => {
  e.preventDefault(); const btn = $('#rbtn'), err = $('#rerr'); err.textContent = ''; btn.disabled = true;
  const p = { name: $('#rn').value.trim(), attendance: $('#ra').value, guests: +$('#rg').value || 1, message: $('#rm').value.trim() };
  try { await INV.rsvp(p); $('#rf').style.display = 'none'; $('#thx').style.display = 'block'; burst(innerWidth / 2, innerHeight * .6) }
  catch (er) {
    if (D.whatsapp) { const t = `Hi! This is ${p.name}. ${p.attendance} (${p.guests} guest/s) for the wedding. ${p.message}`; location.href = 'https://wa.me/' + String(D.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(t) }
    else err.textContent = 'Sorry, we could not send your reply. Please try again.'
  }
  btn.disabled = false
};

/* ---------- render ---------- */
const img = (name, v) => { const r = document.documentElement.style; v ? r.setProperty('--' + name, INV.bg(v)) : r.removeProperty('--' + name) };
function render(d) {
  D = d;
  document.title = `${d.bride} & ${d.groom} – Wedding Invitation`;
  img('bg', d.heroBg); img('env', d.envelopeArt); img('couple', d.blessBg); img('ctl', d.flowerTL); img('ctr', d.flowerTR); img('cbl', d.flowerBL);
  INV.text('#coverHint', d.coverHint);
  $('#intro').innerHTML = BR(d.intro); INV.text('#nA', d.bride); INV.text('#nB', d.groom);
  const dm = dmy(d.date); INV.text('#heroDate', dm ? `${dm.d} · ${dm.m} · ${dm.y}` : '');

  INV.text('#dateTitle', d.dateTitle); INV.text('#dateSub', d.dateSub);
  INV.text('#dMain', dm ? `${dm.d} ${cap(dm.m)} ${dm.y}` : ''); INV.text('#dNote', [INV.fmt.weekday(d.date), d.city].filter(Boolean).join(' · '));
  T = INV.dt(d.date, d.time); cd(); sizeCv(false);

  INV.text('#coupleTitle', d.coupleTitle); INV.text('#bName', d.bride); INV.text('#gName', d.groom);
  $('#bFam').innerHTML = BR(d.brideFamily); $('#gFam').innerHTML = BR(d.groomFamily);
  $('#phB').style.backgroundImage = INV.bg(d.bridePhoto); $('#phG').style.backgroundImage = INV.bg(d.groomPhoto);

  INV.text('#evTitle', d.eventsTitle);
  const evs = d.events || [];
  $('#evList').innerHTML = evs.map(e => { const m = dmy(e.date), when = [m ? `${m.d} ${cap(m.m).slice(0, 3)}` : '', INV.fmt.time(e.time)].filter(Boolean).join(' · ');
    return `<div class="ev"><div class="im" style='background-image:${cssv(e.image)}'></div><div><h3>${E(e.title)}</h3><p class="t">${E(when)}</p>${e.desc ? `<p>${E(e.desc)}</p>` : ''}</div></div>` }).join('');
  all('#evList .ev').forEach(el => rv(el, !first));
  INV.show('#events', evs.length > 0);

  INV.show('#bless', !!d.blessOn); INV.text('#blessTitle', d.blessTitle); INV.text('#blessText', d.blessText);

  const G = (d.gallery || []).filter(g => g && g.image);
  $('#tr').innerHTML = (G.length ? [...G, ...G] : []).map(g => `<button class="tile" style='background-image:${cssv(g.image)}' data-t="${E(g.title)}" aria-label="${E(g.title)}"><span>${E(g.title)}</span></button>`).join('');
  INV.text('#jTitle', d.journeyTitle); INV.text('#jSub', d.journeySub); INV.show('#journey', G.length > 0);

  INV.show('#gift', !!d.giftOn); INV.text('#gTitle', d.giftTitle); INV.text('#gText', d.giftText); INV.text('#upi', d.upi);
  INV.show('#rsvp', !!d.rsvpOn); INV.text('#rTitle', d.rsvpTitle); INV.text('#rSub', d.rsvpSub); INV.text('#thx', d.rsvpThanks);
  INV.text('#vTitle', d.venueTitle); $('#vText').innerHTML = BR([d.venueName, d.venueAddress].filter(Boolean).join('\n'));
  INV.text('#vName', d.venueName); INV.text('#vAddr', d.venueAddress); $('#vLink').href = INV.mapLink(d);
  INV.show('#venue', !!(d.venueName || d.venueAddress));
  all('.dock a').forEach(a => { const s = $(a.getAttribute('href')); a.style.display = s && s.hidden ? 'none' : '' });
  INV.setMusic(d.music); par(); onScroll();
}
INV.on(d => { render(d); if (first) { first = false; if (INV.skip) openEnv() } });
INV.start();
})();
