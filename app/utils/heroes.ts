import type { Hero, Lane } from '~/constants/heroes'

/** 「全部」不是真实分路，用固定值表示 */
export const ALL_LANES = 'all'

export type LaneFilter = Lane | typeof ALL_LANES

/**
 * 按分路筛选英雄。
 * 传 ALL_LANES 返回全量；否则返回包含该分路的英雄，顺序与入参一致。
 * 多分路英雄（如廉颇 = 对抗路 + 游走）会在其每个所属分路的结果里各出现一次。
 */
export function filterHeroesByLane(all: readonly Hero[], lane: LaneFilter): Hero[] {
  if (lane === ALL_LANES)
    return [...all]
  return all.filter(hero => hero.lanes.includes(lane))
}
