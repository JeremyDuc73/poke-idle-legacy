<script setup lang="ts">
import { Coins, Gem, Sparkles, FlaskConical, X, Candy } from 'lucide-vue-next'
import { usePlayerStore, CANDY_XP, CANDY_COST } from '~/stores/usePlayerStore'
import type { CandySize } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { EVO_ITEMS, getEvolutionsFor } from '~/data/evolutions'
import { getGenForSlug } from '~/data/pokedex'
import { getSpriteUrl } from '~/utils/showdown'
import type { OwnedPokemon } from '~/stores/useInventoryStore'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const inventory = useInventoryStore()
const { t } = useLocale()

const purchaseFlash = ref<string | null>(null)
const evoMessage = ref<string | null>(null)

function flash(id: string) {
  purchaseFlash.value = id
  setTimeout(() => (purchaseFlash.value = null), 600)
}

// Evolution items cost
const EVO_ITEM_COST = 1500

// --- Evolution picker modal ---
const pickerItemId = ref<string | null>(null)
const pickerCandidates = ref<OwnedPokemon[]>([])

function getEvoCandidates(itemId: string): OwnedPokemon[] {
  const ownedSlugs = new Set(inventory.collection.map((p) => p.slug))
  const seen = new Set<string>()
  return inventory.collection.filter((p) => {
    if (seen.has(p.slug)) return false
    const evos = getEvolutionsFor(p.slug)
    const eligible = evos.some((e) => {
      if (!((e.method === 'stone' || e.method === 'trade') && e.itemRequired === itemId)) return false
      if (ownedSlugs.has(e.toSlug)) return false
      if (getGenForSlug(e.toSlug) > player.currentGeneration) return false
      return true
    })
    if (eligible) seen.add(p.slug)
    return eligible
  })
}

function openEvoPicker(itemId: string) {
  const candidates = getEvoCandidates(itemId)
  if (candidates.length === 0) {
    evoMessage.value = t('Aucun Pokémon compatible !', 'No compatible Pokémon!')
    setTimeout(() => (evoMessage.value = null), 2000)
    return
  }
  pickerItemId.value = itemId
  pickerCandidates.value = candidates
}

function closeEvoPicker() {
  pickerItemId.value = null
  pickerCandidates.value = []
}

function confirmEvolve(pokemon: OwnedPokemon) {
  const itemId = pickerItemId.value
  if (!itemId) return
  if (!player.spendGold(EVO_ITEM_COST)) return

  const count = inventory.evolveAllWithItem(pokemon.slug, itemId)
  if (count > 0) {
    flash(`evo-${itemId}`)
    evoMessage.value = t(
      `${pokemon.nameFr} a évolué !`,
      `${pokemon.nameEn} evolved!`
    )
    setTimeout(() => (evoMessage.value = null), 3000)
  } else {
    player.addGold(EVO_ITEM_COST) // Refund
  }
  closeEvoPicker()
}

function buyGems(amount: number, goldCost: number) {
  if (player.spendGold(goldCost)) {
    player.addGems(amount)
    flash(`gems-${amount}`)
  }
}

// PokeAPI item sprite URLs
const ITEM_SPRITES: Record<string, string> = {
  'fire-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png',
  'water-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png',
  'thunder-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png',
  'leaf-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png',
  'moon-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png',
}

const gemExchanges = [
  { gems: 1, gold: 100 },
  { gems: 5, gold: 450 },
  { gems: 10, gold: 800 },
]

const candySizes: CandySize[] = ['S', 'M', 'L', 'XL']
const CANDY_COLORS: Record<CandySize, string> = { S: '#4ade80', M: '#60a5fa', L: '#c084fc', XL: '#fbbf24' }

function buyCandy(size: CandySize) {
  if (player.buyCandy(size)) {
    flash(`candy-${size}`)
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="text-2xl font-bold">{{ t('Boutique', 'Shop') }}</h2>

    <!-- Gem Exchange -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Gem class="h-4 w-4 text-purple-400" />
        {{ t('Échange Or → Gemmes', 'Gold → Gems Exchange') }}
      </h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          v-for="ex in gemExchanges"
          :key="ex.gems"
          class="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 p-4 transition-all hover:border-purple-500/50 hover:bg-gray-750 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-purple-500/50': purchaseFlash === `gems-${ex.gems}` }"
          :disabled="player.gold < ex.gold"
          @click="buyGems(ex.gems, ex.gold)"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Sparkles class="h-5 w-5 text-purple-400" />
            </div>
            <div class="text-left">
              <p class="font-bold text-purple-300">{{ ex.gems }} {{ t('gemme(s)', 'gem(s)') }}</p>
            </div>
          </div>
          <span class="flex items-center gap-1 text-sm font-bold text-yellow-400">
            🪙 {{ ex.gold.toLocaleString() }}
          </span>
        </button>
      </div>
    </section>


    <!-- XP Candies -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Candy class="h-4 w-4 text-green-400" />
        {{ t('Bonbons XP', 'XP Candies') }}
      </h3>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          v-for="size in candySizes"
          :key="size"
          class="flex flex-col items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 p-4 transition-all hover:border-green-500/30 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-green-500/50': purchaseFlash === `candy-${size}` }"
          :disabled="player.gold < CANDY_COST[size]"
          @click="buyCandy(size)"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full text-lg font-black"
            :style="{ backgroundColor: CANDY_COLORS[size] + '20', color: CANDY_COLORS[size] }"
          >
            {{ size }}
          </div>
          <div class="text-center">
            <p class="text-xs font-bold" :style="{ color: CANDY_COLORS[size] }">
              {{ t('Bonbon', 'Candy') }} {{ size }}
            </p>
            <p class="text-[10px] text-gray-500">+{{ CANDY_XP[size].toLocaleString() }} XP</p>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="rounded-full bg-gray-700/50 px-2 py-0.5 text-[10px] text-gray-400">
              x{{ player.candies[size] }}
            </span>
            <span class="flex items-center gap-1 text-xs font-bold text-yellow-400">
              🪙 {{ CANDY_COST[size].toLocaleString() }}
            </span>
          </div>
        </button>
      </div>
    </section>

    <!-- Evolution Items -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <FlaskConical class="h-4 w-4 text-green-400" />
        {{ t('Objets d\'évolution', 'Evolution Items') }}
      </h3>
      <!-- Evo message -->
      <div v-if="evoMessage" class="mb-3 rounded-lg bg-green-500/10 px-4 py-2 text-center text-sm font-bold text-green-400">
        {{ evoMessage }}
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="item in EVO_ITEMS"
          :key="item.id"
          class="flex flex-col gap-2 rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition-all hover:border-green-500/30 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-green-500/50': purchaseFlash === `evo-${item.id}` }"
          :disabled="player.gold < EVO_ITEM_COST"
          @click="openEvoPicker(item.id)"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700">
              <img
                v-if="ITEM_SPRITES[item.id]"
                :src="ITEM_SPRITES[item.id]"
                :alt="t(item.nameFr, item.nameEn)"
                class="h-8 w-8 object-contain"
              />
              <span v-else class="text-xl">{{ item.icon }}</span>
            </div>
            <div>
              <p class="font-bold text-white">{{ t(item.nameFr, item.nameEn) }}</p>
              <p class="text-xs text-gray-500">{{ t(item.descFr, item.descEn) }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-gray-600">
              {{ getEvoCandidates(item.id).length }} {{ t('Pokémon éligibles', 'eligible Pokémon') }}
            </span>
            <span class="flex items-center gap-1 text-sm font-bold text-yellow-400">
              🪙 {{ EVO_ITEM_COST.toLocaleString() }}
            </span>
          </div>
        </button>
      </div>
    </section>

    <!-- Balance -->
    <div class="flex gap-6 rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-sm">
      <span class="flex items-center gap-1.5 text-yellow-400">
        <Coins class="h-4 w-4" /> {{ player.formattedGold }} {{ t('or', 'gold') }}
      </span>
      <span class="flex items-center gap-1.5 text-purple-400">
        <Gem class="h-4 w-4" /> {{ player.formattedGems }} {{ t('gemmes', 'gems') }}
      </span>
    </div>

    <!-- Evolution Picker Modal -->
    <Teleport to="body">
      <div
        v-if="pickerItemId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeEvoPicker"
      >
        <div class="relative w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
          <button class="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white" @click="closeEvoPicker">
            <X class="h-5 w-5" />
          </button>
          <h3 class="mb-4 text-lg font-bold text-white">
            {{ t('Choisir un Pokémon à faire évoluer', 'Choose a Pokémon to evolve') }}
          </h3>
          <div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            <button
              v-for="poke in pickerCandidates"
              :key="poke.id"
              class="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 text-left transition-all hover:border-green-500/50 hover:bg-gray-750 active:scale-[0.98]"
              @click="confirmEvolve(poke)"
            >
              <img :src="getSpriteUrl(poke.slug)" :alt="t(poke.nameFr, poke.nameEn)" class="h-12 w-12 object-contain" />
              <div class="flex-1">
                <p class="font-bold text-white">{{ t(poke.nameFr, poke.nameEn) }}</p>
                <p class="text-xs text-gray-500">Lv.{{ poke.level }} — ★{{ poke.stars }}</p>
              </div>
              <span class="text-sm font-bold text-yellow-400">🪙 {{ EVO_ITEM_COST.toLocaleString() }}</span>
            </button>
          </div>
          <p v-if="pickerCandidates.length === 0" class="py-6 text-center text-sm text-gray-500">
            {{ t('Aucun Pokémon éligible', 'No eligible Pokémon') }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
