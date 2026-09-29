<script setup lang="ts">
import { appDescription } from '~/constants'

interface HomeEntry {
  to: string
  icon: string
  title: string
  description: string
  primary?: boolean
}

const entries: HomeEntry[] = [
  { to: '/hero', icon: 'i-lucide-sparkles', title: '抽英雄', description: '为每位玩家抽一个不重复的英雄', primary: true },
  { to: '/team', icon: 'i-lucide-users', title: '抽队友', description: '把名单随机分成两队', primary: true },
  { to: '/pool', icon: 'i-lucide-list-checks', title: '英雄池', description: '建一个只装你会玩的英雄的池' },
  { to: '/history', icon: 'i-lucide-history', title: '历史记录', description: '回看之前抽过的结果' },
]
</script>

<template>
  <div class="space-y-5">
    <p class="text-muted text-sm">
      {{ appDescription }}
    </p>

    <div class="space-y-3">
      <NuxtLink
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        class="border-default bg-elevated hover:border-primary border rounded-xl flex gap-4 transition items-center active:scale-[0.98]"
        :class="entry.primary ? 'p-5' : 'p-4'"
      >
        <span
          class="bg-primary/10 text-primary rounded-lg flex shrink-0 items-center justify-center"
          :class="entry.primary ? 'size-12' : 'size-10'"
        >
          <UIcon :name="entry.icon" :class="entry.primary ? 'size-6' : 'size-5'" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="font-semibold block" :class="entry.primary ? 'text-lg' : 'text-base'">{{ entry.title }}</span>
          <span class="text-muted text-sm block">{{ entry.description }}</span>
        </span>
        <UIcon name="i-lucide-chevron-right" class="text-dimmed shrink-0 size-5" />
      </NuxtLink>
    </div>
  </div>
</template>
