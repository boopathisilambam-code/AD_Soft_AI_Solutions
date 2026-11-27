/* engagement-invite-3 — renders everything from INV.data (see register.js for the fields) */
const $ = s => document.querySelector(s);
const E = s => INV.esc(s);
INV.defaults = (window.INV_DEF || {}).defaults || {};
let T = null, first = true, opened = false;

/* ---------- open card ---------- */
document.body.classList.add('locked'); document.body.style.overflow = 'hidden';
function openCard() {
  if (opened) return; opened = true;
  $('#cover').classList.add('open'); document.body.classList.remove('locked'); document.body.style.overflow = '';
  INV.playMusic();
  setTimeout(() => document.querySelectorAll('#hero .rv').forEach(e => e.classList.add('in')), 650);
}
INV.openFn = openCard;
$('#openBtn').onclick = openCard;

/* ---------- scratch card ---------- */
(function () {
  const c = $('#sc'), x = c.getContext('2d'); let g = x.createLinearGradient(0, 0, 300, 118); g.addColorStop(0, '#0e6b72'); g.addColorStop(.5, '#1b8a92'); g.addColorStop(1, '#0a3f48');
  x.fillStyle = g; x.fillRect(0, 0, 300, 118); x.fillStyle = '#e2c27d'; x.font = 'italic 20px Georgia,serif'; x.textAlign = 'center'; x.fillText('Scratch here ✦', 150, 66);
  let down = false; function sc(e) { if (!down) return; const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) * 300 / r.width, py = (e.clientY - r.top) * 118 / r.height; x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(px, py, 18, 0, 7); x.fill(); check() }
  function check() { try { const d = x.getImageData(0, 0, 300, 118).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (!d[i]) n++; if (n / (d.length / 16) > .45) c.style.opacity = 0 } catch (e) { } }
  c.onpointerdown = e => { down = true; c.setPointerCapture(e.pointerId); sc(e) }; c.onpointermove = sc; c.onpointerup = () => down = false
})();

/* ---------- countdown ---------- */
function cd() {
  if (!T) return; let s = Math.max(0, (T - new Date()) / 1000);
  $('#cd').innerHTML = [[86400, 'days'], [3600, 'hrs'], [60, 'min'], [1, 'sec']].map(([n, l]) => { const k = Math.floor(s / n); s -= k * n; return `<div>${k}<small>${l}</small></div>` }).join('')
}
setInterval(cd, 1000);

/* ---------- gallery + zoom ---------- */
const z = $('#zoom'), zc = $('#zc');
function show(el) { zc.className = 'z'; zc.style.backgroundImage = el.dataset.b; zc.firstElementChild.textContent = el.dataset.t; z.classList.add('on'); $('#track').classList.add('pause') }
z.onclick = () => { z.classList.remove('on'); $('#track').classList.remove('pause') };
function renderGallery(list) {
  const G = (list || []).filter(g => g && g.src);
  $('#track').innerHTML = (G.length ? [...G, ...G] : []).map(g => `<div class="g" tabindex="0" role="button" data-b='${INV.bg(g.src).replace(/'/g, '%27')}' data-t="${E(g.alt)}" style='background-image:${INV.bg(g.src).replace(/'/g, '%27')}'>${g.alt ? `<em>${E(g.alt)}</em>` : ''}</div>`).join('');
  document.querySelectorAll('.g').forEach(e => { e.onclick = () => show(e); e.onkeydown = k => { if (k.key === 'Enter') show(e) } });
  INV.show('#journey', G.length > 0);
}

/* ---------- parallax ---------- */
const L = [...document.querySelectorAll('[data-s]')]; function par() { const r = $('#stage').getBoundingClientRect(), m = r.top + r.height / 2 - innerHeight / 2; L.forEach(e => { const f = e.classList.contains('l-feather') && e.style.transform ? ' scaleX(-1)' : ''; e.style.transform = `translateY(${m * e.dataset.s * -1}px)${f}` }) }
addEventListener('scroll', par, { passive: true }); par();

/* ---------- gift ---------- */
$('#cp').onclick = async () => { try { await navigator.clipboard.writeText($('#upi').textContent); $('#cp').textContent = 'Copied ✓' } catch (e) { $('#cp').textContent = 'Select & copy above' } };

/* ---------- RSVP ---------- */
$('#rg').innerHTML = [1, 2, 3, 4, 5].map(n => `<option value="${n}">${n}${n === 5 ? '+' : ''} guest${n > 1 ? 's' : ''}</option>`).join('');
$('#rb').onclick = async () => {
  const D = INV.data || {}, n = $('#rn').value.trim(), m = $('#rm');
  if (!n) { m.textContent = 'Please enter your name.'; return }
  const btn = $('#rb'); btn.disabled = true; m.textContent = 'Sending…';
  try {
    await INV.rsvp({ name: n, attendance: $('#ra').value, guests: +$('#rg').value });
    m.textContent = 'Thank you! Your reply has been sent ♥'; $('#rn').value = '';
  } catch (e) {
    if (D.whatsapp) {
      const t = `Hi! This is ${n}. ${$('#ra').selectedOptions[0].text} — ${$('#rg').selectedOptions[0].text}. Engagement of ${D.bride} & ${D.groom}, ${INV.fmt.long(D.date)}.`;
      m.textContent = 'Opening WhatsApp to send your reply…'; location.href = 'https://wa.me/' + String(D.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(t);
    } else m.textContent = 'Sorry, we could not send your reply. Please try again.';
  }
  btn.disabled = false;
};

/* ---------- decor + reveal (runs once, after the first render) ---------- */
function decor() {
  const fe = document.querySelector('img.feather').src;
  document.querySelectorAll('section:not(#hero):not(#couple)').forEach((s, i) => {
    const m = i % 2;
    s.insertAdjacentHTML('afterbegin', `<img class="fl" alt="" src="${fe}" style="${m ? 'right' : 'left'}:-34px;top:5%;--r:${m ? -26 : 26}deg;--w:100px;--t:7s"><img class="fl" alt="" src="${fe}" style="${m ? 'left' : 'right'}:-28px;bottom:6%;--r:${m ? 18 : -18}deg;--w:84px;--t:9s;opacity:.26">`);
    for (let k = 0; k < 7; k++) { const d = document.createElement('span'); d.className = 'dot'; const zz = 3 + Math.random() * 4; d.style.cssText = `left:${8 + Math.random() * 84}%;width:${zz}px;height:${zz}px;animation-duration:${9 + Math.random() * 9}s;animation-delay:${-Math.random() * 12}s`; s.appendChild(d) }
  });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 }) : null;
  document.querySelectorAll('section').forEach(s => {
    let ev = 0; const h = s.id === 'hero';
    const els = h ? (hc => [hc, ...hc.children])(s.querySelector('.hc')) : [...s.querySelectorAll(':scope>:is(h2,.sub,.feather,small,.cd,.scratch,.ev,.gift,.map,.track,.btn,.stage),.rs>*,#evList>.ev')];
    els.forEach((e, i) => {
      e.classList.add('rv');
      if (e.matches('.ev')) e.classList.add(ev++ % 2 ? 'r' : 'l'); else if (e.matches('.gift')) e.classList.add('f'); else if (e.matches('.map')) e.classList.add('z');
      else if (e.matches('.track,.stage')) e.classList.add('o'); else if (e.matches('.feather')) e.classList.add('sp'); else if (e.matches('.btn,.scratch,.cd')) e.classList.add('z');
      e.style.setProperty('--d', Math.min(i * .14, .8) + 's'); if (!h) io ? io.observe(e) : e.classList.add('in')
    })
  });
  if (opened) document.querySelectorAll('#hero .rv').forEach(e => e.classList.add('in'));
}

/* ---------- render ---------- */
function render(D) {
  document.title = `${D.bride} & ${D.groom} · Engagement`;
  INV.text('#sealTxt', D.sealText); INV.text('#coverHint', D.coverHint);
  INV.text('#blessing', D.blessing); INV.text('#tagline', D.tagline); INV.text('#inviteLine', D.inviteLine);
  INV.text('#nA', D.bride); INV.text('#nB', D.groom);
  INV.text('#dateTitle', D.dateTitle); INV.text('#dateSub', D.dateSub);
  INV.text('#dB', INV.fmt.dots(D.date));
  INV.text('#dS', [INV.fmt.weekday(D.date), INV.fmt.time(D.time)].filter(Boolean).join(', '));
  T = INV.dt(D.date, D.time); cd();

  INV.text('#evTitle', D.eventsTitle); INV.text('#evSub', D.eventsSub);
  const evs = (D.events || []);
  $('#evList').innerHTML = evs.map((e, i) => `<div class="ev${first ? '' : ' rv in ' + (i % 2 ? 'r' : 'l')}"><div class="im i${(i % 3) + 1}"${e.image ? ` style='background-image:${INV.bg(e.image).replace(/'/g, '%27')};background-position:center'` : ''}></div><div class="tx"><h3>${E(e.title)}</h3><p class="tm">${E(INV.when(e.date, e.time))}</p>${e.desc ? `<p>${E(e.desc)}</p>` : ''}</div></div>`).join('');
  INV.show('#events', evs.length > 0);

  INV.text('#coupleTitle', D.coupleTitle); INV.text('#pA', D.bride); INV.text('#pB', D.groom); INV.text('#coupleCap', D.coupleCaption);
  [['.p1', D.bridePhoto], ['.p2', D.groomPhoto]].forEach(([s, p]) => { const n = $(s); if (p) { n.style.backgroundImage = INV.bg(p); n.style.backgroundSize = 'cover'; n.style.backgroundPosition = 'center 12%' } else { n.style.backgroundImage = ''; n.style.backgroundSize = ''; n.style.backgroundPosition = '' } });

  INV.text('#jTitle', D.journeyTitle); INV.text('#jSub', D.journeySub); renderGallery(D.gallery);

  INV.show('#gift', !!D.giftOn);
  INV.text('#gTitle', D.giftTitle); INV.text('#gSub', D.giftSub); INV.text('#gCard', D.giftCardTitle); INV.text('#gText', D.giftText); INV.text('#upi', D.upi);

  INV.show('#rsvp', !!D.rsvpOn);
  INV.text('#rsvp h2', D.rsvpTitle);
  INV.text('#rSub', D.rsvpBy ? `Kindly reply by ${INV.fmt.long(D.rsvpBy)}` : 'Let us know you are coming');

  INV.text('#vSub', [D.venueName, D.venueAddress].filter(Boolean).join(', ')); INV.text('#venue h2', D.venueTitle);
  const mp = INV.mapEmbed(D); if ($('#vMap').getAttribute('src') !== mp) $('#vMap').setAttribute('src', mp);
  $('#vLink').href = INV.mapLink(D);
  INV.show('#venue', !!(D.venueName || D.venueAddress || D.mapQuery));

  INV.text('#closing', `${D.closing || 'With love'}, ${D.bride} & ${D.groom}`);
  INV.setMusic(D.music);
}
INV.on(D => {
  render(D);
  if (first) { first = false; decor(); if (INV.skip) openCard(); }
});
INV.start();
