# 王者抽签

开黑前快速决定本局玩什么英雄、谁跟谁一队。

一个纯本地的单机网页应用：不用登录、没有后端，数据只存在你自己的浏览器里。移动端优先设计，可安装到手机桌面（PWA），装过之后离线也能用。

## 功能

**抽英雄**：为名单里的每位玩家随机抽一个互不重复的英雄，结果以大字号卡片展示，并附定位标签（对抗路 / 打野 / 中路 / 发育路 / 游走）。

- 可以只重抽某一位玩家，其他人结果不变，新英雄也不会与本局其他英雄重复
- 不满意可以一键「全部重抽」
- 抽签时有短暂的滚动揭晓动画

**抽队友**：把名单随机均分成两队，每队人数可调（1~5，默认 5v5）。名单人数与容量不符时按实际人数均分，人数为奇数时随机一队多 1 人并给出提示。

**英雄池**：内置当前版本 133 位全英雄。可以自建英雄池，只抽自己会玩的那些英雄；抽签前随时切换，选择会被记住。浏览全部英雄和勾选池成员时都能按分路（对抗路 / 打野 / 中路 / 发育路 / 游走）筛选。

**历史记录**：抽英雄、抽队友的结果自动留档，按时间倒序展示，可展开详情，也可一键清空。最多保留最近 100 条。

玩家名单同样会自动保存，下次开黑不用重新输入。支持深色模式，首页有雪花飘落背景。

## 技术栈

Nuxt 4（`ssr: false` 纯 SPA）+ Nuxt UI 4 + UnoCSS + Pinia + VueUse + Vite PWA，TypeScript，Vitest。

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3002 即可。想连 PWA（service worker）一起调试就用 `pnpm dev:pwa`。

## 常用命令

```bash
pnpm dev             # 开发服，http://localhost:3002
pnpm dev:pwa         # 开发服并启用 service worker
pnpm lint            # ESLint 检查
pnpm typecheck       # 类型检查（会重写 .nuxt，勿与 dev server 同时跑）
pnpm test            # Vitest 单元测试
pnpm build           # 生产构建，产物在 .output
pnpm start           # 启动生产构建（node .output/server/index.mjs）
pnpm generate        # 生成纯静态产物，输出 .output/public
pnpm icons           # 改动 public/icon.svg 后重新生成图标
pnpm heroes          # 拉取 133 张官方英雄形象到 public/heroes/（图片不入库，缺失则跳过）
pnpm heroes --force  # 强制重新拉取（默认已存在的会跳过）
pnpm run deploy      # 一键部署/更新：装依赖 → 拉图片 → 构建 → pm2 启动或重载
```

## 项目结构

```
app/
  pages/        路由：首页 / 抽英雄 / 抽队友 / 英雄池 / 历史
  stores/       Pinia store：玩家名单、英雄池、历史记录
  utils/        纯函数业务逻辑：抽签、分队、名单、池解析、历史
  constants/    内置英雄数据（133 位）
  components/   共用组件：底部操作栏、名单编辑器
  composables/  揭晓动画
test/           Vitest 单元测试
```

## 数据与隐私

玩家名单、英雄池、历史记录全部保存在浏览器 localStorage（key 前缀 `wzry:`），不发送到任何服务器，也没有账号体系。清除浏览器数据或换设备后，记录不会跟着走。

## 部署

> **构建前先跑 `pnpm heroes`**：英雄形象图片不入库（`.gitignore` 忽略 `public/heroes/`），跳过这一步构建出来的产物没有英雄头像，应用会退化成文字占位。

三种方式任选：

- **pm2 常驻（推荐）**：`pnpm run deploy` 一条命令完成装依赖、拉图片、构建、启动/重载与保存。常驻运行、开机自启、更新发布都走它，详见 [docs/deploy-pm2.md](./docs/deploy-pm2.md)
- 静态托管：`pnpm generate` 后把 `.output/public` 发布到任意静态服务器
- 容器：仓库自带 Dockerfile，构建后运行 `node .output/server/index.mjs`（监听 3000 端口）

## 开发说明

编码规范、架构约定、开发与验收流程、踩坑记录都写在 [CLAUDE.md](./CLAUDE.md)。产品需求与实现 ticket 在 `.scratch/wzry-draw/`。
