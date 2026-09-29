<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
// 深色用白雪花（官方默认配色）；浅色必须换金色系，白雪花在浅底不可见
const snowColor = computed(() => (isDark.value ? '#ffffff' : '#e3b545'))

interface HomeEntry {
  to: string
  icon: string
  title: string
  description: string
}

const primaryEntries: HomeEntry[] = [
  { to: '/hero', icon: 'i-lucide-sparkles', title: '抽英雄', description: '为每位玩家抽一个不重复的英雄' },
  { to: '/team', icon: 'i-lucide-users', title: '抽队友', description: '把名单随机分成两队' },
]

const secondaryEntries: HomeEntry[] = [
  { to: '/pool', icon: 'i-lucide-list-checks', title: '英雄池', description: '只抽你会玩的英雄' },
  { to: '/history', icon: 'i-lucide-history', title: '历史记录', description: '回看之前抽过的结果' },
]
</script>

<template>
  <div>
    <!-- 装饰性背景：固定铺满视口，不接收点击 -->
    <div class="pointer-events-none fixed inset-0" aria-hidden="true">
      <PixelSnow :color="snowColor" />
    </div>

    <div class="relative z-10 space-y-6">
      <div class="space-y-3">
        <NuxtLink
          v-for="entry in primaryEntries"
          :key="entry.to"
          :to="entry.to"
          class="border-default bg-elevated rounded-card shadow-card hover:border-gold-500/60 flex items-center gap-4 border p-5 transition duration-200 active:scale-[0.98]"
        >
          <span class="from-gold-300 to-gold-500 text-navy-900 rounded-control flex size-12 shrink-0 items-center justify-center bg-gradient-to-br">
            <UIcon :name="entry.icon" class="size-6" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-lg font-semibold">{{ entry.title }}</span>
            <span class="text-muted block text-sm">{{ entry.description }}</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="text-dimmed size-5 shrink-0" />
        </NuxtLink>
      </div>

      <div class="gap-3 grid grid-cols-2">
        <NuxtLink
          v-for="entry in secondaryEntries"
          :key="entry.to"
          :to="entry.to"
          class="border-default bg-elevated rounded-card gap-2 p-4 border flex flex-col transition duration-200 hover:border-gold-500/60 active:scale-[0.98]"
        >
          <UIcon :name="entry.icon" class="text-gold-700 dark:text-gold-400 size-5" />
          <span class="text-sm font-semibold">{{ entry.title }}</span>
          <span class="text-muted text-xs leading-snug">{{ entry.description }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
