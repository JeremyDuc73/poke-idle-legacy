<script setup lang="ts">
import { Coins, FlaskConical, X, Candy, Zap } from 'lucide-vue-next'
import { usePlayerStore, CANDY_XP, getCandyCost } from '~/stores/usePlayerStore'
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

// Evolution items cost based on CURRENT player generation
function getEvoItemCost(): number {
  const prices: Record<number, number> = { 1: 5000, 2: 7500, 3: 10000, 4: 20000 }
  return prices[player.currentGeneration] ?? 20000
}

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
      if (!((e.method === 'stone' || e.method === 'trade' || e.method === 'happiness') && e.itemRequired === itemId)) return false
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

function isCandyUnlocked(size: CandySize): boolean {
  return player.level >= CANDY_UNLOCK_LEVEL[size]
}

function buyCandy(size: CandySize) {
  if (!isCandyUnlocked(size)) return
  if (player.buyCandy(size)) {
    flash(`candy-${size}`)
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
  { id: 'click-kanto-1', nameFr: 'Boost Clics Kanto I', nameEn: 'Kanto Click Boost I', generation: 1, unlockLevel: 10, cost: 1000, damage: 5 },
  { id: 'click-kanto-2', nameFr: 'Boost Clics Kanto II', nameEn: 'Kanto Click Boost II', generation: 1, unlockLevel: 20, cost: 5000, damage: 10 },
  { id: 'click-kanto-3', nameFr: 'Boost Clics Kanto III', nameEn: 'Kanto Click Boost III', generation: 1, unlockLevel: 30, cost: 15000, damage: 20 },
  
  { id: 'click-johto-1', nameFr: 'Boost Clics Johto I', nameEn: 'Johto Click Boost I', generation: 2, unlockLevel: 35, cost: 25000, damage: 30 },
  { id: 'click-johto-2', nameFr: 'Boost Clics Johto II', nameEn: 'Johto Click Boost II', generation: 2, unlockLevel: 45, cost: 50000, damage: 50 },
  { id: 'click-johto-3', nameFr: 'Boost Clics Johto III', nameEn: 'Johto Click Boost III', generation: 2, unlockLevel: 55, cost: 100000, damage: 75 },
  
  { id: 'click-hoenn-1', nameFr: 'Boost Clics Hoenn I', nameEn: 'Hoenn Click Boost I', generation: 3, unlockLevel: 60, cost: 200000, damage: 100 },
  { id: 'click-hoenn-2', nameFr: 'Boost Clics Hoenn II', nameEn: 'Hoenn Click Boost II', generation: 3, unlockLevel: 70, cost: 400000, damage: 150 },
  { id: 'click-hoenn-3', nameFr: 'Boost Clics Hoenn III', nameEn: 'Hoenn Click Boost III', generation: 3, unlockLevel: 80, cost: 750000, damage: 200 },
  
  { id: 'click-sinnoh-1', nameFr: 'Boost Clics Sinnoh I', nameEn: 'Sinnoh Click Boost I', generation: 4, unlockLevel: 85, cost: 1000000, damage: 250 },
  { id: 'click-sinnoh-2', nameFr: 'Boost Clics Sinnoh II', nameEn: 'Sinnoh Click Boost II', generation: 4, unlockLevel: 95, cost: 2000000, damage: 350 },
  { id: 'click-sinnoh-3', nameFr: 'Boost Clics Sinnoh III', nameEn: 'Sinnoh Click Boost III', generation: 4, unlockLevel: 105, cost: 5000000, damage: 500 },
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
  return player.level >= boost.unlockLevel
}

function isBoostPurchased(boostId: string): boolean {
  return purchasedBoosts.value.has(boostId)
}

function buyClickBoost(boost: ClickBoost) {
  if (!isBoostUnlocked(boost) || isBoostPurchased(boost.id)) return
  if (!player.spendGold(boost.cost)) return
  
  purchasedBoosts.value.add(boost.id)
  player.clickDamageBonus += boost.damage
  player.saveBonuses()
  
  // Save to localStorage
  localStorage.setItem('poke-idle-click-boosts', JSON.stringify([...purchasedBoosts.value]))
  flash(`boost-${boost.id}`)
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

    <!-- Click Damage Boosts -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Zap class="h-4 w-4 text-yellow-400" />
        {{ t('Améliorations Dégâts Clics', 'Click Damage Upgrades') }}
      </h3>
      <div v-for="(boosts, gen) in boostsByGen" :key="gen" class="mb-4">
        <p class="mb-2 text-xs font-bold text-slate-500">{{ t('Génération', 'Generation') }} {{ gen }}</p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            v-for="boost in boosts"
            :key="boost.id"
            class="flex flex-col gap-2 rounded-xl border border-gray-700 bg-gray-800 p-3 transition-all hover:border-yellow-500/30 active:scale-[0.98] disabled:opacity-40"
            :class="{ 
              'ring-2 ring-yellow-500/50': purchaseFlash === `boost-${boost.id}`,
              'border-green-500/50 bg-green-500/10': isBoostPurchased(boost.id)
            }"
            :disabled="!isBoostUnlocked(boost) || isBoostPurchased(boost.id) || player.gold < boost.cost"
            @click="buyClickBoost(boost)"
          >
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20">
                <Zap class="h-4 w-4 text-yellow-400" />
              </div>
              <div class="flex-1 text-left">
                <p class="text-xs font-bold text-white">{{ t(boost.nameFr, boost.nameEn) }}</p>
                <p class="text-[10px] text-gray-500">+{{ boost.damage }} {{ t('dégâts', 'damage') }}</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span v-if="!isBoostUnlocked(boost)" class="text-orange-400">🔒 Niv. {{ boost.unlockLevel }}</span>
              <span v-else-if="isBoostPurchased(boost.id)" class="text-green-400">✓ {{ t('Acheté', 'Purchased') }}</span>
              <span v-else class="text-yellow-400">🪙 {{ boost.cost.toLocaleString() }}</span>
            </div>
          </button>
        </div>
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
          :disabled="!isCandyUnlocked(size) || player.gold < getCandyCost(size, player.currentGeneration)"
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
            <p class="text-[10px] text-gray-500">
              <span v-if="!isCandyUnlocked(size)" class="text-orange-400">🔒 Niv. {{ CANDY_UNLOCK_LEVEL[size] }}</span>
              <span v-else>+{{ CANDY_XP[size].toLocaleString() }} XP</span>
            </p>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="rounded-full bg-gray-700/50 px-2 py-0.5 text-[10px] text-gray-400">
              x{{ player.candies[size] }}
            </span>
            <span class="flex items-center gap-1 text-xs font-bold text-yellow-400">
              🪙 {{ getCandyCost(size, player.currentGeneration).toLocaleString() }}
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
              <img :src="getSpriteUrl(poke.slug)" :alt="t(poke.nameFr, poke.nameEn)" class="h-12 w-12 object-contain" />
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
