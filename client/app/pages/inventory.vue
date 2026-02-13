<script setup lang="ts">
import { Star, Shield, ArrowUpDown, Search, Sparkles, Filter } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { getPokemonType, TYPES } from '~/data/types'
import type { PokemonType } from '~/data/types'

definePageMeta({
  layout: 'game',
})

const inventory = useInventoryStore()
const { t } = useLocale()

const sortBy = ref<'stars' | 'level' | 'name' | 'dps'>('stars')
const search = ref('')
const filterType = ref<PokemonType | null>(null)
const filterShiny = ref<boolean | null>(null)
const filterTeam = ref<boolean | null>(null)

const filteredCollection = computed(() => {
  let list = [...inventory.collection]

  // Search
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((p) => p.nameFr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.slug.includes(q))
  }

  // Type filter
  if (filterType.value) {
    list = list.filter((p) => getPokemonType(p.slug) === filterType.value)
  }

  // Shiny filter
  if (filterShiny.value === true) list = list.filter((p) => p.isShiny)
  else if (filterShiny.value === false) list = list.filter((p) => !p.isShiny)

  // Team filter
  if (filterTeam.value === true) list = list.filter((p) => p.teamSlot !== null)
  else if (filterTeam.value === false) list = list.filter((p) => p.teamSlot === null)

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
        const dpsA = Math.floor(a.level * (1 + a.stars * 0.25)) * (a.isShiny ? 1.5 : 1)
        const dpsB = Math.floor(b.level * (1 + b.stars * 0.25)) * (b.isShiny ? 1.5 : 1)
        return dpsB - dpsA || a.slug.localeCompare(b.slug) || Number(a.isShiny) - Number(b.isShiny)
      })
      break
  }

  return list
})

// Types present in collection for the filter dropdown
const collectionTypes = computed(() => {
  const types = new Set<PokemonType>()
  for (const p of inventory.collection) types.add(getPokemonType(p.slug))
  return TYPES.filter((t) => types.has(t.id))
})

function toggleTeam(pokemonId: number) {
  const pokemon = inventory.collection.find((p) => p.id === pokemonId)
  if (!pokemon) return

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
}

function pokeDps(p: { level: number; stars: number; isShiny: boolean }): number {
  return Math.round(Math.floor(p.level * (1 + p.stars * 0.25)) * (p.isShiny ? 1.5 : 1))
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
      <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Shield class="h-4 w-4" />
        {{ t('Équipe active', 'Active Team') }} ({{ inventory.team.length }}/6)
        <span class="ml-auto text-xs text-cyan-400">DPS: {{ inventory.teamDps }}</span>
      </h3>
      <div class="grid grid-cols-6 gap-2">
        <div
          v-for="slot in 6"
          :key="slot"
          class="flex h-24 flex-col items-center justify-center rounded-xl border border-gray-700 bg-gray-800"
        >
          <template v-if="inventory.team.find((p) => p.teamSlot === slot)">
            <img
              :src="inventory.team.find((p) => p.teamSlot === slot)!.isShiny
                ? getShinySpriteUrl(inventory.team.find((p) => p.teamSlot === slot)!.slug)
                : getSpriteUrl(inventory.team.find((p) => p.teamSlot === slot)!.slug)"
              class="h-12 w-12 object-contain"
            />
            <div class="flex gap-0.5">
              <Star
                v-for="s in inventory.team.find((p) => p.teamSlot === slot)!.stars"
                :key="s"
                class="h-2.5 w-2.5 fill-yellow-400 text-yellow-400"
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
      <div class="relative">
        <Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('Rechercher...', 'Search...')"
          class="rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
        />
      </div>

      <!-- Sort -->
      <button
        class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-700"
        @click="sortBy = sortBy === 'stars' ? 'level' : sortBy === 'level' ? 'name' : sortBy === 'name' ? 'dps' : 'stars'"
      >
        <ArrowUpDown class="h-3.5 w-3.5" />
        {{ sortBy === 'stars' ? '⭐' : sortBy === 'level' ? 'Lv' : sortBy === 'name' ? 'A-Z' : 'DPS' }}
      </button>

      <!-- Shiny toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        :class="filterShiny === true
          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="filterShiny = filterShiny === true ? null : true"
      >
        <Sparkles class="h-3.5 w-3.5" />
        Shiny
      </button>

      <!-- Team toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        :class="filterTeam === true
          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="filterTeam = filterTeam === true ? null : true"
      >
        <Shield class="h-3.5 w-3.5" />
        {{ t('Équipe', 'Team') }}
      </button>
    </div>

    <!-- Type filter row -->
    <div class="flex flex-wrap items-center gap-1">
      <button
        class="rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors"
        :class="filterType === null
          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="filterType = null"
      >
        {{ t('Tous', 'All') }}
      </button>
      <button
        v-for="tp in collectionTypes"
        :key="tp.id"
        class="rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors"
        :class="filterType === tp.id
          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
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
    <div v-else class="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
      <button
        v-for="pokemon in filteredCollection"
        :key="pokemon.id"
        class="group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105"
        :class="pokemon.teamSlot !== null
          ? 'border-cyan-500/50 bg-cyan-500/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-500'"
        @click="toggleTeam(pokemon.id)"
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
        <img
          :src="pokemon.isShiny ? getShinySpriteUrl(pokemon.slug) : getSpriteUrl(pokemon.slug)"
          :alt="t(pokemon.nameFr, pokemon.nameEn)"
          class="h-14 w-14 object-contain"
        />
        <TypeBadge :type="getPokemonType(pokemon.slug)" />
        <p class="w-full truncate text-center text-[10px] text-gray-300">
          {{ t(pokemon.nameFr, pokemon.nameEn) }}
        </p>
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
  </div>
</template>
