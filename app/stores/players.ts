import type { Player } from '~/utils/players'
import { useLocalStorage } from '@vueuse/core'
import { defineStore, skipHydrate } from 'pinia'
import { createPlayers, DEFAULT_PLAYER_COUNT, PLAYER_COUNT_MAX, PLAYER_COUNT_MIN, resizePlayers } from '~/utils/players'

export const usePlayersStore = defineStore('players', () => {
  // 数据只存本机，客户端同步读取；skipHydrate 防止将来若恢复 SSR 时被 payload 默认值覆盖
  const players = useLocalStorage<Player[]>('wzry:players', () => createPlayers(DEFAULT_PLAYER_COUNT))

  // 本地存储可能被外部改坏，形状不对时回退默认名单，避免渲染期报错
  if (!Array.isArray(players.value) || players.value.some(item => typeof item?.id !== 'string' || typeof item?.name !== 'string'))
    players.value = createPlayers(DEFAULT_PLAYER_COUNT)

  /** 缩容时被裁掉的玩家，只在当前会话保留，扩容时补回，避免丢名字 */
  const parked = ref<Player[]>([])

  /** 抽签与记录用名单：空昵称按位置回退为「玩家N」 */
  const resolvedPlayers = computed(() => players.value.map((player, index) => ({
    id: player.id,
    name: player.name.trim() || `玩家${index + 1}`,
  })))

  function setCount(count: number) {
    const result = resizePlayers(players.value, parked.value, count)
    players.value = result.players
    parked.value = result.parked
  }

  function rename(id: string, name: string) {
    const target = players.value.find(player => player.id === id)
    if (target)
      target.name = name
  }

  function remove(id: string) {
    if (players.value.length <= PLAYER_COUNT_MIN)
      return
    players.value = players.value.filter(player => player.id !== id)
    parked.value = parked.value.filter(player => player.id !== id)
  }

  function add() {
    if (players.value.length >= PLAYER_COUNT_MAX)
      return
    players.value = [...players.value, ...createPlayers(1)]
  }

  return { players: skipHydrate(players), resolvedPlayers, setCount, rename, remove, add }
})
