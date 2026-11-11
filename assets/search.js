/* 顶栏站内搜索：所有页面共用。
   点放大镜展开输入框，输入给标题建议，回车进 blog.html?q= 做全文搜索。
   按 / 快速打开，Esc 关闭。 */
(function () {
  var MAX_SUGGEST = 6;
  var postsCache = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function dotted(d) {
    return String(d || '').replace(/-/g, '.');
  }
  function loadPosts() {
    if (postsCache) return Promise.resolve(postsCache);
    return fetch('posts/index.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        postsCache = (data.posts || []).slice().sort(function (a, b) {
          return String(b.date || '').localeCompare(String(a.date || ''));
        });
        return postsCache;
      });
  }

  function init() {
    var actions = document.getElementById('navActions');
    if (!actions || document.querySelector('.search-wrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'search-wrap';
    wrap.innerHTML =
      '<button type="button" class="icon-btn search-btn" aria-label="搜索文章" ' +
      'title="搜索文章（按 / 键）" aria-expanded="false" aria-haspopup="dialog">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg></button>' +
      '<div class="search-panel" role="dialog" aria-label="搜索文章" hidden>' +
      '<div class="search-box">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>' +
      '<input type="search" placeholder="搜索标题，回车看全文…" aria-label="搜索文章" autocomplete="off" />' +
      '<span class="search-key">ESC</span>' +
      '</div>' +
      '<div class="search-results"></div>' +
      '</div>';

    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) actions.insertBefore(wrap, themeBtn);
    else actions.appendChild(wrap);

    var btn = wrap.querySelector('.search-btn');
    var panel = wrap.querySelector('.search-panel');
    var input = wrap.querySelector('input');
    var results = wrap.querySelector('.search-results');
    var timer = null;

    function open() {
      if (!panel.hidden) return;
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      setTimeout(function () { input.focus(); input.select(); }, 20);
    }
    function close() {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (timer) clearTimeout(timer);
    }
    function go(q) {
      q = String(q || '').trim();
      if (!q) return;
      location.href = 'blog.html?q=' + encodeURIComponent(q);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.hidden) open(); else close();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close();
        btn.focus();
      } else if (e.key === 'Enter') {
        go(input.value);
      }
    });
    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      var el = document.activeElement;
      var tag = el ? el.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
      e.preventDefault();
      open();
    });

    function suggest(q) {
      loadPosts().then(function (list) {
        var t = q.toLowerCase();
        var hits = list.filter(function (p) {
          var hay = ((p.title || '') + ' ' + (p.desc || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
          return hay.indexOf(t) > -1;
        }).slice(0, MAX_SUGGEST);

        if (!hits.length) {
          results.innerHTML = '<div class="s-empty">标题和摘要里没找到。回车去全文里搜搜看。</div>' +
            '<a class="s-all" href="blog.html?q=' + encodeURIComponent(q) + '">查看全部结果 →</a>';
          return;
        }
        results.innerHTML = hits.map(function (p) {
          var bits = [];
          if (p.date) bits.push(dotted(p.date));
          if (p.tags && p.tags.length) bits.push(p.tags.join(' · '));
          return '<a class="s-hit" href="post.html?post=' + encodeURIComponent(p.slug) + '">' +
            '<span class="s-hit-title">' + esc(p.title) + '</span>' +
            (bits.length ? '<span class="s-hit-meta">' + esc(bits.join('  /  ')) + '</span>' : '') +
            '</a>';
        }).join('') +
          '<a class="s-all" href="blog.html?q=' + encodeURIComponent(q) + '">查看全部结果 →</a>';
      }).catch(function () {
        results.innerHTML = '<div class="s-empty">搜索暂时不可用。</div>';
      });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (timer) clearTimeout(timer);
      if (!q) { results.innerHTML = ''; return; }
      timer = setTimeout(function () { suggest(q); }, 160);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
