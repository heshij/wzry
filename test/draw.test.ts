import { describe, expect, it } from 'vitest'
import { findHeroByName, heroes } from '~/constants/heroes'
import { drawHeroes, shuffle } from '~/utils/draw'
import { poolOf, seeded } from './helpers'

describe('英雄数据', () => {
  it('内置全英雄且 id、名称均唯一', () => {
    expect(heroes.length).toBeGreaterThan(0)
    expect(new Set(heroes.map(hero => hero.id)).size).toBe(heroes.length)
    expect(new Set(heroes.map(hero => hero.name)).size).toBe(heroes.length)
  })

  it('每位英雄至少有一个定位标签', () => {
    for (const hero of heroes) {
      expect(hero.lanes.length).toBeGreaterThan(0)
    }
  })

  it('官方数字 id 唯一且为有效正整数', () => {
    expect(new Set(heroes.map(hero => hero.officialId)).size).toBe(heroes.length)
    for (const hero of heroes) {
      expect(Number.isInteger(hero.officialId)).toBe(true)
      expect(hero.officialId).toBeGreaterThan(0)
    }
  })

  it('可按名称反查英雄，且名称唯一保证反查结果正确', () => {
    for (const hero of heroes)
      expect(findHeroByName(hero.name)?.officialId).toBe(hero.officialId)
    expect(findHeroByName('不存在的英雄')).toBeUndefined()
  })
})

describe('shuffle', () => {
  it('保留全部元素且不修改入参', () => {
    const input = [1, 2, 3, 4, 5]
    const output = shuffle(input, seeded(1))

    expect([...output].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  it('同一随机源下结果可复现', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(shuffle(input, seeded(42))).toEqual(shuffle(input, seeded(42)))
  })
})

describe('drawHeroes', () => {
  it('结果数量等于玩家数', () => {
    for (const count of [2, 3, 5, 10]) {
      expect(drawHeroes(heroes, count, seeded(count))).toHaveLength(count)
    }
  })

  it('同一局内英雄互不重复', () => {
    for (let round = 0; round < 50; round++) {
      const drawn = drawHeroes(heroes, 10)
      expect(new Set(drawn.map(hero => hero.id)).size).toBe(10)
    }
  })

  it('结果全部来自所选英雄池', () => {
    const pool = heroes.slice(0, 12)
    const poolIds = new Set(pool.map(hero => hero.id))
    for (let round = 0; round < 50; round++) {
      const drawn = drawHeroes(pool, 5)
      expect(drawn).toHaveLength(5)
      for (const hero of drawn)
        expect(poolIds.has(hero.id)).toBe(true)
    }
  })

  it('把整个池抽空也不重复', () => {
    const pool = poolOf(6)
    const drawn = drawHeroes(pool, 6, seeded(7))
    expect([...drawn].map(hero => hero.id).sort()).toEqual(pool.map(hero => hero.id).sort())
  })

  it('英雄池少于玩家数时抛错', () => {
    expect(() => drawHeroes(poolOf(4), 5)).toThrow(RangeError)
  })

  it('同一随机源下抽签结果可复现', () => {
    const first = drawHeroes(heroes, 10, seeded(2026)).map(hero => hero.id)
    const second = drawHeroes(heroes, 10, seeded(2026)).map(hero => hero.id)
    expect(first).toEqual(second)
  })
})
