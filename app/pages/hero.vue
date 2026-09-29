<script setup lang="ts">
import type { Hero } from '~/constants/heroes'
import { heroes } from '~/constants/heroes'
import { useHistoryStore } from '~/stores/history'
import { usePlayersStore } from '~/stores/players'
import { ALL_HEROES_ID, usePoolsStore } from '~/stores/pools'
import { drawHeroes, pickHero } from '~/utils/draw'
import { createId } from '~/utils/id'
import { PLAYER_COUNT_MAX } from '~/utils/players'
import { resolvePoolHeroes } from '~/utils/pool'

interface DrawnHero {
  playerId: string
  playerName: string
  hero: Hero
}

const playersStore = usePlayersStore()
const poolsStore = usePoolsStore()
const historyStore = useHistoryStore()

const { rolling, reveal } = useReveal()

const results = ref<DrawnHero[] | null>(null)
const rollHeroes = ref<Hero[]>([])

const playerCount = computed(() => playersStore.players.length)

/** 当前生效的英雄池：选中自定义池则取其成员，否则为全部英雄 */
const poolHeroes = computed(() => {
  const pool = poolsStore.selectedPool
  return pool ? resolvePoolHeroes(heroes, pool.heroIds) : heroes
})

const poolItems = computed(() => [
  { label: `全部英雄（${heroes.length}）`, value: ALL_HEROES_ID },
  ...poolsStore.pools.map(pool => ({
    label: `${pool.name}（${resolvePoolHeroes(heroes, pool.heroIds).length}）`,
    value: pool.id,
  })),
])

const canDraw = computed(() => poolHeroes.value.length >= playerCount.value)

const blockedReason = computed(() => (canDraw.value
  ? ''
  : `当前英雄池只有 ${poolHeroes.value.length} 个英雄，少于 ${playerCount.value} 位玩家，请减少玩家或补充英雄。`))

/** 单人重抽需要池内至少留一个空位，否则无英雄可换 */
const canRedrawOne = computed(() => poolHeroes.value.length > playerCount.value)

function rollTick() {
  const pool = poolHeroes.value
  rollHeroes.value = playersStore.players.map(() => pool[Math.floor(Math.random() * pool.length)]!)
}

function recordDraw(drawn: DrawnHero[]) {
  historyStore.add({
    id: createId('h'),
    type: 'hero',
    createdAt: Date.now(),
    entries: drawn.map(item => ({
      playerName: item.playerName,
      heroName: item.hero.name,
      lanes: item.hero.lanes,
    })),
  })
}

async function startDraw() {
  const entries = playersStore.resolvedPlayers
  const picked = drawHeroes(poolHeroes.value, entries.length)
  const drawn = entries.map((entry, index) => ({
    playerId: entry.id,
    playerName: entry.name,
    hero: picked[index]!,
  }))
  await reveal(() => {
    results.value = drawn
    recordDraw(drawn)
  }, rollTick)
}

function backToEdit() {
  results.value = null
}

/** 单独重抽：只换该玩家的英雄，排除本局已占用的全部英雄（含其原英雄） */
function redrawOne(playerId: string) {
  if (!results.value)
    return
  const occupied = results.value.map(item => item.hero.id)
  const hero = pickHero(poolHeroes.value, occupied)
  results.value = results.value.map(item => (item.playerId === playerId ? { ...item, hero } : item))
}

async function redrawAll() {
  if (!results.value)
    return
  const base = results.value
  const picked = drawHeroes(poolHeroes.value, base.length)
  const drawn = base.map((item, index) => ({ ...item, hero: picked[index]! }))
  await reveal(() => {
    results.value = drawn
    recordDraw(drawn)
  }, rollTick)
}
</script>

<template>
  <section v-if="rolling" class="space-y-4">
    <h1 class="text-xl font-semibold">
      抽签中…
    </h1>
    <div class="gap-3 grid grid-cols-2 lg:grid-cols-3">
      <article
        v-for="(hero, index) in rollHeroes"
        :key="index"
        class="border-default bg-elevated rounded-card gap-2 p-3 border flex flex-col items-center text-center sm:p-4"
      >
        <HeroAvatar :name="hero.name" :official-id="hero.officialId" />
        <p class="text-muted w-full truncate text-xs">
          {{ playersStore.resolvedPlayers[index]?.name ?? '' }}
        </p>
        <p class="text-gold-700 dark:text-gold-300 w-full truncate text-xl font-bold tracking-tight animate-pulse sm:text-3xl">
          {{ hero.name }}
        </p>
        <!-- 与结果卡同构：真实分路徽标 + 等高的按钮占位，揭晓后不跳版 -->
        <div class="flex flex-wrap justify-center gap-1">
          <UBadge
            v-for="lane in hero.lanes"
            :key="lane"
            color="primary"
            variant="subtle"
            size="md"
          >
            {{ lane }}
          </UBadge>
        </div>
        <div class="mt-auto h-11 w-full" aria-hidden="true" />
      </article>
    </div>
  </section>

  <section v-else-if="!results" class="space-y-6">
    <h1 class="text-xl font-semibold">
      抽英雄
    </h1>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <SectionTitle title="玩家名单" />
        <span class="text-dimmed text-xs">{{ playerCount }}/{{ PLAYER_COUNT_MAX }} 人</span>
      </div>
      <PlayerListEditor />
    </div>

    <div class="space-y-3">
      <SectionTitle title="英雄池" />
      <USelect
        v-model="poolsStore.selectedPoolId"
        :items="poolItems"
        size="lg"
        class="h-11 w-full"
        aria-label="选择英雄池"
      />
      <p v-if="blockedReason" class="text-warning text-xs">
        {{ blockedReason }}
      </p>
    </div>

    <ActionBar>
      <UButton
        icon="i-lucide-sparkles"
        size="xl"
        block
        :disabled="!canDraw"
        @click="startDraw"
      >
        开始抽签
      </UButton>
    </ActionBar>
  </section>

  <section v-else class="space-y-4">
    <h1 class="text-xl font-semibold">
      抽签结果
    </h1>

    <div class="gap-3 grid grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in results"
        :key="item.playerId"
        class="border-default bg-elevated rounded-card shadow-card gap-2 p-3 border relative flex flex-col items-center text-center sm:p-4"
      >
        <span class="via-gold-500/70 absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" aria-hidden="true" />
        <HeroAvatar :name="item.hero.name" :official-id="item.hero.officialId" />
        <p class="text-muted w-full truncate text-xs">
          {{ item.playerName }}
        </p>
        <!-- 字号跟着卡片宽度走：移动端两列时卡片约 165px，用 xl 才不会挤爆长名 -->
        <p class="w-full text-xl font-bold tracking-tight leading-tight break-words sm:text-3xl">
          {{ item.hero.name }}
        </p>
        <div class="flex flex-wrap justify-center gap-1">
          <UBadge
            v-for="lane in item.hero.lanes"
            :key="lane"
            color="primary"
            variant="subtle"
            size="md"
          >
            {{ lane }}
          </UBadge>
        </div>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="soft"
          size="md"
          class="mt-auto h-11 w-full justify-center"
          :disabled="!canRedrawOne"
          :aria-label="`重抽 ${item.playerName} 的英雄`"
          @click="redrawOne(item.playerId)"
        >
          重抽
        </UButton>
      </article>
    </div>

    <p v-if="blockedReason" class="text-warning text-xs">
      {{ blockedReason }}
    </p>
    <p v-else-if="!canRedrawOne" class="text-warning text-xs">
      当前英雄池刚好用满，单人重抽没有可换的英雄，可用「全部重抽」。
    </p>

    <ActionBar>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="h-12 flex-1 justify-center"
          @click="backToEdit"
        >
          返回修改名单
        </UButton>
        <UButton
          icon="i-lucide-refresh-cw"
          size="lg"
          class="h-12 flex-1 justify-center"
          :disabled="!canDraw"
          @click="redrawAll"
        >
          全部重抽
        </UButton>
      </div>
    </ActionBar>
  </section>
</template>
