<script setup lang="ts">
interface Props {
  name: string
  /** 官方英雄数字 id；有值且图片可加载时显示官方形象，否则降级为名称首字占位 */
  officialId?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  officialId: undefined,
  size: 'md',
})

const failed = ref(false)

// 换英雄时要重置失败标记，否则上一张的失败会一直挡住新头像
watch(() => props.officialId, () => {
  failed.value = false
})

const showImage = computed(() => props.officialId !== undefined && !failed.value)

const sizeClass = computed(() => ({
  sm: 'size-10 text-base',
  md: 'size-16 text-xl',
  lg: 'size-20 text-2xl',
}[props.size]))

const initial = computed(() => props.name.slice(0, 1))
</script>

<template>
  <!-- 头像在所有场景里都与英雄名文本相邻，属装饰性元素，对读屏隐藏以免重复播报 -->
  <span
    class="from-navy-700 to-navy-900 ring-gold-500/60 relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-semibold ring-2"
    :class="sizeClass"
    aria-hidden="true"
  >
    <span class="text-gold-300">{{ initial }}</span>
    <!-- 头像图缺位时上面的首字占位会透出来，图片失败则整块移除，任何情况都不会出现裂图 -->
    <img
      v-if="showImage"
      :src="`/heroes/${officialId}.jpg`"
      alt=""
      class="absolute inset-0 size-full rounded-full object-cover"
      loading="lazy"
      decoding="async"
      @error="failed = true"
    >
  </span>
</template>
