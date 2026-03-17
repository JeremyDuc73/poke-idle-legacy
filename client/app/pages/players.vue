<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, UsersRound, Trophy, Award, Crown, Sparkles, ChevronDown, ChevronUp, X, MapPin, Swords, Clock, Star, TrendingUp, Eye } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { getStaticSpriteUrl, getStaticShinySpriteUrl } from '~/utils/showdown'
import { GENERATIONS } from '~/data/zones'

definePageMeta({ layout: 'game' })

const { t } = useLocale()
const API_BASE = useRuntimeConfig().public.apiBase

const GENERATION_NAMES: Record<number, { fr: string; en: string }> = {
  1: { fr: 'Kanto', en: 'Kanto' },
  2: { fr: 'Johto', en: 'Johto' },
  3: { fr: 'Hoenn', en: 'Hoenn' },
  4: { fr: 'Sinnoh', en: 'Sinnoh' },
  5: { fr: 'Unys', en: 'Unova' },
  6: { fr: 'Kalos', en: 'Kalos' },
  7: { fr: 'Alola', en: 'Alola' },
  8: { fr: 'Galar', en: 'Galar' },
  9: { fr: 'Paldea', en: 'Paldea' },
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

const RARITY_LABELS: Record<string, { fr: string; en: string }> = {
  common: { fr: 'Commun', en: 'Common' },
  rare: { fr: 'Rare', en: 'Rare' },
  epic: { fr: 'Épique', en: 'Epic' },
  legendary: { fr: 'Légendaire', en: 'Legendary' },
}

interface PlayerRow {
  id: number
  username: string
  level: number
  badges: number
  gold: number
  current_generation: number
  avatar_url: string | null
  last_login_at: string | null
  created_at: string
  total_pokemon: number
  unique_pokemon: number
  shiny_count: number
  legendary_count: number
}

interface PlayerDetail {
  id: number
  username: string
  role: string
  gold: number
  level: number
  badges: number
  xp: number
  currentGeneration: number
  currentZone: number
  currentStage: number
  defeatedBosses: string[]
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
  pokemonCount: number
  uniquePokemon: number
  shinyCount: number
  legendaryCount: number
  epicCount: number
  rarityCounts: Record<string, number>
  genCounts: Record<string, number>
  uniqueGenCounts: Record<string, number>
  totalPerGen: Record<string, number>
  teamPokemons: Array<{
    slug: string
    nameFr: string
    nameEn: string
    level: number
    stars: number
    isShiny: boolean
    rarity: string
    dps: number
  }>
  topPokemon: Array<{
    slug: string
    nameFr: string
    nameEn: string
    level: number
    stars: number
    isShiny: boolean
    rarity: string
    dps: number
    gen: number
  }>
  shinyPokemon: Array<{
    slug: string
    nameFr: string
    nameEn: string
    level: number
    stars: number
    rarity: string
    dps: number
    gen: number
  }>
}

const players = ref<PlayerRow[]>([])
const loading = ref(false)
const searchQuery = ref('')
const sortBy = ref<'badges' | 'level' | 'gold' | 'total_pokemon' | 'shiny_count'>('badges')
const sortOrder = ref<'asc' | 'desc'>('desc')
const selectedPlayer = ref<PlayerRow | null>(null)
const playerDetail = ref<PlayerDetail | null>(null)
const showDetailModal = ref(false)
const detailLoading = ref(false)
const topGenFilter = ref<number>(0)

const filteredTopPokemon = computed(() => {
  if (!playerDetail.value) return []
  const list = topGenFilter.value === 0
    ? playerDetail.value.topPokemon
    : playerDetail.value.topPokemon.filter((p) => p.gen === topGenFilter.value)
  return [...list].sort((a, b) => b.dps - a.dps).slice(0, 12)
})

const availableGens = computed(() => {
  if (!playerDetail.value) return []
  const gens = new Set(playerDetail.value.topPokemon.map((p) => p.gen))
  return [...gens].filter((g) => g > 0).sort((a, b) => a - b)
})

const shinyByGen = computed(() => {
  if (!playerDetail.value) return []
  const groups = new Map<number, typeof playerDetail.value.shinyPokemon>()
  for (const p of playerDetail.value.shinyPokemon) {
    if (!groups.has(p.gen)) groups.set(p.gen, [])
    groups.get(p.gen)!.push(p)
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0])
})

const filteredPlayers = computed(() => {
  let filtered = players.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter((p) => p.username.toLowerCase().includes(q))
  }
  return [...filtered].sort((a, b) => {
    const mult = sortOrder.value === 'asc' ? 1 : -1
    return ((a[sortBy.value] as number) - (b[sortBy.value] as number)) * mult
  })
})

function getAvatarUrl(path: string | null): string | null {
  if (!path) return null
  return `${API_BASE}/api/avatars/${path.split('/').pop()}`
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return t('Jamais', 'Never')
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('À l\'instant', 'Just now')
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}${t('j', 'd')}`
  return `${Math.floor(days / 30)}${t('mois', 'mo')}`
}

function genName(gen: number): string {
  const g = GENERATION_NAMES[gen]
  return g ? t(g.fr, g.en) : `Gen ${gen}`
}

function toggleSort(field: typeof sortBy.value) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

function pokeSprite(slug: string, isShiny: boolean) {
  return isShiny ? getStaticShinySpriteUrl(slug) : getStaticSpriteUrl(slug)
}

function getRank(index: number): string {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `#${index + 1}`
}

function isOnline(lastLogin: string | null): boolean {
  if (!lastLogin) return false
  return Date.now() - new Date(lastLogin).getTime() < 5 * 60 * 1000
}

// Total zones completed from gen + zone + stage
function getProgressPercent(detail: PlayerDetail): number {
  const totalZones = GENERATIONS.reduce((s, g) => s + g.zones.length, 0)
  const completedZones = GENERATIONS
    .filter((g) => g.id < detail.currentGeneration)
    .reduce((s, g) => s + g.zones.length, 0)
    + Math.max(0, detail.currentZone - 1)
  return Math.round((completedZones / totalZones) * 100)
}

async function loadPlayers() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/players`)
    if (res.ok) {
      players.value = await res.json()
    }
  } catch (e) {
    console.error('Failed to load players:', e)
  } finally {
    loading.value = false
  }
}

async function openDetail(player: PlayerRow) {
  selectedPlayer.value = player
  showDetailModal.value = true
  playerDetail.value = null
  detailLoading.value = true
  topGenFilter.value = 0
  try {
    const res = await fetch(`${API_BASE}/api/players/${player.id}`)
    if (res.ok) {
      playerDetail.value = await res.json()
    }
  } catch (e) {
    console.error('Failed to load player details:', e)
  } finally {
    detailLoading.value = false
  }
}

onMounted(loadPlayers)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
        <UsersRound class="h-7 w-7 text-blue-400" />
        {{ t('Joueurs', 'Players') }}
      </h1>
      <p class="mt-1 text-sm text-slate-400">
        {{ t(`${players.length} dresseurs enregistrés`, `${players.length} registered trainers`) }}
      </p>
    </div>

    <!-- Search + Sort bar -->
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative flex-1 sm:max-w-xs">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('Rechercher un joueur...', 'Search a player...')"
          class="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in ([
            { key: 'badges', label: t('Badges', 'Badges'), icon: '🏅' },
            { key: 'level', label: t('Niveau', 'Level'), icon: '⚡' },
            { key: 'gold', label: t('Or', 'Gold'), icon: '🪙' },
            { key: 'total_pokemon', label: t('Pokémon', 'Pokémon'), icon: '' },
            { key: 'shiny_count', label: 'Shiny', icon: '✨' },
          ] as const)"
          :key="s.key"
          class="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all"
          :class="sortBy === s.key
            ? 'border-blue-500 bg-blue-500/15 text-blue-400'
            : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-white'"
          @click="toggleSort(s.key)"
        >
          <span v-if="s.key === 'total_pokemon'" class="inline-block h-3 w-3 rounded-full" style="background: linear-gradient(to bottom, #ee1515 50%, #fff 50%); border: 1.5px solid #333" />
          <span v-else>{{ s.icon }}</span>
          <span class="hidden sm:inline">{{ s.label }}</span>
          <ChevronDown v-if="sortBy === s.key && sortOrder === 'desc'" class="h-3 w-3" />
          <ChevronUp v-if="sortBy === s.key && sortOrder === 'asc'" class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Player list -->
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="(player, idx) in filteredPlayers"
        :key="player.id"
        class="group cursor-pointer rounded-xl border border-slate-700/60 bg-slate-800/50 p-3 transition-all hover:border-slate-600 hover:bg-slate-800 sm:p-4"
        @click="openDetail(player)"
      >
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Rank -->
          <div class="w-8 shrink-0 text-center text-sm font-bold" :class="{
            'text-yellow-400': idx === 0,
            'text-slate-300': idx === 1,
            'text-amber-600': idx === 2,
            'text-slate-500': idx > 2,
          }">
            {{ getRank(idx) }}
          </div>

          <!-- Avatar -->
          <div class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700 sm:h-12 sm:w-12">
            <img v-if="player.avatar_url" :src="getAvatarUrl(player.avatar_url)!" alt="" class="h-full w-full object-cover" />
            <UsersRound v-else class="h-5 w-5 text-slate-500" />
            <div
              v-if="isOnline(player.last_login_at)"
              class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-800 bg-green-500"
            />
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="truncate text-sm font-bold text-white sm:text-base">{{ player.username }}</span>
              <span class="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">Lv.{{ player.level }}</span>
            </div>
            <div class="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 sm:gap-3 sm:text-xs">
              <span class="flex items-center gap-0.5">
                <Award class="h-3 w-3 text-yellow-500" />
                <span class="font-bold text-yellow-400">{{ player.badges }}</span>
              </span>
              <span class="hidden sm:inline">{{ genName(player.current_generation) }}</span>
              <span class="flex items-center gap-0.5">
                <span class="inline-block h-3 w-3 rounded-full" style="background: linear-gradient(to bottom, #ee1515 50%, #fff 50%); border: 1px solid #333; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2)" /> {{ player.total_pokemon }}
              </span>
              <span v-if="player.shiny_count > 0" class="flex items-center gap-0.5">
                ✨ {{ player.shiny_count }}
              </span>
              <span v-if="player.legendary_count > 0" class="flex items-center gap-0.5">
                <Crown class="h-3 w-3 text-amber-500" />
                {{ player.legendary_count }}
              </span>
            </div>
          </div>

          <!-- Right side stats -->
          <div class="hidden flex-col items-end gap-1 sm:flex">
            <div class="flex items-center gap-1 text-xs">
              <span class="text-yellow-400">🪙</span>
              <span class="font-bold text-yellow-300">{{ Number(player.gold).toLocaleString() }}</span>
            </div>
            <div class="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock class="h-3 w-3" />
              {{ relativeTime(player.last_login_at) }}
            </div>
          </div>

          <!-- View button -->
          <Eye class="h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-blue-400" />
        </div>
      </div>

      <!-- Empty -->
      <div v-if="filteredPlayers.length === 0 && !loading" class="py-12 text-center text-sm text-slate-500">
        {{ t('Aucun joueur trouvé.', 'No players found.') }}
      </div>
    </div>

    <!-- Player Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedPlayer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        @click="showDetailModal = false"
      >
        <div
          class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                <img v-if="selectedPlayer.avatar_url" :src="getAvatarUrl(selectedPlayer.avatar_url)!" alt="" class="h-full w-full object-cover" />
                <UsersRound v-else class="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">{{ selectedPlayer.username }}</h3>
                <p class="text-xs text-slate-400">
                  <span class="font-bold text-blue-400">Lv.{{ selectedPlayer.level }}</span>
                  · {{ genName(selectedPlayer.current_generation) }}
                </p>
              </div>
            </div>
            <button
              class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              @click="showDetailModal = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Loading -->
          <div v-if="detailLoading" class="flex items-center justify-center py-16">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>

          <div v-else-if="playerDetail" class="space-y-4 p-6">
            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
                <div class="text-[10px] font-bold uppercase tracking-wider text-yellow-500">{{ t('Or', 'Gold') }}</div>
                <div class="mt-1 text-lg font-bold text-yellow-300">{{ playerDetail.gold.toLocaleString() }}</div>
              </div>
              <div class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
                <div class="text-[10px] font-bold uppercase tracking-wider text-blue-500">{{ t('Niveau', 'Level') }}</div>
                <div class="mt-1 text-lg font-bold text-blue-300">{{ playerDetail.level }}</div>
              </div>
              <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <div class="text-[10px] font-bold uppercase tracking-wider text-amber-500">{{ t('Badges', 'Badges') }}</div>
                <div class="mt-1 flex items-center justify-center gap-1">
                  <Award class="h-5 w-5 text-yellow-500" />
                  <span class="text-lg font-bold text-yellow-300">{{ playerDetail.badges }}</span>
                </div>
              </div>
              <div class="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-center">
                <div class="text-[10px] font-bold uppercase tracking-wider text-purple-500">{{ t('Pokémon', 'Pokémon') }}</div>
                <div class="mt-1 text-lg font-bold text-purple-300">{{ playerDetail.pokemonCount }}</div>
              </div>
            </div>

            <!-- Progression -->
            <div class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin class="h-4 w-4 text-green-400" />
                {{ t('Progression', 'Progression') }}
              </h4>
              <div class="mb-3 flex items-center justify-between text-sm">
                <span class="text-slate-400">{{ genName(playerDetail.currentGeneration) }}</span>
                <span class="font-medium text-white">Zone {{ playerDetail.currentZone }} · Stage {{ playerDetail.currentStage }}</span>
              </div>
              <div class="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  style="background: linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)"
                  :style="{ width: `${getProgressPercent(playerDetail)}%` }"
                />
              </div>
              <div class="mt-1 text-right text-[10px] text-slate-500">{{ getProgressPercent(playerDetail) }}%</div>
            </div>

            <!-- Pokémon Stats -->
            <div class="grid gap-3 sm:grid-cols-2">
              <!-- Collection stats -->
              <div class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Sparkles class="h-4 w-4 text-purple-400" />
                  {{ t('Collection', 'Collection') }}
                </h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">{{ t('Total', 'Total') }}</span>
                    <span class="font-bold text-white">{{ playerDetail.pokemonCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">{{ t('Espèces uniques', 'Unique species') }}</span>
                    <span class="font-bold text-purple-400">{{ playerDetail.uniquePokemon }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Shiny</span>
                    <span class="font-bold text-yellow-400">{{ playerDetail.shinyCount }} ✨</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">{{ t('Légendaires', 'Legendaries') }}</span>
                    <span class="font-bold text-amber-400">{{ playerDetail.legendaryCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">{{ t('Épiques', 'Epics') }}</span>
                    <span class="font-bold text-purple-400">{{ playerDetail.epicCount }}</span>
                  </div>
                </div>
              </div>

              <!-- Rarity distribution -->
              <div class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Star class="h-4 w-4 text-amber-400" />
                  {{ t('Raretés', 'Rarities') }}
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="rarity in ['legendary', 'epic', 'rare', 'common']"
                    :key="rarity"
                    class="flex items-center gap-2"
                  >
                    <div class="h-2.5 w-2.5 rounded-full" :style="{ background: RARITY_COLORS[rarity] }" />
                    <span class="flex-1 text-xs text-slate-400">{{ t(RARITY_LABELS[rarity]?.fr ?? rarity, RARITY_LABELS[rarity]?.en ?? rarity) }}</span>
                    <span class="text-xs font-bold" :style="{ color: RARITY_COLORS[rarity] }">
                      {{ playerDetail.rarityCounts[rarity] ?? 0 }}
                    </span>
                    <div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                      <div
                        class="h-full rounded-full transition-all"
                        :style="{
                          background: RARITY_COLORS[rarity],
                          width: `${playerDetail.pokemonCount > 0 ? ((playerDetail.rarityCounts[rarity] ?? 0) / playerDetail.pokemonCount) * 100 : 0}%`
                        }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pokémon per generation -->
            <div v-if="Object.keys(playerDetail.genCounts).length > 0" class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp class="h-4 w-4 text-green-400" />
                {{ t('Pokémon par génération', 'Pokémon per generation') }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="gen in 9"
                  :key="gen"
                  class="flex flex-col items-center rounded-lg border px-3 py-2"
                  :class="(playerDetail?.uniqueGenCounts[gen] ?? 0) >= (playerDetail?.totalPerGen[gen] ?? Infinity)
                    ? 'border-green-500/40 bg-green-500/10'
                    : (playerDetail?.genCounts[gen] ?? 0) > 0
                      ? 'border-slate-700 bg-slate-900/50'
                      : 'border-slate-700 bg-slate-900/50 opacity-30'"
                >
                  <span class="text-[10px] font-bold text-slate-500">Gen {{ gen }}</span>
                  <span class="text-sm font-bold text-white">{{ playerDetail.genCounts[gen] ?? 0 }}</span>
                  <span class="text-[9px] text-slate-600">{{ genName(gen) }}</span>
                  <span
                    v-if="playerDetail.totalPerGen[gen]"
                    class="mt-0.5 text-[8px] font-bold"
                    :class="(playerDetail.uniqueGenCounts[gen] ?? 0) >= playerDetail.totalPerGen[gen]
                      ? 'text-green-400'
                      : 'text-slate-600'"
                  >
                    {{ playerDetail.uniqueGenCounts[gen] ?? 0 }}/{{ playerDetail.totalPerGen[gen] }}
                    <span v-if="(playerDetail.uniqueGenCounts[gen] ?? 0) >= playerDetail.totalPerGen[gen]"> ✅</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Team -->
            <div v-if="playerDetail.teamPokemons.length > 0" class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Swords class="h-4 w-4 text-red-400" />
                {{ t('Équipe actuelle', 'Current team') }}
              </h4>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                <div
                  v-for="(poke, idx) in playerDetail.teamPokemons"
                  :key="idx"
                  class="flex flex-col items-center rounded-xl border p-2 transition-all"
                  :class="poke.isShiny
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : 'border-slate-700 bg-slate-900/50'"
                >
                  <img :src="pokeSprite(poke.slug, poke.isShiny)" alt="" class="h-12 w-12" />
                  <span class="mt-1 text-center text-[10px] font-bold text-white">{{ t(poke.nameFr, poke.nameEn) }}</span>
                  <div class="mt-0.5 flex items-center gap-1">
                    <span class="text-[9px] font-bold text-slate-400">Lv.{{ poke.level }}</span>
                    <span v-if="poke.isShiny" class="text-[9px]">✨</span>
                  </div>
                  <div class="mt-0.5 flex gap-0.5">
                    <span v-for="s in poke.stars" :key="s" class="text-[8px] text-yellow-400">★</span>
                  </div>
                  <span class="mt-0.5 text-[9px] font-bold text-green-400">{{ poke.dps.toLocaleString() }} DPS</span>
                </div>
              </div>
            </div>

            <!-- Top Pokémon -->
            <div v-if="playerDetail.topPokemon.length > 0" class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Crown class="h-4 w-4 text-amber-400" />
                  {{ t('Meilleurs Pokémon', 'Top Pokémon') }}
                </h4>
                <div class="flex flex-wrap gap-1">
                  <button
                    class="rounded-lg border px-2 py-1 text-[10px] font-bold transition-all"
                    :class="topGenFilter === 0
                      ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                      : 'border-slate-700 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-white'"
                    @click="topGenFilter = 0"
                  >
                    {{ t('Toutes', 'All') }}
                  </button>
                  <button
                    v-for="gen in availableGens"
                    :key="gen"
                    class="rounded-lg border px-2 py-1 text-[10px] font-bold transition-all"
                    :class="topGenFilter === gen
                      ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                      : 'border-slate-700 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-white'"
                    @click="topGenFilter = gen"
                  >
                    {{ genName(gen) }}
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                <div
                  v-for="(poke, idx) in filteredTopPokemon"
                  :key="idx"
                  class="flex flex-col items-center rounded-lg border p-2"
                  :class="poke.isShiny
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-slate-700/50 bg-slate-900/30'"
                >
                  <img :src="pokeSprite(poke.slug, poke.isShiny)" alt="" class="h-10 w-10" />
                  <span class="mt-0.5 text-center text-[9px] font-medium text-white">{{ t(poke.nameFr, poke.nameEn) }}</span>
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] text-slate-500">Lv.{{ poke.level }}</span>
                    <span v-if="poke.isShiny" class="text-[8px]">✨</span>
                  </div>
                  <div class="flex gap-0.5">
                    <span v-for="s in poke.stars" :key="s" class="text-[7px] text-yellow-400">★</span>
                  </div>
                  <span
                    class="mt-0.5 rounded px-1 py-0.5 text-[8px] font-bold"
                    :style="{ color: RARITY_COLORS[poke.rarity], background: `${RARITY_COLORS[poke.rarity]}15` }"
                  >
                    {{ t(RARITY_LABELS[poke.rarity]?.fr ?? poke.rarity, RARITY_LABELS[poke.rarity]?.en ?? poke.rarity) }}
                  </span>
                  <span class="mt-0.5 text-[9px] font-bold text-green-400">{{ poke.dps.toLocaleString() }} DPS</span>
                </div>
              </div>
              <div v-if="filteredTopPokemon.length === 0" class="py-4 text-center text-xs text-slate-500">
                {{ t('Aucun Pokémon dans cette région', 'No Pokémon in this region') }}
              </div>
            </div>

            <!-- Shinys par génération -->
            <div v-if="playerDetail.shinyPokemon.length > 0" class="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-400">
                <Sparkles class="h-4 w-4" />
                {{ t('Shinys', 'Shinies') }} ({{ playerDetail.shinyPokemon.length }})
              </h4>
              <div v-for="[gen, shinys] in shinyByGen" :key="gen" class="mb-3 last:mb-0">
                <div class="mb-2 flex items-center gap-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ genName(gen) }}</span>
                  <div class="h-px flex-1 bg-slate-700/50" />
                  <span class="text-[10px] font-bold text-yellow-500">{{ shinys.length }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  <div
                    v-for="(poke, idx) in shinys"
                    :key="idx"
                    class="flex flex-col items-center rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-2"
                  >
                    <img :src="pokeSprite(poke.slug, true)" alt="" class="h-10 w-10" />
                    <span class="mt-0.5 text-center text-[9px] font-medium text-white">{{ t(poke.nameFr, poke.nameEn) }} ✨</span>
                    <div class="flex items-center gap-1">
                      <span class="text-[9px] text-slate-500">Lv.{{ poke.level }}</span>
                    </div>
                    <div class="flex gap-0.5">
                      <span v-for="s in poke.stars" :key="s" class="text-[7px] text-yellow-400">★</span>
                    </div>
                    <span
                      class="mt-0.5 rounded px-1 py-0.5 text-[8px] font-bold"
                      :style="{ color: RARITY_COLORS[poke.rarity], background: `${RARITY_COLORS[poke.rarity]}15` }"
                    >
                      {{ t(RARITY_LABELS[poke.rarity]?.fr ?? poke.rarity, RARITY_LABELS[poke.rarity]?.en ?? poke.rarity) }}
                    </span>
                    <span class="mt-0.5 text-[9px] font-bold text-green-400">{{ poke.dps.toLocaleString() }} DPS</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Boss vaincus -->
            <div v-if="playerDetail.defeatedBosses.length > 0" class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Trophy class="h-4 w-4 text-yellow-400" />
                {{ t('Boss vaincus', 'Defeated bosses') }} ({{ playerDetail.defeatedBosses.length }})
              </h4>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="boss in playerDetail.defeatedBosses"
                  :key="boss"
                  class="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-400"
                >
                  {{ boss }}
                </span>
              </div>
            </div>

            <!-- Dates -->
            <div class="flex flex-wrap gap-4 text-xs text-slate-500">
              <div class="flex items-center gap-1">
                <Clock class="h-3 w-3" />
                {{ t('Inscrit le', 'Joined') }} {{ new Date(playerDetail.createdAt).toLocaleDateString(t('fr-FR', 'en-US')) }}
              </div>
              <div v-if="playerDetail.lastLoginAt" class="flex items-center gap-1">
                <Clock class="h-3 w-3" />
                {{ t('Dernière connexion', 'Last seen') }}: {{ relativeTime(playerDetail.lastLoginAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
