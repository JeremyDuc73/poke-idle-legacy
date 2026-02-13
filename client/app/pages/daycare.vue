<script setup lang="ts">
import { Egg, Coins, X, Sparkles, Star } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore, MAX_STARS } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { RARITY_COLORS, RARITY_LABELS_FR, RARITY_LABELS_EN } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import type { OwnedPokemon } from '~/stores/useInventoryStore'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const inventory = useInventoryStore()
const { t } = useLocale()

const EGG_COST = 500
const SHINY_CHANCE = 1 / 100

// ── State ──
const selectedPokemon = ref<OwnedPokemon | null>(null)
const showPicker = ref(false)
const isHatching = ref(false)
const hatchResult = ref<{
  slug: string
  nameFr: string
  nameEn: string
  isShiny: boolean
  isNew: boolean
  stars: number
  rarity: Rarity
} | null>(null)

const animPhase = ref<'idle' | 'shake' | 'crack' | 'hatch'>('idle')

// Eligible pokemon: level 100 only, deduplicated by slug
const eligiblePokemon = computed(() => {
  const seen = new Set<string>()
  return inventory.collection.filter((p) => {
    if (p.level < MAX_LEVEL) return false
    if (seen.has(p.slug)) return false
    seen.add(p.slug)
    return true
  })
})

function openPicker() {
  showPicker.value = true
}

function closePicker() {
  showPicker.value = false
}

function selectPokemon(p: OwnedPokemon) {
  selectedPokemon.value = p
  showPicker.value = false
}

function rarityLabel(r: Rarity): string {
  return t(RARITY_LABELS_FR[r], RARITY_LABELS_EN[r])
}

async function hatchEgg() {
  if (!selectedPokemon.value) return
  if (!player.spendGold(EGG_COST)) return

  const poke = selectedPokemon.value
  isHatching.value = true
  hatchResult.value = null

  // Animation
  animPhase.value = 'shake'
  await sleep(1200)
  animPhase.value = 'crack'
  await sleep(800)

  // Determine shiny
  const isShiny = Math.random() < SHINY_CHANCE

  // Add to inventory — non-shiny eggs never merge as duplicates
  let isNew: boolean
  let stars: number
  if (isShiny) {
    const result = inventory.addPokemon({
      slug: poke.slug,
      nameFr: poke.nameFr,
      nameEn: poke.nameEn,
      stars: 1,
      isShiny: true,
      rarity: poke.rarity,
    })
    isNew = result.isNew
    stars = result.pokemon.stars
  } else {
    // Non-shiny: always add as a fresh entry, skip duplicate merge
    inventory.addPokemonRaw({
      slug: poke.slug,
      nameFr: poke.nameFr,
      nameEn: poke.nameEn,
      stars: 1,
      isShiny: false,
      rarity: poke.rarity,
    })
    isNew = true
    stars = 1
  }

  hatchResult.value = {
    slug: poke.slug,
    nameFr: poke.nameFr,
    nameEn: poke.nameEn,
    isShiny,
    isNew,
    stars,
    rarity: poke.rarity,
  }

  animPhase.value = 'hatch'
  isHatching.value = false
}

function dismissResult() {
  hatchResult.value = null
  animPhase.value = 'idle'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-green-400">
        {{ t('Pension Pokémon', 'Pokémon Daycare') }}
      </h2>
      <p class="mt-1 text-sm text-gray-400">
        {{ t(
          'Dépose un Pokémon niv.100 pour obtenir un œuf. Chance de shiny : 1/100 !',
          'Leave a Lv.100 Pokémon to get an egg. Shiny chance: 1/100!'
        ) }}
      </p>
    </div>

    <!-- Selected Pokemon display -->
    <div class="flex flex-col items-center gap-4">
      <div
        class="relative flex h-48 w-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-3 transition-all"
        :class="selectedPokemon
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-gray-600 bg-gray-800/50'"
      >
        <template v-if="selectedPokemon">
          <img
            :src="selectedPokemon.isShiny ? getShinySpriteUrl(selectedPokemon.slug) : getSpriteUrl(selectedPokemon.slug)"
            :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
            class="h-24 w-24 object-contain"
          />
          <div class="absolute bottom-2 left-0 right-0 text-center">
            <p class="text-sm font-bold text-white">{{ t(selectedPokemon.nameFr, selectedPokemon.nameEn) }}</p>
            <span class="text-[10px] font-bold" :style="{ color: RARITY_COLORS[selectedPokemon.rarity] }">
              {{ rarityLabel(selectedPokemon.rarity) }}
            </span>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-2 text-gray-500">
            <Egg class="h-12 w-12" />
            <p class="text-xs">{{ t('Aucun Pokémon sélectionné', 'No Pokémon selected') }}</p>
          </div>
        </template>
      </div>

      <button
        class="rounded-xl bg-slate-700 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-slate-600"
        @click="openPicker"
      >
        {{ selectedPokemon ? t('Changer de Pokémon', 'Change Pokémon') : t('Choisir un Pokémon', 'Choose a Pokémon') }}
      </button>
    </div>

    <!-- Egg animation area -->
    <div class="relative flex h-40 w-40 items-center justify-center">
      <!-- Egg idle / shake / crack -->
      <div
        v-if="!hatchResult"
        class="egg-wrapper"
        :class="{
          'anim-egg-idle': animPhase === 'idle' && selectedPokemon,
          'anim-egg-shake': animPhase === 'shake',
          'anim-egg-crack': animPhase === 'crack',
        }"
      >
        <svg viewBox="0 0 80 100" class="h-28 w-22 drop-shadow-xl">
          <ellipse cx="40" cy="55" rx="30" ry="40" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" />
          <ellipse cx="40" cy="55" rx="30" ry="40" fill="url(#eggGrad)" />
          <!-- Crack lines (visible during crack phase) -->
          <g v-if="animPhase === 'crack'" class="animate-pulse">
            <line x1="30" y1="40" x2="40" y2="55" stroke="#374151" stroke-width="1.5" />
            <line x1="40" y1="55" x2="50" y2="45" stroke="#374151" stroke-width="1.5" />
            <line x1="40" y1="55" x2="35" y2="70" stroke="#374151" stroke-width="1.5" />
          </g>
          <defs>
            <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e2e8f0" />
              <stop offset="50%" stop-color="#f8fafc" />
              <stop offset="100%" stop-color="#e2e8f0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Hatch result -->
      <div
        v-if="hatchResult"
        class="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500"
      >
        <div class="relative">
          <img
            :src="hatchResult.isShiny ? getShinySpriteUrl(hatchResult.slug) : getSpriteUrl(hatchResult.slug)"
            :alt="t(hatchResult.nameFr, hatchResult.nameEn)"
            class="h-24 w-24 object-contain"
            :style="{ filter: hatchResult.isShiny ? 'drop-shadow(0 0 16px #fbbf24)' : `drop-shadow(0 0 10px ${RARITY_COLORS[hatchResult.rarity]})` }"
          />
          <span
            v-if="hatchResult.isShiny"
            class="absolute -right-2 -top-2 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-black"
          >
            ✨ SHINY
          </span>
        </div>

        <p class="text-lg font-bold" :style="{ color: hatchResult.isShiny ? '#fbbf24' : RARITY_COLORS[hatchResult.rarity] }">
          {{ t(hatchResult.nameFr, hatchResult.nameEn) }}
          <span v-if="hatchResult.isShiny" class="text-sm">✨</span>
        </p>

        <div class="flex items-center gap-1">
          <Star
            v-for="s in hatchResult.stars"
            :key="s"
            class="h-3.5 w-3.5"
            :class="hatchResult.stars >= MAX_STARS
              ? 'fill-amber-400 text-amber-400'
              : 'fill-yellow-400 text-yellow-400'"
          />
        </div>

        <p v-if="hatchResult.isShiny && hatchResult.isNew" class="text-sm font-bold text-yellow-400">
          {{ t('✨ Shiny obtenu !', '✨ Shiny obtained!') }}
        </p>
        <p v-else-if="hatchResult.isNew" class="text-sm font-bold text-green-400">
          {{ t('Nouveau Pokémon !', 'New Pokémon!') }}
        </p>
        <p v-else class="text-sm text-slate-400">
          {{ t('Doublon → ★', 'Duplicate → ★') }}{{ hatchResult.stars }}
        </p>

        <button
          class="mt-1 rounded-lg bg-gray-700 px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-600"
          @click="dismissResult"
        >
          OK
        </button>
      </div>
    </div>

    <!-- Hatch button -->
    <div v-if="!isHatching && !hatchResult" class="flex flex-col items-center gap-2">
      <button
        class="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-green-500 active:scale-95 disabled:opacity-40"
        :disabled="!selectedPokemon || player.gold < EGG_COST"
        @click="hatchEgg"
      >
        <Egg class="h-5 w-5" />
        {{ t('Produire un œuf', 'Produce an Egg') }}
        <span class="flex items-center gap-1 text-yellow-300">
          <Coins class="h-4 w-4" /> {{ EGG_COST }}
        </span>
      </button>
      <p class="text-[10px] text-gray-500">
        {{ t('1% de chance d\'obtenir un shiny', '1% chance to get a shiny') }}
      </p>
    </div>

    <!-- Empty state -->
    <div v-if="inventory.collectionCount === 0" class="rounded-xl bg-slate-800 px-6 py-4 text-center text-sm text-gray-400">
      {{ t('Tu n\'as pas encore de Pokémon. Invoque-en d\'abord !', 'You don\'t have any Pokémon yet. Summon some first!') }}
    </div>

    <!-- Pokémon Picker Modal -->
    <Teleport to="body">
      <div
        v-if="showPicker"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closePicker"
      >
        <div class="relative w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
          <button class="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white" @click="closePicker">
            <X class="h-5 w-5" />
          </button>
          <h3 class="mb-4 text-lg font-bold text-white">
            {{ t('Choisir un Pokémon', 'Choose a Pokémon') }}
          </h3>
          <div class="grid max-h-96 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
            <button
              v-for="poke in eligiblePokemon"
              :key="poke.id"
              class="flex flex-col items-center gap-1 rounded-xl border border-gray-700 bg-gray-800 p-2 transition-all hover:border-green-500/50 hover:bg-gray-750 active:scale-95"
              @click="selectPokemon(poke)"
            >
              <img
                :src="poke.isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug)"
                :alt="t(poke.nameFr, poke.nameEn)"
                class="h-12 w-12 object-contain"
              />
              <p class="w-full truncate text-center text-[9px] text-gray-300">
                {{ t(poke.nameFr, poke.nameEn) }}
              </p>
              <span class="text-[8px] font-bold" :style="{ color: RARITY_COLORS[poke.rarity] }">
                {{ rarityLabel(poke.rarity) }}
              </span>
            </button>
          </div>
          <p v-if="eligiblePokemon.length === 0" class="py-8 text-center text-sm text-gray-500">
            {{ t('Aucun Pokémon disponible', 'No Pokémon available') }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.egg-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.anim-egg-idle {
  animation: eggFloat 2.5s ease-in-out infinite;
}

.anim-egg-shake {
  animation: eggShake 0.1s ease-in-out infinite;
}

.anim-egg-crack {
  animation: eggCrack 0.3s ease-in-out infinite;
}

@keyframes eggFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}

@keyframes eggShake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-6deg); }
  100% { transform: rotate(0deg); }
}

@keyframes eggCrack {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
