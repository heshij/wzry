import { createId } from './id'

export interface Player {
  id: string
  name: string
}

export const PLAYER_COUNT_MIN = 2
export const PLAYER_COUNT_MAX = 10
export const DEFAULT_PLAYER_COUNT = 5

export function createPlayers(count: number): Player[] {
  return Array.from({ length: count }, () => ({ id: createId('p'), name: '' }))
}

export interface ResizeResult {
  players: Player[]
  parked: Player[]
}

/**
 * 把名单调整到 target 人。
 * - 缩容不丢名字：被裁掉的条目进入 parked，扩容时优先补回（parked 只活在当前会话里）。
 * - target 非法（NaN / undefined）时原样返回，避免「每队人数」被清空时误清名单。
 */
export function resizePlayers(players: readonly Player[], parked: readonly Player[], target: number): ResizeResult {
  const next = Math.min(PLAYER_COUNT_MAX, Math.max(PLAYER_COUNT_MIN, Math.floor(target)))
  if (!Number.isFinite(next) || next === players.length)
    return { players: [...players], parked: [...parked] }

  if (next < players.length) {
    const dropped = players.slice(next)
    const droppedIds = new Set(dropped.map(player => player.id))
    return {
      players: players.slice(0, next),
      parked: [...dropped, ...parked.filter(player => !droppedIds.has(player.id))],
    }
  }

  const restored = parked.slice(0, next - players.length)
  const grown = [...players, ...restored]
  return {
    players: grown.length < next ? [...grown, ...createPlayers(next - grown.length)] : grown,
    parked: parked.slice(restored.length),
  }
}
