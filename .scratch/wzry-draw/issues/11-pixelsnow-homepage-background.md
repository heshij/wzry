# 11 — 首页 PixelSnow 雪花背景

**What to build:** 给首页（仅 `/`）加 PixelSnow 像素风 3D 雪花飘落背景（three.js WebGL 着色器；完整源码已由用户提供并存档于 `.scratch/tmp/pixelsnow-source.vue`，实现时直接取用）。背景为装饰层：不遮挡内容、不拦截点击；深色模式用白雪花（官方默认），浅色模式改金色系且更淡（白雪花在浅色底不可见），两种模式下正文对比度仍达 WCAG AA；遵守项目 `prefers-reduced-motion` 约定；three.js 懒加载不阻塞首屏，WebGL 不可用或加载失败时静默降级为无背景；参数沿用官方默认（flakeSize 0.01 / density 0.3 / speed 1.25 / pixelResolution 200 / variant square / direction 125），仅按深浅色调整颜色与亮度。

**涉及页面/文件：** `app/pages/index.vue`（挂载背景层）、新增雪花背景组件（由存档源码改造：加懒加载、reduced-motion、WebGL 降级）、`pnpm-workspace.yaml`（catalog 新增 `three`）与 `package.json`。依赖走 catalog 后须跑 `pnpm install` 更新锁文件（CI `--frozen-lockfile` 会校验）。

**Blocked by:** None — can start immediately（调度上建议在 ticket 10 验收收尾后开工，避免验收期间改动仓库）

**Status:** done（2026-09-29 实现；浏览器验收与代码审查通过）

- [x] 首页出现雪花飘落背景且铺满可视区域、清晰可见；其他页面（hero / team / pool / history）零影响
- [x] 背景不拦截交互：首页所有入口可点击、路由跳转正常；文字与卡片清晰可读
- [x] 深浅色：深色白雪花；浅色金色系更淡、可见且克制；两种模式下正文对比度仍达 WCAG AA
- [x] `prefers-reduced-motion: reduce` 时不渲染背景动画（也不加载 three.js）
- [x] three.js 懒加载、不阻塞首屏渲染；WebGL 不可用或加载失败时静默降级为无背景，页面完整可用、无报错
- [x] 参数沿用官方默认；仅按深浅色调整颜色与亮度
- [x] 375px 竖屏无横向滚动；平板（768~1024px）/ 桌面（≥1280px）不退化
- [x] PWA 离线冷启动不回归（首页可用）；`pnpm lint` / `pnpm typecheck` / `pnpm test` 全绿

## 验收结论（2026-09-29）

**结论：全部验收项通过；代码审查 APPROVE（无阻塞项，P1/P2/P3 建议已按证据修复）。**

### 逐条结论

1. **背景铺满且其他页面零影响**：通过。首页 canvas 实测铺满视口（375×812 / 768×1024 / 1440×900，`getBoundingClientRect` 均为 0,0 起满屏）；`/hero`、`/team`、`/pool`、`/history` canvas 数量均为 0。
2. **不拦截交互、内容可读**：通过。背景层 `pointer-events: none` + `aria-hidden="true"`；卡片中心 `elementFromPoint` 命中的是链接内部元素；点击「抽英雄」正常跳转 `/hero`；首页 5 个入口均可点。
3. **深浅色与对比度**：通过。深色白雪花（`#ffffff`），浅色金色系（`#e3b545`）更淡克制。实测对比度：浅色页头标题 10.36:1、卡片标题 9.56:1；深色 12.65:1、9.69:1，均远超 AA。雪花只在页面底与半透明页头之后，卡片为不透明表面，正文对比度不受影响。
4. **reduced-motion**：通过。`set media reduced-motion` 后 `prefers-reduced-motion: reduce` 生效，canvas 数量 0，且网络请求日志中**没有任何 three 请求**（完全没加载 three.js）；页面内容与入口照常可用。
5. **懒加载与降级**：通过。生产构建中 three 为独立 510KB chunk（`BZgwRmxB.js`），入口引用的 15 个脚本**均未引用它**，只在 `onMounted` 后由动态 `import()` 拉取；开发环境网络日志同样显示运行时单独请求 `deps/three.js`。模拟 WebGL 不可用（`getContext('webgl')` 返回 null）后 canvas 0、内容完整、无报错；three 加载失败路径同样静默降级。
6. **参数沿用官方默认**：通过。flakeSize 0.01 / minFlakeSize 1.25 / pixelResolution 200 / speed 1.25 / depthFade 8 / farPlane 20 / gamma 0.4545 / density 0.3 / variant square / direction 125 均按源码默认；仅 `uColor` 按深浅色变化。
7. **响应式**：通过。375 / 768 / 1440 三档均无横向滚动（`scrollWidth` = 视口宽），布局不退化。
8. **PWA 与静态检查**：通过。three chunk 已进 PWA 预缓存（183 条），断网冷启动首页正常打开且雪花仍渲染（three 来自缓存）；`pnpm lint` 0 问题、`pnpm typecheck` 无错误、`pnpm test` 52/52 通过。

### 代码审查与修复

审查结论 APPROVE。据其意见修复：

1. **P1 卸载竞态**：`await import('three')` 期间组件可能已卸载（three 是 500KB 级 chunk，弱网首访需数秒），原实现会在已脱离文档的容器上创建渲染器并启动 rAF 死循环，泄漏 WebGL 上下文。已加 `unmounted` 标志 + `containerRef.value !== container` 双重守卫。
2. **P2 合成精度**：alpha 衰减与 three 的 `NormalBlending` 叠加会让颜色被二次乘 alpha（深色远处雪花比官方暗约 3 倍），与代码注释「深色观感不变」不符。已改 `blending: NoBlending`（全屏 quad 本不需混合），合成结果精确等于 `uColor * a + 页面 * (1 - a)`，深色模式回到官方观感，浅色模式自然淡出。
3. **P3**：WebGL 探测结果改为模块级缓存（避免反复创建探测上下文）；`cleanup` 提前赋值并在起动画循环之前，首帧渲染失败也能被回收；注释里指向的源码存档路径已改指向本 ticket（原路径在 gitignore 内，仓库读者无法核对）。

### 留档

截图：`.scratch/tmp/evidence/t11/`（浅色/深色、reduced-motion、无 WebGL、断网冷启动、各断点）。
