<script setup lang="ts">
const color = useColorMode()

const isDark = computed(() => color.value === 'dark')

function toggleDark() {
  color.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <UButton
    :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
    :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
    color="neutral"
    variant="ghost"
    @click="toggleDark"
  />
</template>
