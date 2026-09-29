import { describe, expect, it } from 'vitest'
import { splitTeams } from '~/utils/teams'
import { seeded } from './helpers'

function membersOf(size: number): number[] {
  return Array.from({ length: size }, (_, index) => index)
}

describe('splitTeams', () => {
  it('人数为偶数时两队人数相等', () => {
    for (const size of [2, 4, 6, 8, 10]) {
      const [first, second] = splitTeams(membersOf(size))
      expect(first).toHaveLength(size / 2)
      expect(second).toHaveLength(size / 2)
    }
  })

  it('人数为奇数时两队人数差为 1', () => {
    for (const size of [1, 3, 5, 7, 9]) {
      const [first, second] = splitTeams(membersOf(size))
      expect(Math.abs(first.length - second.length)).toBe(1)
      expect(first.length + second.length).toBe(size)
    }
  })

  it('成员不重不漏', () => {
    for (let round = 0; round < 50; round++) {
      const members = membersOf(10)
      const [first, second] = splitTeams(members)
      expect([...first, ...second].sort((a, b) => a - b)).toEqual(members)
    }
  })

  it('奇数人时多一人的队伍是随机的', () => {
    const firstIsLarger = new Set<boolean>()
    for (let round = 0; round < 50; round++) {
      const [first, second] = splitTeams(membersOf(7), seeded(round + 1))
      firstIsLarger.add(first.length > second.length)
    }
    expect(firstIsLarger).toEqual(new Set([true, false]))
  })

  it('空名单返回两个空队', () => {
    expect(splitTeams([])).toEqual([[], []])
  })

  it('不修改入参', () => {
    const members = membersOf(6)
    splitTeams(members, seeded(5))
    expect(members).toEqual(membersOf(6))
  })

  it('同一随机源下分组结果可复现', () => {
    expect(splitTeams(membersOf(10), seeded(2026))).toEqual(splitTeams(membersOf(10), seeded(2026)))
  })
})
