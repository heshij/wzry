<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-16 text-center">
    <UIcon name="i-lucide-circle-alert" class="text-dimmed size-12" />
    <p class="text-lg font-semibold">
      页面不存在
    </p>
    <div class="flex gap-2">
      <UButton color="neutral" variant="outline" @click="router.back()">
        返回上一页
      </UButton>
      <UButton to="/">
        回到首页
      </UButton>
    </div>
  </div>
</template>
