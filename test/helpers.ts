import type { Hero } from '~/constants/heroes'

/** 可复现的伪随机源（LCG），返回 [0, 1) */
export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function poolOf(size: number): Hero[] {
  return Array.from({ length: size }, (_, index) => ({
    id: `h${index}`,
    name: `英雄${index}`,
    lanes: ['中路'],
  }))
}
