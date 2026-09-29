import type { Hero } from '~/constants/heroes'

export type Random = () => number

/** Fisher–Yates 洗牌，返回新数组，不修改入参 */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const current = result[i]!
    result[i] = result[j]!
    result[j] = current
  }
  return result
}

/** 一次性抽出 count 个互不重复的英雄；池内英雄不足时抛错 */
export function drawHeroes(pool: readonly Hero[], count: number, random: Random = Math.random): Hero[] {
  if (count > pool.length)
    throw new RangeError('英雄池英雄数量少于玩家数量')
  return shuffle(pool, random).slice(0, count)
}

/**
 * 从池中取一个不在排除集合内的英雄，用于单人重抽。
 * 排除集合应为本局全部已占用英雄（含该玩家原英雄）；池内无可用英雄时抛错。
 */
export function pickHero(pool: readonly Hero[], excludedIds: readonly string[], random: Random = Math.random): Hero {
  const excluded = new Set(excludedIds)
  const available = pool.filter(hero => !excluded.has(hero.id))
  if (available.length === 0)
    throw new RangeError('英雄池内已无可用英雄')
  return available[Math.floor(random() * available.length)]!
}
