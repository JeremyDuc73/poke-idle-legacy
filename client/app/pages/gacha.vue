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

// Filter banner pool: exclude maxed-out Pokemon from pulls
const availablePool = computed(() => {
  const maxed = inventory.maxedSlugs
  return activeBanner.value.pool.filter((p) => !maxed.has(p.slug))
})

const filteredBanner = computed((): Banner => ({
  ...activeBanner.value,
  pool: availablePool.value,
}))

const allMaxed = computed(() => availablePool.value.length === 0)

const isPulling = ref(false)
const showResult = ref(false)
const pullResult = ref<{
  nameFr: string
  nameEn: string
  slug: string
  rarity: Rarity
  isShiny: boolean
  isNew: boolean
  isMaxed: boolean
  stars: number
} | null>(null)

const animPhase = ref<'idle' | 'shake' | 'flash' | 'reveal'>('idle')

function rarityLabel(r: Rarity): string {
  return t(RARITY_LABELS_FR[r], RARITY_LABELS_EN[r])
}

async function doPull(currency: 'gold' | 'gems') {
  if (allMaxed.value) return
  const banner = filteredBanner.value
  if (!banner || banner.pool.length === 0) return

  if (currency === 'gold') {
    if (!player.spendGold(activeBanner.value.costGold)) return
  } else {
    if (!player.spendGems(activeBanner.value.costGems)) return
  }

  isPulling.value = true
  showResult.value = false
  pullResult.value = null

  animPhase.value = 'shake'
  await sleep(1200)

  const { pokemon, isShiny } = pullFromBanner(banner)

  animPhase.value = 'flash'
  await sleep(600)

  const { isNew, isMaxed, pokemon: owned } = inventory.addPokemon({
    slug: pokemon.slug,
    nameFr: pokemon.nameFr,
    nameEn: pokemon.nameEn,
    stars: 1,
    isShiny,
  })

  pullResult.value = {
    nameFr: pokemon.nameFr,
    nameEn: pokemon.nameEn,
    slug: pokemon.slug,
    rarity: pokemon.rarity,
    isShiny,
    isNew,
    isMaxed,
    stars: owned.stars,
  }

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
  pullResult.value = null
}
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <!-- Banner Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-yellow-400">
        {{ t(activeBanner.nameFr, activeBanner.nameEn) }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ t('Invoque des Pokémon pour renforcer ton équipe !', 'Summon Pokémon to strengthen your team!') }}
      </p>
    </div>

    <!-- Pokeball Animation Area -->
    <div class="relative flex h-64 w-64 items-center justify-center">
      <!-- Idle / Shake -->
      <div
        v-if="!showResult"
        class="text-8xl select-none transition-transform"
        :class="{
          'animate-bounce': animPhase === 'idle',
          'animate-[wiggle_0.15s_ease-in-out_infinite]': animPhase === 'shake',
        }"
      >
        🔴
      </div>

      <!-- Flash overlay -->
      <div
        v-if="animPhase === 'flash'"
        class="absolute inset-0 animate-ping rounded-full"
        :style="{ backgroundColor: pullResult ? RARITY_COLORS[pullResult.rarity] : '#fff', opacity: 0.4 }"
      />

      <!-- Result Reveal -->
      <div
        v-if="showResult && pullResult"
        class="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500"
      >
        <div class="relative">
          <img
            :src="pullResult.isShiny ? getShinySpriteUrl(pullResult.slug) : getSpriteUrl(pullResult.slug)"
            :alt="t(pullResult.nameFr, pullResult.nameEn)"
            class="h-32 w-32 object-contain drop-shadow-lg"
            :style="{ filter: `drop-shadow(0 0 16px ${RARITY_COLORS[pullResult.rarity]})` }"
          />
          <span
            v-if="pullResult.isShiny"
            class="absolute -right-2 -top-2 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-black"
          >
            ✨ SHINY
          </span>
        </div>

        <p class="text-lg font-bold" :style="{ color: RARITY_COLORS[pullResult.rarity] }">
          {{ t(pullResult.nameFr, pullResult.nameEn) }}
        </p>

        <div class="flex items-center gap-1">
          <Star
            v-for="s in pullResult.stars"
            :key="s"
            class="h-4 w-4"
            :class="pullResult.stars >= MAX_STARS
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
              : 'fill-yellow-400 text-yellow-400'"
          />
        </div>

        <span
          class="rounded-full px-3 py-1 text-xs font-medium"
          :style="{
            backgroundColor: RARITY_COLORS[pullResult.rarity] + '20',
            color: RARITY_COLORS[pullResult.rarity],
          }"
        >
          {{ rarityLabel(pullResult.rarity) }}
        </span>

        <p v-if="pullResult.isNew" class="text-sm font-bold text-green-400">
          {{ t('✨ Nouveau !', '✨ New!') }}
        </p>
        <p v-else-if="pullResult.isMaxed" class="text-sm font-bold text-amber-400">
          {{ t('⭐ MAX ! Retiré du tirage', '⭐ MAX! Removed from pool') }}
        </p>
        <p v-else class="text-sm text-slate-400">
          {{ t('Doublon → ★', 'Duplicate → ★') }}{{ pullResult.stars }}
        </p>

        <button
          class="mt-2 rounded-lg bg-gray-700 px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-600"
          @click="dismiss"
        >
          OK
        </button>
      </div>
    </div>

    <!-- Pull Buttons -->
    <div v-if="!isPulling && !showResult" class="flex flex-col items-center gap-3">
      <div v-if="allMaxed" class="rounded-xl bg-green-500/10 px-6 py-3 text-center text-sm font-bold text-green-400">
        {{ t('Tous les Pokémon sont au max !', 'All Pokémon are maxed out!') }} 🎉
      </div>
      <div v-else class="flex gap-4">
        <button
          class="flex items-center gap-2 rounded-xl bg-yellow-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-yellow-500 active:scale-95 disabled:opacity-40"
          :disabled="player.gold < activeBanner.costGold"
          @click="doPull('gold')"
        >
          <Coins class="h-5 w-5" />
          {{ t('Invoquer', 'Summon') }} ({{ activeBanner.costGold }} {{ t('or', 'gold') }})
        </button>
        <button
          class="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-purple-500 active:scale-95 disabled:opacity-40"
          :disabled="player.gems < activeBanner.costGems"
          @click="doPull('gems')"
        >
          <Sparkles class="h-5 w-5" />
          {{ t('Invoquer', 'Summon') }} ({{ activeBanner.costGems }} {{ t('gemme', 'gem') }})
        </button>
      </div>
      <p class="text-xs text-slate-500">
        {{ availablePool.length }} / {{ activeBanner.pool.length }} {{ t('disponibles', 'available') }}
      </p>
    </div>

    <!-- Pool Preview -->
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
          <!-- Star indicators for owned -->
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
          <!-- MAX badge -->
          <div v-if="inventory.maxedSlugs.has(p.slug)" class="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1 py-px text-[7px] font-bold text-black">
            MAX
          </div>
          <!-- Tooltip -->
          <div class="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
            {{ t(p.nameFr, p.nameEn) }}
            <span v-if="inventory.ownedSlugStars.has(p.slug)" class="text-yellow-400"> ★{{ inventory.ownedSlugStars.get(p.slug) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Collection count -->
    <p class="text-xs text-slate-500">
      {{ t('Collection', 'Collection') }}: {{ inventory.collectionCount }} {{ t('Pokémon', 'Pokémon') }}
    </p>
  </div>
</template>

<style scoped>
@keyframes wiggle {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}
</style>
