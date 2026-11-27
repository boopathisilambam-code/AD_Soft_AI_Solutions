/* engagement-invite-2 — renders everything from INV.data (see register.js for the fields) */
const $ = s => document.querySelector(s);
const E = s => INV.esc(s);
INV.defaults = (window.INV_DEF || {}).defaults || {};
let T = null, first = true, opened = false;
const LT = '<svg class="lt" viewBox="0 0 100 70" aria-hidden="true"><g transform="translate(50 66)" fill="#f7bccb" stroke="#d9728c" stroke-width="1.2"><ellipse rx="11" ry="34" cy="-34" transform="rotate(-64)"/><ellipse rx="11" ry="34" cy="-34" transform="rotate(64)"/><ellipse rx="11" ry="34" cy="-34" transform="rotate(-32)"/><ellipse rx="11" ry="34" cy="-34" transform="rotate(32)"/><ellipse rx="11" ry="34" cy="-34" fill="#fbd3dc"/><circle cy="-12" r="5" fill="#e8c98a" stroke="none"/></g></svg>';
document.querySelectorAll('i.lotus').forEach(e => e.outerHTML = LT);

/* ---------- open door ---------- */
document.body.classList.add('locked'); document.body.style.overflow = 'hidden';
function openDoor() {
  if (opened) return; opened = true;
  $('#cover').classList.add('open'); document.body.classList.remove('locked'); document.body.style.overflow = '';
  INV.playMusic();
  setTimeout(() => document.querySelectorAll('#hero .rv').forEach(e => e.classList.add('in')), 900)
}
INV.openFn = openDoor;
$('#openBtn').onclick = openDoor;

/* ---------- scratch card ---------- */
(function () {
  const c = $('#sc'), x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 300, 118); g.addColorStop(0, '#d98ca0'); g.addColorStop(.5, '#e8c98a'); g.addColorStop(1, '#b8893c');
  x.fillStyle = g; x.fillRect(0, 0, 300, 118); x.fillStyle = '#6e2a3c'; x.font = 'italic 21px Georgia,serif'; x.textAlign = 'center'; x.fillText('Scratch here ✦', 150, 66);
  let down = false; function sc(e) { if (!down) return; const r = c.getBoundingClientRect(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc((e.clientX - r.left) * 300 / r.width, (e.clientY - r.top) * 118 / r.height, 18, 0, 7); x.fill(); chk() }
  function chk() { try { const d = x.getImageData(0, 0, 300, 118).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (!d[i]) n++; if (n / (d.length / 16) > .45) c.style.opacity = 0 } catch (e) { } }
  c.onpointerdown = e => { down = true; c.setPointerCapture(e.pointerId); sc(e) }; c.onpointermove = sc; c.onpointerup = () => down = false
})();

/* ---------- countdown ---------- */
function cd() { if (!T) return; let s = Math.max(0, (T - new Date()) / 1000); $('#cd').innerHTML = [[86400, 'days'], [3600, 'hrs'], [60, 'min'], [1, 'sec']].map(([n, l]) => { const k = Math.floor(s / n); s -= k * n; return `<div>${k}<small>${l}</small></div>` }).join('') }
setInterval(cd, 1000);

/* ---------- gallery + zoom ---------- */
const z = $('#zoom'), zc = $('#zc');
function show(el) { zc.className = 'zm'; zc.style.backgroundImage = el.dataset.b; zc.firstElementChild.textContent = el.dataset.t; z.classList.add('on'); $('#track').classList.add('pause') }
z.onclick = () => { z.classList.remove('on'); $('#track').classList.remove('pause') };
function renderGallery(list) {
  const G = (list || []).filter(g => g && g.src);
  $('#track').innerHTML = (G.length ? [...G, ...G] : []).map(g => { const b = INV.bg(g.src).replace(/'/g, '%27'); return `<div class="g" tabindex="0" role="button" data-b='${b}' data-t="${E(g.alt)}" style='background-image:${b}'>${g.alt ? `<em>${E(g.alt)}</em>` : ''}</div>` }).join('');
  document.querySelectorAll('.g').forEach(e => { e.onclick = () => show(e); e.onkeydown = k => { if (k.key === 'Enter') show(e) } });
  INV.show('#journey', G.length > 0);
}

/* ---------- parallax ---------- */
const L = [...document.querySelectorAll('[data-s]')]; function par() { const r = $('#stage').getBoundingClientRect(), m = r.top + r.height / 2 - innerHeight / 2; L.forEach(e => e.style.transform = `translateY(${-m * e.dataset.s}px)`) }
addEventListener('scroll', par, { passive: true }); par();

/* ---------- gift + RSVP ---------- */
$('#cp').onclick = async () => { try { await navigator.clipboard.writeText($('#upi').textContent); $('#cp').textContent = 'Copied ✓' } catch (e) { $('#cp').textContent = 'Select & copy above' } };
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
      m.textContent = 'Opening WhatsApp to send your reply…'; location.href = 'https://wa.me/' + String(D.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(t)
    } else m.textContent = 'Sorry, we could not send your reply. Please try again.';
  }
  btn.disabled = false;
};

/* ---------- love button ---------- */
(function () {
  const st = $('#stage'); for (let k = 0; k < 10; k++) { const h = document.createElement('span'); h.className = 'fh'; h.textContent = '♥'; h.style.cssText = `left:${5 + Math.random() * 90}%;font-size:${12 + Math.random() * 16}px;animation-duration:${8 + Math.random() * 8}s;animation-delay:${-Math.random() * 12}s`; st.appendChild(h) }
  let n = 0; $('#lv').onclick = e => { n++; $('#lc').textContent = `You have sent ${n} ${n > 1 ? 'hearts' : 'heart'}. Thank you! ♥`; const r = e.currentTarget.getBoundingClientRect(); for (let k = 0; k < 9; k++) { const h = document.createElement('span'); h.className = 'hb'; h.textContent = '♥'; h.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;--x:${(Math.random() - .5) * 170}px;font-size:${14 + Math.random() * 16}px;color:${['#e68aa0', '#f6b7c3', '#c46a7e', '#e8c98a'][k % 4]}`; document.body.appendChild(h); setTimeout(() => h.remove(), 1500) } }
})();

/* ---------- flowers, petals, reveal (runs once, after the first render) ---------- */
function decor() {
  const PC = ['#f6b7c3', '#e68aa0', '#fbd9c9', '#fff1ea', '#f3c98b'];
  document.querySelectorAll('section:not(#hero):not(#couple)').forEach((s, i) => {
    const m = i % 2, h = s.offsetHeight + 40;
    s.insertAdjacentHTML('afterbegin', `<div class="fl" style="${m ? 'right' : 'left'}:-22px;top:4%;--r:${m ? -14 : -6}deg;--w:96px;--t:7s">${LT}</div><div class="fl" style="${m ? 'left' : 'right'}:-18px;bottom:5%;--r:${m ? -8 : -16}deg;--w:80px;--t:9s;opacity:.4">${LT}</div>`);
    for (let k = 0; k < 9; k++) { const p = document.createElement('span'), w = 9 + Math.random() * 9; p.className = 'pt'; p.style.cssText = `left:${Math.random() * 100}%;width:${w}px;height:${w * 1.25}px;background:${PC[k % 5]};--h:${h}px;animation-duration:${9 + Math.random() * 9}s;animation-delay:${-Math.random() * 14}s`; s.appendChild(p) }
  });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 }) : null;
  document.querySelectorAll('section').forEach(s => {
    let ev = 0; const h = s.id === 'hero';
    const els = h ? (hc => [hc, ...hc.children])(s.querySelector('.hc')) : [...s.querySelectorAll(':scope>:is(h2,.sub,small,.cd,.scratch,.gift,.map,.track,.btn,.stage,.arch,.tl,.rings,.quote),.rs>*,.tl>*,#evList>.ev')];
    els.forEach((e, i) => {
      e.classList.add('rv');
      if (e.matches('.ev,.tli')) e.classList.add(ev++ % 2 ? 'r' : 'l'); else if (e.matches('.gift')) e.classList.add('f'); else if (e.matches('.track,.stage,.tl,.rings')) e.classList.add('o');
      else if (e.matches('.btn,.scratch,.cd,.names,.map,.arch')) e.classList.add('z');
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
  const evs = D.events || [];
  $('#evList').innerHTML = evs.map((e, i) => `<div class="ev${first ? '' : ' rv in ' + (i % 2 ? 'r' : 'l')}"><div class="im"${e.image ? ` style='background-image:${INV.bg(e.image).replace(/'/g, '%27')};background-size:cover;background-position:center'` : ''}></div><div class="tx"><h3>${E(e.title)}</h3><p class="tm">${E(INV.when(e.date, e.time))}</p>${e.desc ? `<p>${E(e.desc)}</p>` : ''}</div></div>`).join('');
  INV.show('#events', evs.length > 0);

  INV.text('#coupleTitle', D.coupleTitle); INV.text('#pA', D.groom); INV.text('#pB', D.bride); INV.text('#coupleCap', D.coupleCaption);
  [['.p1', D.groomPhoto], ['.p2', D.bridePhoto]].forEach(([s, p]) => { $(s).style.backgroundImage = p ? INV.bg(p) : '' });

  INV.show('#story', !!D.storyOn);
  INV.text('#sTitle', D.storyTitle); INV.text('#sSub', D.storySub);
  $('#sPhoto').style.backgroundImage = D.storyPhoto ? INV.bg(D.storyPhoto) : '';
  $('#tlList').innerHTML = (D.timeline || []).map((t, i) => `<div class="tli${first ? '' : ' rv in ' + (i % 2 ? 'r' : 'l')}"><b>${E(t.year)}</b><h3>${E(t.title)}</h3><p>${E(t.desc)}</p></div>`).join('');

  INV.text('#jTitle', D.journeyTitle); INV.text('#jSub', D.journeySub); renderGallery(D.gallery);

  INV.show('#love', !!D.loveOn);
  INV.text('#lTitle', D.loveTitle); INV.text('#lSub', D.loveSub); INV.text('#lQuote', D.loveQuote); INV.text('#lv', D.loveButton);

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
  if (first) { first = false; decor(); if (INV.skip) openDoor(); }
});
INV.start();
