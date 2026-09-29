export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
    },
    modal: {
      slots: {
        // 深色下 Nuxt UI 的遮罩是「提亮」的（bg-elevated/75 比页面底更亮），弹层若沿用 bg-default
        // 会比遮罩还暗；深色改用 accented（navy-600）才真正浮起来。浅色保持 bg-default（白）。
        content: 'bg-default dark:bg-accented',
      },
    },
  },
})
