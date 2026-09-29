<script setup lang="ts">
import type { DrawRecord } from '~/utils/history'
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
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">
        历史记录
      </h1>
      <UButton
        v-if="historyStore.records.length"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
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
      class="border-default bg-elevated p-4 border rounded-xl"
    >
      <button
        type="button"
        class="flex gap-3 w-full text-left items-center"
        :aria-expanded="expandedIds.includes(record.id)"
        @click="toggle(record.id)"
      >
        <UIcon
          :name="record.type === 'hero' ? 'i-lucide-sparkles' : 'i-lucide-users'"
          class="text-primary shrink-0 size-5"
        />
        <span class="flex-1 min-w-0">
          <span class="font-medium block">{{ summaryOf(record) }}</span>
          <span class="text-dimmed text-xs block">{{ formatTime(record.createdAt) }}</span>
        </span>
        <UIcon
          :name="expandedIds.includes(record.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-dimmed shrink-0 size-5"
        />
      </button>

      <div v-if="expandedIds.includes(record.id)" class="border-default mt-3 pt-3 border-t space-y-1">
        <template v-if="record.type === 'hero'">
          <div
            v-for="(entry, index) in record.entries"
            :key="`${record.id}-${index}`"
            class="flex items-baseline gap-3 text-sm"
          >
            <span class="text-muted flex-1 truncate">{{ entry.playerName }}</span>
            <span class="shrink-0 font-medium">
              {{ entry.heroName }}
              <span class="text-dimmed text-xs ml-1">{{ entry.lanes.join('/') }}</span>
            </span>
          </div>
        </template>
        <template v-else>
          <div v-for="(team, index) in record.teams" :key="`${record.id}-team-${index}`" class="text-sm">
            <span class="text-muted">队伍 {{ index === 0 ? 'A' : 'B' }}：</span>{{ team.join('、') }}
          </div>
        </template>
      </div>
    </article>

    <UModal v-model:open="clearModalOpen" title="清空历史记录">
      <template #body>
        <p>确定清空全部 {{ historyStore.records.length }} 条记录吗？清空后无法恢复。</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="clearModalOpen = false">
            取消
          </UButton>
          <UButton color="error" @click="confirmClear">
            清空
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
