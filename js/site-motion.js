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
    var vh = window.innerHeight || 800;
    var items = collect();
    var groups = new Map();
    items.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9 && rect.bottom > 0) return;     /* already on screen: leave as is, no flash */
      var key = el.parentElement;
      var n = groups.get(key) || 0;
      groups.set(key, n + 1);
      el.style.setProperty('--i', Math.min(n, 5));           /* stagger siblings, capped */
      el.setAttribute('data-reveal', '');
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
