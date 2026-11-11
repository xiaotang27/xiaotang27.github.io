/* 外观切换：浅色 / 深色 / 跟随系统。
   在 <head> 里同步执行，先把 data-theme 定下来，避免首屏闪一下。
   按钮在 DOM 就绪后注入顶栏右侧，选择存在 localStorage。 */
(function () {
  var STORE = 'x27-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  var ICONS = {
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6Z"/></svg>',
    system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.4"/><path d="M12 3.6v16.8A8.4 8.4 0 0 0 12 3.6Z" fill="currentColor" stroke="none"/></svg>'
  };
  var LABELS = { light: '浅色', dark: '深色', system: '跟随系统' };

  function getChoice() {
    try {
      var v = localStorage.getItem(STORE);
      return (v === 'light' || v === 'dark' || v === 'system') ? v : 'system';
    } catch (e) { return 'system'; }
  }
  function setChoice(v) {
    try { localStorage.setItem(STORE, v); } catch (e) {}
  }
  function sysDark() {
    return !!(mq && mq.matches);
  }
  function isDark(c) {
    return c === 'dark' || (c === 'system' && sysDark());
  }

  function apply() {
    var c = getChoice();
    root.setAttribute('data-theme', isDark(c) ? 'dark' : 'light');
    var btn = document.getElementById('themeBtn');
    if (btn) {
      btn.innerHTML = ICONS[c];
      var title = '外观：' + LABELS[c];
      btn.title = title;
      btn.setAttribute('aria-label', title);
    }
    var menu = document.getElementById('themeMenu');
    if (menu) {
      var rows = menu.querySelectorAll('button[data-value]');
      for (var i = 0; i < rows.length; i++) {
        rows[i].setAttribute('data-active', rows[i].getAttribute('data-value') === c ? '1' : '0');
      }
    }
  }

  function build() {
    var actions = document.getElementById('navActions');
    if (!actions || document.getElementById('themeBtn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'themeBtn';
    btn.className = 'icon-btn theme-btn';
    btn.innerHTML = ICONS[getChoice()];
    actions.appendChild(btn);

    var menu = document.createElement('div');
    menu.id = 'themeMenu';
    menu.className = 'theme-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = ['light', 'dark', 'system'].map(function (v) {
      return '<button type="button" role="menuitem" data-value="' + v + '" data-active="0">' +
        '<span class="mark"></span><span>' + LABELS[v] + '</span></button>';
    }).join('');
    document.body.appendChild(menu);

    function close() {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function open() {
      var r = btn.getBoundingClientRect();
      var rootRect = document.documentElement.getBoundingClientRect();
      var vw = rootRect.width || document.documentElement.clientWidth || window.innerWidth;
      menu.style.top = Math.round(r.bottom + 9) + 'px';
      menu.style.right = Math.max(8, Math.round(vw - r.right)) + 'px';
      menu.style.left = 'auto';
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      apply();
    }

    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.contains('open') ? close() : open();
    });
    menu.addEventListener('click', function (e) {
      var opt = e.target.closest ? e.target.closest('button[data-value]') : null;
      if (!opt) return;
      setChoice(opt.getAttribute('data-value'));
      apply();
      close();
      btn.focus();
    });
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('open')) return;
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        close();
        btn.focus();
      }
    });
    window.addEventListener('resize', close);

    apply();
  }

  function onSystemChange() {
    if (getChoice() === 'system') apply();
  }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  apply();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
