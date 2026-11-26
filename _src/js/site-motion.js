/* AD Soft Technologies - shared scroll motion.
   Gives every section the same entrance (fade + 28px rise, 0.7s, same easing)
   WITHOUT touching anything that already has its own animation. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js-motion');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var TARGETS = [
    'section h2', 'section h3',
    '.feature-box', '.card-idx', '.work-card', '.std-card', '.std-pill',
    '.eq-wrap', 'section .accordion-item', 'section .table-responsive',
    'section .row > [class*="col-"]', 'section .row > .col'   /* every grid cell = one consistent entrance */
  ].join(',');

  var SKIP = [
    '[data-anime]', '.rv', '[data-reveal]',                 /* already animated */
    'header', 'nav', 'footer',                               /* chrome */
    '.home-hero', '.swiper', '.swiper-wrapper', '.slider',   /* sliders / hero */
    '.client-logo-marquee', '[class*="marquee"]', '.modal',
    '.tab-content', '.accordion-collapse', '.hero', '[class*="hero"]'
  ].join(',');

  function firstSection(el) {
    var s = el.closest('section');
    return s && s === document.querySelector('section');
  }

  function collect() {
    var list = [];
    document.querySelectorAll(TARGETS).forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (firstSection(el)) return;                          /* hero has its own intro */
      /* only reveal the outermost match so nested cards do not animate twice */
      var parent = el.parentElement && el.parentElement.closest(TARGETS);
      if (parent && !parent.closest(SKIP) && list.indexOf(parent) > -1) return;
      list.push(el);
    });
    return list;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });   /* threshold 0: tall blocks can never get stuck hidden */

  function init() {
    var items = collect();
    if (!items.length) return;
    var groups = new Map();
    /* Which items start on screen? An IntersectionObserver answers with the browser's normal
       first layout. Calling getBoundingClientRect here instead forced an early synchronous
       layout of the whole page, including the content-visibility sections below the fold:
       one long blocking task on phones (Lighthouse "Forced reflow" / Total Blocking Time).
       "On screen" is the same as before: top above 90% of the screen height, bottom below its top. */
    var first = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        first.unobserve(el);
        if (e.isIntersecting) return;                         /* already on screen: leave as is, no flash */
        var key = el.parentElement;
        var n = groups.get(key) || 0;
        groups.set(key, n + 1);
        el.style.setProperty('--i', Math.min(n, 5));         /* stagger siblings, capped */
        el.setAttribute('data-reveal', '');
        io.observe(el);
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { first.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Sliders: images inside a carousel use loading="lazy", but slides hidden sideways would only
   start loading when they slide in (blank flash). Once a slider comes near the screen, load
   all of its images. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  function init() {
    var sliders = document.querySelectorAll('.swiper');
    if (!sliders.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
        io.unobserve(e.target);
      });
    }, { rootMargin: '600px 0px' });
    sliders.forEach(function (s) { io.observe(s); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Typing headlines (h1[data-final]): keep the part that is not typed yet laid out but invisible,
   right after the caret, so words never jump to the next line while typing (layout shift).
   Works with each page's own typing script; it only watches the typed text. */
(function () {
  'use strict';
  function setup(h1) {
    var layer = h1.querySelector('.type-layer');
    var typed = layer && layer.querySelector('span[id]');
    if (!typed || layer.querySelector('.type-rest')) return;
    var finalText = h1.getAttribute('data-final') || '';
    var rest = document.createElement('span');
    rest.className = 'type-rest';
    rest.setAttribute('aria-hidden', 'true');
    layer.appendChild(rest);
    var update = function () {
      var now = typed.innerText.replace(/\r/g, '');
      rest.textContent = finalText.indexOf(now) === 0 ? finalText.slice(now.length) : '';
    };
    new MutationObserver(update).observe(typed, { childList: true, characterData: true, subtree: true });
    update();
  }
  function init() { document.querySelectorAll('h1[data-final]').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
