import { describe, expect, it } from 'vitest'
import { heroes } from '~/constants/heroes'
import { resolvePoolHeroes } from '~/utils/pool'

describe('resolvePoolHeroes', () => {
  it('只返回池内英雄', () => {
    const picked = heroes.slice(0, 3).map(hero => hero.id)
    const resolved = resolvePoolHeroes(heroes, picked)
    expect(resolved.map(hero => hero.id)).toEqual(picked)
  })

  it('顺序与全量英雄一致，与勾选顺序无关', () => {
    const picked = [heroes[5]!.id, heroes[1]!.id, heroes[3]!.id]
    expect(resolvePoolHeroes(heroes, picked).map(hero => hero.id)).toEqual([
      heroes[1]!.id,
      heroes[3]!.id,
      heroes[5]!.id,
    ])
  })

  it('忽略池中已失效的英雄 id', () => {
    expect(resolvePoolHeroes(heroes, ['lianpo', 'not-a-hero']).map(hero => hero.id)).toEqual(['lianpo'])
  })

  it('空池返回空数组', () => {
    expect(resolvePoolHeroes(heroes, [])).toEqual([])
  })
})
