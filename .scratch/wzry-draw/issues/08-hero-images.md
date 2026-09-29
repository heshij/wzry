# 08 — 英雄形象接入

**What to build:** 新增拉取脚本把 133 位英雄的官方 100×100 图标下载到 gitignored 的 `public/heroes/`；`app/constants/heroes.ts` 补官方数字 id 用于拼路径；新增 `HeroAvatar` 组件在结果卡（含揭晓动画）、英雄池、历史等位置展示头像，图片缺失/加载失败时优雅降级为「名称 + 定位」占位、不出现裂图；PWA 预缓存包含头像，断网后可用。

**涉及页面/文件：** 新增 `scripts/fetch-hero-images.mjs` 与 `package.json` 的 `heroes` 脚本、`app/constants/heroes.ts`（新增官方数字 id）、新增 `app/components/HeroAvatar.vue`、调用方页面（hero / pool / history 及结果卡）、`app/config/pwa.ts`（workbox `globPatterns` 含 jpg）、`.gitignore`（`public/heroes/`）。

**Blocked by:** 07 — 视觉体系与页面重设计（头像接入重设计后的结果卡与列表）

**Status:** done（2026-09-29 实现；Tester 逐条验收 10/10 通过，Code Reviewer 审查通过）

- [ ] `pnpm heroes` 幂等拉取全部图标到 `public/heroes/{数字id}.jpg`：已存在则跳过、`--force` 可重拉；单个失败给出汇总提示且不阻断构建
- [ ] `app/constants/heroes.ts` 增加官方数字 id 字段，校验 133 位英雄一一对应、无重复
- [ ] `HeroAvatar` 组件：加载成功显示头像；缺失/失败降级为占位（名称 + 定位），任何情况下不出现裂图
- [ ] 抽英雄结果卡（含揭晓动画）与英雄池、历史详情统一使用头像，规格一致
- [ ] `.gitignore` 忽略 `public/heroes/`，仓库不提交图片；注明素材来源与仅本地/个人使用
- [ ] PWA 预缓存包含头像（workbox `globPatterns` 含 jpg）；首访在线缓存后断网冷启动，抽签结果卡头像正常显示
- [ ] 删除 `public/heroes/` 后应用完整可用（降级占位、无报错）
