# hypercurvature

超曲率（北京）科技有限公司官方网站，面向 `hypercurvature.com`。以 cvmax.cn 首页的业务与视觉为参考，介绍公司与 cvmax 产品。静态页面不接收简历、不提供模拟登录或虚构实时数据，所有产品服务入口链接至实际的 https://cvmax.cn/。

## 本地预览

无需安装依赖或构建。在仓库根目录执行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

打开 http://127.0.0.1:8080。也可以直接用浏览器打开 `index.html`。

## 文件

- `index.html`：公司信息、产品介绍和备案链接。
- `styles.css`：响应式样式，支持手机与键盘导航。
- `assets/`：来自公司产品 cvmax.cn 主页引用的产品说明图，保存为本地资源；站点运行不依赖第三方图片 CDN。
- `deploy/nginx.conf.example`：域名与静态目录配置示例。部署前替换路径并按现有服务器配置合并，不能直接覆盖现有配置。

## 上线说明

将 `index.html`、`styles.css`、`favicon.svg` 和 `assets/` 放到静态服务器的网站根目录。不需要 Node.js 服务或后端接口。

本网站展示 `京ICP备2023015572号-2`，链接工信部备案查询系统。该号码对应 hypercurvature.com；不要将此页直接作为 cvmax.cn 的备案页面。参考素材来源见 `assets/sources.md`。

代码完成不代表域名已恢复访问。实际上线前需核对当前备案接入情况（该域名曾取消华为云接入）、DNS、公网访问和 HTTPS 证书，并按接入商要求完成必要手续。仓库内不含服务器凭据、证件或自动部署配置。
