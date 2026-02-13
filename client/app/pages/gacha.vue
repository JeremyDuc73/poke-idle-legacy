<script setup lang="ts">
import { Star, Sparkles, Coins } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore, MAX_STARS } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { BANNERS, RARITY_COLORS, RARITY_LABELS_FR, RARITY_LABELS_EN, pullFromBanner } from '~/data/gacha'
import type { Banner, Rarity } from '~/data/gacha'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const inventory = useInventoryStore()
const { t } = useLocale()

const activeBanner = computed(() => BANNERS[0]!)

const availablePool = computed(() => {
  const maxed = inventory.maxedSlugs
  return activeBanner.value.pool.filter((p) => !maxed.has(p.slug))
})

const filteredBanner = computed((): Banner => ({
  ...activeBanner.value,
  pool: availablePool.value,
}))

const allMaxed = computed(() => availablePool.value.length === 0)

// ── Pull state ──
interface PullResultItem {
  nameFr: string
  nameEn: string
  slug: string
  rarity: Rarity
  isShiny: boolean
  isNew: boolean
  isMaxed: boolean
  stars: number
}

const isPulling = ref(false)
const showResult = ref(false)
const pullResults = ref<PullResultItem[]>([])
const pullCount = ref<1 | 5 | 10>(1)

const animPhase = ref<'idle' | 'shake' | 'color' | 'flash' | 'reveal'>('idle')
const revealedRarity = ref<Rarity>('common')

const singleResult = computed(() => pullResults.value.length === 1 ? pullResults.value[0]! : null)

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
function totalCostGems(count: number): number {
  return activeBanner.value.costGems * count
}

async function doPull(currency: 'gold' | 'gems') {
  if (allMaxed.value) return
  const banner = filteredBanner.value
  if (!banner || banner.pool.length === 0) return

  const count = pullCount.value
  const costGold = totalCostGold(count)
  const costGems = totalCostGems(count)

  if (currency === 'gold') {
    if (!player.spendGold(costGold)) return
  } else {
    if (!player.spendGems(costGems)) return
  }

  isPulling.value = true
  showResult.value = false
  pullResults.value = []

  // Do all pulls first (so we know rarities for animation)
  const rawPulls = []
  for (let i = 0; i < count; i++) {
    const currentBanner = filteredBanner.value
    if (!currentBanner || currentBanner.pool.length === 0) break
    rawPulls.push(pullFromBanner(currentBanner))
  }

  // Determine best rarity for ball color reveal
  const bestR = bestRarity(rawPulls.map((p) => ({ rarity: p.pokemon.rarity } as PullResultItem)))
  revealedRarity.value = bestR

  // Animation: shake
  animPhase.value = 'shake'
  const shakeTime = count === 1 ? 1400 : 1000
  await sleep(shakeTime)

  // Animation: ball color change to rarity
  animPhase.value = 'color'
  await sleep(count === 1 ? 800 : 500)

  // Animation: flash
  animPhase.value = 'flash'
  await sleep(500)

  // Add all to inventory and build results
  const results: PullResultItem[] = []
  for (const { pokemon, isShiny } of rawPulls) {
    const { isNew, isMaxed, pokemon: owned } = inventory.addPokemon({
      slug: pokemon.slug,
      nameFr: pokemon.nameFr,
      nameEn: pokemon.nameEn,
      stars: 1,
      isShiny,
      rarity: pokemon.rarity,
    })
    results.push({
      nameFr: pokemon.nameFr,
      nameEn: pokemon.nameEn,
      slug: pokemon.slug,
      rarity: pokemon.rarity,
      isShiny,
      isNew,
      isMaxed,
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
    <!-- Banner Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-yellow-400">
        {{ t(activeBanner.nameFr, activeBanner.nameEn) }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ t('Invoque des Pokémon pour renforcer ton équipe !', 'Summon Pokémon to strengthen your team!') }}
      </p>
    </div>

    <!-- ═══ Pokeball Animation Area ═══ -->
    <div class="relative flex h-64 w-64 items-center justify-center">
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
          <img
            :src="singleResult.isShiny ? getShinySpriteUrl(singleResult.slug) : getSpriteUrl(singleResult.slug)"
            :alt="t(singleResult.nameFr, singleResult.nameEn)"
            class="h-32 w-32 object-contain drop-shadow-lg"
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
        <p v-else-if="singleResult.isMaxed" class="text-sm font-bold text-amber-400">
          {{ t('⭐ MAX ! Retiré du tirage', '⭐ MAX! Removed from pool') }}
        </p>
        <p v-else class="text-sm text-slate-400">
          {{ t('Doublon → ★', 'Duplicate → ★') }}{{ singleResult.stars }}
        </p>

        <button
          class="mt-2 rounded-lg bg-gray-700 px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-600"
          @click="dismiss"
        >
          OK
        </button>
      </div>
    </div>

    <!-- ═══ MULTI Result Reveal ═══ -->
    <div
      v-if="showResult && pullResults.length > 1"
      class="flex w-full max-w-2xl flex-col items-center gap-4"
    >
      <div class="grid w-full gap-3" :class="pullResults.length <= 5 ? 'grid-cols-5' : 'grid-cols-5 sm:grid-cols-5'">
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
          <img
            :src="r.isShiny ? getShinySpriteUrl(r.slug) : getSpriteUrl(r.slug)"
            :alt="t(r.nameFr, r.nameEn)"
            class="h-14 w-14 object-contain"
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

      <button
        class="rounded-lg bg-gray-700 px-8 py-2.5 text-sm font-medium transition-colors hover:bg-gray-600"
        @click="dismiss"
      >
        OK
      </button>
    </div>

    <!-- ═══ Pull Buttons ═══ -->
    <div v-if="!isPulling && !showResult" class="flex flex-col items-center gap-4">
      <div v-if="allMaxed" class="rounded-xl bg-green-500/10 px-6 py-3 text-center text-sm font-bold text-green-400">
        {{ t('Tous les Pokémon sont au max !', 'All Pokémon are maxed out!') }} 🎉
      </div>
      <template v-else>
        <!-- Pull count selector -->
        <div class="flex items-center gap-1.5 rounded-xl bg-slate-800 p-1">
          <button
            v-for="n in ([1, 5, 10] as const)"
            :key="n"
            class="rounded-lg px-4 py-1.5 text-sm font-bold transition-all"
            :class="pullCount === n
              ? 'bg-yellow-500 text-black shadow-lg'
              : 'text-slate-400 hover:text-white'"
            @click="pullCount = n"
          >
            x{{ n }}
          </button>
        </div>

        <!-- Gold / Gems buttons -->
        <div class="flex gap-3">
          <button
            class="flex items-center gap-2 rounded-xl bg-yellow-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-yellow-500 active:scale-95 disabled:opacity-40"
            :disabled="player.gold < totalCostGold(pullCount)"
            @click="doPull('gold')"
          >
            <Coins class="h-5 w-5" />
            {{ totalCostGold(pullCount) }} {{ t('or', 'gold') }}
          </button>
          <button
            class="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-purple-500 active:scale-95 disabled:opacity-40"
            :disabled="player.gems < totalCostGems(pullCount)"
            @click="doPull('gems')"
          >
            <Sparkles class="h-5 w-5" />
            {{ totalCostGems(pullCount) }} {{ t('gemmes', 'gems') }}
          </button>
        </div>
      </template>
      <p class="text-xs text-slate-500">
        {{ availablePool.length }} / {{ activeBanner.pool.length }} {{ t('disponibles', 'available') }}
      </p>
    </div>

    <!-- ═══ Pool Preview ═══ -->
    <div class="w-full max-w-2xl">
      <h3 class="mb-3 text-sm font-semibold text-slate-400">
        {{ t('Pokémon disponibles', 'Available Pokémon') }}
      </h3>
      <div class="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
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
          <img
            :src="getSpriteUrl(p.slug)"
            :alt="t(p.nameFr, p.nameEn)"
            class="h-10 w-10 object-contain"
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
