const $ = id => document.getElementById(id);
$('seal').onclick = () => { $('envo').classList.add('open'); document.body.classList.remove('lock'); setTimeout(() => $('envo').remove(), 1700); sizeCv() };
// scratch
const cv = $('cv'), cx = cv.getContext('2d'); let done = false;
function sizeCv() {
    const r = cv.parentElement.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
    const g = cx.createLinearGradient(0, 0, r.width, r.height); g.addColorStop(0, '#d9b45f'); g.addColorStop(.5, '#f3dc9a'); g.addColorStop(1, '#b8923f');
    cx.globalCompositeOperation = 'source-over'; cx.fillStyle = g; cx.fillRect(0, 0, r.width, r.height);
    cx.fillStyle = '#5e1020'; cx.font = 'italic 600 22px Cormorant Garamond,serif'; cx.textAlign = 'center'; cx.fillText('Scratch here ✦', r.width / 2, r.height / 2 + 7)
}
sizeCv(); let dn = false;
function sc(e) {
    if (!dn || done) return; const r = cv.getBoundingClientRect(); cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); cx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, 7); cx.fill();
    if (Math.random() < .15) { const d = cx.getImageData(0, 0, cv.width, cv.height).data; let c = 0; for (let i = 3; i < d.length; i += 64)if (!d[i]) c++; if (c / (d.length / 64) > .4) { done = true; cv.style.opacity = 0; cv.style.pointerEvents = 'none' } }
}
cv.onpointerdown = e => { dn = true; cv.setPointerCapture(e.pointerId); sc(e) }; cv.onpointermove = sc; cv.onpointerup = () => dn = false;
// countdown
const T = new Date('2027-02-14T08:30:00+05:30');
function cd() {
    let s = Math.max(0, (T - Date.now()) / 1000 | 0); const v = [[s / 86400 | 0, 'Days'], [s % 86400 / 3600 | 0, 'Hours'], [s % 3600 / 60 | 0, 'Mins'], [s % 60, 'Secs']];
    $('cd').innerHTML = v.map(x => `<div><b>${x[0]}</b><i>${x[1]}</i></div>`).join('')
}
cd(); setInterval(cd, 1000);
// parallax
const ps = [...document.querySelectorAll('[data-p]')];
function par() { const h = innerHeight; ps.forEach(e => { const r = e.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return; e.style.transform = `translateY(${((r.top + r.height / 2 - h / 2) * e.dataset.p).toFixed(1)}px)` }) }
addEventListener('scroll', par, { passive: true }); par();
// gallery
const G = [['assets/journey-1.jpeg', 'First hello'], ['assets/journey-2.jpeg', 'The proposal'], ['assets/journey-3.jpeg', 'Family says yes'], ['assets/mugartham.jpeg', 'Ring day'], ['assets/journey-4.jpeg', 'Pre-wedding'], ['assets/reception.jpeg', 'Forever begins']];
$('tr').innerHTML = [...G, ...G].map(g => `<button class="tile" style="background-image:url(${g[0]})" data-i="${g[0]}" data-t="${g[1]}" aria-label="${g[1]}"><span>${g[1]}</span></button>`).join('');
$('tr').onclick = e => { const t = e.target.closest('.tile'); if (!t) return; $('lbi').style.backgroundImage = `url(${t.dataset.i})`; $('lbt').textContent = t.dataset.t; $('lb').classList.add('on'); $('tr').classList.add('p') };
$('lb').onclick = () => { $('lb').classList.remove('on'); $('tr').classList.remove('p') };
// gift + rsvp
$('cp').onclick = async () => { try { await navigator.clipboard.writeText($('upi').textContent); $('cp').textContent = 'Copied' } catch (e) { $('cp').textContent = 'Select and copy above' } };
$('rf').onsubmit = e => { e.preventDefault(); $('rf').style.display = 'none'; $('thx').style.display = 'block' };