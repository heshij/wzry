import type { Lane } from '~/constants/heroes'

export interface HeroRecordEntry {
  playerName: string
  heroName: string
  lanes: Lane[]
}

export interface HeroDrawRecord {
  id: string
  type: 'hero'
  createdAt: number
  entries: HeroRecordEntry[]
}

export interface TeamSplitRecord {
  id: string
  type: 'team'
  createdAt: number
  teams: [string[], string[]]
}

export type DrawRecord = HeroDrawRecord | TeamSplitRecord

export const HISTORY_LIMIT = 100

/** 新记录插入到最前，超出上限时丢弃最旧记录 */
export function appendRecord(records: readonly DrawRecord[], record: DrawRecord, limit = HISTORY_LIMIT): DrawRecord[] {
  return [record, ...records].slice(0, limit)
}
