let seq = 0

/** 生成本地唯一 id（不依赖 crypto.randomUUID，非安全上下文亦可用） */
export function createId(prefix: string): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`
}
