import type { Random } from './draw'
import { shuffle } from './draw'

/**
 * 把名单随机均分成两队，两队人数差最多 1 人。
 * 人数为奇数时随机决定哪一队多 1 人；人数不足或超出预设容量时按实际人数均分。
 */
export function splitTeams<T>(members: readonly T[], random: Random = Math.random): [T[], T[]] {
  const shuffled = shuffle(members, random)
  const base = Math.floor(shuffled.length / 2)
  const extraToFirst = shuffled.length % 2 === 1 && random() < 0.5
  const firstSize = base + (extraToFirst ? 1 : 0)
  return [shuffled.slice(0, firstSize), shuffled.slice(firstSize)]
}
