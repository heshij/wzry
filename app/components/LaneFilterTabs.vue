<script setup lang="ts">
import type { LaneFilter } from '~/utils/heroes'
import { lanes } from '~/constants/heroes'
import { ALL_LANES } from '~/utils/heroes'

// 页面上同时存在两处筛选（浏览列表 + 打开的弹层），用 label 让读屏能区分
const { label = '按分路筛选' } = defineProps<{
  label?: string
}>()

const model = defineModel<LaneFilter>({ required: true })

const options: { value: LaneFilter, label: string }[] = [
  { value: ALL_LANES, label: '全部' },
  ...lanes.map(lane => ({ value: lane, label: lane })),
]
</script>

<template>
  <!-- 这是筛选器而不是标签页，用 group + aria-pressed 的切换按钮语义，比不完整的 tablist 更准确 -->
  <!-- 移动端 6 个 tab 均分两行（窄屏下自动换行会折成 5+1，不整齐），sm 以上一行自适应 -->
  <div class="gap-2 grid grid-cols-3 sm:flex sm:flex-wrap" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="model === option.value"
      class="rounded-full px-3 min-h-11 text-sm font-medium border outline-gold-500/25 focus-visible:outline-3 transition duration-150"
      :class="model === option.value
        ? 'bg-gold-500/15 border-gold-500/60 text-gold-700 dark:text-gold-300'
        : 'border-default text-muted hover:border-gold-500/40 active:bg-elevated'"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
