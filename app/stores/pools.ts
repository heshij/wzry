import type { HeroPool } from '~/utils/pool'
import { useLocalStorage } from '@vueuse/core'
import { defineStore, skipHydrate } from 'pinia'
import { createId } from '~/utils/id'

/** 「全部英雄」不是真实池，用固定 id 表示 */
export const ALL_HEROES_ID = 'all'

export const usePoolsStore = defineStore('pools', () => {
  const pools = useLocalStorage<HeroPool[]>('wzry:pools', [])
  const selectedPoolId = useLocalStorage<string>('wzry:selected-pool', ALL_HEROES_ID)

  // 本地存储可能被外部改坏，形状不对时回退，避免渲染期报错
  if (!Array.isArray(pools.value) || pools.value.some(pool => typeof pool?.id !== 'string' || typeof pool?.name !== 'string' || !Array.isArray(pool?.heroIds)))
    pools.value = []
  if (typeof selectedPoolId.value !== 'string')
    selectedPoolId.value = ALL_HEROES_ID

  const selectedPool = computed(() => pools.value.find(pool => pool.id === selectedPoolId.value) ?? null)

  function createPool(name: string, heroIds: string[] = []): string {
    const id = createId('pool')
    pools.value = [...pools.value, { id, name, heroIds }]
    return id
  }

  function renamePool(id: string, name: string) {
    pools.value = pools.value.map(pool => (pool.id === id ? { ...pool, name } : pool))
  }

  function setPoolHeroes(id: string, heroIds: string[]) {
    pools.value = pools.value.map(pool => (pool.id === id ? { ...pool, heroIds } : pool))
  }

  function removePool(id: string) {
    pools.value = pools.value.filter(pool => pool.id !== id)
    if (selectedPoolId.value === id)
      selectedPoolId.value = ALL_HEROES_ID
  }

  function selectPool(id: string) {
    selectedPoolId.value = id
  }

  return {
    pools: skipHydrate(pools),
    selectedPoolId: skipHydrate(selectedPoolId),
    selectedPool,
    createPool,
    renamePool,
    setPoolHeroes,
    removePool,
    selectPool,
  }
})
