<script setup lang="ts">
import type { DrawRecord } from '~/utils/history'
import { findHeroByName } from '~/constants/heroes'
import { useHistoryStore } from '~/stores/history'

const historyStore = useHistoryStore()

const expandedIds = ref<string[]>([])
const clearModalOpen = ref(false)

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function summaryOf(record: DrawRecord): string {
  return record.type === 'hero'
    ? `抽英雄 · ${record.entries.length} 人`
    : `抽队友 · ${record.teams[0].length} vs ${record.teams[1].length}`
}

function toggle(id: string) {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter(item => item !== id)
    : [...expandedIds.value, id]
}

function confirmClear() {
  historyStore.clear()
  expandedIds.value = []
  clearModalOpen.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">
        历史记录
      </h1>
      <UButton
        v-if="historyStore.records.length"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        class="h-11"
        @click="clearModalOpen = true"
      >
        清空
      </UButton>
    </div>

    <p v-if="!historyStore.records.length" class="text-dimmed text-sm">
      还没有记录。抽完一次英雄或队友，结果会自动存到这里。
    </p>

    <article
      v-for="record in historyStore.records"
      :key="record.id"
      class="border-default bg-elevated rounded-card shadow-card p-4 border"
    >
      <button
        type="button"
        class="flex min-h-11 w-full items-center gap-3 text-left"
        :aria-expanded="expandedIds.includes(record.id)"
        @click="toggle(record.id)"
      >
        <span
          class="rounded-control flex size-10 shrink-0 items-center justify-center"
          :class="record.type === 'hero' ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300' : 'bg-primary/10 text-primary'"
        >
          <UIcon
            :name="record.type === 'hero' ? 'i-lucide-sparkles' : 'i-lucide-users'"
            class="size-5"
          />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-medium">{{ summaryOf(record) }}</span>
          <span class="text-dimmed block text-xs">{{ formatTime(record.createdAt) }}</span>
        </span>
        <UIcon
          :name="expandedIds.includes(record.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-dimmed size-5 shrink-0"
        />
      </button>

      <div v-if="expandedIds.includes(record.id)" class="bg-default rounded-control mt-3 space-y-2 p-3">
        <template v-if="record.type === 'hero'">
          <div
            v-for="(entry, index) in record.entries"
            :key="`${record.id}-${index}`"
            class="flex items-center gap-3"
          >
            <HeroAvatar :name="entry.heroName" :official-id="findHeroByName(entry.heroName)?.officialId" size="sm" />
            <span class="text-muted min-w-0 flex-1 truncate text-sm">{{ entry.playerName }}</span>
            <span class="shrink-0 text-right">
              <span class="block text-sm font-medium">{{ entry.heroName }}</span>
              <span class="text-dimmed block text-xs">{{ entry.lanes.join('/') }}</span>
            </span>
          </div>
        </template>
        <template v-else>
          <div v-for="(team, index) in record.teams" :key="`${record.id}-team-${index}`" class="text-sm">
            <span class="text-gold-700 dark:text-gold-300 font-medium">队伍 {{ index === 0 ? 'A' : 'B' }}：</span>
            <span class="text-muted">{{ team.join('、') }}</span>
          </div>
        </template>
      </div>
    </article>

    <UModal v-model:open="clearModalOpen" title="清空历史记录">
      <template #body>
        <p>确定清空全部 {{ historyStore.records.length }} 条记录吗？清空后无法恢复。</p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" class="h-11" @click="clearModalOpen = false">
            取消
          </UButton>
          <UButton color="error" class="h-11" @click="confirmClear">
            清空
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
