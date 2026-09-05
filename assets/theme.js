/* 主题切换：浅色 / 深色 / 跟随系统。
   在顶栏毛玻璃导航右侧注入切换按钮；选择保存在 localStorage。 */
(function () {
  var STORE = 'x27-theme'; // 'light' | 'dark' | 'system'

  function getChoice() {
    try { return localStorage.getItem(STORE) || 'system'; } catch (e) { return 'system'; }
  }
  function setChoice(c) {
    try { localStorage.setItem(STORE, c); } catch (e) {}
  }
  function sysDark() {
    try { return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches; }
    catch (e) { return false; }
  }

  function apply() {
    var c = getChoice();
    var dark = c === 'dark' || (c === 'system' && sysDark());
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var ico = document.getElementById('x27-ico');
    if (ico) ico.textContent = c === 'light' ? '☀' : c === 'dark' ? '☾' : '◐';
  }

  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function onSysChange() { if (getChoice() === 'system') apply(); }
  if (mq && mq.addEventListener) mq.addEventListener('change', onSysChange);
  else if (mq && mq.addListener) mq.addListener(onSysChange);

  var UI_CSS =
    '.x27-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;' +
    'border-radius:50%;border:1px solid var(--card-border,#e6e8f2);background:var(--card,#fff);' +
    'color:var(--text,#222);font-size:15px;cursor:pointer;margin-left:6px;flex:0 0 auto;' +
    'transition:transform .2s ease,box-shadow .2s ease;padding:0;line-height:1;}' +
    '.x27-btn:hover{transform:translateY(-1px);box-shadow:0 6px 14px -6px rgba(80,90,160,.45);}' +
    '.x27-menu{position:fixed;z-index:300;min-width:148px;padding:6px;border-radius:14px;' +
    'background:var(--card,#fff);border:1px solid var(--card-border,#e6e8f2);' +
    'box-shadow:0 16px 40px -12px rgba(0,0,0,.35);display:none;overflow:hidden;}' +
    '.x27-menu.open{display:block;animation:x27rise .18s ease both;}' +
    '@keyframes x27rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
    '.x27-opt{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;' +
    'border:0;background:none;border-radius:9px;cursor:pointer;color:var(--text,#222);' +
    'font:inherit;font-size:13.5px;text-align:left;}' +
    '.x27-opt:hover{background:rgba(102,126,234,.12);}' +
    '.x27-opt .x27-dot{width:8px;height:8px;border-radius:50%;border:1px solid transparent;flex:0 0 auto;}' +
    '.x27-opt[data-active="1"] .x27-dot{background:#fff;box-shadow:0 0 0 4px #667eea;}' +
    '.x27-opt[data-active="1"]{font-weight:700;color:#667eea;}' +
    '@media (max-width:560px){.x27-btn{width:30px;height:30px;font-size:14px;margin-left:4px;}}';

  function ensureUI() {
    if (document.getElementById('x27-ui')) return;
    var st = document.createElement('style');
    st.id = 'x27-ui';
    st.textContent = UI_CSS;
    document.head.appendChild(st);

    var nav = document.querySelector('.glass-nav');
    if (!nav) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'x27-btn';
    btn.className = 'x27-btn';
    btn.setAttribute('aria-label', '切换主题');
    btn.title = '切换主题';
    btn.innerHTML = '<span id="x27-ico">◐</span>';
    nav.appendChild(btn);

    var menu = document.createElement('div');
    menu.id = 'x27-menu';
    menu.className = 'x27-menu';
    var opts = [
      { v: 'light', icon: '☀', label: '浅色' },
      { v: 'dark', icon: '☾', label: '深色' },
      { v: 'system', icon: '◐', label: '跟随系统' }
    ];
    menu.innerHTML = opts.map(function (o) {
      return '<button type="button" class="x27-opt" data-value="' + o.v + '" data-active="0">' +
        '<span class="x27-dot"></span><span>' + o.icon + ' ' + o.label + '</span></button>';
    }).join('');
    document.body.appendChild(menu);

    function refresh() {
      var c = getChoice();
      var rows = menu.querySelectorAll('.x27-opt');
      for (var i = 0; i < rows.length; i++) {
        rows[i].setAttribute('data-active', rows[i].getAttribute('data-value') === c ? '1' : '0');
      }
      apply();
    }

    function open() {
      var r = btn.getBoundingClientRect();
      menu.style.top = (r.bottom + 8) + 'px';
      menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
      menu.classList.add('open');
      refresh();
    }
    function close() { menu.classList.remove('open'); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.contains('open') ? close() : open();
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && e.target !== btn) close();
    });
    menu.addEventListener('click', function (e) {
      var opt = e.target.closest ? e.target.closest('.x27-opt') : null;
      if (!opt) return;
      setChoice(opt.getAttribute('data-value'));
      close();
      refresh();
    });
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureUI);
  } else {
    ensureUI();
  }
  apply();
})();
