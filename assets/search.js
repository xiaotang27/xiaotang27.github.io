/* 顶栏（灵动岛）内的站内搜索：所有页面共用。
   - 点击放大镜展开输入框（展开时暂隐导航链接，保持胶囊不撑破）
   - 输入即给轻量建议（标题 / 摘要 / 标签），回车或点「查看全部结果」进入 blog.html?q= 全文搜索
   - 按 "/" 快速聚焦 */
(function () {
  var MAX_SUGGEST = 6;
  var postsCache = null;

  var CSS =
    '.x27-search{position:relative;display:flex;align-items:center;margin-left:6px;}' +
    '.x27-search .x27-sbtn{width:34px;height:34px;padding:0;flex:0 0 auto;border-radius:50%;' +
    'border:1px solid var(--card-border,#e6e8f2);background:var(--card,#fff);color:var(--text,#222);' +
    'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;' +
    'transition:background .2s ease,box-shadow .2s ease,border-color .2s ease;}' +
    '.x27-search .x27-sbtn svg{width:16px;height:16px;}' +
    '.x27-search .x27-sbtn:hover{box-shadow:0 6px 14px -6px rgba(80,90,160,.45);}' +
    '.x27-search.open .x27-sbtn{background:rgba(102,126,234,.14);border-color:transparent;}' +
    '.x27-search .x27-sinput{width:0;opacity:0;padding:0;border:0;background:none;outline:none;' +
    'font:inherit;font-size:13.5px;color:var(--text,#222);' +
    'transition:width .3s cubic-bezier(.22,1,.36,1),opacity .2s ease,padding .3s ease;}' +
    '.x27-search.open .x27-sinput{width:200px;opacity:1;padding:0 6px 0 10px;}' +
    '.glass-nav.x27-searching > a{display:none;}' +
    '.x27-sres{position:absolute;top:calc(100% + 12px);right:0;width:330px;max-height:62vh;overflow:auto;' +
    'padding:6px;background:var(--card,#fff);border:1px solid var(--card-border,#e6e8f2);' +
    'border-radius:16px;box-shadow:0 20px 50px -18px rgba(0,0,0,.4);z-index:320;' +
    'display:flex;flex-direction:column;gap:2px;}' +
    '.x27-sres[hidden]{display:none;}' +
    '.x27-sitem{display:flex;flex-direction:column;gap:3px;padding:9px 12px;border-radius:10px;' +
    'text-decoration:none;color:inherit;}' +
    '.x27-sitem:hover{background:rgba(102,126,234,.12);}' +
    '.x27-stitle{font-size:14px;font-weight:700;}' +
    '.x27-smeta{font-size:12px;color:var(--text-faint,#9aa1b0);white-space:nowrap;overflow:hidden;' +
    'text-overflow:ellipsis;}' +
    '.x27-sall{display:block;padding:10px 12px;border-radius:10px;text-align:center;font-size:13px;' +
    'font-weight:700;color:#667eea;text-decoration:none;}' +
    '.x27-sall:hover{background:rgba(102,126,234,.12);}' +
    '.x27-sempty{padding:10px 12px;font-size:12.5px;color:var(--text-faint,#9aa1b0);}' +
    '@media (max-width:560px){.x27-search .x27-sbtn{width:30px;height:30px;margin-left:2px;}' +
    '.x27-search.open .x27-sinput{width:132px;}.x27-sres{width:min(86vw,300px);}}';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function inject() {
    if (document.getElementById('x27-search-css')) return;
    var s = document.createElement('style');
    s.id = 'x27-search-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function loadPosts() {
    if (postsCache) return Promise.resolve(postsCache);
    return fetch('posts/index.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { postsCache = data.posts || []; return postsCache; });
  }

  function init() {
    var nav = document.querySelector('.glass-nav');
    if (!nav) return;
    inject();

    var wrap = document.createElement('div');
    wrap.className = 'x27-search';
    wrap.innerHTML =
      '<button class="x27-sbtn" type="button" aria-label="搜索文章" title="搜索文章（按 / 键）">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>' +
      '<input class="x27-sinput" type="search" placeholder="搜索文章…" ' +
      'aria-label="搜索文章" autocomplete="off" />' +
      '<div class="x27-sres" hidden></div>';

    var themeBtn = nav.querySelector('.x27-btn');
    if (themeBtn) nav.insertBefore(wrap, themeBtn); else nav.appendChild(wrap);

    var btn = wrap.querySelector('.x27-sbtn');
    var input = wrap.querySelector('.x27-sinput');
    var res = wrap.querySelector('.x27-sres');
    var timer = null;

    function open() {
      wrap.classList.add('open');
      nav.classList.add('x27-searching');
      setTimeout(function () { input.focus(); }, 20);
    }
    function close() {
      wrap.classList.remove('open');
      nav.classList.remove('x27-searching');
      res.hidden = true;
    }
    function go(q) {
      q = String(q || '').trim();
      if (!q) return;
      location.href = 'blog.html?q=' + encodeURIComponent(q);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.contains('open') ? close() : open();
    });
    input.addEventListener('focus', open);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; close(); }
      else if (e.key === 'Enter') { go(input.value); }
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); open(); }
    });

    function suggest(q) {
      loadPosts().then(function (list) {
        var t = q.toLowerCase();
        var hits = list.filter(function (p) {
          var h = ((p.title || '') + ' ' + (p.desc || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
          return h.indexOf(t) > -1;
        }).slice(0, MAX_SUGGEST);

        if (!hits.length) {
          res.innerHTML = '<div class="x27-sempty">标题与摘要中没有匹配，回车查看全文搜索结果</div>';
          res.hidden = false;
          return;
        }
        res.innerHTML = hits.map(function (p) {
          var meta = (p.desc || (p.tags || []).join(' · ') || '');
          return '<a class="x27-sitem" href="post.html?post=' + encodeURIComponent(p.slug) + '">' +
            '<span class="x27-stitle">' + esc(p.title) + '</span>' +
            (meta ? '<span class="x27-smeta">' + esc(meta) + '</span>' : '') +
            '</a>';
        }).join('') +
          '<a class="x27-sall" href="blog.html?q=' + encodeURIComponent(q) + '">查看全部结果 →</a>';
        res.hidden = false;
      }).catch(function () { res.hidden = true; });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (timer) clearTimeout(timer);
      if (!q) { res.hidden = true; return; }
      timer = setTimeout(function () { suggest(q); }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
