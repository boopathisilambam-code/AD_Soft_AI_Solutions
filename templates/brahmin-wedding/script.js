/* brahmin-wedding — renders everything from INV.data (see register.js for the fields) */
(() => {
const $ = s => document.querySelector(s), hero = $('#hero'), cv = $('#cover');
const E = s => INV.esc(s);
const cssv = v => INV.bg(v).replace(/'/g, '%27');
const stock = v => !v || /^\.?\/?assets\//.test(v);
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const cap = s => s[0] + s.slice(1).toLowerCase();
const dmy = d => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? { d: +m[3], m: MONTHS[+m[2] - 1], y: m[1] } : null };
INV.defaults = (window.INV_DEF || {}).defaults || {};
let first = true, D = INV.defaults, T0 = null, M = [], ci = 0;

/* ---------- hero timeline ---------- */
const T = []; let done = false, opened = false;
const sc = [['#s1', '-110vw', '0px', '110vw', '0px'], ['#s2', '110vw', '0px', '-110vw', '0px'], ['#s3', '0px', '-80vh', '0px', '80vh'], ['#s4', '0px', '80vh', '0px', '-80vh']];
function put(e, x, y) { e.style.setProperty('--fx', x); e.style.setProperty('--fy', y) }
function show(a) { const e = $(a[0]); e.style.transition = 'none'; put(e, a[1], a[2]); e.classList.remove('on'); void e.offsetWidth; e.style.transition = ''; put(e, '0px', '0px'); e.classList.add('on') }
function out(a) { const e = $(a[0]); put(e, a[3], a[4]); e.classList.remove('on') }
function finish() { if (done) return; done = true; T.forEach(clearTimeout); hero.classList.add('go'); sc.forEach(a => $(a[0]).style.display = 'none'); $('#nm').classList.add('show') }
function start() { hero.classList.add('go'); if (matchMedia('(prefers-reduced-motion:reduce)').matches) { finish(); return }
  sc.forEach((a, i) => { T.push(setTimeout(() => show(a), 2000 + i * 1900)); T.push(setTimeout(() => out(a), 2000 + i * 1900 + 1400)) });
  T.push(setTimeout(finish, 2000 + sc.length * 1900)) }
hero.onclick = () => { if (!cv.classList.contains('open')) return; finish() };
function openDoors(skip) { if (opened) return; opened = true; cv.classList.add('open'); document.body.classList.remove('locked'); INV.playMusic(); if (skip === true) { setTimeout(finish, 50) } else setTimeout(start, 900) }
INV.openFn = () => openDoors();
cv.onclick = () => openDoors(); cv.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') openDoors() };

/* ---------- scratch ---------- */
const scr = $('#scr'), sx = scr.getContext('2d'); let sdone = false, sdown = false, sw = 0, sh = 0, drawnHint = null;
function drawScratch() {
  if (sdone) return; const hint = D.scratchHint || 'Scratch here ✦'; if (hint === drawnHint && sw) return;
  const r = scr.getBoundingClientRect(); if (!r.width) return; drawnHint = hint; sw = scr.width = r.width; sh = scr.height = r.height;
  const g = sx.createLinearGradient(0, 0, sw, sh); g.addColorStop(0, '#e8c675'); g.addColorStop(.5, '#c28a22'); g.addColorStop(1, '#dcb558');
  sx.globalCompositeOperation = 'source-over'; sx.fillStyle = g; sx.fillRect(0, 0, sw, sh); sx.fillStyle = 'rgba(255,246,220,.95)'; sx.font = 'italic 20px Cormorant Garamond,serif'; sx.textAlign = 'center'; sx.fillText(hint, sw / 2, sh / 2 + 6)
}
function sdraw(e) { if (!sdown || sdone) return; const r = scr.getBoundingClientRect(); sx.globalCompositeOperation = 'destination-out'; sx.beginPath(); sx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, 7); sx.fill() }
scr.onpointerdown = e => { sdown = true; scr.setPointerCapture(e.pointerId); sdraw(e) }; scr.onpointermove = sdraw;
scr.onpointerup = () => { sdown = false; const d = sx.getImageData(0, 0, sw, sh).data; let n = 0; for (let i = 3; i < d.length; i += 32) if (!d[i]) n++; if (n / (d.length / 32) > .45) { sdone = true; scr.style.opacity = 0; scr.style.pointerEvents = 'none' } };

/* ---------- decor (garlands, banana leaves, elephants) ---------- */
const S = document.querySelectorAll('section'), K = { g: ['--gl', 2.4], b: ['--bn', 1.78], e: ['--el', 1.35] };
[[0,'g','left:4px;top:0',.04,52],[0,'g','right:4px;top:0',.04,52,1],[1,'e','right:-20px;top:34%',.1,100],[1,'b','left:-36px;bottom:3%',.06,100],[2,'e','left:-20px;top:2%',.1,100],[3,'b','right:-30px;bottom:2%',.06,96,1],[4,'g','left:6px;top:0',.04,50],[4,'e','right:-20px;bottom:6%',.1,100],[5,'b','left:-30px;bottom:0',.06,96],[6,'e','right:-20px;top:10%',.1,100],[7,'g','right:6px;top:0',.04,52,1],[7,'b','left:-34px;bottom:2%',.06,100]].forEach(d => { const e = document.createElement('div'), k = K[d[1]]; e.className = 'd ' + d[1] + (d[5] ? ' fx' : ''); e.dataset.p = d[3]; e.style.cssText = d[2] + ';width:' + d[4] + 'px;height:' + d[4] * k[1] + 'px'; e.innerHTML = '<i style="--k:var(' + k[0] + ')"></i>'; S[d[0]].appendChild(e) });

/* ---------- reveal + parallax ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
document.querySelectorAll('section>:not(.d)').forEach(e => { e.classList.add('rv'); io.observe(e) });
addEventListener('scroll', () => $('#fab').classList.toggle('on', scrollY > innerHeight * .7), { passive: true });
const ps = [...document.querySelectorAll('[data-p]')];
function par() { const vh = innerHeight; ps.forEach(el => { const r = el.parentNode.getBoundingClientRect(); el.style.transform = 'translateY(' + ((r.top + r.height / 2 - vh / 2) * el.dataset.p) + 'px)' }) }
addEventListener('scroll', par, { passive: true }); par();

/* ---------- gallery / lightbox ---------- */
const lb = $('#lb');
function sh_(i) { if (!M.length) return; ci = (i + M.length) % M.length; const m = M[ci], p = $('#lbp'); p.style.setProperty('--im', cssv(m.image)); p.classList.toggle('ph', !stock(m.image)); $('#lbt').textContent = m.title || ''; $('#lbd').textContent = m.desc || '' }
$('#trk').onclick = e => { const t = e.target.closest('.tile'); if (t) { sh_(+t.dataset.i); lb.classList.add('on') } };
$('#trk').onkeydown = e => { if (e.key === 'Enter') $('#trk').onclick(e) };
$('#cl').onclick = () => lb.classList.remove('on'); lb.onclick = e => { if (e.target === lb) lb.classList.remove('on') };
$('#pv').onclick = () => sh_(ci - 1); $('#nx').onclick = () => sh_(ci + 1);
$('#gal').addEventListener('touchstart', () => $('#gal').classList.add('p'), { passive: true });
$('#gal').addEventListener('touchend', () => setTimeout(() => $('#gal').classList.remove('p'), 2500));

/* ---------- gift + rsvp ---------- */
$('#cp').onclick = async () => { try { await navigator.clipboard.writeText($('#upi').textContent); $('#cp').textContent = 'Copied' } catch (e) { $('#cp').textContent = 'Select and copy the ID above' } };
$('#rs').onsubmit = async e => {
  e.preventDefault(); const btn = $('#rbtn'), err = $('#rerr'); err.textContent = ''; btn.disabled = true;
  const p = { name: $('#rn').value.trim(), attendance: $('#ra').value, guests: +$('#rg').value || 1, message: $('#rm').value.trim() };
  try { await INV.rsvp(p); $('#rs').style.display = 'none'; $('#thx').style.display = 'block' }
  catch (er) {
    if (D.whatsapp) { const t = 'Vanakkam! ' + p.name + ': ' + p.attendance + ' (' + p.guests + ' guest/s). ' + p.message; open('https://wa.me/' + String(D.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(t), '_blank') }
    else err.textContent = 'Sorry, we could not send your reply. Please try again.'
  }
  btn.disabled = false
};

/* ---------- render ---------- */
let c = 0; const spl = t => [...t].map(ch => '<span class="ch" style="--i:' + (c++) + '">' + (ch === ' ' ? '&nbsp;' : E(ch)) + '</span>').join('');
function cd() { if (!T0) return; const dd = T0 - new Date(); $('#cd').textContent = dd > 0 ? Math.floor(dd / 864e5) + ' ' + (D.countdownText || 'days to go') : (D.countdownDone || 'The auspicious day is here') }
function render(d) {
  D = d;
  document.title = `${d.bride} & ${d.groom} · Vivaha Invitation`;
  INV.text('#tapText', d.tapText); INV.text('#shloka', d.shloka); INV.text('#tamilTitle', d.tamilTitle); INV.text('#intro', d.intro);
  c = 0; $('#n1').innerHTML = spl(d.bride || ''); c += 2; $('#n2').innerHTML = spl(d.groom || '');
  const dm = dmy(d.date);
  INV.text('#hWeek', INV.fmt.weekday(d.date).toUpperCase()); INV.text('#hDay', dm ? dm.d : ''); INV.text('#hMonth', dm ? dm.m + ' ' + dm.y : '');
  INV.text('#hLine', [d.muhurthamLabel && d.time ? d.muhurthamLabel + ' ' + INV.fmt.time(d.time) : INV.fmt.time(d.time), d.city].filter(Boolean).join(' · '));

  INV.text('#dateE', d.dateTitle); INV.text('#dateSub', d.dateSub);
  INV.text('#dMain', dm ? `${dm.d} ${cap(dm.m)} ${dm.y}` : '');
  INV.text('#dNote', [INV.fmt.weekday(d.date), d.time ? (d.muhurthamLabel ? d.muhurthamLabel + ' ' : '') + INV.fmt.time(d.time) : ''].filter(Boolean).join(' · '));
  T0 = INV.dt(d.date, d.time); cd(); drawScratch();

  INV.text('#evH', d.eventsTitle); INV.text('#evSub', d.eventsSub);
  const evs = d.events || [];
  $('#evList').innerHTML = evs.map(e => { const m = dmy(e.date), w = INV.fmt.weekday(e.date);
    const when = [m ? (w ? w + ', ' : '') + m.d + ' ' + cap(m.m) : '', INV.fmt.time(e.time)].filter(Boolean).join(' · ');
    return `<div class="ev"><div class="im${stock(e.image) ? '' : ' ph'}" style='--im:${cssv(e.image)}'></div><div class="t"><h3>${E(e.title)}</h3><small>${E(when)}</small>${E(e.desc || '')}</div></div>` }).join('');
  INV.show('#events', evs.length > 0);

  INV.text('#pairH', d.pairTitle); INV.text('#pairSub', d.pairSub);
  INV.text('#bName', d.bride); INV.text('#bFam', d.brideFamily); INV.text('#gName', d.groom); INV.text('#gFam', d.groomFamily);
  INV.text('#moB', (d.bride || '')[0] || ''); INV.text('#moG', (d.groom || '')[0] || '');
  [['#archB', '#icB', d.bridePhoto, '--ka'], ['#archG', '#icG', d.groomPhoto, '--el']].forEach(([a, i, p, def]) => { const A = $(a), I = $(i); A.style.setProperty('--pic', p ? INV.bg(p) : 'var(' + def + ')'); I.classList.toggle('ph', !!p) });

  INV.show('#blessings', !!d.noteOn); INV.text('#noteH', d.noteTitle); INV.text('#noteSub', d.noteSub); INV.text('#noteIcon', d.noteIcon || '🪔'); INV.text('#noteText', d.noteText); INV.text('#noteSmall', d.noteSmall);

  M = (d.memories || []).filter(m => m && m.image);
  $('#trk').innerHTML = (M.length ? [...M, ...M] : []).map((m, k) => `<div class="tile im${stock(m.image) ? '' : ' ph'}" tabindex="0" role="button" aria-label="${E(m.title)}" data-i="${k % M.length}" style='--im:${cssv(m.image)}'><span>${E(m.title)}</span></div>`).join('');
  INV.text('#jH', d.journeyTitle); INV.text('#jSub', d.journeySub); INV.show('#journey', M.length > 0);

  INV.show('#gift', !!d.giftOn); INV.text('#gH', d.giftTitle); INV.text('#gText', d.giftText); INV.text('#upi', d.upi);
  INV.show('#rsvp', !!d.rsvpOn); INV.text('#rH', d.rsvpTitle); INV.text('#rSub', d.rsvpSub); INV.text('#thx', d.rsvpThanks);
  INV.text('#vH', d.venueTitle); $('#vText').innerHTML = [d.venueName, d.venueAddress].filter(Boolean).map(E).join('<br>');
  const mp = INV.mapEmbed(d); if ($('#vMap').getAttribute('src') !== mp) $('#vMap').setAttribute('src', mp); $('#vLink').href = INV.mapLink(d);
  INV.show('#venue', !!(d.venueName || d.venueAddress || d.mapQuery));
  $('#fab').style.display = d.rsvpOn ? '' : 'none';
  INV.setMusic(d.music);
  par();
}
INV.on(d => { render(d); if (first) { first = false; if (INV.skip) openDoors(true) } });
INV.start();
})();
