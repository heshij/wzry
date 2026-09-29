// @ts-check
import antfu from '@antfu/eslint-config'
import nuxt from './.nuxt/eslint.config.mjs'

export default antfu(
  {
    unocss: true,
    formatters: true,
    pnpm: true,
    antislop: true,
  },
  {
    // .scratch 存放需求澄清与产品文档草稿，不参与代码风格检查
    ignores: ['.scratch/**'],
  },
)
  .append(nuxt())
