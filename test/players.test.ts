import type { Player } from '~/utils/players'
import { describe, expect, it } from 'vitest'
import { createPlayers, resizePlayers } from '~/utils/players'

function namedPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({ id: `p${index}`, name }))
}

const TEN = namedPlayers(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])

describe('resizePlayers', () => {
  it('缩容时不丢名字，被裁掉的条目进入 parked', () => {
    const { players, parked } = resizePlayers(TEN, [], 6)

    expect(players.map(p => p.id)).toEqual(['p0', 'p1', 'p2', 'p3', 'p4', 'p5'])
    expect(parked.map(p => p.id)).toEqual(['p6', 'p7', 'p8', 'p9'])
    expect(parked.map(p => p.name)).toEqual(['7', '8', '9', '10'])
  })

  it('扩容时优先补回被裁掉的条目', () => {
    const shrunk = resizePlayers(TEN, [], 6)
    const grown = resizePlayers(shrunk.players, shrunk.parked, 8)

    expect(grown.players).toHaveLength(8)
    expect(grown.players.slice(6).map(p => p.id)).toEqual(['p6', 'p7'])
    expect(grown.parked.map(p => p.id)).toEqual(['p8', 'p9'])
  })

  it('缩容再扩容回原人数时名字完全恢复', () => {
    const shrunk = resizePlayers(TEN, [], 3)
    const grown = resizePlayers(shrunk.players, shrunk.parked, 10)

    expect(grown.players.map(p => p.id)).toEqual(TEN.map(p => p.id))
    expect(grown.players.map(p => p.name)).toEqual(TEN.map(p => p.name))
    expect(grown.parked).toEqual([])
  })

  it('反复缩容不会把同一条目重复放进 parked', () => {
    const first = resizePlayers(TEN, [], 6)
    const second = resizePlayers(first.players, first.parked, 6)

    expect(second.parked).toHaveLength(4)
    expect(new Set(second.parked.map(p => p.id)).size).toBe(4)
  })

  it('目标人数非法时原样返回，不清空名单', () => {
    // 「每队人数」输入框被清空时组件会把值置为 undefined，运行时确实可能拿到非 number
    const invalidTargets: unknown[] = [Number.NaN, undefined]
    for (const target of invalidTargets) {
      const { players, parked } = resizePlayers(TEN, [], target as number)
      expect(players).toEqual(TEN)
      expect(parked).toEqual([])
    }
  })

  it('目标人数超出上下限时按上下限处理', () => {
    expect(resizePlayers(TEN, [], 99).players).toHaveLength(10)
    expect(resizePlayers(TEN, [], 0).players).toHaveLength(2)
  })

  it('扩容时 parked 不够则补空白玩家', () => {
    const players = createPlayers(2)
    const { players: grown, parked } = resizePlayers(players, [], 5)

    expect(grown).toHaveLength(5)
    expect(grown.slice(2).every(p => p.name === '')).toBe(true)
    expect(parked).toEqual([])
  })

  it('不修改入参', () => {
    const players = [...TEN]
    const parked: Player[] = []
    resizePlayers(players, parked, 6)

    expect(players).toHaveLength(10)
    expect(parked).toHaveLength(0)
  })
})

describe('createPlayers', () => {
  it('生成指定数量、id 唯一且昵称为空的玩家', () => {
    const players = createPlayers(5)

    expect(players).toHaveLength(5)
    expect(new Set(players.map(p => p.id)).size).toBe(5)
    expect(players.every(p => p.name === '')).toBe(true)
  })
})
