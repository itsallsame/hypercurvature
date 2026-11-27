# hypercurvature

cvmax.cn 主页的原样静态 mock，面向 hypercurvature.com。直接复用原主页渲染结构、样式、图片、文案和版块顺序，不增加「访问 cvmax」按钮，不跳转到 cvmax.cn 首页。备案号调整为本站对应的 `京ICP备2023015572号-2`。

## 本地预览

无需安装依赖或构建，浏览器打开 `index.html` 即可。也可在仓库目录运行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

打开 http://127.0.0.1:8080。

## 文件与功能

- `index.html`：源主页的静态 DOM 快照。
- `assets/reference/`：原站 CSS、图片和图标的本地副本；来源见 `assets/sources.json`。
- `mock.js`：本地轮播与点击反馈，不请求原站业务 API。
- `scripts/capture-homepage.cjs`：重新从公司主页获取快照的脚本（需要 Playwright）。运行会覆盖首页和资源，执行前应确认参考站内容。
- `AGENTS.md`：记录原样复制的边界，避免后续擅自改版。
- `deploy/nginx.conf.example`：服务器配置示例。

登录、会员、上传简历等后台功能未接入，点击仅提示静态 mock，不收集文件、账户信息或支付信息。职位数量、职位信息与评价保留抓取时的原站内容，不是实时数据。原站嵌入的哔哩哔哩视频和外部插件商店链接保留；视频需要联网。原站两份字体文件返回 403，使用本地字体回退。

## 部署

将 `index.html`、`mock.js` 和整个 `assets/` 放到静态服务器的网站根目录，无需 Node.js 后端。部署示例不能直接覆盖线上 nginx 配置，需要核对 root、HTTPS 证书、DNS 和现有服务。

本仓库不修改 DNS、不恢复备案接入、不自动部署。hypercurvature.com 曾取消华为云接入，上线前仍需核对其接入状态。
