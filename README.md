# Xiaotang27 个人站点

纯静态、零依赖的个人站点：主页 + 用 Markdown 驱动的博客。无需构建步骤。

## 文件结构

```
├─ index.html                 # 主页：顶部毛玻璃区域；首屏正中为圆形头像+昵称/Slogan+单行按钮的资料卡，
│                             #       下滑后出现独立博客卡片区；资料卡完全进入顶栏后顶栏淡入迷你资料卡（圆形头像+昵称+小号Slogan）
├─ 404.html                   # 自定义 404（沿用博客模板风格）
├─ xiaotang27-logo.webp       # 根目录副本：全部页面浏览器标签页图标（favicon）统一用此 logo
├─ favicon.png                # PNG 兜底 favicon（老浏览器不支持 webp 图标时使用，由 logo 生成）
├─ avatar.svg                 # favicon
├─ assets/
│   ├─ xiaotang27-logo.webp   # 头像
│   ├─ tangible-logo.png      # Tangible 标志（TangibleCraft 按钮图标）
│   ├─ blog.css               # 博客样式（文章页）
│   └─ markdown.js            # Markdown 渲染器 + 字数统计/阅读时长（零依赖）
├─ blog/
│   └─ post.html              # 文章模板（读取 posts/*.md 并渲染，含头图位）
└─ posts/
    ├─ index.json             # 文章清单（slug / title / desc / tags，可选 date、cover）
    └─ *.md                   # 文章正文
```

文章卡片直接展示在主页；点击进入 `blog/post.html?post=slug`。

## 如何改成你自己的

1. **昵称 / Slogan**：改 `index.html` 中 `.name` 与 `.slogan` 两行。
2. **头像**：当前是 `assets/xiaotang27-logo.webp`，资料卡与迷你卡共用（圆形）。换图改 `index.html` 里两处 `src` 即可。
3. **站点按钮**：每个按钮是一个 `<a href="...">`，改 `href` 即可：
   - GitHub：`https://github.com/xiaotang27`（按实际账号改）
   - 哔哩哔哩：`https://space.bilibili.com/1473734923`
   - TangibleCraft：`https://tangible.xiaotang27.top`（图标为图 1 标志）
   - Modrinth：`https://modrinth.com/organization/trtimc`
4. **版权**：改 `footer` 里的署名；年份自动更新。

## 如何写博客

1. 在 `posts/` 放一个 `.md` 文件（支持标题、加粗、列表、引用、行内/围栏代码、链接、图片、分隔线）。
2. 在 `posts/index.json` 的 `posts` 数组里加一条记录，字段：
   - `slug`：必填，文件名（不含 `.md`）
   - `title` / `desc` / `tags`：用于主页卡片
   - `date`：可选覆盖；**默认发布日期自动取 `.md` 文件的保存时间**（HTTP `Last-Modified`），所以通常不用填
   - `cover`：可选头图。值为图片路径，**相对站点根目录**（如 `posts/covers/foo.jpg`），也支持 `/foo.jpg`
     或完整的 `https://…` 外链。不填则主页卡片与文章页显示渐变占位图。
     主页卡片按 4.4:1、文章页按 2.4:1 居中裁切，建议用横版大图（宽度 ≥ 1200px 更佳）。
     示例：`posts/covers/hello-world.svg`（仓库已内置一篇演示，可替换该文件或删掉 `cover` 字段恢复占位）。
3. 字数与预估阅读时长自动统计，无需手工填写。

> 说明：`Last-Modified` 即你**最后保存/上传文章**的时间。若部署在按仓库快照生成文件的托管（如 GitHub Pages），
> 所有文件可能显示为同一次部署时间，此时建议在清单里用 `date` 字段覆盖。

## 本地预览

博客部分要用 `fetch` 读文件，`file://` 下会被浏览器拦截，请启动本地 HTTP 服务：

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 部署到 xiaotang27.top

任意静态托管均可（GitHub Pages / Vercel / Cloudflare Pages / Nginx），将整个目录作为站点根目录即可。
