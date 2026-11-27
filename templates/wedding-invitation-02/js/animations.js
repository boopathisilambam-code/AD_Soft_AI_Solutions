(() => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches, all = s => [...document.querySelectorAll(s)];
    document.documentElement.classList.add('js');
    // scroll reveal with stagger
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
    all('section:not(.px):not(.hero) h2,section>p,.gold,.ev,.pt,.gift,form,.sc,.cd,.map,section>.btn,.px .gold').forEach(el => {
        if (!el.classList.contains('gold')) el.classList.add('rv'); el.style.setProperty('--d', [...el.parentNode.children].indexOf(el) % 4); io.observe(el)
    });
    // progress bar
    const bar = document.createElement('div'); bar.id = 'bar'; document.body.append(bar);
    // dock nav
    const S = all('section'), map = [['Date', 1], ['Events', 3], ['Journey', 5], ['RSVP', 7], ['Venue', 8]];
    S.forEach((s, i) => s.id = 's' + i);
    const dock = document.createElement('nav'); dock.className = 'dock'; dock.innerHTML = map.map(m => `<a href="#s${m[1]}">${m[0]}</a>`).join(''); document.body.append(dock);
    function onScroll() {
        const h = document.documentElement, max = h.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        let cur = 0; S.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .5) cur = i });
        dock.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#s' + cur))
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // 3D tilt on portraits
    all('.ph').forEach(el => {
        el.onpointermove = e => {
            const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            el.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`
        }; el.onpointerleave = () => el.style.transform = ''
    });
    // petals
    const c = document.createElement('canvas'); c.id = 'pt'; document.body.append(c); const x = c.getContext('2d'); let W, H, P = [], run = false;
    const cols = ['#7b1a2c', '#9b2a3d', '#fff8ee', '#d9b45f'];
    function rs() { W = c.width = innerWidth; H = c.height = innerHeight } rs(); addEventListener('resize', rs);
    const mk = (y, b) => ({ x: Math.random() * W, y: y ?? -20, s: 5 + Math.random() * 7, v: .5 + Math.random() * .9, r: Math.random() * 6, ph: Math.random() * 6, c: cols[Math.random() * 4 | 0], vx: 0, b });
    for (let i = 0; i < 14; i++)P.push(mk(Math.random() * H));
    function tick() {
        x.clearRect(0, 0, W, H);
        P = P.filter(p => !(p.b && (p.y > H + 20 || p.y < -40)));
        P.forEach(p => {
            p.y += p.v; p.ph += .02; p.x += Math.sin(p.ph) * .7 + p.vx; p.r += .03; p.vx *= .985; if (p.b) p.v += .05;
            if (!p.b && (p.y > H + 20 || p.x < -30 || p.x > W + 30)) Object.assign(p, mk(), { x: Math.random() * W });
            x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.scale(1, Math.abs(Math.sin(p.r * 1.3)) * .6 + .4); x.fillStyle = p.c; x.globalAlpha = .85; x.beginPath(); x.ellipse(0, 0, p.s, p.s * .55, 0, 0, 7); x.fill(); x.restore()
        });
        requestAnimationFrame(tick)
    }
    function burst(cx, cy) { for (let i = 0; i < 45; i++) { const p = mk(cy, true); p.x = cx; p.vx = (Math.random() - .5) * 7; p.v = -2 - Math.random() * 5; P.push(p) } }
    document.getElementById('seal').addEventListener('click', () => { document.body.classList.add('go'); if (!run && !rm) { run = true; tick() } });
    const cv = document.getElementById('cv'); cv.addEventListener('transitionstart', () => { if (rm) return; const r = cv.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2) });
})();
