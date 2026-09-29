<script setup lang="ts">
import { heroes } from '~/constants/heroes'
import { usePoolsStore } from '~/stores/pools'

const poolsStore = usePoolsStore()

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
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">
          英雄池
        </h1>
        <UButton icon="i-lucide-plus" @click="openCreate">
          新建
        </UButton>
      </div>

      <p v-if="!poolsStore.pools.length" class="text-dimmed text-sm">
        还没有自定义池。建一个只装你会玩的英雄，抽签时就只从里面抽。
      </p>

      <article
        v-for="pool in poolsStore.pools"
        :key="pool.id"
        class="border-default bg-elevated p-4 border rounded-xl space-y-3"
      >
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="font-semibold truncate">
            {{ pool.name }}
          </h2>
          <span class="text-dimmed text-xs shrink-0">{{ pool.heroIds.length }} 个英雄</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton icon="i-lucide-list-checks" size="sm" color="neutral" variant="soft" @click="openMembers(pool.id)">
            编辑成员
          </UButton>
          <UButton icon="i-lucide-pencil" size="sm" color="neutral" variant="ghost" @click="openRename(pool.id)">
            重命名
          </UButton>
          <UButton
            icon="i-lucide-trash-2"
            size="sm"
            color="error"
            variant="ghost"
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
        <h2 class="text-muted text-sm font-medium">
          全部英雄
        </h2>
        <span class="text-dimmed text-xs">{{ heroes.length }} 位</span>
      </div>
      <ul class="gap-x-4 gap-y-1 grid grid-cols-2 sm:grid-cols-3">
        <li
          v-for="hero in heroes"
          :key="hero.id"
          class="flex items-center justify-between gap-2 text-sm"
        >
          <span class="truncate">{{ hero.name }}</span>
          <span class="text-dimmed text-xs shrink-0">{{ hero.lanes.join('/') }}</span>
        </li>
      </ul>
    </section>

    <UModal v-model:open="nameModalOpen" :title="editingId ? '重命名英雄池' : '新建英雄池'">
      <template #body>
        <UInput
          v-model="nameInput"
          placeholder="例如：我会玩的英雄"
          size="lg"
          class="w-full"
          :maxlength="20"
          @keydown.enter="submitName"
        />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="nameModalOpen = false">
            取消
          </UButton>
          <UButton :disabled="!nameInput.trim()" @click="submitName">
            确定
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="memberModalOpen" :title="`编辑「${memberPool?.name ?? ''}」`">
      <template #body>
        <p class="text-muted text-sm">
          已选 {{ selectedHeroIds.length }} / {{ heroes.length }}
        </p>
        <div class="mt-3 space-y-0.5 max-h-[55vh] overflow-y-auto">
          <label
            v-for="hero in heroes"
            :key="hero.id"
            class="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-elevated"
          >
            <UCheckbox
              :model-value="selectedHeroIds.includes(hero.id)"
              @update:model-value="toggleHero(hero.id)"
            />
            <span class="flex-1 truncate">{{ hero.name }}</span>
            <span class="text-dimmed text-xs shrink-0">{{ hero.lanes.join('/') }}</span>
          </label>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="memberModalOpen = false">
            取消
          </UButton>
          <UButton @click="submitMembers">
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
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="deleteModalOpen = false">
            取消
          </UButton>
          <UButton color="error" @click="confirmDelete">
            删除
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
