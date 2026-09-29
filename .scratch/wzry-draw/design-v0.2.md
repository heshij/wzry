# 王者抽签 v0.2 视觉体系（ticket 07 交付）

产出方式：使用设计类 skill（`ui-ux-pro-max`）检索风格 / 色板 / 触屏与动效规则后，结合 spec 固定的「品牌深蓝 + 金」基调综合定稿。设计系统检索的首轮结果（霓虹紫 3D / 落地页范式）与产品不符，已按 skill 规则改用定向检索取用其中的 UX 与实现规范。

## 1. 定位与三条原则

**定位**：开黑现场用的「有仪式感的抽签工具」。冷静的深蓝负责可读性与高级感，金色只在强调处出现。

1. **金色是强调，不是底色**：金色只用于品牌标识、图标徽章、分隔强调、头像环、揭晓高光。大面积金色会显廉价，也过不了对比度。
2. **颜色分工固定**：深蓝 = 表面与文字层级；金色 = 品牌与强调；蓝色 = 可交互（按钮 / 链接 / 焦点）。三者不互相兼职。
3. **触屏优先**：所有可点区域 ≥44px（spec v0.2 验收 5），间距 ≥8px，主操作固定在拇指区。

## 2. 色板（`app/assets/css/main.css` 的 `@theme`，即唯一真源）

### 品牌深蓝 navy
| token | 值 | 用途 |
|---|---|---|
| `--color-navy-50` | `#f2f6fd` | 浅色模式卡片/悬停表面（elevated） |
| `--color-navy-100` | `#e2eaf8` | 浅色模式次级表面（muted） |
| `--color-navy-200` | `#c4d3ee` | 浅色模式边框 |
| `--color-navy-300` | `#9cb2dd` | 深色模式次要文字 |
| `--color-navy-400` | `#6b86bd` | 深色模式弱化文字 |
| `--color-navy-500` | `#47619b` | 深色模式边框 |
| `--color-navy-600` | `#33497b` | 深色模式卡片底（次层） |
| `--color-navy-700` | `#24365c` | 深色模式卡片底 |
| `--color-navy-800` | `#16233f` | 深色模式页面底 |
| `--color-navy-900` | `#0b1220` | 品牌深蓝（PWA theme_color、金色上的深色文字） |
| `--color-navy-950` | `#070c16` | 品牌面板渐变暗端 |

### 品牌金 gold
| token | 值 | 用途 |
|---|---|---|
| `--color-gold-100` | `#fdf0cc` | 浅色模式金色浅底（徽章 / 高光） |
| `--color-gold-300` | `#f2cc6b` | 深色模式金色文字与图标 |
| `--color-gold-400` | `#e3b545` | 深色模式金色强调 |
| `--color-gold-500` | `#d4a017` | 品牌金（图标徽章底、头像环） |
| `--color-gold-700` | `#8a660f` | 浅色模式金色文字（白底 5.29:1 ✔） |

**对比度实测**：gold-700 on 白 = 5.29:1；navy-900 on gold-500 = 7.8:1；gold-400 on navy-900 = 9.75:1。金色文字只允许用上述三组组合。

### 语义色映射（不改动 Nuxt UI 的 primary=blue）
- `primary`（蓝）：可交互主色。浅色下经 `--ui-primary` 覆盖为 700 号色（白字 6.8:1），深色保持默认亮色配深字。
- 文字层级：浅色 `--ui-text-muted` = neutral-700、`--ui-text-dimmed` = neutral-600；深色 = neutral-300 / neutral-400。浅色两档同色、靠字号（14px / 12px）区分层级，因为卡片表面带极浅蓝调，dimmed 必须取 600 才能保证 ≥4.5:1。
- 表面：浅色**页面保持白底**、`--ui-bg-elevated` = navy-50（卡片与悬停带一层极浅品牌蓝）、边框 navy-200；深色页面 navy-800、卡片 navy-700、边框 navy-600。
  - 注意：浅色不要把 `--ui-bg` 铺成带色底。Nuxt UI 的 Modal 内容用 `bg-default`、遮罩用 `bg-elevated/75`，一旦 elevated 比 bg 亮，弹层就会比自己的遮罩还暗（层级反转）。

## 3. 字号层级

基准 16px，行高 1.5（正文）。移动端不因屏幕小而降级字号。

| 层级 | 类 | 用途 |
|---|---|---|
| display | `text-4xl font-bold tracking-tight` | 结果卡英雄名（36px） |
| title | `text-2xl font-bold` | 首页品牌标题 |
| h1 | `text-xl font-semibold` | 页面标题 |
| h2 | `text-sm font-medium` + 金色强调条 | 小节标题 |
| body | `text-base` / `text-sm` | 正文 / 次要说明 |
| meta | `text-xs` | 时间戳、计数（不低于 12px） |

## 4. 间距 · 圆角 · 阴影 · 动效

**间距**：沿用 Tailwind 4/8 栅格；页面节奏 `space-y-6`（24px）分节、卡间距 `gap-3`（12px）、卡内 `p-4`（16px）。

**圆角**：`--radius-card: 1rem`（卡片 / 弹层）· `--radius-control: 0.75rem`（按钮 / 输入）· 头像、徽章与筛选 chip 用 `rounded-full`（筛选 chip 是 ticket 10 的例外，胶囊形更能表达「一组里选一个」）。
- `--ui-radius` 取 0.5rem：Nuxt UI 会把它放大成整条刻度（md = ×1.5 = 12px，正好等于 control；lg = ×2 = 16px，正好等于 card；xl = ×3）。**不要再调大**，否则 16px 的复选框（`rounded-sm`）会被压成圆形。
- 因此 Tailwind 原生 `rounded-lg/xl` 在本项目里不等于常规值，logo 一类需要精确圆角的地方用 `rounded-[6px]` 这类固定值。

**阴影**：`--shadow-card`（卡片，两层柔和）· `--shadow-raised`（底部操作栏，向上投影）。深色模式阴影不显，改用 `navy-600` 边框 + 更亮的表面色表达层级。

**动效**：微反馈 `duration-150`、状态切换 `duration-200`、揭晓 600ms（`useReveal` 的默认参数）。**尊重 `prefers-reduced-motion`**：揭晓动画直接出结果，不做滚动。

## 5. 组件规范

- **按钮**：主操作 `size="xl"`（高 48px）；次操作 `size="lg"`；图标按钮 `class="size-11 justify-center"` 固定 44×44（UButton 的 base 没有 `justify-center`，不加图标会偏心）。
- **ActionBar**：底部固定，`shadow-raised` + 背景模糊 + `env(safe-area-inset-bottom)` 安全区。
- **卡片**：`rounded-card border bg-elevated p-4`；结果卡额外带金色顶部强调。
- **图标徽章**：`size-12 rounded-control` 金色渐变底 + navy-900 图标（首页入口）；次级入口 `size-10`。
- **HeroAvatar**（07 先落占位，08 接真图）：`size-16 rounded-full` 金色环 + 深蓝底 + 英雄名首字（金色）。
- **空态**：居中文案 + 弱化色，不放大图标。
- **弹层**：`rounded-card`，标题 `text-lg font-semibold`，页脚按钮右对齐。

## 6. 页面要点

- **首页**：顶部深蓝渐变品牌面板（金「王」标 + 应用名 + 一句话说明）；其下两张主入口大卡（金徽章 + 标题 + 说明 + 箭头）；再下两张次级入口并排小卡。
- **抽英雄 / 抽队友**：小节标题带金色短竖条；输入态清爽；结果态卡片「头像 + 大字号英雄名 + 定位标签」，卡顶金色细线；揭晓动画金色高光。
- **英雄池**：池卡片信息层级为「名称 / 数量 / 操作」，全部英雄列表用网格 + 头像位（08）。
- **历史**：左金色时间轴细线 + 类型图标徽章，摘要行 + 时间，展开区为内嵌浅面板。

## 7. 与验收标准对照

| 验收项 | 落地方式 |
|---|---|
| 视觉体系集中定义 | 色/圆角/阴影/缓动在 `@theme`；字号与间距用 Tailwind 标准刻度 |
| 结果卡主视觉 | 头像位 + `text-4xl` 英雄名 + 定位徽章 |
| 375 / 768~1024 / ≥1280 不退化 | 沿用 v0.1 的 `max-w-3xl` 居中 + `sm/lg` 多列网格，仅换皮 |
| 深浅色可读、AA | 见第 2 节对比度实测；深色用 navy 系替代 slate |
| 触屏 ≥44px | 主操作 48px、图标按钮与列表操作 44px |
| 揭晓有仪式感 | 金色高光滚动 + 结果卡入场，`prefers-reduced-motion` 下降级 |

## 8. 代码审查后的修订（2026-09-29）

Code Reviewer 独立审查后按证据修订了三处：

1. **`--ui-radius` 从 0.75rem 降到 0.5rem**。Nuxt UI 把它放大成整条圆角刻度，0.75rem 会让控件圆角变 18px、弹层 24px，并且把 16px 的复选框（`rounded-sm`）压成圆形（看起来像单选）。降到 0.5rem 后控件 = 12px、弹层 = 16px，正好等于 `--radius-control` / `--radius-card`；复选框另给 `rounded-[4px]` 固定值。
2. **浅色不再覆盖 `--ui-bg`**，页面回到白底，只把 `--ui-bg-elevated` 铺成 navy-50。原方案把页面铺成 navy-50、卡片铺白，会让 Modal 的内容底（`bg-default`）比自己的遮罩（`bg-elevated/75`）更暗，层级反转。同时浅色 `--ui-text-dimmed` 提到 neutral-600，保证落在带蓝调卡面上也有 ≥4.5:1（原 500 号色只有 4.40:1）。
3. **图标按钮补 `justify-center`**（UButton 的 base 只有 `inline-flex items-center`，44px 方按钮里图标会偏左 4px）；`UInputNumber` 提到 `size="xl"`，让步进按钮从 36px 变成 44px，满足「可点区域 ≥44px」。
