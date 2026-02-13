<script setup lang="ts">
import { Search, Sparkles, EyeOff, X, Star } from 'lucide-vue-next'
import { getSpriteUrl, getStaticSpriteUrl, getShinySpriteUrl, getStaticShinySpriteUrl, getPokeApiSpriteUrl } from '~/utils/showdown'
import { getPokemonType, getTypeInfo } from '~/data/types'
import { useLocale } from '~/composables/useLocale'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { POKEDEX, GEN_NAMES, getAllGens } from '~/data/pokedex'
import type { PokedexEntry } from '~/data/pokedex'
import { EVOLUTIONS } from '~/data/evolutions'

definePageMeta({
  layout: 'game',
})

const { t } = useLocale()
const inventory = useInventoryStore()

const search = ref('')
const selectedGen = ref<number | null>(null)
const showShiny = ref(false)
const hideOwned = ref(false)
const selectedPokemon = ref<PokedexEntry | null>(null)

const allGens = getAllGens()

const ownedNormalSlugs = computed(() => new Set(
  inventory.collection.filter((p) => !p.isShiny).map((p) => p.slug)
))
const ownedShinySlugs = computed(() => new Set(
  inventory.collection.filter((p) => p.isShiny).map((p) => p.slug)
))

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
  if (hideOwned.value) {
    const owned = showShiny.value ? ownedShinySlugs.value : ownedNormalSlugs.value
    list = list.filter((p) => !owned.has(p.slug))
  }
  return list
})

const aniErrors = reactive<Set<string>>(new Set())
const staticErrors = reactive<Set<string>>(new Set())
const pokeApiErrors = reactive<Set<string>>(new Set())

function onAniError(slug: string) {
  aniErrors.add(slug)
}

function onStaticError(slug: string) {
  staticErrors.add(slug)
}

function onPokeApiError(slug: string) {
  pokeApiErrors.add(slug)
}

function getAniUrl(slug: string): string {
  return showShiny.value ? getShinySpriteUrl(slug) : getSpriteUrl(slug)
}

function getStaticUrl(slug: string): string {
  return showShiny.value ? getStaticShinySpriteUrl(slug) : getStaticSpriteUrl(slug)
}

function getApiUrl(id: number): string {
  return getPokeApiSpriteUrl(id, showShiny.value)
}

function isOwned(slug: string): boolean {
  const owned = showShiny.value ? ownedShinySlugs.value : ownedNormalSlugs.value
  return owned.has(slug)
}

function getOwnedInfo(slug: string) {
  return inventory.collection.find((p) => p.slug === slug && !p.isShiny) ?? null
}

function getOwnedShinyInfo(slug: string) {
  return inventory.collection.find((p) => p.slug === slug && p.isShiny) ?? null
}

function getEvolutions(slug: string): PokedexEntry[] {
  const chain: PokedexEntry[] = []
  const visited = new Set<string>()
  function walk(s: string) {
    if (visited.has(s)) return
    visited.add(s)
    const entry = POKEDEX.find((p) => p.slug === s)
    if (entry) chain.push(entry)
    const evos = EVOLUTIONS.filter((e) => e.fromSlug === s)
    for (const evo of evos) walk(evo.toSlug)
  }
  // Walk back to root
  let root = slug
  let safety = 10
  while (safety-- > 0) {
    const pre = EVOLUTIONS.find((e) => e.toSlug === root)
    if (pre) root = pre.fromSlug
    else break
  }
  walk(root)
  return chain
}

function openDetail(p: PokedexEntry) {
  selectedPokemon.value = p
}

function closeDetail() {
  selectedPokemon.value = null
}

watch(showShiny, () => {
  aniErrors.clear()
  staticErrors.clear()
  pokeApiErrors.clear()
})
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

      <!-- Shiny toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        :class="showShiny
          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="showShiny = !showShiny"
      >
        <Sparkles class="h-3.5 w-3.5" />
        Shiny
      </button>

      <!-- Hide owned toggle -->
      <button
        class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        :class="hideOwned
          ? 'border-purple-500 bg-purple-500/20 text-purple-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'"
        @click="hideOwned = !hideOwned"
      >
        <EyeOff class="h-3.5 w-3.5" />
        {{ t('Masquer possédés', 'Hide owned') }}
      </button>
    </div>

    <!-- Gen filter -->
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
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
        class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
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
    <div class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
      <button
        v-for="p in filtered"
        :key="p.id"
        class="group relative flex flex-col items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 p-2 transition-all hover:scale-105 hover:border-slate-500 hover:bg-slate-700"
        @click="openDetail(p)"
      >
        <!-- Dex number -->
        <span class="absolute left-1 top-1 text-[8px] font-mono text-slate-600">#{{ String(p.id).padStart(4, '0') }}</span>

        <!-- Owned indicator -->
        <span
          v-if="isOwned(p.slug)"
          class="absolute right-1 top-1 text-[8px] text-green-500"
        >&#x2714;</span>

        <!-- Sprite: animated GIF → static PNG → PokeAPI → ? -->
        <img
          v-if="!aniErrors.has(p.slug)"
          :src="getAniUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="mt-1 h-14 w-14 object-contain"
          style="image-rendering: pixelated;"
          loading="lazy"
          @error="onAniError(p.slug)"
        />
        <img
          v-else-if="!staticErrors.has(p.slug)"
          :src="getStaticUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="mt-1 h-14 w-14 object-contain"
          loading="lazy"
          @error="onStaticError(p.slug)"
        />
        <img
          v-else-if="p.id <= 1025 && !pokeApiErrors.has(p.slug)"
          :src="getApiUrl(p.id)"
          :alt="t(p.nameFr, p.nameEn)"
          class="mt-1 h-14 w-14 object-contain"
          loading="lazy"
          @error="onPokeApiError(p.slug)"
        />
        <div
          v-else
          class="mt-1 flex h-14 w-14 items-center justify-center text-lg text-slate-600"
        >
          ?
        </div>

        <!-- Type -->
        <TypeBadge :type="getPokemonType(p.slug)" />

        <!-- Name -->
        <p class="max-w-full truncate text-[10px] font-medium text-slate-300">
          {{ t(p.nameFr, p.nameEn) }}
        </p>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filtered.length === 0" class="py-12 text-center text-sm text-slate-500">
      {{ t('Aucun Pokémon trouvé.', 'No Pokémon found.') }}
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedPokemon"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeDetail"
      >
        <div class="relative mx-4 flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-2xl">
          <!-- Close -->
          <button class="absolute right-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white" @click="closeDetail">
            <X class="h-5 w-5" />
          </button>

          <!-- Header -->
          <div class="flex items-center gap-4">
            <img
              v-if="!aniErrors.has(selectedPokemon.slug)"
              :src="getAniUrl(selectedPokemon.slug)"
              :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
              class="h-24 w-24 object-contain"
              style="image-rendering: pixelated;"
              @error="onAniError(selectedPokemon.slug)"
            />
            <img
              v-else-if="!staticErrors.has(selectedPokemon.slug)"
              :src="getStaticUrl(selectedPokemon.slug)"
              :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
              class="h-24 w-24 object-contain"
              @error="onStaticError(selectedPokemon.slug)"
            />
            <img
              v-else-if="selectedPokemon.id <= 1025 && !pokeApiErrors.has(selectedPokemon.slug)"
              :src="getApiUrl(selectedPokemon.id)"
              :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
              class="h-24 w-24 object-contain"
              @error="onPokeApiError(selectedPokemon.slug)"
            />
            <div v-else class="flex h-24 w-24 items-center justify-center text-3xl text-slate-600">?</div>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-mono text-slate-500">#{{ String(selectedPokemon.id).padStart(4, '0') }}</span>
              <h3 class="text-lg font-bold text-white">{{ t(selectedPokemon.nameFr, selectedPokemon.nameEn) }}</h3>
              <p class="text-xs text-slate-400">{{ selectedPokemon.nameEn }}</p>
              <div class="flex items-center gap-2">
                <TypeBadge :type="getPokemonType(selectedPokemon.slug)" />
                <span class="text-[10px] text-slate-500">Gen {{ selectedPokemon.gen }} — {{ t(GEN_NAMES[selectedPokemon.gen]?.fr ?? '', GEN_NAMES[selectedPokemon.gen]?.en ?? '') }}</span>
              </div>
            </div>
          </div>

          <!-- Owned status -->
          <div class="flex flex-col gap-2 rounded-xl bg-slate-800/50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ t('Collection', 'Collection') }}</p>
            <div v-if="getOwnedInfo(selectedPokemon.slug)" class="flex items-center gap-2">
              <span class="text-xs text-green-400">✓ {{ t('Possédé', 'Owned') }}</span>
              <span class="text-[10px] text-slate-400">Lv.{{ getOwnedInfo(selectedPokemon.slug)!.level }}</span>
              <div class="flex gap-0.5">
                <Star v-for="s in getOwnedInfo(selectedPokemon.slug)!.stars" :key="s" class="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <span v-else class="text-xs text-slate-500">{{ t('Non possédé', 'Not owned') }}</span>
            <div v-if="getOwnedShinyInfo(selectedPokemon.slug)" class="flex items-center gap-2">
              <span class="text-xs text-yellow-400">✨ Shiny</span>
              <span class="text-[10px] text-slate-400">Lv.{{ getOwnedShinyInfo(selectedPokemon.slug)!.level }}</span>
              <div class="flex gap-0.5">
                <Star v-for="s in getOwnedShinyInfo(selectedPokemon.slug)!.stars" :key="s" class="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>

          <!-- Evolution chain -->
          <div v-if="getEvolutions(selectedPokemon.slug).length > 1" class="flex flex-col gap-2 rounded-xl bg-slate-800/50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ t('Évolutions', 'Evolutions') }}</p>
            <div class="flex items-center justify-center gap-1">
              <template v-for="(evo, i) in getEvolutions(selectedPokemon.slug)" :key="evo.id">
                <span v-if="i > 0" class="text-xs text-slate-600">→</span>
                <button
                  class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors hover:bg-slate-700"
                  :class="evo.slug === selectedPokemon.slug ? 'ring-1 ring-blue-500 bg-blue-500/10' : ''"
                  @click="openDetail(evo)"
                >
                  <img
                    :src="getSpriteUrl(evo.slug)"
                    :alt="t(evo.nameFr, evo.nameEn)"
                    class="h-10 w-10 object-contain"
                    style="image-rendering: pixelated;"
                  />
                  <span class="text-[9px] text-slate-400">{{ t(evo.nameFr, evo.nameEn) }}</span>
                </button>
              </template>
            </div>
          </div>

          <!-- Shiny preview -->
          <div class="flex flex-col gap-2 rounded-xl bg-slate-800/50 p-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Shiny</p>
            <div class="flex items-center gap-3">
              <img
                v-if="!aniErrors.has(selectedPokemon.slug)"
                :src="getSpriteUrl(selectedPokemon.slug)"
                :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
                class="h-16 w-16 object-contain"
                style="image-rendering: pixelated;"
                @error="onAniError(selectedPokemon.slug)"
              />
              <img
                v-else-if="!staticErrors.has(selectedPokemon.slug)"
                :src="getStaticSpriteUrl(selectedPokemon.slug)"
                :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
                class="h-16 w-16 object-contain"
                @error="onStaticError(selectedPokemon.slug)"
              />
              <img
                v-else-if="selectedPokemon.id <= 1025"
                :src="getPokeApiSpriteUrl(selectedPokemon.id, false)"
                :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn)"
                class="h-16 w-16 object-contain"
              />
              <div v-else class="flex h-16 w-16 items-center justify-center text-lg text-slate-600">?</div>
              <span class="text-slate-600">→</span>
              <img
                v-if="!aniErrors.has(selectedPokemon.slug + '-shiny')"
                :src="getShinySpriteUrl(selectedPokemon.slug)"
                :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn) + ' Shiny'"
                class="h-16 w-16 object-contain"
                style="image-rendering: pixelated;"
                @error="onAniError(selectedPokemon.slug + '-shiny')"
              />
              <img
                v-else-if="!staticErrors.has(selectedPokemon.slug + '-shiny')"
                :src="getStaticShinySpriteUrl(selectedPokemon.slug)"
                :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn) + ' Shiny'"
                class="h-16 w-16 object-contain"
                @error="onStaticError(selectedPokemon.slug + '-shiny')"
              />
              <img
                v-else-if="selectedPokemon.id <= 1025"
                :src="getPokeApiSpriteUrl(selectedPokemon.id, true)"
                :alt="t(selectedPokemon.nameFr, selectedPokemon.nameEn) + ' Shiny'"
                class="h-16 w-16 object-contain"
              />
              <div v-else class="flex h-16 w-16 items-center justify-center text-lg text-slate-600">?</div>
              <span class="text-[10px] text-yellow-400">✨</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
