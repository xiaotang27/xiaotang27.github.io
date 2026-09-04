/* 轻量 Markdown 渲染器：无外部依赖，浏览器/Node 均可使用。
   暴露全局 window.renderMarkdown(mdText) -> HTML 字符串。 */
(function (global) {
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/(\bhttps?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function renderMarkdown(src) {
    const lines = String(src).replace(/\r\n/g, '\n').split('\n');
    let html = [];
    let i = 0;
    let inCode = false, codeLang = '', codeBuf = [];

    while (i < lines.length) {
      const line = lines[i];

      if (/^\s*```/.test(line)) {
        if (!inCode) { inCode = true; codeLang = line.replace(/^\s*```/, '').trim(); codeBuf = []; }
        else {
          const cls = codeLang ? ' class="language-' + esc(codeLang) + '"' : '';
          html.push('<pre><code' + cls + '>' + esc(codeBuf.join('\n')) + '</code></pre>');
          inCode = false;
        }
        i++; continue;
      }
      if (inCode) { codeBuf.push(line); i++; continue; }

      if (!line.trim()) { i++; continue; }

      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const lv = h[1].length; html.push('<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>'); i++; continue; }

      if (/^\s*([-*_])\s*\1\s*\1\s*$/.test(line)) { html.push('<hr />'); i++; continue; }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        html.push('<blockquote>' + inline(buf.join(' ')) + '</blockquote>'); continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { buf.push('<li>' + inline(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>'); i++; }
        html.push('<ul>' + buf.join('') + '</ul>'); continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push('<li>' + inline(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>'); i++; }
        html.push('<ol>' + buf.join('') + '</ol>'); continue;
      }

      const buf = [line]; i++;
      while (i < lines.length && lines[i].trim() &&
        !/^(#{1,6}\s|```|>|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i]) &&
        !/^\s*([-*_])\s*\1\s*\1\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      html.push('<p>' + inline(buf.join(' ')) + '</p>');
    }
    return html.join('\n');
  }

  /* 字数统计：中文字符逐字计 1，连续英文/数字串计 1。
     去除代码块、行内代码、链接地址、HTML 标签与 Markdown 符号后统计。 */
  function countWords(md) {
    var body = String(md || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ');
    var clean = body.replace(/[#>*_~`\-\[\]()|\\]/g, ' ');
    var cjk = clean.match(/[\u2E80-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/g) || [];
    var rest = clean.replace(/[\u2E80-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/g, ' ');
    var words = rest.match(/[A-Za-z0-9]+(?:[''-][A-Za-z0-9]+)*/g) || [];
    return cjk.length + words.length;
  }

  /* 千字格式化：380 -> "380 字"，2300 -> "2.3 千字" */
  function formatWords(n) {
    n = Number(n) || 0;
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + ' 万字';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + ' 千字';
    return n + ' 字';
  }

  /* 估算阅读时长：按每分钟约 400 字（中英混合） */
  function readMinutes(words) {
    return Math.max(1, Math.round((Number(words) || 0) / 400));
  }

  global.renderMarkdown = renderMarkdown;
  global.countWords = countWords;
  global.formatWords = formatWords;
  global.readMinutes = readMinutes;
})(typeof window !== 'undefined' ? window : this);
