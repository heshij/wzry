import type { DrawRecord } from '~/utils/history'
import { useLocalStorage } from '@vueuse/core'
import { defineStore, skipHydrate } from 'pinia'
import { appendRecord } from '~/utils/history'

export const useHistoryStore = defineStore('history', () => {
  // 新记录排在最前，超过上限自动丢弃最旧记录
  const records = useLocalStorage<DrawRecord[]>('wzry:history', [])

  // 本地存储可能被外部改坏，形状不对时回退，避免渲染期报错
  if (!Array.isArray(records.value) || records.value.some(record => record?.type !== 'hero' && record?.type !== 'team'))
    records.value = []

  function add(record: DrawRecord) {
    records.value = appendRecord(records.value, record)
  }

  function clear() {
    records.value = []
  }

  return { records: skipHydrate(records), add, clear }
})
