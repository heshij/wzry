<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <h2 class="text-muted flex items-center gap-2 text-sm font-medium">
    <span class="bg-gold-500 h-4 w-1 shrink-0 rounded-full" aria-hidden="true" />
    {{ title }}
  </h2>
</template>
