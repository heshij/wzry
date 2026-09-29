<script setup lang="ts">
import { usePlayersStore } from '~/stores/players'
import { PLAYER_COUNT_MAX, PLAYER_COUNT_MIN } from '~/utils/players'

const props = withDefaults(defineProps<{
  min?: number
  max?: number
}>(), {
  min: PLAYER_COUNT_MIN,
  max: PLAYER_COUNT_MAX,
})

const playersStore = usePlayersStore()

const canRemove = computed(() => playersStore.players.length > props.min)
const canAdd = computed(() => playersStore.players.length < props.max)

/** 桌面端回车提交：焦点跳到下一个昵称输入框，最后一个则收起键盘 */
function focusNext(index: number) {
  const next = document.querySelector<HTMLInputElement>(`#player-name-${index + 1}`)
  if (next)
    next.focus()
  else
    (document.activeElement as HTMLElement | null)?.blur()
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(player, index) in playersStore.players"
      :key="player.id"
      class="flex items-center gap-2"
    >
      <UInput
        :id="`player-name-${index}`"
        :model-value="player.name"
        :placeholder="`玩家${index + 1}`"
        :aria-label="`玩家${index + 1}昵称`"
        size="lg"
        class="h-11 flex-1"
        autocomplete="off"
        enterkeyhint="next"
        @keydown.enter="focusNext(index)"
        @update:model-value="playersStore.rename(player.id, String($event))"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        size="lg"
        class="size-11 justify-center"
        :disabled="!canRemove"
        :aria-label="`删除玩家${index + 1}`"
        @click="playersStore.remove(player.id)"
      />
    </div>

    <UButton
      icon="i-lucide-plus"
      color="neutral"
      variant="outline"
      size="lg"
      block
      class="h-11"
      :disabled="!canAdd"
      @click="playersStore.add()"
    >
      添加玩家
    </UButton>
  </div>
</template>
