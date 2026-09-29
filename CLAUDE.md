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
