<script setup lang="ts">
import { Star, Coins } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore, MAX_STARS } from '~/stores/useInventoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { BANNERS, RARITY_COLORS, RARITY_LABELS_FR, RARITY_LABELS_EN } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import { useApi } from '~/composables/useApi'
import { GENERATIONS } from '~/data/zones'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const inventory = useInventoryStore()
const { t } = useLocale()

const unlockedBanners = computed(() => BANNERS.filter((b) => b.generation <= player.currentGeneration))
const selectedBannerIndex = ref(0)
const activeBanner = computed(() => unlockedBanners.value[selectedBannerIndex.value] ?? unlockedBanners.value[0]!)

const availablePool = computed(() => {
  const maxed = inventory.maxedSlugs
  return activeBanner.value.pool.filter((p) => !maxed.has(p.slug))
})

// ── Pull state ──
interface PullResultItem {
  nameFr: string
  nameEn: string
  slug: string
  rarity: Rarity
  isShiny: boolean
  isNew: boolean
  isMaxed: boolean
  wasAlreadyMaxed: boolean
  refundAmount: number
  stars: number
}

const isPulling = ref(false)
const showResult = ref(false)
const pullResults = ref<PullResultItem[]>([])
const pullCount = ref<1 | 5 | 10 | 50 | 100>(1)

// Check if the region's champion (last zone boss) has been defeated
function isRegionCompleted(genId: number): boolean {
  const gen = GENERATIONS.find((g) => g.id === genId)
  if (!gen) return false
  const lastZone = gen.zones[gen.zones.length - 1]
  if (!lastZone) return false
  return player.defeatedBosses.includes(lastZone.boss.slug)
}

const canPull100 = computed(() => isRegionCompleted(activeBanner.value.generation))

const animPhase = ref<'idle' | 'shake' | 'color' | 'flash' | 'reveal'>('idle')
const revealedRarity = ref<Rarity>('common')

const singleResult = computed(() => pullResults.value.length === 1 ? pullResults.value[0]! : null)

// Summary for x50 pulls
const pullSummary = computed(() => {
  if (pullResults.value.length <= 10) return null
  // x100 label
  const label = pullResults.value.length >= 100 ? 'x100' : 'x50'
  const byRarity: Record<Rarity, number> = { legendary: 0, epic: 0, rare: 0, common: 0 }
  let newCount = 0
  let shinyCount = 0
  let totalRefund = 0
  for (const r of pullResults.value) {
    byRarity[r.rarity]++
    if (r.isNew) newCount++
    if (r.isShiny) shinyCount++
    totalRefund += r.refundAmount
  }
  return { byRarity, newCount, shinyCount, totalRefund, total: pullResults.value.length, label }
})

// Pokeball color scheme per rarity
const BALL_COLORS: Record<Rarity, { top: string; band: string; glow: string }> = {
  common:   { top: '#EF4444', band: '#374151', glow: '#EF4444' },
  rare:     { top: '#3B82F6', band: '#1E3A5F', glow: '#3B82F6' },
  epic:     { top: '#7C3AED', band: '#4C1D95', glow: '#A855F7' },
  legendary:{ top: '#F59E0B', band: '#78350F', glow: '#FBBF24' },
}

const currentBallColor = computed(() => {
  if (animPhase.value === 'color' || animPhase.value === 'flash' || animPhase.value === 'reveal') {
    return BALL_COLORS[revealedRarity.value]
  }
  return BALL_COLORS.common
})

// Best rarity from multi-pull (drives the ball color)
function bestRarity(results: PullResultItem[]): Rarity {
  const order: Rarity[] = ['legendary', 'epic', 'rare', 'common']
  for (const r of order) {
    if (results.some((p) => p.rarity === r)) return r
  }
  return 'common'
}

function rarityLabel(r: Rarity): string {
  return t(RARITY_LABELS_FR[r], RARITY_LABELS_EN[r])
}

function totalCostGold(count: number): number {
  return activeBanner.value.costGold * count
}

const pullError = ref('')

async function doPull() {
  if (isPulling.value || showResult.value) return
  const banner = activeBanner.value
  if (!banner || banner.pool.length === 0) return

  const count = pullCount.value
  const costGold = totalCostGold(count)

  // Pre-check gold client-side (server is source of truth)
  if (player.gold < costGold) return

  isPulling.value = true
  showResult.value = false
  pullResults.value = []
  pullError.value = ''

  // Sync client state to DB before invoking (prevents gold desync)
  const auth = useAuthStore()
  try {
    await auth.saveGameState()
  } catch {
    // Save failed — continue anyway, server will use DB gold as source of truth
  }

  // Start animation immediately (shake while waiting for server)
  animPhase.value = 'shake'
  const shakeTime = count === 1 ? 1400 : count >= 50 ? 400 : 1000

  // Call server-side gacha endpoint
  const api = useApi()
  let serverResults: {
    results: Array<{
      id: number | null
      speciesId: number
      slug: string
      nameFr: string
      nameEn: string
      rarity: Rarity
      isShiny: boolean
      level: number
      xp: number
      stars: number
    }>
    goldSpent: number
    goldRemaining: number
  }

  try {
    const [res] = await Promise.all([
      api.post<typeof serverResults>('/api/invocations', {
        bannerId: banner.id,
        count,
      }),
      sleep(shakeTime), // Run animation in parallel with API call
    ])
    serverResults = res
  } catch (err: any) {
    isPulling.value = false
    animPhase.value = 'idle'
    pullError.value = err?.message || 'Invocation failed'
    return
  }

  // Sync gold from server (source of truth)
  player.gold = serverResults.goldRemaining

  // Determine best rarity for ball color reveal
  const bestR = bestRarity(serverResults.results.map((p) => ({ rarity: p.rarity } as PullResultItem)))
  revealedRarity.value = bestR

  // Animation: ball color change to rarity
  animPhase.value = 'color'
  await sleep(count === 1 ? 800 : count >= 100 ? 200 : count >= 50 ? 300 : 500)

  // Animation: flash
  animPhase.value = 'flash'
  await sleep(500)

  // Add server-confirmed Pokémon to local inventory and build display results
  const results: PullResultItem[] = []
  const costPerPull = banner.costGold

  for (const drawn of serverResults.results) {
    const { isNew, isMaxed, wasAlreadyMaxed, pokemon: owned } = inventory.addPokemon({
      slug: drawn.slug,
      nameFr: drawn.nameFr,
      nameEn: drawn.nameEn,
      stars: 1,
      isShiny: drawn.isShiny,
      rarity: drawn.rarity,
    })

    // Calculate refund: 50% of cost per individual pull if already maxed
    const refundAmount = wasAlreadyMaxed ? Math.floor(costPerPull * 0.5) : 0
    if (refundAmount > 0) {
      player.addGold(refundAmount)
    }

    results.push({
      nameFr: drawn.nameFr,
      nameEn: drawn.nameEn,
      slug: drawn.slug,
      rarity: drawn.rarity,
      isShiny: drawn.isShiny,
      isNew,
      isMaxed,
      wasAlreadyMaxed,
      refundAmount,
      stars: owned.stars,
    })
  }

  // Sort results: legendary first, then epic, rare, common
  const rarityOrder: Record<Rarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 }
  results.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])

  pullResults.value = results
  animPhase.value = 'reveal'
  showResult.value = true
  isPulling.value = false

  // Save immediately after pull to prevent data loss on F5
  auth.saveGameState()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function dismiss() {
  showResult.value = false
  animPhase.value = 'idle'
  pullResults.value = []
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Banner Selector -->
    <div class="flex flex-wrap justify-center gap-2">
      <button
        v-for="(banner, idx) in BANNERS"
        :key="banner.id"
        class="rounded-lg px-4 py-2 text-xs font-bold transition-all"
        :class="banner.generation > player.currentGeneration
          ? 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
          : selectedBannerIndex === unlockedBanners.indexOf(banner)
            ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50'
            : 'bg-gray-700/40 text-gray-400 hover:bg-gray-700/60'"
        :disabled="banner.generation > player.currentGeneration || isPulling || showResult"
        @click="banner.generation <= player.currentGeneration && !isPulling && !showResult && (selectedBannerIndex = unlockedBanners.indexOf(banner))"
      >
        {{ t(banner.nameFr, banner.nameEn) }}
        <span v-if="banner.generation > player.currentGeneration" class="ml-1 text-[10px]">🔒</span>
        <span v-else class="ml-1 text-[10px] opacity-60">({{ banner.pool.length }})</span>
      </button>
    </div>

    <!-- Banner Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-yellow-400">
        {{ t(activeBanner.nameFr, activeBanner.nameEn) }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ t('Invoque des Pokémon pour renforcer ton équipe !', 'Summon Pokémon to strengthen your team!') }}
      </p>
    </div>

    <!-- ═══ OK / Pull Buttons (above results so position never shifts) ═══ -->
    <div v-if="!isPulling" class="flex flex-col items-center gap-3">
      <!-- Pull count selector (hidden during result) -->
      <div v-if="!showResult" class="flex items-center gap-1.5 rounded-xl bg-slate-800 p-1">
        <button
          v-for="n in ([1, 5, 10, 50] as const)"
          :key="n"
          class="rounded-lg px-4 py-1.5 text-sm font-bold transition-all"
          :class="pullCount === n
            ? 'bg-yellow-500 text-black shadow-lg'
            : 'text-slate-400 hover:text-white'"
          @click="pullCount = n"
        >
          x{{ n }}
        </button>
        <button
          v-if="canPull100"
          class="rounded-lg px-4 py-1.5 text-sm font-bold transition-all"
          :class="pullCount === 100
            ? 'bg-yellow-500 text-black shadow-lg'
            : 'text-amber-400 hover:text-amber-300'"
          @click="pullCount = 100"
        >
          x100
        </button>
      </div>

      <!-- Action button: OK (dismiss) or Invoquer (pull) at the exact same position -->
      <button
        v-if="showResult"
        class="flex items-center gap-2 rounded-xl bg-yellow-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-yellow-500 active:scale-95"
        @click="dismiss"
      >
        OK
      </button>
      <button
        v-else
        class="flex items-center gap-2 rounded-xl bg-yellow-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-yellow-500 active:scale-95 disabled:opacity-40"
        :disabled="player.gold < totalCostGold(pullCount)"
        @click="doPull()"
      >
        <Coins class="h-5 w-5" />
        {{ totalCostGold(pullCount) }} {{ t('PokéDollar', 'PokéDollar') }}
      </button>
      <p v-if="!showResult" class="text-xs text-slate-500">
        {{ availablePool.length }} / {{ activeBanner.pool.length }} {{ t('disponibles', 'available') }}
      </p>
    </div>

    <!-- ═══ Pokeball Animation Area (hidden during multi/summary) ═══ -->
    <div v-if="!showResult || singleResult" class="relative flex h-64 w-64 items-center justify-center">
      <!-- Pokeball (idle / shake / color) -->
      <div
        v-if="!showResult"
        class="pokeball-wrapper"
        :class="{
          'anim-bounce': animPhase === 'idle',
          'anim-shake': animPhase === 'shake',
          'anim-pulse': animPhase === 'color',
        }"
      >
        <svg viewBox="0 0 100 100" class="h-32 w-32 drop-shadow-2xl transition-all duration-500">
          <!-- Top half -->
          <path d="M 50 50 L 5 50 A 45 45 0 0 1 95 50 Z"
            :fill="currentBallColor.top"
            class="transition-all duration-500"
          />
          <!-- Bottom half (white) -->
          <path d="M 50 50 L 5 50 A 45 45 0 0 0 95 50 Z" fill="#f1f5f9" />
          <!-- Center band -->
          <rect x="3" y="46" width="94" height="8" rx="4"
            :fill="currentBallColor.band"
            class="transition-all duration-500"
          />
          <!-- Center button -->
          <circle cx="50" cy="50" r="10"
            :fill="currentBallColor.band"
            :stroke="currentBallColor.top"
            stroke-width="3"
            class="transition-all duration-500"
          />
          <circle cx="50" cy="50" r="5" fill="#f1f5f9" />
        </svg>

        <!-- Glow ring (color phase) -->
        <div
          v-if="animPhase === 'color' || animPhase === 'shake'"
          class="absolute inset-0 rounded-full transition-all duration-700"
          :class="{ 'opacity-0': animPhase === 'shake', 'opacity-100': animPhase === 'color' }"
          :style="{
            boxShadow: `0 0 40px 15px ${currentBallColor.glow}60, 0 0 80px 30px ${currentBallColor.glow}30`,
          }"
        />
      </div>

      <!-- Flash overlay -->
      <Transition name="flash">
        <div
          v-if="animPhase === 'flash'"
          class="absolute inset-[-50%] rounded-full"
          :style="{
            background: `radial-gradient(circle, ${currentBallColor.glow}cc 0%, ${currentBallColor.glow}00 70%)`,
          }"
        />
      </Transition>

      <!-- ═══ SINGLE Result Reveal ═══ -->
      <div
        v-if="showResult && singleResult"
        class="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500"
      >
        <div class="relative">
          <PokemonSprite
            :slug="singleResult.slug"
            :shiny="singleResult.isShiny"
            :alt="t(singleResult.nameFr, singleResult.nameEn)"
            class="h-32 w-32 drop-shadow-lg"
            :style="{ filter: `drop-shadow(0 0 16px ${RARITY_COLORS[singleResult.rarity]})` }"
          />
          <span
            v-if="singleResult.isShiny"
            class="absolute -right-2 -top-2 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-black"
          >
            ✨ SHINY
          </span>
        </div>

        <p class="text-lg font-bold" :style="{ color: RARITY_COLORS[singleResult.rarity] }">
          {{ t(singleResult.nameFr, singleResult.nameEn) }}
        </p>

        <div class="flex items-center gap-1">
          <Star
            v-for="s in singleResult.stars"
            :key="s"
            class="h-4 w-4"
            :class="singleResult.stars >= MAX_STARS
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
              : 'fill-yellow-400 text-yellow-400'"
          />
        </div>

        <span
          class="rounded-full px-3 py-1 text-xs font-medium"
          :style="{
            backgroundColor: RARITY_COLORS[singleResult.rarity] + '20',
            color: RARITY_COLORS[singleResult.rarity],
          }"
        >
          {{ rarityLabel(singleResult.rarity) }}
        </span>

        <p v-if="singleResult.isNew" class="text-sm font-bold text-green-400">
          {{ t('✨ Nouveau !', '✨ New!') }}
        </p>
        <p v-else-if="singleResult.wasAlreadyMaxed" class="text-sm font-bold text-amber-400">
          {{ t(`⭐ MAX ! Remboursé 50% (🪙 ${singleResult.refundAmount})`, `⭐ MAX! 50% Refund (🪙 ${singleResult.refundAmount})`) }}
        </p>
        <p v-else-if="singleResult.isMaxed" class="text-sm font-bold text-amber-400">
          {{ t('⭐ MAX atteint !', '⭐ MAX reached!') }}
        </p>
        <p v-else class="text-sm text-slate-400">
          ★ {{ singleResult.stars }} / {{ MAX_STARS }}
        </p>

      </div>
    </div>

    <!-- ═══ x50 SUMMARY Result ═══ -->
    <div
      v-if="showResult && pullSummary"
      class="flex w-full max-w-lg flex-col items-center gap-4"
    >
      <h3 class="text-lg font-bold text-yellow-400">{{ t(`Résumé ${pullSummary.label}`, `${pullSummary.label} Summary`) }}</h3>

      <!-- Rarity breakdown -->
      <div class="w-full space-y-2 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
        <div v-if="pullSummary.byRarity.legendary > 0" class="flex items-center justify-between">
          <span class="text-sm font-bold" :style="{ color: RARITY_COLORS.legendary }">{{ t('Légendaire', 'Legendary') }}</span>
          <span class="text-sm font-bold text-yellow-400">x{{ pullSummary.byRarity.legendary }}</span>
        </div>
        <div v-if="pullSummary.byRarity.epic > 0" class="flex items-center justify-between">
          <span class="text-sm font-bold" :style="{ color: RARITY_COLORS.epic }">{{ t('Épique', 'Epic') }}</span>
          <span class="text-sm font-bold text-purple-400">x{{ pullSummary.byRarity.epic }}</span>
        </div>
        <div v-if="pullSummary.byRarity.rare > 0" class="flex items-center justify-between">
          <span class="text-sm font-bold" :style="{ color: RARITY_COLORS.rare }">{{ t('Rare', 'Rare') }}</span>
          <span class="text-sm font-bold text-blue-400">x{{ pullSummary.byRarity.rare }}</span>
        </div>
        <div v-if="pullSummary.byRarity.common > 0" class="flex items-center justify-between">
          <span class="text-sm font-bold" :style="{ color: RARITY_COLORS.common }">{{ t('Commun', 'Common') }}</span>
          <span class="text-sm font-bold text-gray-400">x{{ pullSummary.byRarity.common }}</span>
        </div>
        <div class="mt-2 border-t border-slate-700 pt-2 space-y-1">
          <div v-if="pullSummary.newCount > 0" class="flex items-center justify-between text-sm">
            <span class="text-green-400">{{ t('Nouveaux', 'New') }}</span>
            <span class="font-bold text-green-400">{{ pullSummary.newCount }}</span>
          </div>
          <div v-if="pullSummary.shinyCount > 0" class="flex items-center justify-between text-sm">
            <span class="text-yellow-300">✨ Shiny</span>
            <span class="font-bold text-yellow-300">{{ pullSummary.shinyCount }}</span>
          </div>
          <div v-if="pullSummary.totalRefund > 0" class="flex items-center justify-between text-sm">
            <span class="text-amber-400">{{ t('Remboursé', 'Refunded') }}</span>
            <span class="font-bold text-amber-400">🪙 {{ pullSummary.totalRefund }}</span>
          </div>
        </div>
      </div>

      <!-- Notable pulls (epic+) -->
      <div v-if="pullResults.filter(r => r.rarity === 'legendary' || r.rarity === 'epic' || r.isShiny).length > 0" class="w-full">
        <p class="mb-2 text-xs font-semibold text-slate-400">{{ t('Obtentions notables', 'Notable pulls') }}</p>
        <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
          <div
            v-for="(r, i) in pullResults.filter(r => r.rarity === 'legendary' || r.rarity === 'epic' || r.isShiny)"
            :key="i"
            class="flex flex-col items-center gap-1 rounded-lg border p-1.5"
            :style="{
              borderColor: RARITY_COLORS[r.rarity] + '80',
              backgroundColor: RARITY_COLORS[r.rarity] + '10',
            }"
          >
            <div class="relative">
              <PokemonSprite
                :slug="r.slug"
                :shiny="r.isShiny"
                :alt="t(r.nameFr, r.nameEn)"
                class="h-10 w-10"
              />
              <span v-if="r.isShiny" class="absolute -right-1 -top-1 text-[8px]">✨</span>
            </div>
            <p class="truncate text-center text-[9px] font-bold" :style="{ color: RARITY_COLORS[r.rarity] }">
              {{ t(r.nameFr, r.nameEn) }}
            </p>
            <span v-if="r.isNew" class="text-[8px] font-bold text-green-400">NEW</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══ MULTI Result Reveal (x5, x10) ═══ -->
    <div
      v-if="showResult && pullResults.length > 1 && !pullSummary"
      class="flex w-full max-w-2xl flex-col items-center gap-4"
    >
      <div class="grid w-full gap-2 sm:gap-3" :class="pullResults.length <= 5 ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-3 sm:grid-cols-5'">
        <div
          v-for="(r, i) in pullResults"
          :key="i"
          class="multi-card group relative flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all"
          :style="{
            borderColor: RARITY_COLORS[r.rarity] + '80',
            backgroundColor: RARITY_COLORS[r.rarity] + '10',
            boxShadow: `0 0 12px ${RARITY_COLORS[r.rarity]}30`,
            animationDelay: `${i * 80}ms`,
          }"
        >
          <!-- Shiny badge -->
          <span
            v-if="r.isShiny"
            class="absolute -right-1 -top-1 z-10 rounded-full bg-yellow-500 px-1.5 py-px text-[8px] font-bold text-black"
          >
            ✨
          </span>

          <!-- Sprite -->
          <PokemonSprite
            :slug="r.slug"
            :shiny="r.isShiny"
            :alt="t(r.nameFr, r.nameEn)"
            class="h-14 w-14"
            :style="{ filter: `drop-shadow(0 0 8px ${RARITY_COLORS[r.rarity]})` }"
          />

          <!-- Name -->
          <p class="truncate text-center text-[10px] font-bold leading-tight" :style="{ color: RARITY_COLORS[r.rarity] }">
            {{ t(r.nameFr, r.nameEn) }}
          </p>

          <!-- Stars -->
          <div class="flex items-center gap-px">
            <Star
              v-for="s in r.stars"
              :key="s"
              class="h-2.5 w-2.5"
              :class="r.stars >= MAX_STARS
                ? 'fill-amber-400 text-amber-400'
                : 'fill-yellow-400 text-yellow-400'"
            />
          </div>

          <!-- New / Dupe badge -->
          <span
            v-if="r.isNew"
            class="rounded-full bg-green-500/20 px-1.5 py-px text-[8px] font-bold text-green-400"
          >
            NEW
          </span>
          <span
            v-else-if="r.wasAlreadyMaxed"
            class="rounded-full bg-amber-500/20 px-1.5 py-px text-[8px] font-bold text-amber-400"
          >
            -50%
          </span>
          <span
            v-else-if="r.isMaxed"
            class="rounded-full bg-amber-500/20 px-1.5 py-px text-[8px] font-bold text-amber-400"
          >
            MAX
          </span>

          <!-- Tooltip -->
          <div class="pointer-events-none absolute -top-8 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
            {{ t(r.nameFr, r.nameEn) }} — {{ rarityLabel(r.rarity) }}
          </div>
        </div>
      </div>

    </div>

    <!-- ═══ Error Message ═══ -->
    <p v-if="pullError" class="text-sm font-bold text-red-400">
      {{ pullError }}
    </p>


    <!-- ═══ Pool Preview ═══ -->
    <div class="w-full max-w-2xl">
      <h3 class="mb-3 text-sm font-semibold text-slate-400">
        {{ t('Pokémon disponibles', 'Available Pokémon') }}
      </h3>
      <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        <div
          v-for="p in activeBanner.pool"
          :key="p.slug"
          class="group relative flex flex-col items-center rounded-lg border p-1.5 transition-colors"
          :class="inventory.maxedSlugs.has(p.slug)
            ? 'border-yellow-600/30 bg-yellow-900/10 opacity-40'
            : inventory.uniqueSlugs.has(p.slug)
              ? 'border-slate-600 bg-slate-800/80'
              : 'border-slate-700 bg-slate-800 hover:border-slate-500'"
        >
          <PokemonSprite
            :slug="p.slug"
            :alt="t(p.nameFr, p.nameEn)"
            class="h-10 w-10"
            :class="{ grayscale: inventory.maxedSlugs.has(p.slug) }"
          />
          <div v-if="inventory.ownedSlugStars.has(p.slug)" class="flex items-center justify-center gap-px">
            <Star
              v-for="s in (inventory.ownedSlugStars.get(p.slug) ?? 0)"
              :key="s"
              class="h-2 w-2"
              :class="(inventory.ownedSlugStars.get(p.slug) ?? 0) >= MAX_STARS
                ? 'fill-amber-400 text-amber-400'
                : 'fill-yellow-400 text-yellow-400'"
            />
          </div>
          <div v-else
            class="h-1 w-full rounded-full"
            :style="{ backgroundColor: RARITY_COLORS[p.rarity] }"
          />
          <div v-if="inventory.maxedSlugs.has(p.slug)" class="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1 py-px text-[7px] font-bold text-black">
            MAX
          </div>
          <div class="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
            {{ t(p.nameFr, p.nameEn) }}
            <span v-if="inventory.ownedSlugStars.has(p.slug)" class="text-yellow-400"> ★{{ inventory.ownedSlugStars.get(p.slug) }}</span>
          </div>
        </div>
      </div>
    </div>

    <p class="text-xs text-slate-500">
      {{ t('Collection', 'Collection') }}: {{ inventory.collectionCount }} {{ t('Pokémon', 'Pokémon') }}
    </p>
  </div>
</template>

<style scoped>
/* ── Pokeball animations ── */
.pokeball-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.anim-bounce {
  animation: pokeFloat 2s ease-in-out infinite;
}

.anim-shake {
  animation: pokeShake 0.12s ease-in-out infinite;
}

.anim-pulse {
  animation: pokePulse 0.6s ease-in-out infinite;
}

@keyframes pokeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes pokeShake {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-12deg) scale(1.03); }
  50% { transform: rotate(12deg) scale(1.03); }
  75% { transform: rotate(-8deg) scale(1.01); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes pokePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* ── Flash transition ── */
.flash-enter-active {
  animation: flashBurst 0.5s ease-out forwards;
}
.flash-leave-active {
  animation: flashBurst 0.5s ease-out reverse forwards;
}

@keyframes flashBurst {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* ── Multi-pull card stagger ── */
.multi-card {
  animation: cardPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cardPop {
  0% { opacity: 0; transform: scale(0.5) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
