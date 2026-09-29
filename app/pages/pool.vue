<script setup lang="ts">
import type { LaneFilter } from '~/utils/heroes'
import { heroes } from '~/constants/heroes'
import { usePoolsStore } from '~/stores/pools'
import { ALL_LANES, filterHeroesByLane } from '~/utils/heroes'

const poolsStore = usePoolsStore()

// 两处列表（页面底部浏览网格、编辑成员弹层）各自独立的筛选状态
const browseLane = ref<LaneFilter>(ALL_LANES)
const memberLane = ref<LaneFilter>(ALL_LANES)

const browseHeroes = computed(() => filterHeroesByLane(heroes, browseLane.value))
const memberHeroes = computed(() => filterHeroesByLane(heroes, memberLane.value))

const nameModalOpen = ref(false)
const editingId = ref<string | null>(null)
const nameInput = ref('')

const memberModalOpen = ref(false)
const memberPoolId = ref<string | null>(null)
const selectedHeroIds = ref<string[]>([])

const deleteModalOpen = ref(false)
const deletePoolId = ref<string | null>(null)

const memberPool = computed(() => poolsStore.pools.find(pool => pool.id === memberPoolId.value) ?? null)
const deleteTarget = computed(() => poolsStore.pools.find(pool => pool.id === deletePoolId.value) ?? null)

function openCreate() {
  editingId.value = null
  nameInput.value = ''
  nameModalOpen.value = true
}

function openRename(id: string) {
  const pool = poolsStore.pools.find(item => item.id === id)
  if (!pool)
    return
  editingId.value = id
  nameInput.value = pool.name
  nameModalOpen.value = true
}

function submitName() {
  const name = nameInput.value.trim()
  if (!name)
    return
  if (editingId.value)
    poolsStore.renamePool(editingId.value, name)
  else
    poolsStore.createPool(name)
  nameModalOpen.value = false
}

function openMembers(id: string) {
  const pool = poolsStore.pools.find(item => item.id === id)
  if (!pool)
    return
  memberPoolId.value = id
  selectedHeroIds.value = [...pool.heroIds]
  memberLane.value = ALL_LANES
  memberModalOpen.value = true
}

function toggleHero(id: string) {
  selectedHeroIds.value = selectedHeroIds.value.includes(id)
    ? selectedHeroIds.value.filter(item => item !== id)
    : [...selectedHeroIds.value, id]
}

function submitMembers() {
  if (memberPoolId.value)
    poolsStore.setPoolHeroes(memberPoolId.value, selectedHeroIds.value)
  memberModalOpen.value = false
}

function openDelete(id: string) {
  deletePoolId.value = id
  deleteModalOpen.value = true
}

function confirmDelete() {
  if (deletePoolId.value)
    poolsStore.removePool(deletePoolId.value)
  deleteModalOpen.value = false
}
</script>

<template>
  <div class="space-y-8">
    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-xl font-semibold">
          英雄池
        </h1>
        <UButton icon="i-lucide-plus" class="h-11" @click="openCreate">
          新建
        </UButton>
      </div>

      <p v-if="!poolsStore.pools.length" class="text-dimmed text-sm">
        还没有自定义池。建一个只装你会玩的英雄，抽签时就只从里面抽。
      </p>

      <article
        v-for="pool in poolsStore.pools"
        :key="pool.id"
        class="border-default bg-elevated rounded-card shadow-card p-4 border space-y-3"
      >
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="font-semibold truncate">
            {{ pool.name }}
          </h2>
          <span class="text-gold-700 dark:text-gold-300 shrink-0 text-sm font-medium">{{ pool.heroIds.length }} 个英雄</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton icon="i-lucide-list-checks" size="sm" color="neutral" variant="soft" class="h-11" @click="openMembers(pool.id)">
            编辑成员
          </UButton>
          <UButton icon="i-lucide-pencil" size="sm" color="neutral" variant="ghost" class="h-11" @click="openRename(pool.id)">
            重命名
          </UButton>
          <UButton
            icon="i-lucide-trash-2"
            size="sm"
            color="error"
            variant="ghost"
            class="h-11"
            :aria-label="`删除英雄池 ${pool.name}`"
            @click="openDelete(pool.id)"
          >
            删除
          </UButton>
        </div>
      </article>
    </section>

    <section class="space-y-3">
      <div class="flex items-baseline justify-between">
        <SectionTitle title="全部英雄" />
        <span class="text-dimmed text-xs">{{ browseHeroes.length }} 位</span>
      </div>
      <LaneFilterTabs v-model="browseLane" label="浏览列表分路筛选" />
      <ul class="gap-3 grid grid-cols-2 sm:grid-cols-3">
        <li
          v-for="hero in browseHeroes"
          :key="hero.id"
          class="flex items-center gap-2 min-w-0"
        >
          <HeroAvatar :name="hero.name" :official-id="hero.officialId" size="sm" />
          <span class="min-w-0">
            <span class="block truncate text-sm font-medium">{{ hero.name }}</span>
            <span class="text-dimmed block truncate text-xs">{{ hero.lanes.join('/') }}</span>
          </span>
        </li>
      </ul>
    </section>

    <UModal v-model:open="nameModalOpen" :title="editingId ? '重命名英雄池' : '新建英雄池'">
      <template #body>
        <UInput
          v-model="nameInput"
          placeholder="例如：我会玩的英雄"
          size="lg"
          class="h-11 w-full"
          :maxlength="20"
          @keydown.enter="submitName"
        />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" class="h-11" @click="nameModalOpen = false">
            取消
          </UButton>
          <UButton class="h-11" :disabled="!nameInput.trim()" @click="submitName">
            确定
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="memberModalOpen" :title="`编辑「${memberPool?.name ?? ''}」`">
      <template #body>
        <p class="text-muted text-sm">
          已选 <span class="text-gold-700 dark:text-gold-300 font-semibold">{{ selectedHeroIds.length }}</span> / {{ heroes.length }}
        </p>
        <div class="mt-3">
          <LaneFilterTabs v-model="memberLane" label="选择池成员分路筛选" />
        </div>
        <div class="mt-3 max-h-[55vh] space-y-0.5 overflow-y-auto">
          <label
            v-for="hero in memberHeroes"
            :key="hero.id"
            class="hover:bg-elevated min-h-11 rounded-control flex cursor-pointer items-center gap-3 px-2 py-1.5"
          >
            <UCheckbox
              :model-value="selectedHeroIds.includes(hero.id)"
              :ui="{ base: 'rounded-[4px]' }"
              @update:model-value="toggleHero(hero.id)"
            />
            <HeroAvatar :name="hero.name" :official-id="hero.officialId" size="sm" />
            <span class="flex-1 truncate">{{ hero.name }}</span>
            <span class="text-dimmed shrink-0 text-xs">{{ hero.lanes.join('/') }}</span>
          </label>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" class="h-11" @click="memberModalOpen = false">
            取消
          </UButton>
          <UButton class="h-11" @click="submitMembers">
            保存
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteModalOpen" title="删除英雄池">
      <template #body>
        <p>确定删除「{{ deleteTarget?.name ?? '' }}」吗？删除后无法恢复。</p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" class="h-11" @click="deleteModalOpen = false">
            取消
          </UButton>
          <UButton color="error" class="h-11" @click="confirmDelete">
            删除
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
