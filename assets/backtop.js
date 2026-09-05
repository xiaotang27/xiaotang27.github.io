/* 回到顶部按钮：所有页面通用。
   下滑超过 400px 后淡入右下角，回到顶部后自动隐藏。 */
(function () {
  var SHOW_AFTER = 400;

  function css() {
    var s = document.createElement('style');
    s.textContent =
      '.backtop{position:fixed;right:22px;bottom:28px;width:44px;height:44px;' +
      'border-radius:50%;border:1px solid #e6e8f2;background:rgba(255,255,255,.8);' +
      'color:#5b6472;display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:0;box-shadow:0 8px 18px -8px rgba(80,90,160,.4);' +
      'opacity:0;transform:translateY(10px);visibility:hidden;' +
      'transition:opacity .25s ease,transform .25s ease,visibility .25s ease,color .2s,border-color .2s;' +
      'z-index:90;-webkit-backdrop-filter:blur(10px) saturate(160%);backdrop-filter:blur(10px) saturate(160%);}' +
      '.backtop.show{opacity:1;transform:translateY(0);visibility:visible;}' +
      '.backtop:hover{color:#667eea;border-color:#667eea;}' +
      '.backtop svg{width:20px;height:20px;}' +
      '@media (prefers-color-scheme:dark){' +
      '.backtop{background:rgba(23,26,38,.72);border-color:rgba(255,255,255,.14);color:#a7adc0;}' +
      '.backtop:hover{color:#9fa8ff;border-color:#9fa8ff;}}' +
      '@media (max-width:520px){.backtop{right:14px;bottom:16px;width:40px;height:40px;}}' +
      '@media (prefers-reduced-motion:reduce){.backtop{transition:none;}}';
    document.head.appendChild(s);
  }

  function init() {
    if (!document.body) { window.addEventListener('load', init); return; }
    css();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'backtop';
    btn.title = '回到顶部';
    btn.setAttribute('aria-label', '回到顶部');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/>' +
      '<path d="m5 12 7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    var visible = false;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > SHOW_AFTER && !visible) { visible = true; btn.classList.add('show'); }
      else if (y <= SHOW_AFTER && visible) { visible = false; btn.classList.remove('show'); }
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
