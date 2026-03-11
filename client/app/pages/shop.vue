<script setup lang="ts">
import { Coins, FlaskConical, X, Candy } from 'lucide-vue-next'
import { usePlayerStore, CANDY_XP, getCandyCost } from '~/stores/usePlayerStore'
import type { CandySize } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { EVO_ITEMS, getEvolutionsFor } from '~/data/evolutions'
import { getGenForSlug } from '~/data/pokedex'
import { getSpriteUrl } from '~/utils/showdown'
import type { OwnedPokemon } from '~/stores/useInventoryStore'

definePageMeta({
  layout: 'game',
})

const GENERATION_NAMES: Record<number, string> = {
  1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh', 5: 'Unys', 6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea',
}

const player = usePlayerStore()
const inventory = useInventoryStore()
const auth = useAuthStore()
const { t } = useLocale()

const purchaseFlash = ref<string | null>(null)
const evoMessage = ref<string | null>(null)

function flash(id: string) {
  purchaseFlash.value = id
  setTimeout(() => (purchaseFlash.value = null), 600)
}

// Evolution items cost based on CURRENT player generation
function getEvoItemCost(): number {
  const prices: Record<number, number> = {
    1: 5000, 2: 10000, 3: 25000, 4: 50000, 5: 100000,
    6: 200000, 7: 400000, 8: 700000, 9: 1000000,
  }
  return prices[player.currentGeneration] ?? 1000000
}

// --- Evolution picker modal ---
const pickerItemId = ref<string | null>(null)
const pickerCandidates = ref<OwnedPokemon[]>([])

function getEvoCandidates(itemId: string): OwnedPokemon[] {
  // Build slug+shiny keys for owned pokemon so we check per-variant
  const ownedKeys = new Set(inventory.collection.map((p) => `${p.slug}-${p.isShiny}`))
  const seen = new Set<string>()
  return inventory.collection.filter((p) => {
    const key = `${p.slug}-${p.isShiny}`
    if (seen.has(key)) return false
    const evos = getEvolutionsFor(p.slug)
    const eligible = evos.some((e) => {
      if (!((e.method === 'stone' || e.method === 'trade' || e.method === 'happiness') && e.itemRequired === itemId)) return false
      // Check if this specific variant (same isShiny) already has the evolved form
      if (ownedKeys.has(`${e.toSlug}-${p.isShiny}`)) return false
      if (getGenForSlug(e.toSlug) > player.currentGeneration) return false
      return true
    })
    if (eligible) seen.add(key)
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
  const cost = getEvoItemCost()
  if (!player.spendGold(cost)) return

  const count = inventory.evolveAllWithItem(pokemon.slug, itemId, player.currentGeneration)
  if (count > 0) {
    flash(`evo-${itemId}`)
    evoMessage.value = t(
      `${pokemon.nameFr} a évolué !`,
      `${pokemon.nameEn} evolved!`
    )
    setTimeout(() => (evoMessage.value = null), 3000)
    auth.saveGameState()
  } else {
    player.addGold(cost) // Refund
  }
  closeEvoPicker()
}

// PokeAPI item sprite URLs
const ITEM_SPRITES: Record<string, string> = {
  'fire-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png',
  'water-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png',
  'thunder-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png',
  'leaf-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png',
  'moon-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png',
  'link-cable': 'https://wiki.cobblemon.com/images/3/33/Link_Cable.png?v=2',
  'kings-rock': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png',
  'prism-scale': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/prism-scale.png',
  'razor-claw': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-claw.png',
  'deep-sea-tooth': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-tooth.png',
  'deep-sea-scale': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-scale.png',
  'shed-shell': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shed-shell.png',
  'soothe-bell': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soothe-bell.png',
  'sun-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png',
  'dusk-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-stone.png',
  'shiny-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-stone.png',
  'dawn-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dawn-stone.png',
  'ice-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ice-stone.png',
  'protector': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protector.png',
  'electirizer': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electirizer.png',
  'magmarizer': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magmarizer.png',
  'dubious-disc': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dubious-disc.png',
  'reaper-cloth': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/reaper-cloth.png',
}

const candySizes: CandySize[] = ['S', 'M', 'L', 'XL']
const CANDY_COLORS: Record<CandySize, string> = { S: '#4ade80', M: '#60a5fa', L: '#c084fc', XL: '#fbbf24' }
const CANDY_UNLOCK_LEVEL: Record<CandySize, number> = { S: 5, M: 15, L: 30, XL: 50 }
const CANDY_QUANTITIES = [1, 5, 10, 50] as const
const candyQty = ref<number>(1)

function isCandyUnlocked(size: CandySize): boolean {
  return player.level >= CANDY_UNLOCK_LEVEL[size]
}

function getCandyTotalCost(size: CandySize): number {
  return getCandyCost(size, player.currentGeneration) * candyQty.value
}

function buyCandy(size: CandySize) {
  if (!isCandyUnlocked(size)) return
  if (player.buyCandy(size, candyQty.value)) {
    flash(`candy-${size}`)
    auth.saveGameState()
  }
}

</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="text-2xl font-bold">{{ t('Boutique', 'Shop') }}</h2>

    <!-- XP Candies -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Candy class="h-4 w-4 text-green-400" />
        {{ t('Bonbons XP', 'XP Candies') }}
      </h3>
      <!-- Quantity selector -->
      <div class="mb-3 flex items-center gap-2">
        <span class="text-xs text-gray-500">{{ t('Quantité', 'Quantity') }}:</span>
        <div class="flex gap-1">
          <button
            v-for="qty in CANDY_QUANTITIES"
            :key="qty"
            class="rounded-lg border px-2.5 py-1 text-xs font-bold transition-all"
            :class="candyQty === qty
              ? 'border-green-500 bg-green-500/20 text-green-400'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'"
            @click="candyQty = qty"
          >
            x{{ qty }}
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          v-for="size in candySizes"
          :key="size"
          class="flex flex-col items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 p-4 transition-all hover:border-green-500/30 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-green-500/50': purchaseFlash === `candy-${size}` }"
          :disabled="!isCandyUnlocked(size) || player.gold < getCandyTotalCost(size)"
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
              {{ t('Bonbon', 'Candy') }} {{ size }} <span v-if="candyQty > 1" class="text-gray-500">×{{ candyQty }}</span>
            </p>
            <p class="text-[10px] text-gray-500">
              <span v-if="!isCandyUnlocked(size)" class="text-orange-400">🔒 Niv. {{ CANDY_UNLOCK_LEVEL[size] }}</span>
              <span v-else>+{{ (CANDY_XP[size] * candyQty).toLocaleString() }} XP</span>
            </p>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="rounded-full bg-gray-700/50 px-2 py-0.5 text-[10px] text-gray-400">
              x{{ player.candies[size] }}
            </span>
            <span class="flex items-center gap-1 text-xs font-bold text-yellow-400">
              🪙 {{ getCandyTotalCost(size).toLocaleString() }}
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
          :disabled="player.gold < getEvoItemCost()"
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
              🪙 {{ getEvoItemCost().toLocaleString() }}
            </span>
          </div>
        </button>
      </div>
    </section>

    <!-- Balance -->
    <div class="flex gap-6 rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-sm">
      <span class="flex items-center gap-1.5 text-yellow-400">
        <Coins class="h-4 w-4" /> {{ player.formattedGold }} {{ t('PokéDollar', 'PokéDollar') }}
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
              <PokemonSprite :slug="poke.slug" :alt="t(poke.nameFr, poke.nameEn)" class="h-12 w-12" />
              <div class="flex-1">
                <p class="font-bold text-white">{{ t(poke.nameFr, poke.nameEn) }}</p>
                <p class="text-xs text-gray-500">Lv.{{ poke.level }} — ★{{ poke.stars }}</p>
              </div>
              <span class="text-sm font-bold text-yellow-400">🪙 {{ getEvoItemCost().toLocaleString() }}</span>
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
