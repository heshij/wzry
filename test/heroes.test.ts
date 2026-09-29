import { describe, expect, it } from 'vitest'
import { heroes, lanes } from '~/constants/heroes'
import { ALL_LANES, filterHeroesByLane } from '~/utils/heroes'

describe('filterHeroesByLane', () => {
  it('传「全部」返回全量，且顺序不变', () => {
    const result = filterHeroesByLane(heroes, ALL_LANES)
    expect(result).toHaveLength(heroes.length)
    expect(result.map(hero => hero.id)).toEqual(heroes.map(hero => hero.id))
  })

  it('按分路过滤正确：结果里每个英雄都含该分路，且不含该分路的英雄不出现', () => {
    for (const lane of lanes) {
      const result = filterHeroesByLane(heroes, lane)
      expect(result.length).toBeGreaterThan(0)
      for (const hero of result)
        expect(hero.lanes).toContain(lane)

      const expected = heroes.filter(hero => hero.lanes.includes(lane))
      expect(result.map(hero => hero.id)).toEqual(expected.map(hero => hero.id))
    }
  })

  it('多分路英雄在其每个所属分路里都出现，且各只出现一次', () => {
    const multiLane = heroes.filter(hero => hero.lanes.length > 1)
    expect(multiLane.length).toBeGreaterThan(0)

    for (const hero of multiLane) {
      for (const lane of hero.lanes) {
        const inLane = filterHeroesByLane(heroes, lane).filter(item => item.id === hero.id)
        expect(inLane).toHaveLength(1)
      }
    }

    const lianpo = heroes.find(hero => hero.id === 'lianpo')!
    expect(lianpo.lanes).toEqual(expect.arrayContaining(['对抗路', '游走']))
    for (const lane of lianpo.lanes)
      expect(filterHeroesByLane(heroes, lane).map(hero => hero.id)).toContain('lianpo')
  })

  it('结果数正确：各分路结果数之和等于全量英雄的分路标签总数', () => {
    const sum = lanes.reduce((total, lane) => total + filterHeroesByLane(heroes, lane).length, 0)
    const laneTagCount = heroes.reduce((total, hero) => total + hero.lanes.length, 0)
    expect(sum).toBe(laneTagCount)
  })

  it('单分路英雄只出现在自己的分路里', () => {
    const single = heroes.filter(hero => hero.lanes.length === 1)
    for (const hero of single) {
      for (const lane of lanes) {
        const ids = filterHeroesByLane(heroes, lane).map(item => item.id)
        expect(ids.includes(hero.id)).toBe(hero.lanes[0] === lane)
      }
    }
  })

  it('空列表返回空数组', () => {
    expect(filterHeroesByLane([], ALL_LANES)).toEqual([])
    expect(filterHeroesByLane([], '中路')).toEqual([])
  })

  it('「全部」分支返回新数组，不是入参引用', () => {
    const input = heroes.slice(0, 5)
    expect(filterHeroesByLane(input, ALL_LANES)).not.toBe(input)
  })

  it('不修改入参', () => {
    const input = heroes.slice(0, 5)
    const before = input.map(hero => hero.id)
    filterHeroesByLane(input, ALL_LANES)
    filterHeroesByLane(input, '打野')
    expect(input.map(hero => hero.id)).toEqual(before)
  })
})
