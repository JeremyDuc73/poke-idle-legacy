<script setup lang="ts">
import { Star, Shield, Search, Sparkles, X, Trash2, Save, FolderOpen } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { useInventoryStore, MAX_LEVEL } from '~/stores/useInventoryStore'
import type { OwnedPokemon } from '~/stores/useInventoryStore'
import { usePlayerStore, CANDY_XP, CANDY_COST } from '~/stores/usePlayerStore'
import type { CandySize } from '~/stores/usePlayerStore'
import { useLocale } from '~/composables/useLocale'
import { getPokemonType, getPokemonTypes, getEffectiveness, TYPES } from '~/data/types'
import type { PokemonType } from '~/data/types'
import { RARITY_COLORS, RARITY_LABELS_FR, RARITY_LABELS_EN, getRarityDpsMult, getStarDpsMult, RARITY_DPS_MULT, getRarity } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import { getEvolutionStage, getEvoStageMult, EVO_STAGE_MULT, EVOLUTIONS, pokemonXpForLevel } from '~/data/evolutions'
import { getGenForSlug } from '~/data/pokedex'
import { useDaycareStore } from '~/stores/useDaycareStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { POKEDEX } from '~/data/pokedex'

definePageMeta({
  layout: 'game',
})

const inventory = useInventoryStore()
const player = usePlayerStore()
const daycare = useDaycareStore()
const { t } = useLocale()

const candySizes: CandySize[] = ['S', 'M', 'L', 'XL']
const CANDY_COLORS: Record<CandySize, string> = { S: '#4ade80', M: '#60a5fa', L: '#c084fc', XL: '#fbbf24' }

const auth = useAuthStore()

function useCandy(poke: OwnedPokemon, size: CandySize) {
  if (poke.level >= MAX_LEVEL) return
  if (!player.useCandy(size)) return
  inventory.addPokemonXp(poke.id, CANDY_XP[size], player.currentGeneration)
  auth.saveGameState()
}

const sortBy = ref<'stars' | 'level' | 'name' | 'dps' | 'pokedex' | 'rarity'>('stars')
const search = ref('')
const filterType = ref<PokemonType | null>(null)
const filterShiny = ref<boolean | null>(null)
const filterTeam = ref<boolean | null>(null)
const filterGen = ref<number | null>(null)

const sortOptions = computed(() => [
  { value: 'stars', label: `⭐ ${t('Étoiles', 'Stars')}` },
  { value: 'level', label: `Lv ${t('Niveau', 'Level')}` },
  { value: 'name', label: `A-Z ${t('Nom', 'Name')}` },
  { value: 'dps', label: 'DPS' },
  { value: 'pokedex', label: `# ${t('Pokédex', 'Pokédex')}` },
  { value: 'rarity', label: `${t('Rareté', 'Rarity')}` },
])

const genOptions = computed(() => [
  { value: null, label: t('Toutes régions', 'All regions') },
  { value: 1, label: 'Gen 1 - Kanto' },
  { value: 2, label: 'Gen 2 - Johto' },
  { value: 3, label: 'Gen 3 - Hoenn' },
  { value: 4, label: 'Gen 4 - Sinnoh' },
  { value: 5, label: 'Gen 5 - Unys' },
  { value: 6, label: 'Gen 6 - Kalos' },
])

// Team save/load
const showSaveTeamModal = ref(false)
const showLoadTeamModal = ref(false)
const newTeamName = ref('')

function saveCurrentTeam() {
  if (!newTeamName.value.trim()) return
  inventory.saveTeam(newTeamName.value.trim())
  newTeamName.value = ''
  showSaveTeamModal.value = false
}

function loadSavedTeam(name: string) {
  inventory.loadTeam(name)
  showLoadTeamModal.value = false
  auth.saveGameState()
}

function deleteSavedTeam(name: string) {
  inventory.deleteTeam(name)
}

function clearTeam() {
  inventory.team.forEach(p => inventory.removeFromTeam(p.id))
  auth.saveGameState()
}

function handlePokemonRightClick(event: MouseEvent, pokemon: OwnedPokemon) {
  event.preventDefault()
  if (isInDaycare(pokemon)) return
  toggleTeam(pokemon.id)
}

function getPokemonGen(slug: string): number {
  return POKEDEX.find(p => p.slug === slug)?.gen ?? 1
}

const filteredCollection = computed(() => {
  let list = [...inventory.collection]

  // Search
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((p) => p.nameFr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.slug.includes(q))
  }

  // Type filter (match any of the pokemon's types)
  if (filterType.value) {
    list = list.filter((p) => getPokemonTypes(p.slug).includes(filterType.value!))
  }

  // Shiny filter
  if (filterShiny.value === true) list = list.filter((p) => p.isShiny)
  else if (filterShiny.value === false) list = list.filter((p) => !p.isShiny)

  // Team filter
  if (filterTeam.value === true) list = list.filter((p) => p.teamSlot !== null)
  else if (filterTeam.value === false) list = list.filter((p) => p.teamSlot === null)

  // Gen filter
  if (filterGen.value !== null) {
    list = list.filter((p) => getPokemonGen(p.slug) === filterGen.value)
  }

  // Sort — shinies grouped next to their base forms
  switch (sortBy.value) {
    case 'stars':
      list.sort((a, b) => b.stars - a.stars || b.level - a.level || a.slug.localeCompare(b.slug) || Number(a.isShiny) - Number(b.isShiny))
      break
    case 'level':
      list.sort((a, b) => b.level - a.level || b.stars - a.stars || a.slug.localeCompare(b.slug) || Number(a.isShiny) - Number(b.isShiny))
      break
    case 'name':
      list.sort((a, b) => a.slug.localeCompare(b.slug) || Number(a.isShiny) - Number(b.isShiny))
      break
    case 'dps':
      list.sort((a, b) => {
        return pokeDps(b) - pokeDps(a) || a.slug.localeCompare(b.slug) || Number(a.isShiny) - Number(b.isShiny)
      })
      break
    case 'pokedex':
      list.sort((a, b) => {
        const aId = POKEDEX.find(p => p.slug === a.slug)?.id ?? 9999
        const bId = POKEDEX.find(p => p.slug === b.slug)?.id ?? 9999
        return aId - bId || Number(a.isShiny) - Number(b.isShiny)
      })
      break
    case 'rarity':
      const rarityOrder: Record<Rarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 }
      list.sort((a, b) => {
        const aRarity = getRarity(a.slug)
        const bRarity = getRarity(b.slug)
        return rarityOrder[aRarity] - rarityOrder[bRarity] || b.stars - a.stars || a.slug.localeCompare(b.slug) || Number(a.isShiny) - Number(b.isShiny)
      })
      break
  }

  return list
})

// Types present in collection for the filter dropdown
const collectionTypes = computed(() => {
  const types = new Set<PokemonType>()
  for (const p of inventory.collection) {
    for (const t of getPokemonTypes(p.slug)) types.add(t)
  }
  return TYPES.filter((t) => types.has(t.id))
})

function isInDaycare(pokemon: OwnedPokemon): boolean {
  return daycare.hasSlug(pokemon.slug, pokemon.isShiny)
}

// Check if a pokemon can evolve with an item (stone/trade/happiness)
const evoItemSlugs = computed(() => {
  const ownedKeys = new Set(inventory.collection.map(p => `${p.slug}-${p.isShiny}`))
  const result = new Set<string>()
  for (const p of inventory.collection) {
    const key = `${p.slug}-${p.isShiny}`
    if (result.has(key)) continue
    const evos = EVOLUTIONS.filter(e => e.fromSlug === p.slug)
    const hasItemEvo = evos.some(e => {
      if (!(e.method === 'stone' || e.method === 'trade' || e.method === 'happiness') || !e.itemRequired) return false
      if (ownedKeys.has(`${e.toSlug}-${p.isShiny}`)) return false
      if (getGenForSlug(e.toSlug) > player.currentGeneration) return false
      return true
    })
    if (hasItemEvo) result.add(key)
  }
  return result
})

function canEvolveWithItem(poke: OwnedPokemon): boolean {
  return evoItemSlugs.value.has(`${poke.slug}-${poke.isShiny}`)
}

function toggleTeam(pokemonId: number) {
  const pokemon = inventory.collection.find((p) => p.id === pokemonId)
  if (!pokemon) return
  if (isInDaycare(pokemon)) return

  if (pokemon.teamSlot !== null) {
    inventory.removeFromTeam(pokemonId)
  } else {
    const nextSlot = [1, 2, 3, 4, 5, 6].find(
      (s) => !inventory.team.some((p) => p.teamSlot === s)
    )
    if (nextSlot) {
      inventory.setTeamSlot(pokemonId, nextSlot)
    }
  }
  auth.saveGameState()
}

// New damage formula: base=level×2, mults: evo, rarity, shiny, type
function pokeDps(p: OwnedPokemon, enemyType?: PokemonType): number {
  const baseDmg = p.level * 2
  const evoMult = getEvoStageMult(p.slug)
  const rarityMult = RARITY_DPS_MULT[p.rarity] ?? 1.0
  const shinyMult = p.isShiny ? 4.0 : 1.0
  const starMult = getStarDpsMult(p.stars, p.isShiny)
  const typeMult = enemyType ? getEffectiveness(getPokemonType(p.slug), enemyType) : 1
  return Math.round(Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult) * typeMult)
}

function rarityLabel(r: Rarity): string {
  return t(RARITY_LABELS_FR[r], RARITY_LABELS_EN[r])
}

// --- Detail modal ---
const detailPokemon = ref<OwnedPokemon | null>(null)

function openDetail(poke: OwnedPokemon) {
  detailPokemon.value = poke
}

function closeDetail() {
  detailPokemon.value = null
}

// --- Drag & Drop Team ---
const dragSlot = ref<number | null>(null)
const dragOverSlot = ref<number | null>(null)
const dragPokemonId = ref<number | null>(null)

function onTeamDragStart(event: DragEvent, slot: number, pokeId: number) {
  dragSlot.value = slot
  dragPokemonId.value = pokeId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(pokeId))
  }
}

function onTeamDragOver(event: DragEvent, slot: number) {
  event.preventDefault()
  dragOverSlot.value = slot
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onTeamDragLeave() {
  dragOverSlot.value = null
}

function onTeamDrop(event: DragEvent, targetSlot: number) {
  event.preventDefault()
  dragOverSlot.value = null
  const pokeId = dragPokemonId.value
  if (pokeId === null) return

  // If dropping on a team slot, swap/move
  inventory.setTeamSlot(pokeId, targetSlot)
  dragSlot.value = null
  dragPokemonId.value = null
  auth.saveGameState()
}

function onTeamDragEnd() {
  dragSlot.value = null
  dragOverSlot.value = null
  dragPokemonId.value = null
}

// Drag from collection to team
function onCollectionDragStart(event: DragEvent, poke: OwnedPokemon) {
  if (poke.teamSlot !== null || isInDaycare(poke)) return
  dragPokemonId.value = poke.id
  dragSlot.value = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(poke.id))
  }
}

function getDetailStats(poke: OwnedPokemon) {
  const baseDmg = poke.level * 2
  const evoStage = getEvolutionStage(poke.slug)
  const evoMult = getEvoStageMult(poke.slug)
  const rarityMult = RARITY_DPS_MULT[poke.rarity] ?? 1.0
  const shinyMult = poke.isShiny ? 4.0 : 1.0
  const starMult = getStarDpsMult(poke.stars, poke.isShiny)
  const permanentDps = Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult)
  
  // Pour doubles types: montrer le MEILLEUR multiplicateur offensif
  const attackerTypes = getPokemonTypes(poke.slug)
  const typeMatchups = TYPES.map((tp) => {
    // Calculer effectiveness pour CHAQUE type offensif, prendre le meilleur
    const mult = Math.max(...attackerTypes.map(atkType => 
      getEffectiveness(atkType, tp.id)
    ))
    return {
      type: tp,
      mult,
    }
  })

  return { baseDmg, evoStage, evoMult, rarityMult, shinyMult, starMult, permanentDps, typeMatchups }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">
        {{ t('Inventaire', 'Inventory') }}
        <span class="text-sm font-normal text-gray-400">({{ filteredCollection.length }}/{{ inventory.collectionCount }})</span>
      </h2>
    </div>

    <!-- Team -->
    <div>
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-400">
          <Shield class="h-4 w-4" />
          {{ t('Équipe active', 'Active Team') }} ({{ inventory.team.length }}/6)
          <span class="ml-2 text-xs text-cyan-400">DPS: {{ inventory.teamDps }}</span>
        </h3>
        <div class="flex gap-2 sm:ml-auto">
          <button
            v-if="inventory.team.length > 0"
            class="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-red-500"
            @click="clearTeam"
          >
            <Trash2 class="h-3.5 w-3.5 inline" /> {{ t('Vider', 'Clear') }}
          </button>
          <button
            v-if="inventory.team.length > 0"
            class="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-cyan-500"
            @click="showSaveTeamModal = true"
          >
            <Save class="h-3.5 w-3.5 inline" /> {{ t('Sauvegarder', 'Save') }}
          </button>
          <button
            v-if="inventory.savedTeams.length > 0"
            class="rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-purple-500"
            @click="showLoadTeamModal = true"
          >
            <FolderOpen class="h-3.5 w-3.5 inline" /> {{ t('Charger', 'Load') }}
          </button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <div
          v-for="slot in [1, 2, 3, 4, 5, 6]"
          :key="slot"
          class="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border bg-gray-800 py-1 transition-all duration-200"
          :class="[
            dragOverSlot === slot ? 'border-cyan-400 bg-cyan-500/20 scale-110 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/50' : 'border-gray-700',
            dragSlot === slot ? 'opacity-40 scale-95' : '',
            inventory.team.find((p) => p.teamSlot === slot) ? 'cursor-grab hover:border-blue-500/50' : '',
            dragPokemonId !== null && !inventory.team.find((p) => p.teamSlot === slot) && dragOverSlot !== slot ? 'border-dashed border-cyan-600/40' : '',
          ]"
          :draggable="!!inventory.team.find((p) => p.teamSlot === slot)"
          @dragstart="inventory.team.find((p) => p.teamSlot === slot) ? onTeamDragStart($event, slot, inventory.team.find((p) => p.teamSlot === slot)!.id) : null"
          @dragover="onTeamDragOver($event, slot)"
          @dragleave="onTeamDragLeave"
          @drop="onTeamDrop($event, slot)"
          @dragend="onTeamDragEnd"
          @click="inventory.team.find((p) => p.teamSlot === slot) ? openDetail(inventory.team.find((p) => p.teamSlot === slot)!) : null"
          @contextmenu.prevent="inventory.team.find((p) => p.teamSlot === slot) ? inventory.removeFromTeam(inventory.team.find((p) => p.teamSlot === slot)!.id) : null"
        >
          <template v-if="inventory.team.find((p) => p.teamSlot === slot)">
            <img
              :src="inventory.team.find((p) => p.teamSlot === slot)!.isShiny
                ? getShinySpriteUrl(inventory.team.find((p) => p.teamSlot === slot)!.slug)
                : getSpriteUrl(inventory.team.find((p) => p.teamSlot === slot)!.slug)"
              class="pointer-events-none h-10 w-10 select-none object-contain"
              draggable="false"
            />
            <div class="flex gap-0.5">
              <TypeBadge
                v-for="type in getPokemonTypes(inventory.team.find((p) => p.teamSlot === slot)!.slug)"
                :key="type"
                :type="type"
                size="xs"
              />
            </div>
            <div class="flex gap-0.5">
              <Star
                v-for="s in inventory.team.find((p) => p.teamSlot === slot)!.stars"
                :key="s"
                class="h-2 w-2 fill-yellow-400 text-yellow-400"
              />
            </div>
          </template>
          <template v-else>
            <span class="text-2xl text-gray-600">?</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Search -->
      <div class="relative w-full sm:w-auto">
        <Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('Rechercher...', 'Search...')"
          class="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 sm:w-auto"
        />
      </div>

      <!-- Sort dropdown -->
      <CustomSelect
        :model-value="sortBy"
        :options="sortOptions"
        @update:model-value="sortBy = $event"
      />

      <!-- Shiny toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium shadow-md transition-all hover:shadow-lg"
        :class="filterShiny === true
          ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 text-yellow-400 shadow-yellow-500/20'
          : 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'"
        @click="filterShiny = filterShiny === true ? null : true"
      >
        <Sparkles class="h-3.5 w-3.5" />
        Shiny
      </button>

      <!-- Team toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium shadow-md transition-all hover:shadow-lg"
        :class="filterTeam === true
          ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 text-cyan-400 shadow-cyan-500/20'
          : 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'"
        @click="filterTeam = filterTeam === true ? null : true"
      >
        <Shield class="h-3.5 w-3.5" />
        {{ t('Équipe', 'Team') }}
      </button>

      <!-- Gen/Region filter -->
      <CustomSelect
        :model-value="filterGen"
        :options="genOptions"
        @update:model-value="filterGen = $event"
      />
    </div>

    <!-- Type filter row -->
    <div class="flex flex-wrap items-center gap-1">
      <button
        class="rounded-lg border px-2.5 py-1 text-[10px] font-medium shadow-sm transition-all hover:shadow-md"
        :class="filterType === null
          ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/30 text-blue-400 shadow-blue-500/20'
          : 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'"
        @click="filterType = null"
      >
        {{ t('Tous', 'All') }}
      </button>
      <button
        v-for="tp in collectionTypes"
        :key="tp.id"
        class="rounded-lg border px-2.5 py-1 text-[10px] font-medium shadow-sm transition-all hover:shadow-md"
        :class="filterType === tp.id
          ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/30 text-blue-400 shadow-blue-500/20'
          : 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'"
        :style="filterType === tp.id ? { borderColor: tp.color, backgroundColor: tp.color + '20', color: tp.color } : {}"
        @click="filterType = filterType === tp.id ? null : tp.id"
      >
        {{ t(tp.nameFr, tp.nameEn) }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filteredCollection.length === 0" class="flex flex-col items-center gap-4 py-12 text-gray-500">
      <Star class="h-12 w-12" />
      <p>{{ t('Aucun Pokémon trouvé.', 'No Pokémon found.') }}</p>
      <NuxtLink
        v-if="inventory.collectionCount === 0"
        to="/gacha"
        class="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-500"
      >
        {{ t('Invoquer', 'Summon') }}
      </NuxtLink>
    </div>

    <!-- Collection Grid -->
    <div v-else class="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
      <button
        v-for="pokemon in filteredCollection"
        :key="pokemon.id"
        :draggable="pokemon.teamSlot === null && !isInDaycare(pokemon)"
        class="group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105"
        :style="dragPokemonId === pokemon.id ? { opacity: 0.4, transform: 'scale(0.95)' } : {}"
        :class="pokemon.teamSlot !== null
          ? 'border-cyan-500 bg-cyan-500/10 cursor-default'
          : isInDaycare(pokemon)
            ? 'border-purple-500/50 bg-purple-500/5 cursor-not-allowed'
            : 'border-gray-700 bg-gray-800 hover:border-blue-500'"
        @dragstart="onCollectionDragStart($event, pokemon)"
        @dragend="onTeamDragEnd"
        @click="openDetail(pokemon)"
        @contextmenu.prevent="handlePokemonRightClick($event, pokemon)"
      >
        <span
          v-if="pokemon.isShiny"
          class="absolute -right-1 -top-1 text-xs"
        >✨</span>
        <span
          v-if="pokemon.teamSlot !== null"
          class="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black"
        >
          {{ pokemon.teamSlot }}
        </span>
        <!-- Evo item indicator -->
        <span
          v-if="canEvolveWithItem(pokemon)"
          class="absolute -left-1 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/90 text-[10px] shadow-lg"
          :title="t('Peut évoluer avec un item !', 'Can evolve with an item!')"
        >🔮</span>
        <!-- Rarity indicator -->
        <span
          class="absolute -right-1 top-4 h-2 w-2 rounded-full"
          :style="{ backgroundColor: RARITY_COLORS[pokemon.rarity ?? 'common'] }"
        />
        <img
          :src="pokemon.isShiny ? getShinySpriteUrl(pokemon.slug) : getSpriteUrl(pokemon.slug)"
          :alt="t(pokemon.nameFr, pokemon.nameEn)"
          class="h-14 w-14 object-contain"
        />
        <div class="flex w-full flex-wrap justify-center gap-0.5">
          <TypeBadge v-for="type in getPokemonTypes(pokemon.slug)" :key="type" :type="type" size="xs" />
        </div>
        <p class="w-full truncate text-center text-[10px] text-gray-300">
          {{ t(pokemon.nameFr, pokemon.nameEn) }}
        </p>
        <span class="text-[8px] font-bold" :style="{ color: RARITY_COLORS[pokemon.rarity ?? 'common'] }">
          {{ rarityLabel(pokemon.rarity ?? 'common') }}
        </span>
        <div class="flex items-center gap-1">
          <div class="flex gap-0.5">
            <Star
              v-for="s in pokemon.stars"
              :key="s"
              class="h-2.5 w-2.5 fill-yellow-400 text-yellow-400"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5 text-[9px]">
          <span class="text-gray-500">Lv.{{ pokemon.level }}</span>
          <span class="font-medium text-cyan-400">{{ pokeDps(pokemon) }} DPS</span>
        </div>
      </button>
    </div>

    <!-- Pokemon Detail Modal -->
    <Teleport to="body">
      <div
        v-if="detailPokemon"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeDetail"
      >
        <div class="relative w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
          <button class="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white" @click="closeDetail">
            <X class="h-5 w-5" />
          </button>

          <!-- Header -->
          <div class="mb-4 flex items-center gap-4">
            <img
              :src="detailPokemon.isShiny ? getShinySpriteUrl(detailPokemon.slug) : getSpriteUrl(detailPokemon.slug)"
              class="h-20 w-20 object-contain"
            />
            <div>
              <h3 class="text-xl font-bold text-white">
                {{ t(detailPokemon.nameFr, detailPokemon.nameEn) }}
                <span v-if="detailPokemon.isShiny" class="text-sm">✨</span>
              </h3>
              <div class="mt-1 flex items-center gap-2">
                <div class="flex gap-1">
                  <TypeBadge v-for="type in getPokemonTypes(detailPokemon.slug)" :key="type" :type="type" />
                </div>
                <span class="text-xs font-bold" :style="{ color: RARITY_COLORS[detailPokemon.rarity ?? 'common'] }">
                  {{ rarityLabel(detailPokemon.rarity ?? 'common') }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-400">
                Lv.{{ detailPokemon.level }} —
                <span class="text-yellow-400">★{{ detailPokemon.stars }}</span>
              </p>
            </div>
          </div>

          <!-- XP Progress -->
          <div v-if="detailPokemon.level < MAX_LEVEL" class="mb-4">
            <div class="mb-1 flex justify-between text-[10px] text-gray-400">
              <span>{{ t('Expérience', 'Experience') }}</span>
              <span>{{ detailPokemon.xp.toLocaleString() }} / {{ pokemonXpForLevel(detailPokemon.level + 1, detailPokemon.rarity).toLocaleString() }} XP</span>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                :style="{ width: `${Math.min(100, (detailPokemon.xp / pokemonXpForLevel(detailPokemon.level + 1, detailPokemon.rarity)) * 100)}%` }"
              />
            </div>
            <p class="mt-1 text-[10px] text-gray-500">
              {{ t('Prochain niveau', 'Next level') }}: Lv.{{ detailPokemon.level + 1 }}
              — {{ Math.max(0, pokemonXpForLevel(detailPokemon.level + 1, detailPokemon.rarity) - detailPokemon.xp).toLocaleString() }} XP {{ t('restants', 'remaining') }}
            </p>
          </div>
          <div v-else class="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs font-bold text-amber-400">
            {{ t('Niveau maximum atteint !', 'Maximum level reached!') }}
          </div>

          <!-- Damage breakdown -->
          <div v-if="detailPokemon" class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Détail des dégâts', 'Damage Breakdown') }}</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-lg bg-gray-800 px-3 py-2">
                <p class="text-[10px] uppercase text-gray-500">{{ t('Dégâts de base', 'Base damage') }}</p>
                <p class="text-lg font-bold text-white">{{ getDetailStats(detailPokemon).baseDmg }}</p>
                <p class="text-[10px] text-gray-600">= {{ t('niveau × 2', 'level × 2') }}</p>
              </div>
              <div class="rounded-lg bg-gray-800 px-3 py-2">
                <p class="text-[10px] uppercase text-gray-500">{{ t('DPS permanent', 'Permanent DPS') }}</p>
                <p class="text-lg font-bold text-cyan-400">{{ getDetailStats(detailPokemon).permanentDps }}</p>
              </div>
            </div>

            <!-- Multipliers -->
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Multiplicateurs', 'Multipliers') }}</h4>
            <div class="flex flex-wrap gap-2">
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">{{ t('Évolution', 'Evolution') }}</span>
                <span class="ml-1 font-bold" :class="getDetailStats(detailPokemon).evoMult > 1 ? 'text-green-400' : 'text-gray-400'">
                  x{{ getDetailStats(detailPokemon).evoMult }}
                </span>
                <span class="ml-1 text-[10px] text-gray-600">
                  ({{ ['Base', 'Stade 1', 'Stade 2'][getDetailStats(detailPokemon).evoStage] }})
                </span>
              </div>
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">{{ t('Rareté', 'Rarity') }}</span>
                <span class="ml-1 font-bold" :style="{ color: RARITY_COLORS[detailPokemon.rarity ?? 'common'] }">
                  x{{ getDetailStats(detailPokemon).rarityMult }}
                </span>
              </div>
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">Shiny</span>
                <span class="ml-1 font-bold" :class="detailPokemon.isShiny ? 'text-yellow-400' : 'text-gray-400'">
                  x{{ getDetailStats(detailPokemon).shinyMult }}
                </span>
              </div>
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">★{{ detailPokemon.stars }}</span>
                <span class="ml-1 font-bold" :class="getDetailStats(detailPokemon).starMult > 1 ? 'text-amber-400' : 'text-gray-400'">
                  x{{ getDetailStats(detailPokemon).starMult }}
                </span>
              </div>
            </div>

            <!-- Type matchups -->
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Table des types', 'Type Matchups') }}</h4>
            <div class="flex flex-wrap gap-1">
              <template v-for="m in getDetailStats(detailPokemon).typeMatchups" :key="m.type.id">
                <div
                  v-if="m.mult !== 1"
                  class="rounded px-2 py-0.5 text-[10px] font-bold"
                  :class="m.mult > 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                >
                  {{ t(m.type.nameFr, m.type.nameEn) }} x{{ m.mult }}
                </div>
              </template>
            </div>

            <!-- XP Candies -->
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Bonbons XP', 'XP Candies') }}</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in candySizes"
                :key="size"
                class="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-bold transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-30"
                :disabled="player.candies[size] <= 0 || detailPokemon.level >= MAX_LEVEL"
                :style="{ color: CANDY_COLORS[size], borderColor: CANDY_COLORS[size] + '40' }"
                @click="useCandy(detailPokemon, size)"
              >
                {{ size }}
                <span class="text-[10px] text-gray-500">+{{ CANDY_XP[size].toLocaleString() }} XP</span>
                <span class="rounded bg-gray-800 px-1 py-px text-[9px] text-gray-400">x{{ player.candies[size] }}</span>
              </button>
            </div>
            <p v-if="detailPokemon.level >= MAX_LEVEL" class="text-[10px] text-amber-400">
              {{ t('Niveau max atteint !', 'Max level reached!') }}
            </p>

            <!-- Team action -->
            <div class="flex gap-2 pt-2">
              <button
                v-if="detailPokemon.teamSlot !== null"
                class="flex-1 rounded-lg bg-red-500/20 py-2 text-sm font-bold text-red-400 hover:bg-red-500/30"
                @click="toggleTeam(detailPokemon.id); closeDetail()"
              >
                {{ t('Retirer de l\'équipe', 'Remove from Team') }}
              </button>
              <button
                v-else-if="isInDaycare(detailPokemon)"
                class="flex-1 rounded-lg bg-gray-500/20 py-2 text-sm font-bold text-gray-500 cursor-not-allowed"
                disabled
              >
                {{ t('En pension', 'In Daycare') }}
              </button>
              <button
                v-else
                class="flex-1 rounded-lg bg-cyan-500/20 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/30"
                :disabled="inventory.team.length >= 6"
                @click="toggleTeam(detailPokemon.id); closeDetail()"
              >
                {{ t('Ajouter à l\'équipe', 'Add to Team') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Save Team Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSaveTeamModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          @click="showSaveTeamModal = false"
        >
          <div
            class="w-full max-w-md rounded-2xl border-2 border-cyan-500 bg-gray-900 p-6"
            @click.stop
          >
            <h3 class="mb-4 flex items-center gap-2 text-xl font-bold text-cyan-400"><Save class="h-5 w-5" /> {{ t('Sauvegarder l\'équipe', 'Save Team') }}</h3>
            <input
              v-model="newTeamName"
              type="text"
              :placeholder="t('Nom de l\'équipe', 'Team name')"
              class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              @keyup.enter="saveCurrentTeam"
            />
            <div class="mt-4 flex gap-2">
              <button
                class="flex-1 rounded-lg bg-gray-700 py-2 font-bold text-white transition-colors hover:bg-gray-600"
                @click="showSaveTeamModal = false"
              >
                {{ t('Annuler', 'Cancel') }}
              </button>
              <button
                class="flex-1 rounded-lg bg-cyan-600 py-2 font-bold text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
                :disabled="!newTeamName.trim()"
                @click="saveCurrentTeam"
              >
                {{ t('Sauvegarder', 'Save') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Load Team Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLoadTeamModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          @click="showLoadTeamModal = false"
        >
          <div
            class="w-full max-w-md rounded-2xl border-2 border-purple-500 bg-gray-900 p-6"
            @click.stop
          >
            <h3 class="mb-4 flex items-center gap-2 text-xl font-bold text-purple-400"><FolderOpen class="h-5 w-5" /> {{ t('Charger une équipe', 'Load Team') }}</h3>
            <div class="max-h-96 space-y-2 overflow-y-auto">
              <div
                v-for="team in inventory.savedTeams"
                :key="team.name"
                class="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 p-3 transition-colors hover:border-purple-500"
              >
                <div class="flex-1">
                  <p class="font-bold text-white">{{ team.name }}</p>
                  <p class="text-xs text-gray-400">{{ team.pokemonIds.length }} {{ t('Pokémon', 'Pokémon') }}</p>
                </div>
                <button
                  class="rounded bg-purple-600 px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-purple-500"
                  @click="loadSavedTeam(team.name)"
                >
                  {{ t('Charger', 'Load') }}
                </button>
                <button
                  class="rounded bg-red-600 px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-red-500"
                  @click="deleteSavedTeam(team.name)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
              <p v-if="inventory.savedTeams.length === 0" class="py-8 text-center text-gray-500">
                {{ t('Aucune équipe sauvegardée', 'No saved teams') }}
              </p>
            </div>
            <button
              class="mt-4 w-full rounded-lg bg-gray-700 py-2 font-bold text-white transition-colors hover:bg-gray-600"
              @click="showLoadTeamModal = false"
            >
              {{ t('Fermer', 'Close') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
