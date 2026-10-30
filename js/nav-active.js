
(function () {
  var css = [
    '#navbarNav .navbar-nav > li.nav-current > a.nav-link{font-weight:700 !important;position:relative;}',
    '#navbarNav .navbar-nav > li.nav-current > a.nav-link:after{content:"";position:absolute;left:15px;right:15px;bottom:-4px;height:2px;background:currentColor;border-radius:2px;display:block !important;}',
    '#navbarNav .navbar-nav .dropdown-menu li.nav-current > a,',
    '#navbarNav .navbar-nav .dropdown-menu li.nav-current > a:hover{background:#1f3a1a !important;color:#fff !important;font-weight:600 !important;border-radius:12px !important;}',
    '#navbarNav .navbar-nav .dropdown-menu li.nav-current > a i{color:#a9d38f !important;}'
  ].join('\n');
  var st = document.createElement('style');
  st.setAttribute('data-nav-active', '');
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);
 
  function fileOf(href) {
    try {
      var p = new URL(href, location.href).pathname.split('/').pop().toLowerCase();
      p = p.replace(/\.html?$/, '');
      return (p === '' || p === 'index') ? 'index' : p;
    } catch (e) { return ''; }
  }
  function init() {
    var current = fileOf(location.href);
    var links = document.querySelectorAll('#navbarNav .navbar-nav a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i], href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || fileOf(href) !== current) continue;
      var li = a.closest('li');
      if (!li) continue;
      li.classList.add('nav-current');
      a.setAttribute('aria-current', 'page');
      var parent = li.parentElement && li.parentElement.closest('li.nav-item');
      if (parent) parent.classList.add('nav-current');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();