/* 顶部毛玻璃栏：向下滚动时收缩为居中的悬浮胶囊（灵动岛样式），回到顶部展开。
   所有页面共用；样式由本脚本注入，避免逐页改 CSS。 */
(function () {
  var SHRINK_AT = 80;   // 滚动超过该距离后收缩
  var EXPAND_AT = 40;   // 回到该距离内展开（滞回，避免抖动）

  var CSS =
    '.glass{transition:background .3s ease,border-color .3s ease;}' +
    '.glass .glass-inner{height:64px;border:1px solid transparent;border-radius:0;' +
    'transition:max-width .36s cubic-bezier(.22,1,.36,1),height .36s cubic-bezier(.22,1,.36,1),' +
    'transform .36s cubic-bezier(.22,1,.36,1),padding .36s ease,border-radius .36s ease,' +
    'background .3s ease,box-shadow .3s ease,border-color .3s ease;}' +

    /* 收缩态：外层变透明，内层变成悬浮胶囊
       （重复类名提高优先级，避免被页面里 html[data-theme] .glass 覆盖） */
    '.glass.is-island.is-island{background:transparent;border-bottom-color:transparent;' +
    '-webkit-backdrop-filter:none;backdrop-filter:none;}' +
    '.glass.is-island .glass-inner{max-width:520px;height:52px;padding:0 14px;' +
    'transform:translateY(8px);border-radius:999px;border-color:rgba(28,32,48,.10);' +
    'background:rgba(255,255,255,.78);' +
    '-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);' +
    'box-shadow:0 12px 32px -14px rgba(30,40,90,.45);}' +
    '.glass.is-island .glass-brand img{width:32px;height:32px;}' +
    '.glass.is-island .gb-sub{display:none;}' +
    '.glass.is-island .glass-nav a{padding:6px 11px;font-size:13.5px;}';

  var CSS_DARK =
    '@media (prefers-color-scheme:dark){' +
    '.glass.is-island .glass-inner{border-color:rgba(255,255,255,.12);' +
    'background:rgba(18,20,30,.78);box-shadow:0 12px 32px -14px rgba(0,0,0,.7);}}' +
    "html[data-theme='dark'] .glass.is-island .glass-inner{border-color:rgba(255,255,255,.12);" +
    'background:rgba(18,20,30,.78);box-shadow:0 12px 32px -14px rgba(0,0,0,.7);}' +
    "html[data-theme='light'] .glass.is-island .glass-inner{border-color:rgba(28,32,48,.10);" +
    'background:rgba(255,255,255,.78);box-shadow:0 12px 32px -14px rgba(30,40,90,.45);}';

  var CSS_NARROW =
    '@media (max-width:560px){.glass.is-island .glass-inner{max-width:calc(100vw - 20px);' +
    'padding:0 10px;}.glass.is-island .glass-nav a{padding:6px 8px;font-size:13px;}}';

  function inject() {
    if (document.getElementById('x27-island-css')) return;
    var s = document.createElement('style');
    s.id = 'x27-island-css';
    s.textContent = CSS + CSS_DARK + CSS_NARROW;
    document.head.appendChild(s);
  }

  function init() {
    var glass = document.querySelector('.glass');
    if (!glass) return;
    inject();

    var island = false;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (!island && y > SHRINK_AT) { island = true; glass.classList.add('is-island'); }
      else if (island && y <= EXPAND_AT) { island = false; glass.classList.remove('is-island'); }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      if (window.requestAnimationFrame) requestAnimationFrame(update);
      else update();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
