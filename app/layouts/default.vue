<script setup lang="ts">
import { appName } from '~/constants'

const route = useRoute()

const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="bg-default text-default flex flex-col min-h-dvh">
    <header class="border-default bg-default/85 border-b top-0 sticky z-20 backdrop-blur">
      <div class="mx-auto px-2 flex gap-1 h-14 max-w-3xl w-full items-center">
        <UButton
          v-if="!isHome"
          to="/"
          icon="i-lucide-chevron-left"
          aria-label="返回首页"
          color="neutral"
          variant="ghost"
        />
        <NuxtLink to="/" class="font-semibold truncate">
          {{ appName }}
        </NuxtLink>
        <div class="ml-auto">
          <DarkToggle />
        </div>
      </div>
    </header>

    <main class="mx-auto px-4 pb-28 pt-4 flex-1 max-w-3xl w-full">
      <slot />
    </main>
  </div>
</template>
