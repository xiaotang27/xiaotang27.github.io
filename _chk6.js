const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');

function count(s, t) { return (s.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; }

// 去掉 script/style 后检查标签配对
let body = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
const pairs = [['<div', '</div>'], ['<section', '</section>'], ['<nav', '</nav>'], ['<ul', '</ul>'],
               ['<li>', '</li>'], ['<a ', '</a>'], ['<p ', '</p>'], ['<p>', '</p>'], ['<h1', '</h1>']];
const bad = [];
for (const [o, c] of pairs) { const a = count(body, o), b = count(body, c); if (a !== b) bad.push(`${o}=${a} vs ${c}=${b}`); }
console.log(bad.length ? 'ERR  tag balance :: ' + bad.join(' | ') : 'OK   tag balance');

// 关键结构
console.log('head-row:', h.includes('class="head-row"'), '| info-col:', h.includes('class="info-col"'));
console.log('avatar inside head-row:', /head-row[\s\S]{0,200}pf-avatar/.test(h));
console.log('links inside info-col:', /info-col[\s\S]{0,600}class="links"/.test(h));
console.log('name after avatar:', h.indexOf('class="name"') > h.indexOf('pf-avatar'));

// 内联脚本语法
const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
let m, ok = true, i = 0;
while ((m = re.exec(h)) !== null) { i++; try { new Function(m[1]); } catch (e) { ok = false; console.log('ERR script', i, e.message); } }
console.log(ok ? 'OK   inline scripts parse (' + i + ')' : 'ERR  inline script');
