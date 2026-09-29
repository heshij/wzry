<script setup lang="ts">
import { appName } from '~/constants'

const route = useRoute()

const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="bg-default text-default flex min-h-dvh flex-col">
    <header class="border-default bg-default/85 sticky top-0 z-20 border-b backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-2">
        <UButton
          v-if="!isHome"
          to="/"
          icon="i-lucide-chevron-left"
          aria-label="返回首页"
          color="neutral"
          variant="ghost"
        >
          返回
        </UButton>
        <NuxtLink v-else to="/" class="flex min-w-0 items-center gap-2 px-2">
          <span class="truncate font-semibold">{{ appName }}</span>
        </NuxtLink>
        <div class="ml-auto">
          <UColorModeButton size="lg" class="size-11 justify-center" />
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-28">
      <slot />
    </main>
  </div>
</template>
