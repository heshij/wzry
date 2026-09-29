/**
 * 抽签揭晓动画：先短暂滚动，再落到最终结果。
 * durationMs 保持在 1 秒内，避免拖慢连续操作；对动效敏感的用户直接出结果。
 */
export function useReveal(durationMs = 600, tickMs = 70) {
  const rolling = ref(false)

  function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  async function reveal(apply: () => void, onTick: () => void) {
    if (prefersReducedMotion()) {
      apply()
      return
    }

    rolling.value = true
    onTick()
    const timer = setInterval(onTick, tickMs)
    await new Promise(resolve => setTimeout(resolve, durationMs))
    clearInterval(timer)
    apply()
    rolling.value = false
  }

  return { rolling, reveal }
}
