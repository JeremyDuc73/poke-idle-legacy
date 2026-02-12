<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { getSpriteUrl } from '~/utils/showdown'
import { useLocale } from '~/composables/useLocale'
import { POKEDEX, GEN_NAMES, getAllGens } from '~/data/pokedex'
import type { PokedexEntry } from '~/data/pokedex'

definePageMeta({
  layout: 'game',
})

const { t } = useLocale()

const search = ref('')
const selectedGen = ref<number | null>(null)

const allGens = getAllGens()

const filtered = computed((): PokedexEntry[] => {
  let list = POKEDEX
  if (selectedGen.value !== null) {
    list = list.filter((p) => p.gen === selectedGen.value)
  }
  const q = search.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameFr.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.slug.includes(q)
    )
  }
  return list
})

const spriteErrors = reactive<Set<string>>(new Set())

function onSpriteError(slug: string) {
  spriteErrors.add(slug)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-xl font-bold text-white">
      {{ t('Pokédex', 'Pokédex') }}
      <span class="text-sm font-normal text-slate-400">({{ filtered.length }} / {{ POKEDEX.length }})</span>
    </h2>

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

      <!-- Gen filter -->
      <button
        class="rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        :class="selectedGen === null
          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="selectedGen = null"
      >
        {{ t('Toutes', 'All') }}
      </button>
      <button
        v-for="gen in allGens"
        :key="gen"
        class="rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        :class="selectedGen === gen
          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="selectedGen = gen"
      >
        Gen {{ gen }}
        <span class="hidden sm:inline text-slate-500 ml-1">{{ t(GEN_NAMES[gen]?.fr ?? '', GEN_NAMES[gen]?.en ?? '') }}</span>
      </button>
    </div>

    <!-- Pokemon Grid -->
    <div class="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14">
      <div
        v-for="p in filtered"
        :key="p.id"
        class="group relative flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800 p-1 transition-colors hover:border-slate-500 hover:bg-slate-700"
      >
        <!-- Dex number -->
        <span class="absolute left-0.5 top-0.5 text-[8px] font-mono text-slate-600">#{{ String(p.id).padStart(4, '0') }}</span>

        <!-- Sprite -->
        <img
          v-if="!spriteErrors.has(p.slug)"
          :src="getSpriteUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="h-12 w-12 object-contain"
          style="image-rendering: pixelated;"
          loading="lazy"
          @error="onSpriteError(p.slug)"
        />
        <div
          v-else
          class="flex h-12 w-12 items-center justify-center text-lg text-slate-600"
        >
          ?
        </div>

        <!-- Name -->
        <p class="max-w-full truncate text-[9px] font-medium text-slate-300">
          {{ t(p.nameFr, p.nameEn) }}
        </p>

        <!-- Tooltip -->
        <div class="pointer-events-none absolute -top-12 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg ring-1 ring-slate-700 group-hover:block">
          <span class="font-bold">#{{ p.id }}</span> {{ t(p.nameFr, p.nameEn) }}
          <span class="text-slate-500">({{ p.nameEn }})</span>
          <br />
          <span class="text-slate-400">Gen {{ p.gen }} — {{ t(GEN_NAMES[p.gen]?.fr ?? '', GEN_NAMES[p.gen]?.en ?? '') }}</span>
          <span v-if="spriteErrors.has(p.slug)" class="ml-1 text-red-400">⚠ sprite manquant</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filtered.length === 0" class="py-12 text-center text-sm text-slate-500">
      {{ t('Aucun Pokémon trouvé.', 'No Pokémon found.') }}
    </div>
  </div>
</template>
