<script setup lang="ts">
import { Star, Shield, ArrowUpDown } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { getPokemonType } from '~/data/types'

definePageMeta({
  layout: 'game',
})

const inventory = useInventoryStore()
const { t } = useLocale()

const sortBy = ref<'stars' | 'level' | 'name'>('stars')

const sortedCollection = computed(() => {
  const list = [...inventory.collection]
  switch (sortBy.value) {
    case 'stars':
      return list.sort((a, b) => b.stars - a.stars || b.level - a.level)
    case 'level':
      return list.sort((a, b) => b.level - a.level || b.stars - a.stars)
    case 'name':
      return list.sort((a, b) => a.nameFr.localeCompare(b.nameFr))
    default:
      return list
  }
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">
        {{ t('Inventaire', 'Inventory') }}
        <span class="text-sm font-normal text-gray-400">({{ inventory.collectionCount }})</span>
      </h2>
      <button
        class="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
        @click="sortBy = sortBy === 'stars' ? 'level' : sortBy === 'level' ? 'name' : 'stars'"
      >
        <ArrowUpDown class="h-3.5 w-3.5" />
        {{ t('Tri', 'Sort') }}: {{ sortBy === 'stars' ? '⭐' : sortBy === 'level' ? 'Lv' : 'A-Z' }}
      </button>
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

    <!-- Empty state -->
    <div v-if="sortedCollection.length === 0" class="flex flex-col items-center gap-4 py-12 text-gray-500">
      <Star class="h-12 w-12" />
      <p>{{ t('Aucun Pokémon. Fais une invocation !', 'No Pokémon. Do a summon!') }}</p>
      <NuxtLink
        to="/gacha"
        class="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-500"
      >
        {{ t('Invoquer', 'Summon') }}
      </NuxtLink>
    </div>

    <!-- Collection Grid -->
    <div v-else class="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
      <button
        v-for="pokemon in sortedCollection"
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
        <div class="flex gap-0.5">
          <Star
            v-for="s in pokemon.stars"
            :key="s"
            class="h-2.5 w-2.5 fill-yellow-400 text-yellow-400"
          />
        </div>
        <span class="text-[9px] text-gray-500">Lv.{{ pokemon.level }}</span>
      </button>
    </div>
  </div>
</template>
