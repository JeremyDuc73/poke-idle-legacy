<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue'
import { Trophy, Crown, Star, Coins, Medal, BookOpen, Sparkles, Flame, Gem } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { useAuthStore } from '~/stores/useAuthStore'

definePageMeta({ layout: 'game' })

const { t } = useLocale()
const auth = useAuthStore()
const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return `${API_BASE}/api/avatars/${path.split('/').pop()}`
}

const GENERATION_NAMES: Record<number, string> = {
  1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh', 5: 'Unys',
  6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea',
}

interface LeaderboardEntry {
  id: number
  username: string
  level: number
  badges: number
  gold: number
  current_generation: number
  avatar_url: string | null
  total_pokemon: number
  unique_pokemon: number
  shiny_count: number
  legendary_count: number
  shiny_legendary_count: number
}

interface GeneralEntry {
  id: number
  username: string
  current_generation: number
  level: number
  avatar_url: string | null
  avgRank: number
}

interface Category {
  id: string
  labelFr: string
  labelEn: string
  icon: Component
  color: string
  gradient: string
  field: keyof LeaderboardEntry
  format: (val: number, entry: LeaderboardEntry) => string
}

const CATEGORIES: Category[] = [
  { id: 'level', labelFr: 'Niveau', labelEn: 'Level', icon: Star, color: 'text-blue-400', gradient: 'from-blue-500/20 to-cyan-500/10', field: 'level', format: (val) => `Lv. ${val}` },
  { id: 'gold', labelFr: 'Richesse', labelEn: 'Wealth', icon: Coins, color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-amber-500/10', field: 'gold', format: (val) => val.toLocaleString() },
  { id: 'badges', labelFr: 'Badges', labelEn: 'Badges', icon: Medal, color: 'text-amber-400', gradient: 'from-amber-500/20 to-orange-500/10', field: 'badges', format: (val, entry) => `${val} · ${GENERATION_NAMES[entry.current_generation] ?? '???'}` },
  { id: 'unique_pokemon', labelFr: 'Pokédex', labelEn: 'Pokédex', icon: BookOpen, color: 'text-red-400', gradient: 'from-red-500/20 to-pink-500/10', field: 'unique_pokemon', format: (val) => `${val}` },
  { id: 'shiny_count', labelFr: 'Shiny', labelEn: 'Shiny', icon: Sparkles, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-teal-500/10', field: 'shiny_count', format: (val) => `${val}` },
  { id: 'legendary_count', labelFr: 'Légendaires', labelEn: 'Legendaries', icon: Flame, color: 'text-orange-400', gradient: 'from-orange-500/20 to-red-500/10', field: 'legendary_count', format: (val) => `${val}` },
  { id: 'shiny_legendary_count', labelFr: 'Légendaires Shiny', labelEn: 'Shiny Legendaries', icon: Gem, color: 'text-pink-400', gradient: 'from-pink-500/20 to-rose-500/10', field: 'shiny_legendary_count', format: (val) => `${val}` },
]

const data = ref<LeaderboardEntry[]>([])
const loading = ref(true)
const error = ref(false)
const activeCategory = ref('general')
const expandedCategory = ref<string | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const currentCategory = computed(() => CATEGORIES.find(c => c.id === activeCategory.value))

function getRanking(cat: Category): LeaderboardEntry[] {
  return [...data.value].sort((a, b) => (b[cat.field] as number) - (a[cat.field] as number))
}

// General ranking: average position across categories where the player has > 0
const generalRanking = computed<GeneralEntry[]>(() => {
  if (data.value.length === 0) return []
  const rankMaps: { cat: Category; map: Map<number, number> }[] = CATEGORIES.map(cat => {
    const sorted = getRanking(cat)
    const map = new Map<number, number>()
    sorted.forEach((e, i) => map.set(e.id, i + 1))
    return { cat, map }
  })
  return data.value.map(entry => {
    // Only count categories where the player has a value > 0
    const validRanks: number[] = []
    for (const { cat, map } of rankMaps) {
      const val = entry[cat.field] as number
      if (val > 0) {
        validRanks.push(map.get(entry.id) ?? data.value.length)
      }
    }
    const avgRank = validRanks.length > 0
      ? validRanks.reduce((s, r) => s + r, 0) / validRanks.length
      : data.value.length
    return { id: entry.id, username: entry.username, current_generation: entry.current_generation, level: entry.level, avatar_url: entry.avatar_url, avgRank }
  }).sort((a, b) => a.avgRank - b.avgRank)
})

const currentRanking = computed(() => {
  if (!currentCategory.value) return [] // general tab
  return getRanking(currentCategory.value)
})

const podiumGeneral = computed<{ first: GeneralEntry; second: GeneralEntry; third: GeneralEntry } | null>(() => {
  if (generalRanking.value.length < 3) return null
  const r = generalRanking.value
  return { first: r[0]!, second: r[1]!, third: r[2]! }
})

const podiumCategory = computed<{ first: LeaderboardEntry; second: LeaderboardEntry; third: LeaderboardEntry } | null>(() => {
  if (currentRanking.value.length < 3) return null
  const r = currentRanking.value
  return { first: r[0]!, second: r[1]!, third: r[2]! }
})

function getMedalClass(rank: number): string {
  if (rank === 0) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900 shadow-lg shadow-yellow-500/30'
  if (rank === 1) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-lg shadow-slate-400/30'
  if (rank === 2) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100 shadow-lg shadow-amber-600/30'
  return 'bg-slate-700/50 text-slate-400'
}

function getRankLabel(rank: number): string {
  return `${rank + 1}`
}

function isMeId(id: number): boolean {
  return auth.user?.id === id
}

async function loadLeaderboard() {
  loading.value = true
  error.value = false
  try {
    const response = await fetch(`${API_BASE}/api/leaderboard`, { credentials: 'include' })
    if (response.ok) {
      data.value = await response.json()
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function silentRefresh() {
  try {
    const response = await fetch(`${API_BASE}/api/leaderboard`, { credentials: 'include' })
    if (response.ok) data.value = await response.json()
  } catch { /* silent */ }
}

function toggleMobileCategory(id: string) {
  expandedCategory.value = expandedCategory.value === id ? null : id
}

onMounted(() => {
  loadLeaderboard()
  refreshInterval = setInterval(silentRefresh, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <!-- Header -->
    <div class="mb-6 text-center">
      <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-yellow-400">
        <Trophy class="h-5 w-5" />
        <span class="text-sm font-bold">{{ t('Classement', 'Leaderboard') }}</span>
      </div>
      <h1 class="text-2xl font-bold text-white sm:text-3xl">{{ t('Hall of Fame', 'Hall of Fame') }}</h1>
      <p class="mt-1 text-xs text-slate-400">
        {{ t('Minimum 2 badges pour apparaître', 'Minimum 2 badges to appear') }}
      </p>
      <p class="mt-2 rounded-lg bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 px-4 py-2 text-xs font-medium italic text-amber-300/80">
        {{ t('Chaque semaine, le top 3 sera récompensé par le comité de la Ligue Pokémon', 'Every week, the top 3 will be rewarded by the Pokémon League committee') }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center gap-4 py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
      <p class="text-sm text-slate-400">{{ t('Chargement...', 'Loading...') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
      <p class="text-red-400">{{ t('Erreur de chargement', 'Loading error') }}</p>
      <button class="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30" @click="loadLeaderboard">
        {{ t('Réessayer', 'Retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="data.length === 0" class="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
      <Trophy class="mx-auto h-12 w-12 text-slate-600" />
      <p class="mt-3 text-slate-400">{{ t('Aucun joueur éligible pour le moment', 'No eligible players yet') }}</p>
    </div>

    <!-- Leaderboard Content -->
    <div v-else>
      <!-- Category tabs -->
      <div class="mb-6 flex flex-wrap justify-center gap-2">
        <!-- General tab -->
        <button
          class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all"
          :class="activeCategory === 'general'
            ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 shadow-lg'
            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'"
          @click="activeCategory = 'general'"
        >
          <Trophy class="h-3.5 w-3.5" />
          <span>{{ t('Général', 'Overall') }}</span>
        </button>
        <button
          v-for="cat in CATEGORIES"
          :key="cat.id"
          class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all"
          :class="activeCategory === cat.id
            ? `border-transparent bg-gradient-to-r ${cat.gradient} ${cat.color} shadow-lg`
            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'"
          @click="activeCategory = cat.id"
        >
          <component :is="cat.icon" class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">{{ t(cat.labelFr, cat.labelEn) }}</span>
        </button>
      </div>

      <!-- ============ GENERAL RANKING ============ -->
      <div v-if="activeCategory === 'general'">
        <div class="overflow-hidden rounded-xl border border-yellow-500/20 bg-slate-800/50 shadow-xl">
          <!-- Header -->
          <div class="border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-500/15 px-6 py-4">
            <div class="flex items-center gap-3">
              <Trophy class="h-6 w-6 text-yellow-400" />
              <div>
                <h2 class="text-lg font-bold text-white">{{ t('Classement Général', 'Overall Ranking') }}</h2>
                <p class="text-xs text-slate-400">{{ t('Moyenne des positions sur tous les classements', 'Average position across all rankings') }}</p>
              </div>
            </div>
          </div>

          <!-- Podium -->
          <div v-if="podiumGeneral" class="border-b border-slate-700/50 px-4 py-8 sm:px-6">
            <div class="grid grid-cols-3 items-end gap-3 sm:gap-6">
              <!-- 2nd -->
              <div class="flex flex-col items-center gap-2">
                <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-slate-400/50 sm:h-20 sm:w-20" :class="getMedalClass(1)">
                  <img v-if="podiumGeneral.second.avatar_url" :src="getAvatarUrl(podiumGeneral.second.avatar_url)!" alt="" class="h-full w-full object-cover" />
                  <span v-else class="text-2xl font-black sm:text-3xl">2</span>
                </div>
                <span class="text-center text-xs font-bold sm:text-sm" :class="isMeId(podiumGeneral.second.id) ? 'text-yellow-300' : 'text-white'">
                  {{ podiumGeneral.second.username }}
                </span>
                <span class="text-[10px] text-slate-400">{{ t('Score', 'Score') }}: {{ podiumGeneral.second.avgRank.toFixed(1) }}</span>
              </div>
              <!-- 1st -->
              <div class="flex flex-col items-center gap-2">
                <Crown class="h-6 w-6 text-yellow-400 sm:h-7 sm:w-7" />
                <div class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20 sm:h-24 sm:w-24" :class="getMedalClass(0)">
                  <img v-if="podiumGeneral.first.avatar_url" :src="getAvatarUrl(podiumGeneral.first.avatar_url)!" alt="" class="h-full w-full object-cover" />
                  <span v-else class="text-3xl font-black sm:text-4xl">1</span>
                </div>
                <span class="text-center text-sm font-bold sm:text-base" :class="isMeId(podiumGeneral.first.id) ? 'text-yellow-300' : 'text-white'">
                  {{ podiumGeneral.first.username }}
                </span>
                <span class="text-[10px] text-yellow-400">{{ t('Score', 'Score') }}: {{ podiumGeneral.first.avgRank.toFixed(1) }}</span>
              </div>
              <!-- 3rd -->
              <div class="flex flex-col items-center gap-2">
                <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber-600/50 sm:h-20 sm:w-20" :class="getMedalClass(2)">
                  <img v-if="podiumGeneral.third.avatar_url" :src="getAvatarUrl(podiumGeneral.third.avatar_url)!" alt="" class="h-full w-full object-cover" />
                  <span v-else class="text-2xl font-black sm:text-3xl">3</span>
                </div>
                <span class="text-center text-xs font-bold sm:text-sm" :class="isMeId(podiumGeneral.third.id) ? 'text-yellow-300' : 'text-white'">
                  {{ podiumGeneral.third.username }}
                </span>
                <span class="text-[10px] text-slate-400">{{ t('Score', 'Score') }}: {{ podiumGeneral.third.avgRank.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- Full list -->
          <div class="divide-y divide-slate-700/30">
            <div
              v-for="(entry, idx) in generalRanking"
              :key="entry.id"
              class="flex items-center gap-4 px-4 py-3 transition-colors sm:px-6"
              :class="[
                isMeId(entry.id) ? 'bg-yellow-500/5' : 'hover:bg-slate-700/20',
                idx < 3 && podiumGeneral ? 'hidden' : ''
              ]"
            >
              <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-black" :class="getMedalClass(idx)">
                <img v-if="entry.avatar_url" :src="getAvatarUrl(entry.avatar_url)!" alt="" class="h-full w-full object-cover" />
                <template v-else>{{ getRankLabel(idx) }}</template>
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-sm font-bold" :class="isMeId(entry.id) ? 'text-yellow-300' : 'text-white'">
                  {{ entry.username }}
                  <span v-if="isMeId(entry.id)" class="ml-1 text-[10px] text-yellow-500">({{ t('vous', 'you') }})</span>
                </span>
                <span class="ml-2 text-[10px] text-slate-500">
                  {{ GENERATION_NAMES[entry.current_generation] ?? '???' }} · Lv.{{ entry.level }}
                </span>
              </div>
              <span class="text-sm font-bold text-yellow-400">{{ entry.avgRank.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ CATEGORY RANKING ============ -->
      <div v-else-if="currentCategory">
        <div class="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 shadow-xl">
          <!-- Category header -->
          <div class="border-b border-slate-700 bg-gradient-to-r px-6 py-4" :class="currentCategory.gradient">
            <div class="flex items-center gap-3">
              <component :is="currentCategory.icon" class="h-6 w-6" />
              <div>
                <h2 class="text-lg font-bold text-white">{{ t(currentCategory.labelFr, currentCategory.labelEn) }}</h2>
                <p class="text-xs text-slate-400">{{ currentRanking.length }} {{ t('joueurs', 'players') }}</p>
              </div>
            </div>
          </div>

          <!-- Podium -->
          <div v-if="podiumCategory" class="border-b border-slate-700/50 px-4 py-8 sm:px-6">
            <div class="grid grid-cols-3 items-end gap-3 sm:gap-6">
              <!-- 2nd -->
              <div class="flex flex-col items-center gap-2">
                <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-slate-400/50 sm:h-20 sm:w-20" :class="getMedalClass(1)">
                  <img v-if="podiumCategory.second.avatar_url" :src="getAvatarUrl(podiumCategory.second.avatar_url)!" alt="" class="h-full w-full object-cover" />
                  <span v-else class="text-2xl font-black sm:text-3xl">2</span>
                </div>
                <span class="text-center text-xs font-bold sm:text-sm" :class="isMeId(podiumCategory.second.id) ? 'text-yellow-300' : 'text-white'">
                  {{ podiumCategory.second.username }}
                </span>
                <span class="text-sm font-bold sm:text-base" :class="currentCategory.color">
                  {{ currentCategory.format(podiumCategory.second[currentCategory.field] as number, podiumCategory.second) }}
                </span>
              </div>
              <!-- 1st -->
              <div class="flex flex-col items-center gap-2">
                <Crown class="h-6 w-6 text-yellow-400 sm:h-7 sm:w-7" />
                <div class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20 sm:h-24 sm:w-24" :class="getMedalClass(0)">
                  <img v-if="podiumCategory.first.avatar_url" :src="getAvatarUrl(podiumCategory.first.avatar_url)!" alt="" class="h-full w-full object-cover" />
                  <span v-else class="text-3xl font-black sm:text-4xl">1</span>
                </div>
                <span class="text-center text-sm font-bold sm:text-base" :class="isMeId(podiumCategory.first.id) ? 'text-yellow-300' : 'text-white'">
                  {{ podiumCategory.first.username }}
                </span>
                <span class="text-lg font-bold sm:text-xl" :class="currentCategory.color">
                  {{ currentCategory.format(podiumCategory.first[currentCategory.field] as number, podiumCategory.first) }}
                </span>
              </div>
              <!-- 3rd -->
              <div class="flex flex-col items-center gap-2">
                <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber-600/50 sm:h-20 sm:w-20" :class="getMedalClass(2)">
                  <img v-if="podiumCategory.third.avatar_url" :src="getAvatarUrl(podiumCategory.third.avatar_url)!" alt="" class="h-full w-full object-cover" />
                  <span v-else class="text-2xl font-black sm:text-3xl">3</span>
                </div>
                <span class="text-center text-xs font-bold sm:text-sm" :class="isMeId(podiumCategory.third.id) ? 'text-yellow-300' : 'text-white'">
                  {{ podiumCategory.third.username }}
                </span>
                <span class="text-sm font-bold sm:text-base" :class="currentCategory.color">
                  {{ currentCategory.format(podiumCategory.third[currentCategory.field] as number, podiumCategory.third) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rest of ranking -->
          <div class="divide-y divide-slate-700/30">
            <div
              v-for="(entry, idx) in currentRanking"
              :key="entry.id"
              class="flex items-center gap-4 px-4 py-3 transition-colors sm:px-6"
              :class="[
                isMeId(entry.id) ? 'bg-yellow-500/5' : 'hover:bg-slate-700/20',
                idx < 3 && podiumCategory ? 'hidden' : ''
              ]"
            >
              <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-black" :class="getMedalClass(idx)">
                <img v-if="entry.avatar_url" :src="getAvatarUrl(entry.avatar_url)!" alt="" class="h-full w-full object-cover" />
                <template v-else>{{ getRankLabel(idx) }}</template>
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-sm font-bold" :class="isMeId(entry.id) ? 'text-yellow-300' : 'text-white'">
                  {{ entry.username }}
                  <span v-if="isMeId(entry.id)" class="ml-1 text-[10px] text-yellow-500">({{ t('vous', 'you') }})</span>
                </span>
                <span class="ml-2 text-[10px] text-slate-500">
                  {{ GENERATION_NAMES[entry.current_generation] ?? '???' }} · Lv.{{ entry.level }}
                </span>
              </div>
              <span class="text-sm font-bold" :class="currentCategory.color">
                {{ currentCategory.format(entry[currentCategory.field] as number, entry) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.25s ease;
  max-height: 600px;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
