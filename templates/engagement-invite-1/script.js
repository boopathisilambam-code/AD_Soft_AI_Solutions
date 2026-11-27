/* engagement-invite-1 — renders everything from INV.data (see register.js for the fields) */
const $ = s => document.querySelector(s);
const E = s => INV.esc(s);
INV.defaults = (window.INV_DEF || {}).defaults || {};
let T = null, first = true, opened = false, M = [];

/* ---------- open card ---------- */
const cv = $('#cover');
function openCard() { if (opened) return; opened = true; cv.classList.add('open'); document.body.classList.remove('locked'); INV.playMusic() }
INV.openFn = openCard;
cv.onclick = openCard; cv.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') openCard() };
// scratch
        function initScratch() {
            const c = $('#scr'), x = c.getContext('2d'); let w, h, down = false, done = false;
            function init() {
                const r = c.getBoundingClientRect(); w = c.width = r.width; h = c.height = r.height;
                const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e3c878'); g.addColorStop(.5, '#b58e3f'); g.addColorStop(1, '#d9b95f');
                x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,248,225,.9)'; x.font = 'italic 20px Cormorant Garamond,serif'; x.textAlign = 'center'; x.fillText('Scratch here ✦', w / 2, h / 2 + 6)
            }
            init();
            function sc(e) { if (!down || done) return; const r = c.getBoundingClientRect(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, 7); x.fill() }
            c.onpointerdown = e => { down = true; c.setPointerCapture(e.pointerId); sc(e) }; c.onpointermove = sc;
            c.onpointerup = () => {
                down = false; const d = x.getImageData(0, 0, w, h).data; let n = 0; for (let i = 3; i < d.length; i += 32)if (!d[i]) n++;
                if (n / (d.length / 32) > .45) { done = true; c.style.opacity = 0; c.style.pointerEvents = 'none' }
            };
        }
        
/* ---------- countdown ---------- */
function cd() {
  if (!T) return; const D = INV.data || {}, d = T - new Date();
  $('#cd').textContent = d > 0 ? Math.floor(d / 864e5) + ' ' + (D.countdownText || 'days to go') : (D.countdownDone || '')
}
setInterval(cd, 60000);

// decor
        const S = document.querySelectorAll('section'), D = [[0, 'b', 'right:7%;bottom:11%', .25, 64], [1, 'f', 'left:-80px;top:20%', .08, 170], [1, 'b', 'right:2%;top:5%', .3, 76], [2, 'f', 'right:-90px;top:38%', .1, 180], [2, 'b', 'left:0;bottom:5%', .28, 70], [3, 'b', 'left:3%;top:1%', .3, 68], [3, 'f', 'right:-95px;bottom:2%', .12, 190], [4, 'f', 'left:-85px;top:2%', .1, 170], [4, 'b', 'right:3%;top:34%', .3, 62], [5, 'b', 'left:6%;top:6%', .3, 72], [5, 'f', 'right:-90px;bottom:0', .1, 190], [6, 'f', 'left:-95px;top:12%', .1, 180], [6, 'b', 'right:3%;bottom:5%', .28, 68], [7, 'f', 'right:-80px;top:8%', .1, 170], [7, 'b', 'left:4%;top:0', .3, 70]];
        D.concat([[4, 'b', 'right:4%;top:6%', .3, 66, 1], [4, 'f', 'left:-90px;bottom:0', .1, 170, 1], [5, 'f', 'right:-90px;top:30%', .1, 170, 1], [5, 'b', 'left:3%;bottom:4%', .28, 64, 1]]).forEach((d, k) => { if (!d[5] && d[0] > 3) d[0] += 2; const e = document.createElement('div'); e.className = 'd ' + d[1]; e.dataset.p = d[3]; e.style.cssText = d[2] + ';width:' + d[4] + 'px;height:' + d[4] * .92 + 'px'; e.innerHTML = '<i style="animation-delay:-' + (k * 1.7) + 's"></i>'; S[d[0]].appendChild(e) });
        
// parallax
        const ps = [...document.querySelectorAll('[data-p]')];
        function par() { const vh = innerHeight; ps.forEach(el => { const r = el.parentNode.getBoundingClientRect(); const o = (r.top + r.height / 2 - vh / 2); el.style.transform = 'translateY(' + (o * el.dataset.p) + 'px)' }) }
        addEventListener('scroll', par, { passive: true }); par();
        
/* ---------- gallery ---------- */
let ci = 0; const lb = $('#lb'), tr = $('#trk');
const bgs = m => (m.image ? INV.bg(m.image) : '');
function show(i) { ci = (i + M.length) % M.length; const m = M[ci], p = $('#lbp'); p.style.backgroundImage = bgs(m); p.style.backgroundPosition = 'center'; p.style.backgroundSize = 'cover'; p.style.backgroundRepeat = 'no-repeat'; p.style.backgroundColor = '#cdd8c3'; $('#lbt').textContent = m.title || ''; $('#lbd').textContent = m.desc || '' }
tr.onclick = e => { const t = e.target.closest('.tile'); if (t && M.length) { show(+t.dataset.i); lb.classList.add('on') } };
tr.onkeydown = e => { if (e.key === 'Enter') tr.onclick(e) };
$('#cl').onclick = () => lb.classList.remove('on'); lb.onclick = e => { if (e.target === lb) lb.classList.remove('on') };
$('#pv').onclick = () => show(ci - 1); $('#nx').onclick = () => show(ci + 1);
$('#gal').addEventListener('touchstart', () => $('#gal').classList.add('p'), { passive: true });
$('#gal').addEventListener('touchend', () => setTimeout(() => $('#gal').classList.remove('p'), 2500));
function renderGallery(list) {
  M = (list || []).filter(m => m && m.image);
  let h = ''; for (let k = 0; k < (M.length ? 2 : 0); k++) M.forEach((m, i) => h += `<div class="tile" tabindex="0" data-i="${i}" role="button" aria-label="${E(m.title)}" style='background-image:${bgs(m).replace(/'/g, '%27')};background-position:center;background-size:cover'><span>${E(m.title)}</span></div>`);
  tr.innerHTML = h; INV.show('#journey', M.length > 0);
}

/* ---------- flip cards, hearts ---------- */
document.querySelectorAll('.fc').forEach(f => f.onclick = () => f.classList.toggle('on'));
$('#hearts').innerHTML = Array.from({ length: 12 }, (_, i) => '<i style="left:' + (i * 8 + 3) + '%;font-size:' + (12 + i % 4 * 5) + 'px;animation-delay:-' + (i * .9) + 's;animation-duration:' + (7 + i % 3 * 2) + 's">♥</i>').join('');
const lines = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean);

/* ---------- gift + RSVP ---------- */
$('#cp').onclick = async () => { try { await navigator.clipboard.writeText($('#upi').textContent); $('#cp').textContent = 'Copied' } catch (e) { $('#cp').textContent = 'Select and copy the ID above' } };
$('#rs').onsubmit = async e => {
  e.preventDefault(); const f = new FormData(e.target), D = INV.data || {}, m = $('#rm'), btn = $('#rb');
  const n = String(f.get('n') || '').trim(); if (!n) { m.textContent = 'Please enter your name.'; return }
  btn.disabled = true; m.textContent = 'Sending…';
  try {
    await INV.rsvp({ name: n, attendance: f.get('a'), guests: +f.get('g') || 1, message: f.get('m') || '' });
    m.textContent = 'Thank you! Your reply has been sent ♥'; e.target.reset();
  } catch (err) {
    if (D.whatsapp) {
      const t = `Hello! ${n}: ${f.get('a') === 'Joyfully Accepts' ? 'Joyfully attending' : 'Unable to attend'} (${f.get('g')} guest/s). ${f.get('m') || ''}`;
      m.textContent = 'Opening WhatsApp to send your reply…'; window.open('https://wa.me/' + String(D.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(t), '_blank')
    } else m.textContent = 'Sorry, we could not send your reply. Please try again.'
  }
  btn.disabled = false;
};

/* ---------- render ---------- */
function render(D) {
  document.title = `${D.bride} & ${D.groom} · Engagement`;
  INV.text('#coverHint', D.coverHint); INV.text('#blessing', D.blessing);
  INV.text('#nA', D.bride); INV.text('#nB', D.groom);
  INV.text('#heroDate', [INV.fmt.weekday(D.date), INV.fmt.long(D.date)].filter(Boolean).join(' · '));
  INV.text('#dateTitle', D.dateTitle); INV.text('#dateSub', D.dateSub);
  INV.text('#dB', INV.fmt.long(D.date)); INV.text('#dS', [INV.fmt.weekday(D.date), INV.fmt.time(D.time)].filter(Boolean).join(', '));
  T = INV.dt(D.date, D.time); cd();

  INV.text('#evTitle', D.eventsTitle); INV.text('#evSub', D.eventsSub);
  const evs = D.events || [];
  $('#evList').innerHTML = evs.map(e => `<div class="ev"><div class="im"${e.image ? ` style='background-image:${INV.bg(e.image).replace(/'/g, '%27')};background-position:center;background-size:cover'` : ''}></div><div class="t"><h3>${E(e.title)}</h3><small>${E([INV.fmt.weekday(e.date), INV.fmt.short(e.date)].filter(Boolean).join(', ') + (e.time ? ' · ' + INV.fmt.time(e.time) : ''))}</small>${E(e.desc)}</div></div>`).join('');
  INV.show('#events', evs.length > 0);

  INV.text('#pairTitle', D.pairTitle); INV.text('#pairSub', D.pairSub);
  INV.text('#pA', D.bride); INV.text('#pB', D.groom); INV.text('#fA', D.brideFamily); INV.text('#fB', D.groomFamily);
  [['A', D.bride, D.bridePhoto], ['B', D.groom, D.groomPhoto]].forEach(([k, name, ph]) => {
    const a = $('#arch' + k), mo = $('#mo' + k); mo.textContent = (name || '').trim().charAt(0).toUpperCase();
    a.style.backgroundImage = ph ? `${INV.bg(ph)}` : ''; a.style.backgroundSize = ph ? 'cover' : ''; a.style.backgroundPosition = ph ? 'center top' : ''; mo.style.display = ph ? 'none' : '';
  });

  INV.show('#letter', !!D.letterOn);
  INV.text('#lTitle', D.letterTitle); INV.text('#lSub', D.letterSub); INV.text('#lText', D.letterText);
  INV.text('#lSign', `${D.closing || 'With love'}, ${D.bride} & ${D.groom}`);

  INV.show('#loves', !!D.lovesOn);
  INV.text('#loTitle', D.lovesTitle); INV.text('#loSub', D.lovesSub);
  const fc = (a, b, items) => `<div class="fi"><div class="ff"><b>♥</b>What ${E(a)} loves<br>about ${E(b)}</div><div class="fb">${lines(items).map(x => `<span>${E(x)}</span>`).join('')}</div></div>`;
  $('#fcA').innerHTML = fc(D.bride, D.groom, D.brideLoves); $('#fcB').innerHTML = fc(D.groom, D.bride, D.groomLoves);

  INV.text('#jTitle', D.journeyTitle); INV.text('#jSub', D.journeySub); renderGallery(D.memories);

  INV.show('#gift', !!D.giftOn); INV.text('#gTitle', D.giftTitle); INV.text('#gText', D.giftText); INV.text('#upi', D.upi);
  INV.show('#rsvp', !!D.rsvpOn); INV.text('#rTitle', D.rsvpTitle); INV.text('#rSub', D.rsvpSub);

  INV.text('#vTitle', D.venueTitle);
  const v = $('#vSub'); v.innerHTML = [D.venueName, D.venueAddress].filter(Boolean).map(E).join('<br>');
  const mp = INV.mapEmbed(D); if ($('#vMap').getAttribute('src') !== mp) $('#vMap').setAttribute('src', mp);
  $('#vLink').href = INV.mapLink(D);
  INV.show('#venue', !!(D.venueName || D.venueAddress || D.mapQuery));
  INV.setMusic(D.music);
}
INV.on(D => {
  render(D);
  if (first) { first = false; initScratch(); par(); if (INV.skip) openCard(); }
});
INV.start();
