<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'
import { appName } from '~/constants'

const color = useColorMode()

useHead({
  title: appName,
  htmlAttrs: { lang: 'zh-CN' },
  meta: [{
    name: 'theme-color',
    // 跟随实际页面底色（浅色白 / 深色 navy-800），manifest 的 theme_color 另用品牌 navy-900
    content: () => (color.value === 'dark' ? '#16233f' : '#ffffff'),
  }],
})
</script>

<template>
  <UApp :locale="zh_cn">
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
html,
body,
#__nuxt {
  min-height: 100dvh;
  margin: 0;
  padding: 0;
}

html.dark {
  color-scheme: dark;
}
</style>
