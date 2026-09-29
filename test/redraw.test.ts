import { describe, expect, it } from 'vitest'
import { heroes } from '~/constants/heroes'
import { drawHeroes, pickHero } from '~/utils/draw'
import { poolOf, seeded } from './helpers'

describe('pickHero（单人重抽）', () => {
  it('结果不在排除集合内', () => {
    for (let round = 0; round < 50; round++) {
      const occupied = heroes.slice(round, round + 6).map(hero => hero.id)
      const next = pickHero(heroes, occupied)
      expect(occupied).not.toContain(next.id)
    }
  })

  it('五人局重抽一人：新英雄不同于其原英雄，也不与其他玩家重复', () => {
    for (let round = 0; round < 50; round++) {
      const drawn = drawHeroes(heroes, 5)
      const index = round % 5
      // 排除集合 = 本局全部已占用英雄（含该玩家原英雄）
      const occupied = drawn.map(hero => hero.id)

      const next = pickHero(heroes, occupied)

      expect(next.id).not.toBe(drawn[index]!.id)
      expect(occupied).not.toContain(next.id)
    }
  })

  it('重抽不影响其他玩家的结果', () => {
    const drawn = drawHeroes(heroes, 5, seeded(11))
    const snapshot = drawn.map(hero => hero.id)

    pickHero(heroes, snapshot, seeded(12))

    expect(drawn.map(hero => hero.id)).toEqual(snapshot)
  })

  it('池内只剩一个可用英雄时必定抽到它', () => {
    expect(pickHero(poolOf(3), ['h0', 'h1']).id).toBe('h2')
  })

  it('可用英雄被排除完时抛错', () => {
    const pool = poolOf(3)
    expect(() => pickHero(pool, pool.map(hero => hero.id))).toThrow(RangeError)
  })

  it('不修改排除集合入参', () => {
    const occupied = ['h0', 'h1']
    pickHero(poolOf(6), occupied, seeded(3))
    expect(occupied).toEqual(['h0', 'h1'])
  })

  it('同一随机源下重抽结果可复现', () => {
    const occupied = heroes.slice(0, 5).map(hero => hero.id)
    expect(pickHero(heroes, occupied, seeded(99)).id).toBe(pickHero(heroes, occupied, seeded(99)).id)
  })
})
