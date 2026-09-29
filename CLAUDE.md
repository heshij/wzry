# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

王者荣耀英雄随机抽签、对局抽签：开黑前给每位玩家抽一个不重复的英雄，或把名单随机分成两队。

## 项目结构

**形态**：纯本地单机 SPA（`ssr: false`，理由见「关键细节」第 5 条），中文界面，无后端、无登录，数据只存 localStorage；适配优先级 移动端（竖屏单手）> 平板 > 桌面。技术栈 Nuxt 4 + Nuxt UI 4 + UnoCSS + Pinia + VueUse + Vite PWA。项目由 vitesse-nuxt 模板起步，根 `README.md` 为本项目说明文档。

- `app/pages/`：`/` 首页入口 · `/hero` 抽英雄 · `/team` 抽队友 · `/pool` 英雄池 · `/history` 历史 · `/[...all]` 404。抽签页的「输入态 / 结果态」是同一路由内用 `v-if` 切换，没有子路由。
- `app/utils/`：业务核心纯函数：`draw`（洗牌/抽英雄/单人重抽）· `teams`（分队）· `players`（名单增删与容量）· `pool`（池解析）· `history`（记录追加与上限）· `id`（id 生成）。不依赖 Vue，单测主要覆盖这里。
- `app/stores/`：Pinia setup store：`players`（名单）· `pools`（自定义池 + 当前选中池）· `history`（抽签记录）。
- `app/constants/heroes.ts`：内置 133 位全英雄静态数据（`id` 拼音 / `officialId` 官方数字 id / `name` / `lanes`），随游戏版本人工更新；`findHeroByName()` 供历史记录按名反查官方形象。`officialId` 用于拼官方形象路径 `/heroes/{officialId}.jpg`。
- `app/composables/useReveal.ts`：抽签滚动揭晓动画（约 600ms，`prefers-reduced-motion` 时直接出结果）。
- `app/components/`：`ActionBar`（底部固定操作栏）· `PlayerListEditor`（hero / team 两页共用的名单编辑器）· `HeroAvatar`（官方形象 + 首字占位降级）· `SectionTitle`（带金色强调条的小节标题）· `LaneFilterTabs`（英雄池分路筛选）· `PixelSnow`（首页 three.js 雪花背景，懒加载 + reduced-motion/WebGL 降级）。明暗切换用 Nuxt UI 内置的 `UColorModeButton`，不要再写自定义组件。
- `test/`：Vitest，node 环境，`~` 与 `@` 别名指向 `app/`；`test/helpers.ts` 的 `seeded()` 提供可复现的伪随机源。
- `.scratch/<feature>/`：本地 Markdown issue tracker：`spec.md` 与 `issues/NN-*.md`，约定见 `docs/agents/issue-tracker.md`。`.scratch/tmp` 已 gitignore，其余文件入库。当前唯一 feature 是 `wzry-draw`（已交付并复核通过）。

## 高优先级约束

- 前台图标统一使用 `<UIcon name="i-lucide-*" />` 组件，禁止使用 `<span class="i-lucide-*">` CSS class 方式，前者是 Nuxt UI 官方方式，不会被 UnoCSS 扫描遗漏

## 常用命令

```bash
pnpm install                          # 依赖版本由 pnpm-workspace.yaml 的 catalog 集中管理
pnpm dev                              # 开发服 http://localhost:3002（已带 --host 0.0.0.0）
pnpm dev:pwa                          # 开发服并启用 service worker（VITE_PLUGIN_PWA=true）
pnpm lint                             # eslint .（@antfu 配置 + unocss/formatters/pnpm/antislop）
pnpm typecheck                        # nuxt typecheck；会重写 .nuxt，勿与 dev server 并发跑
pnpm test                             # vitest run，跑 test/**/*.test.ts
pnpm vitest run test/draw.test.ts     # 只跑单个测试文件
pnpm vitest run -t "重抽"              # 按用例名子串过滤
pnpm build && pnpm start              # 生产构建（.output/server）+ 启动
pnpm generate && pnpm start:generate  # 静态产物 + 本地预览
pnpm icons                            # 改了 public/icon.svg 后重新生成 PWA/favicon 图标
pnpm heroes                           # 幂等拉取 133 张官方英雄形象到 public/heroes/（gitignored，不入库）
pnpm heroes --force                   # 强制重拉（默认已存在则跳过；单张失败只汇总提示、不阻断）
```

CI（`.github/workflows/ci.yml`）在 `main` 分支的 push 与 PR 上跑 lint / typecheck / test 三个 job；仓库已推送 GitHub（`origin` → `heshij/wzry`，本地与远端均为 `main` 分支，tag `v0.1.0`）。

## 编码规范

- ESLint 基于 `@antfu/eslint-config`，启用 unocss / formatters / pnpm / antislop 插件；`.scratch/**` 不参与检查
- 实际格式规则：**单引号、无分号、无尾逗号**（以 `pnpm lint` 输出为准）
- TypeScript 优先使用 `interface`，Vue SFC 使用 `<script setup lang="ts">`
- 命名使用驼峰；Vue 组件文件用 PascalCase（如 `HeroAvatar.vue`，Nuxt 自动导入惯例），其余文件用小写连字符（如 `fetch-hero-images.mjs`）

## 关键细节

1. **持久化统一走 Pinia store + VueUse `useLocalStorage`**，key 前缀 `wzry:`：`wzry:players` / `wzry:pools` / `wzry:selected-pool` / `wzry:history`。每个 store 读取后做形状校验，坏数据回退默认值，返回时用 `skipHydrate()` 包裹。新增持久状态照此模式写。
2. **随机逻辑必须可注入随机源**：`draw.ts` / `teams.ts` 的函数都接受 `random: Random = Math.random` 参数，测试传 `test/helpers.ts` 的 `seeded()` 保证可复现。新逻辑不要直接调 `Math.random()`。
3. **产品决策（不是 bug，勿"顺手修"）**：
   - 历史写入：首次抽签与「全部重抽」各写一条，**单人重抽不写**；上限 100 条（`HISTORY_LIMIT`），超出丢弃最旧。
   - 单人重抽排除本局已占用的全部英雄（含该玩家原英雄）；池刚好用满时单人重抽不可用，只能「全部重抽」。
   - 名单 2~10 人（`PLAYER_COUNT_MIN/MAX`）；team 页把「每队人数 × 2」同步进 `playersStore.setCount()`，两页共用同一份名单。缩容时被裁掉的名字进内存 `parked`，扩容补回，不落盘。
   - 空昵称只在渲染时经 `resolvedPlayers` 回退为「玩家N」，不写回存储。
4. **英雄池解析**：`resolvePoolHeroes()` 按全量英雄顺序过滤 `heroIds`，池中失效 id 自动忽略；「全部英雄」不是真实池，用常量 `ALL_HEROES_ID = 'all'` 表示。
5. **SPA 模式（`ssr: false`）是刻意选择**：纯本地应用在 SSR 取不到 localStorage，会造成 hydration 冲突，且 SPA 下 PWA 的 `navigateFallback` 语义才正确。不要为"修 SSR"改回 `ssr: true`。
6. **布局与主题**：`app/layouts/default.vue` 提供 header + main（`pb-28` 给固定 `ActionBar` 留位）；`app/assets/css/main.css` 的 `@theme` 是设计 token 唯一真源（navy/gold 色板、`--radius-card` / `--radius-control`、阴影），并在 `@layer` 之外覆盖 Nuxt UI 变量以满足对比度（浅色 primary 用 700 号色、深色用 300 号色，弱化文字各提一档）。改样式前先读该文件注释与 `.scratch/wzry-draw/design-v0.2.md`。
7. 改英雄数据（增删英雄、定位标签）只动 `app/constants/heroes.ts`，`test/draw.test.ts` 会校验 id / 名称唯一、定位非空。

## 开发流程

串行推进：实现 → `pnpm lint` + `pnpm test` → 浏览器验收（`.claude/agents/tester.md`）→ 代码审查（`.claude/agents/code-reviewer.md`）。

浏览器验收的约束（每条都实际踩过坑，原因见错题本）：

- 验收进行中**不要改 `app/` 下任何文件**：Vite HMR 会重载页面，让验收结论不可信。
- 同时只保留一个 dev 实例；验收统一用显式端口：开发服 4321、生产预览 4322。
- 重启服务时按端口找 PID 再杀（`netstat -ano | grep :端口`），按命令行关键字过滤会漏掉 `node .output/server/index.mjs` 这类进程。
- 不要在 dev server 运行时跑 `pnpm typecheck`。

## 错题本

> 踩坑后追加一行：现象 → 原因 → 正确做法。给未来的 AI 和人看。

- `pnpm install` 报 `ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR` / `拒绝访问 os error 5` → 上次 pnpm 进程中断残留的 `node_modules` 被进程占用或句柄未释放 → 先手动 `Remove-Item node_modules -Recurse -Force` 再重新 `pnpm install`。
- `pnpm install` 报 `Failed to resolve dependency tree: High-risk trust downgrade for "why-is-node-running@3.2.2"` → pnpm 的 `trustPolicy: no-downgrade` 拦截了 vitest 间接依赖的可信度降级版本 → 在 `pnpm-workspace.yaml` 的 `overrides` 里固定到受信版本（如 `why-is-node-running: 3.2.1`），不要直接关掉 `trustPolicy`。
- `pnpm dev` 打印 `Local: http://localhost:3000` 但浏览器打开是别的应用 → 本机 3000 端口已被无关进程占用（Nuxt 只绑到了 IPv6 回环，curl `localhost` 命中 IPv4 上的别的服务）→ 用 `pnpm dev --host 0.0.0.0 --port 4321` 显式指定端口，并用 `curl` 核对返回内容确实是本项目页面。
- `pnpm lint` 报 `style/quotes: Strings must use singlequote` → `@antfu/eslint-config` 默认要求单引号（本文档早期版本误写为双引号，已更正）→ 全仓统一单引号，以 `pnpm lint` 实际规则为准。
- `pnpm dev` 的进程跑一会儿后崩溃，日志出现 `FATAL ERROR: Reached heap limit Allocation failed` → 在 dev server 运行期间执行 `pnpm typecheck`（内含 `nuxt prepare`，会重写 `.nuxt`）或同时跑多个 dev 实例，会让进程堆内存冲高后崩掉 → 静态检查与浏览器验收分开进行；验收时只保留一个 dev 实例，且不要在其运行期间跑 typecheck。
- 验收截图里底部固定操作栏「跑到」列表中部，疑似布局缺陷 → 全页截图（`screenshot --full`）对 `position: fixed` 元素的合成假象，实时页面并无问题 → 验收截图用视口截图（不加 `--full`）；存疑时用 `getBoundingClientRect()` 实测位置复核。
- CI 三个 job 全挂在 Install 步骤（1 秒内 exit 1），报 `ERR_PNPM_OUTDATED_LOCKFILE` → package.json 依赖改成 `catalog:` 引用后没有重新生成 pnpm-lock.yaml，CI 默认 `--frozen-lockfile` 会直接拒绝（本地普通 `pnpm install` 会自动同步，感知不到）→ 改动依赖后跑一次 `pnpm install` 并提交锁文件；本地用 `pnpm install --frozen-lockfile` 可以预检。
- 调大 `--ui-radius` 后复选框变成圆形（看起来像单选），且按钮/弹层圆角比预期大得多 → Nuxt UI 把 `--ui-radius` 放大成整条圆角刻度（`--radius-md` = ×1.5、`--radius-lg` = ×2、`--radius-xl` = ×3），Tailwind 原生 `rounded-lg/xl` 在本项目里不是常规值 → `--ui-radius` 固定 0.5rem（控件 12px = `--radius-control`、弹层 16px = `--radius-card`），不要再调大；需要精确圆角的地方用 `rounded-[6px]` 这类固定值，`UCheckbox` 单独给 `rounded-[4px]`。
- 浅色模式下弹层比自己的遮罩还暗、层级反转 → Nuxt UI 的 Modal 用 `bg-default` 作内容底、`bg-elevated/75` 作遮罩，而本项目浅色把 `--ui-bg-elevated` 铺成了带色底，比 `--ui-bg`（白）暗 → 不要覆盖浅色的 `--ui-bg`；深色相反（遮罩是「提亮」的），给 Modal 的 content 槽加 `dark:bg-accented` 才能浮起来。
- 被拉宽的按钮（`w-full` / `flex-1`）图标和文字靠左不居中 → Nuxt UI v4 Button 基础类只有 `inline-flex items-center`、**不含 `justify-center`**，只有 `block` prop 才自带 `w-full justify-center`；内容宽按钮看不出，一拉宽就暴露 → 拉宽的 UButton 必须显式加 `justify-center`（或改用 `block`）；排查同类问题可搜 `class="[^"]*(w-full|flex-1)[^"]*"` 的 UButton。
