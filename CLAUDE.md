# CLAUDE.md

王者荣耀英雄随机抽签，对局抽签等

## 项目结构

## 高优先级约束

- 前台图标统一使用 `<UIcon name="i-lucide-*" />` 组件，禁止使用 `<span class="i-lucide-*">` CSS class 方式，前者是 Nuxt UI 官方方式，不会被 UnoCSS 扫描遗漏

## 常用命令

## 编码规范

- ESLint 基于 `@antfu/eslint-config`，无分号、双引号、无尾逗号
- TypeScript 优先使用 `interface`，Vue SFC 使用 `<script setup lang="ts">`
- 命名使用驼峰，文件名使用小写连字符，如 `user-info.vue`

## 关键细节

## 错题本

> 踩坑后追加一行：现象 → 原因 → 正确做法。给未来的 AI 和人看。

- `pnpm install` 报 `ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR` / `拒绝访问 os error 5` → 上次 pnpm 进程中断残留的 `node_modules` 被进程占用或句柄未释放 → 先手动 `Remove-Item node_modules -Recurse -Force` 再重新 `pnpm install`。
- `pnpm install` 报 `Failed to resolve dependency tree: High-risk trust downgrade for "why-is-node-running@3.2.2"` → pnpm 的 `trustPolicy: no-downgrade` 拦截了 vitest 间接依赖的可信度降级版本 → 在 `pnpm-workspace.yaml` 的 `overrides` 里固定到受信版本（如 `why-is-node-running: 3.2.1`），不要直接关掉 `trustPolicy`。
- `pnpm dev` 打印 `Local: http://localhost:3000` 但浏览器打开是别的应用 → 本机 3000 端口已被无关进程占用（Nuxt 只绑到了 IPv6 回环，curl `localhost` 命中 IPv4 上的别的服务）→ 用 `pnpm dev --host 0.0.0.0 --port 4321` 显式指定端口，并用 `curl` 核对返回内容确实是本项目页面。
- 按「编码规范」写双引号后 `pnpm lint` 报 `style/quotes: Strings must use singlequote` → 实际 `@antfu/eslint-config` 默认要求单引号，与本文档「双引号」表述不一致 → 以 `pnpm lint` 的实际规则为准（当前仓库全量使用单引号）。
- `pnpm dev` 的进程跑一会儿后崩溃，日志出现 `FATAL ERROR: Reached heap limit Allocation failed` → 在 dev server 运行期间执行 `pnpm typecheck`（内含 `nuxt prepare`，会重写 `.nuxt`）或同时跑多个 dev 实例，会让进程堆内存冲高后崩掉 → 静态检查与浏览器验收分开进行；验收时只保留一个 dev 实例，且不要在其运行期间跑 typecheck。
- 验收截图里底部固定操作栏「跑到」列表中部，疑似布局缺陷 → 全页截图（`screenshot --full`）对 `position: fixed` 元素的合成假象，实时页面并无问题 → 验收截图用视口截图（不加 `--full`）；存疑时用 `getBoundingClientRect()` 实测位置复核。
