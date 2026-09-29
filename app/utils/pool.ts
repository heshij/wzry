import type { Hero } from '~/constants/heroes'

export interface HeroPool {
  id: string
  name: string
  heroIds: string[]
}

/** 取池内英雄，顺序与全量英雄一致；池中已失效的 id 自动忽略 */
export function resolvePoolHeroes(all: readonly Hero[], heroIds: readonly string[]): Hero[] {
  const members = new Set(heroIds)
  return all.filter(hero => members.has(hero.id))
}
