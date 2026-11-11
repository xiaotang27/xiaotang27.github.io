/* 回到顶部：下滑超过 400px 后出现。样式在 site.css。 */
(function () {
  var SHOW_AFTER = 400;

  function init() {
    if (!document.body) { window.addEventListener('load', init); return; }
    if (document.querySelector('.backtop')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'backtop';
    btn.title = '回到顶部';
    btn.setAttribute('aria-label', '回到顶部');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    var visible = false;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > SHOW_AFTER && !visible) {
        visible = true;
        btn.classList.add('show');
      } else if (y <= SHOW_AFTER && visible) {
        visible = false;
        btn.classList.remove('show');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
