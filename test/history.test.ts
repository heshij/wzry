import type { DrawRecord, HeroDrawRecord, TeamSplitRecord } from '~/utils/history'
import { describe, expect, it } from 'vitest'
import { appendRecord, HISTORY_LIMIT } from '~/utils/history'

function heroRecord(index: number): HeroDrawRecord {
  return {
    id: `r${index}`,
    type: 'hero',
    createdAt: index,
    entries: [{ playerName: '玩家1', heroName: '小乔', lanes: ['中路'] }],
  }
}

function teamRecord(index: number): TeamSplitRecord {
  return {
    id: `t${index}`,
    type: 'team',
    createdAt: index,
    teams: [['a'], ['b']],
  }
}

describe('appendRecord', () => {
  it('新记录排在最前', () => {
    const records = appendRecord([], heroRecord(1))
    const result = appendRecord(records, heroRecord(2))
    expect(result.map(record => record.id)).toEqual(['r2', 'r1'])
  })

  it('未超出上限时全部保留', () => {
    let records: DrawRecord[] = []
    for (let i = 0; i < 5; i++)
      records = appendRecord(records, heroRecord(i), 10)
    expect(records).toHaveLength(5)
  })

  it('超出上限时丢弃最旧记录', () => {
    let records: DrawRecord[] = []
    for (let i = 0; i < 130; i++)
      records = appendRecord(records, heroRecord(i), HISTORY_LIMIT)
    expect(records).toHaveLength(HISTORY_LIMIT)
    expect(records[0]!.id).toBe('r129')
    expect(records.at(-1)!.id).toBe('r30')
  })

  it('默认上限为 100 条', () => {
    let records: DrawRecord[] = []
    for (let i = 0; i < 120; i++)
      records = appendRecord(records, teamRecord(i))
    expect(records).toHaveLength(HISTORY_LIMIT)
  })

  it('不修改原数组', () => {
    const original: DrawRecord[] = [heroRecord(1)]
    appendRecord(original, heroRecord(2))
    expect(original).toHaveLength(1)
  })
})
