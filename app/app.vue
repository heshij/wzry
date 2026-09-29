<script setup lang="ts">
import { appName } from '~/constants'

const color = useColorMode()

useHead({
  title: appName,
  htmlAttrs: { lang: 'zh-CN' },
  meta: [{
    name: 'theme-color',
    content: () => (color.value === 'dark' ? '#0b1220' : '#ffffff'),
  }],
})
</script>

<template>
  <UApp>
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
