# 用纯静态搭建个人站点

这个站点没有框架、没有构建步骤、没有后端，正文就是 `posts/` 下的 Markdown 文件。

## 目录结构

```
├─ index.html        # 主页（头像/昵称/Slogan/按钮 + 博客文章卡片）
├─ avatar.svg        # favicon
├─ assets/
│   ├─ blog.css      # 博客样式
│   ├─ markdown.js   # 轻量 Markdown 渲染器 + 字数统计
│   ├─ xiaotang27-logo.webp   # 头像
│   └─ tangible-logo.png      # Tangible 标志
├─ post.html        # 文章模板（读取 Markdown，含头图位）
└─ posts/
    ├─ index.json    # 文章清单（标题、简介、标签……）
    └─ *.md          # 文章正文
```

主页直接按发布先后渲染全部文章卡片（点击进入 `post.html?post=slug`），不再有单独的列表页。

## 文章是怎么加载的

主页与 `post.html` 先读 `posts/index.json`，再逐个读取 `posts/*.md`：

```js
var slug = new URLSearchParams(location.search).get('post');
var md   = await fetch('../posts/' + slug + '.md').then(function (r) { return r.text(); });
content.innerHTML = renderMarkdown(md);
```

发布日期自动取自 `.md` 文件的保存时间（HTTP 的 `Last-Modified`），字数和预估阅读时长自动计算，无需手工维护。

## 支持的写法

- **标题** `#` 到 `######`
- **加粗** `**文字**`、*斜体* `*文字*`、~~删除线~~ `~~文字~~`
- **列表**（无序 / 有序）
- **引用** `> 文字`
- **代码**：行内 `` `code` `` 与围栏代码块
- **链接** `[文字](地址)` 与 **图片** `![alt](地址)`
- 分隔线 `---`

## 本地预览

博客部分要用 `fetch` 读文件，`file://` 协议下浏览器会拦截，请用本地 HTTP 服务：

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```
