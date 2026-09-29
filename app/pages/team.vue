<script setup lang="ts">
import { useHistoryStore } from '~/stores/history'
import { usePlayersStore } from '~/stores/players'
import { createId } from '~/utils/id'
import { PLAYER_COUNT_MAX } from '~/utils/players'
import { splitTeams } from '~/utils/teams'

interface TeamMember {
  id: string
  name: string
}

const PER_TEAM_MIN = 1
const PER_TEAM_MAX = 5

const playersStore = usePlayersStore()
const historyStore = useHistoryStore()

const { rolling, reveal } = useReveal()

const perTeam = ref<number | null>(5)
/** UInputNumber 被清空时会把值置为 undefined，这里保留上一档合法值，避免页面出现 NaN 并误裁名单 */
const teamSize = ref(5)
const teams = ref<[TeamMember[], TeamMember[]] | null>(null)
const rollTeams = ref<[string[], string[]]>([[], []])

const capacity = computed(() => teamSize.value * 2)

const hint = computed(() => {
  const total = playersStore.players.length
  const parts: string[] = []
  if (total !== capacity.value)
    parts.push(`名单 ${total} 人，与两队容量 ${capacity.value} 人不符，将按实际人数均分`)
  if (total % 2 === 1)
    parts.push('人数为奇数，随机一队会多 1 人')
  return parts.join('；')
})

watch(perTeam, (value) => {
  if (!Number.isFinite(value))
    return
  teamSize.value = Math.min(PER_TEAM_MAX, Math.max(PER_TEAM_MIN, Math.floor(value as number)))
}, { immediate: true })

// 槽位数随每队人数联动
watch(teamSize, value => playersStore.setCount(value * 2), { immediate: true })

function rollTick() {
  rollTeams.value = splitTeams(playersStore.resolvedPlayers.map(player => player.name))
}

async function startSplit() {
  const [first, second] = splitTeams(playersStore.resolvedPlayers)
  await reveal(() => {
    teams.value = [first, second]
    historyStore.add({
      id: createId('h'),
      type: 'team',
      createdAt: Date.now(),
      teams: [first.map(member => member.name), second.map(member => member.name)],
    })
  }, rollTick)
}

function backToEdit() {
  teams.value = null
}
</script>

<template>
  <section v-if="rolling" class="space-y-4">
    <h1 class="text-xl font-semibold">
      分组中…
    </h1>
    <div class="gap-3 grid grid-cols-1 sm:grid-cols-2">
      <article
        v-for="(team, index) in rollTeams"
        :key="index"
        class="border-default bg-elevated rounded-card p-4 border"
      >
        <h2 class="text-lg font-semibold">
          队伍 {{ index === 0 ? 'A' : 'B' }}
        </h2>
        <ol class="mt-2 space-y-1">
          <li v-for="(name, i) in team" :key="i" class="text-gold-700 dark:text-gold-300 text-xl font-medium animate-pulse">
            {{ name }}
          </li>
        </ol>
      </article>
    </div>
  </section>

  <section v-else-if="!teams" class="space-y-6">
    <h1 class="text-xl font-semibold">
      抽队友
    </h1>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <SectionTitle title="每队人数" />
        <!-- increment/decrement 传对象会展开到内部按钮上，用来把步进按钮撑到 44px 触屏目标 -->
        <UInputNumber
          v-model="perTeam"
          :min="PER_TEAM_MIN"
          :max="PER_TEAM_MAX"
          size="xl"
          :increment="{ class: 'size-11 justify-center' }"
          :decrement="{ class: 'size-11 justify-center' }"
          class="h-11 max-w-1/2"
          aria-label="每队人数"
        />
        <span class="text-dimmed text-xs">
          共 {{ capacity }} 个槽位
        </span>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <SectionTitle title="玩家名单" />
        <span class="text-dimmed text-xs">{{ playersStore.players.length }}/{{ PLAYER_COUNT_MAX }} 人</span>
      </div>
      <PlayerListEditor />
      <p v-if="hint" class="text-warning text-xs">
        {{ hint }}
      </p>
    </div>

    <ActionBar>
      <UButton
        icon="i-lucide-users"
        size="xl"
        block
        @click="startSplit"
      >
        开始抽签
      </UButton>
    </ActionBar>
  </section>

  <section v-else class="space-y-4">
    <h1 class="text-xl font-semibold">
      分组结果
    </h1>

    <div class="gap-3 grid grid-cols-1 sm:grid-cols-2">
      <article
        v-for="(team, index) in teams"
        :key="index"
        class="border-default bg-elevated rounded-card shadow-card p-4 border relative overflow-hidden"
      >
        <span class="via-gold-500/70 absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" aria-hidden="true" />
        <div class="flex items-baseline justify-between">
          <h2 class="text-lg font-semibold">
            队伍 {{ index === 0 ? 'A' : 'B' }}
          </h2>
          <span class="text-dimmed text-xs">{{ team.length }} 人</span>
        </div>
        <ol class="mt-3 space-y-2">
          <li
            v-for="(member, i) in team"
            :key="member.id"
            class="flex items-center gap-3"
          >
            <span class="bg-gold-500/15 text-gold-700 dark:text-gold-300 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {{ i + 1 }}
            </span>
            <span class="text-lg font-medium truncate">{{ member.name }}</span>
          </li>
        </ol>
      </article>
    </div>

    <p v-if="hint" class="text-warning text-xs">
      {{ hint }}
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
          @click="startSplit"
        >
          重新分组
        </UButton>
      </div>
    </ActionBar>
  </section>
</template>
