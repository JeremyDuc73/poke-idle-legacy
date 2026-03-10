<script setup lang="ts">
import { Coins, FlaskConical, X, Candy, Zap } from 'lucide-vue-next'
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

// Click Damage Boosts
interface ClickBoost {
  id: string
  nameFr: string
  nameEn: string
  generation: number
  unlockLevel: number
  cost: number
  damage: number
}

const CLICK_BOOSTS: ClickBoost[] = [
  { id: 'click-kanto-1', nameFr: 'Kanto I', nameEn: 'Kanto I', generation: 1, unlockLevel: 10, cost: 200, damage: 5 },
  { id: 'click-kanto-2', nameFr: 'Kanto II', nameEn: 'Kanto II', generation: 1, unlockLevel: 20, cost: 500, damage: 8 },
  { id: 'click-kanto-3', nameFr: 'Kanto III', nameEn: 'Kanto III', generation: 1, unlockLevel: 30, cost: 1500, damage: 12 },
  
  { id: 'click-johto-1', nameFr: 'Johto I', nameEn: 'Johto I', generation: 2, unlockLevel: 35, cost: 3000, damage: 15 },
  { id: 'click-johto-2', nameFr: 'Johto II', nameEn: 'Johto II', generation: 2, unlockLevel: 45, cost: 6000, damage: 20 },
  { id: 'click-johto-3', nameFr: 'Johto III', nameEn: 'Johto III', generation: 2, unlockLevel: 55, cost: 12000, damage: 30 },
  
  { id: 'click-hoenn-1', nameFr: 'Hoenn I', nameEn: 'Hoenn I', generation: 3, unlockLevel: 60, cost: 25000, damage: 30 },
  { id: 'click-hoenn-2', nameFr: 'Hoenn II', nameEn: 'Hoenn II', generation: 3, unlockLevel: 70, cost: 50000, damage: 40 },
  { id: 'click-hoenn-3', nameFr: 'Hoenn III', nameEn: 'Hoenn III', generation: 3, unlockLevel: 80, cost: 100000, damage: 50 },
  
  { id: 'click-sinnoh-1', nameFr: 'Sinnoh I', nameEn: 'Sinnoh I', generation: 4, unlockLevel: 85, cost: 150000, damage: 40 },
  { id: 'click-sinnoh-2', nameFr: 'Sinnoh II', nameEn: 'Sinnoh II', generation: 4, unlockLevel: 95, cost: 250000, damage: 50 },
  { id: 'click-sinnoh-3', nameFr: 'Sinnoh III', nameEn: 'Sinnoh III', generation: 4, unlockLevel: 105, cost: 400000, damage: 60 },
  
  { id: 'click-unova-1', nameFr: 'Unys I', nameEn: 'Unova I', generation: 5, unlockLevel: 110, cost: 500000, damage: 50 },
  { id: 'click-unova-2', nameFr: 'Unys II', nameEn: 'Unova II', generation: 5, unlockLevel: 120, cost: 700000, damage: 60 },
  { id: 'click-unova-3', nameFr: 'Unys III', nameEn: 'Unova III', generation: 5, unlockLevel: 130, cost: 1000000, damage: 70 },
  
  { id: 'click-kalos-1', nameFr: 'Kalos I', nameEn: 'Kalos I', generation: 6, unlockLevel: 135, cost: 1200000, damage: 60 },
  { id: 'click-kalos-2', nameFr: 'Kalos II', nameEn: 'Kalos II', generation: 6, unlockLevel: 145, cost: 1500000, damage: 75 },
  { id: 'click-kalos-3', nameFr: 'Kalos III', nameEn: 'Kalos III', generation: 6, unlockLevel: 155, cost: 1800000, damage: 90 },
  
  { id: 'click-alola-1', nameFr: 'Alola I', nameEn: 'Alola I', generation: 7, unlockLevel: 160, cost: 2000000, damage: 75 },
  { id: 'click-alola-2', nameFr: 'Alola II', nameEn: 'Alola II', generation: 7, unlockLevel: 170, cost: 2500000, damage: 90 },
  { id: 'click-alola-3', nameFr: 'Alola III', nameEn: 'Alola III', generation: 7, unlockLevel: 180, cost: 3000000, damage: 110 },
  
  { id: 'click-galar-1', nameFr: 'Galar I', nameEn: 'Galar I', generation: 8, unlockLevel: 185, cost: 3200000, damage: 90 },
  { id: 'click-galar-2', nameFr: 'Galar II', nameEn: 'Galar II', generation: 8, unlockLevel: 195, cost: 3500000, damage: 110 },
  { id: 'click-galar-3', nameFr: 'Galar III', nameEn: 'Galar III', generation: 8, unlockLevel: 205, cost: 4000000, damage: 130 },
  
  { id: 'click-paldea-1', nameFr: 'Paldea I', nameEn: 'Paldea I', generation: 9, unlockLevel: 210, cost: 4200000, damage: 110 },
  { id: 'click-paldea-2', nameFr: 'Paldea II', nameEn: 'Paldea II', generation: 9, unlockLevel: 220, cost: 4600000, damage: 130 },
  { id: 'click-paldea-3', nameFr: 'Paldea III', nameEn: 'Paldea III', generation: 9, unlockLevel: 230, cost: 5000000, damage: 150 },
]

const purchasedBoosts = ref<Set<string>>(new Set())

onMounted(() => {
  // Load purchased boosts from player store
  const savedBoosts = localStorage.getItem('poke-idle-click-boosts')
  if (savedBoosts) {
    try {
      purchasedBoosts.value = new Set(JSON.parse(savedBoosts))
      // Calculate total bonus
      let totalBonus = 0
      for (const boostId of purchasedBoosts.value) {
        const boost = CLICK_BOOSTS.find(b => b.id === boostId)
        if (boost) totalBonus += boost.damage
      }
      player.clickDamageBonus = totalBonus
    } catch { /* ignore */ }
  }
})

function isBoostUnlocked(boost: ClickBoost): boolean {
  return player.level >= boost.unlockLevel && player.currentGeneration >= boost.generation
}

function isBoostPurchased(boostId: string): boolean {
  return purchasedBoosts.value.has(boostId)
}

function buyClickBoost(boost: ClickBoost) {
  if (!isBoostUnlocked(boost) || isBoostPurchased(boost.id)) return
  if (!player.spendGold(boost.cost)) return
  
  purchasedBoosts.value.add(boost.id)
  player.clickDamageBonus += boost.damage
  player.recalcClickDamage()
  player.saveBonuses()
  
  // Save to localStorage
  localStorage.setItem('poke-idle-click-boosts', JSON.stringify([...purchasedBoosts.value]))
  flash(`boost-${boost.id}`)
  auth.saveGameState()
}

const boostsByGen = computed(() => {
  const grouped: Record<number, ClickBoost[]> = {}
  for (const boost of CLICK_BOOSTS) {
    if (!grouped[boost.generation]) grouped[boost.generation] = []
    grouped[boost.generation]!.push(boost)
  }
  return grouped
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="text-2xl font-bold">{{ t('Boutique', 'Shop') }}</h2>

    <!-- Click Damage Boosts (compact) -->
    <section>
      <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Zap class="h-4 w-4 text-yellow-400" />
        {{ t('Dégâts Clics', 'Click Damage') }}
        <span class="ml-auto text-[10px] text-yellow-400/70">{{ t('Total', 'Total') }}: +{{ player.clickDamageBonus }}</span>
      </h3>
      <div class="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
        <button
          v-for="boost in CLICK_BOOSTS"
          :key="boost.id"
          class="flex flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-center transition-all active:scale-95 disabled:opacity-30"
          :class="{
            'border-green-500/50 bg-green-500/10': isBoostPurchased(boost.id),
            'border-gray-700 bg-gray-800 hover:border-yellow-500/30': !isBoostPurchased(boost.id),
            'ring-2 ring-yellow-500/50': purchaseFlash === `boost-${boost.id}`,
          }"
          :disabled="!isBoostUnlocked(boost) || isBoostPurchased(boost.id) || player.gold < boost.cost"
          @click="buyClickBoost(boost)"
        >
          <span class="text-[10px] font-bold text-gray-400">{{ boost.nameFr }}</span>
          <span class="text-xs font-bold text-yellow-400">+{{ boost.damage }}</span>
          <span v-if="player.currentGeneration < boost.generation" class="text-[9px] text-orange-400">🔒 {{ GENERATION_NAMES[boost.generation] }}</span>
          <span v-else-if="player.level < boost.unlockLevel" class="text-[9px] text-orange-400">🔒 Lv.{{ boost.unlockLevel }}</span>
          <span v-else-if="isBoostPurchased(boost.id)" class="text-[9px] text-green-400">✓</span>
          <span v-else class="text-[9px] text-yellow-400/70">🪙 {{ boost.cost >= 1000000 ? (boost.cost / 1000000).toFixed(1).replace('.0', '') + 'M' : boost.cost >= 1000 ? Math.round(boost.cost / 1000) + 'k' : boost.cost }}</span>
        </button>
      </div>
    </section>

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
