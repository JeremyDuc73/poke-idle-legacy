<script setup lang="ts">
import { Egg, Coins, X, Star, Trash2, Plus } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore, MAX_LEVEL, MAX_STARS } from '~/stores/useInventoryStore'
import { useDaycareStore, MAX_DAYCARE_SLOTS, DAYCARE_COST, HATCH_DAMAGE, FIVE_STAR_SHINY_CHANCE } from '~/stores/useDaycareStore'
import type { DaycareSlot } from '~/stores/useDaycareStore'
import { useLocale } from '~/composables/useLocale'
import { RARITY_COLORS, RARITY_LABELS_FR, RARITY_LABELS_EN } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import type { OwnedPokemon } from '~/stores/useInventoryStore'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const inventory = useInventoryStore()
const daycare = useDaycareStore()
const { t } = useLocale()

// ── State ──
const showPicker = ref(false)
const hatchResults = ref<{ slug: string; nameFr: string; nameEn: string; isShiny: boolean; isNew: boolean; stars: number; rarity: Rarity }[]>([])

// Eligible pokemon: level 100, not shiny, not already in daycare, deduplicated by slug
const eligiblePokemon = computed(() => {
  const seen = new Set<string>()
  return inventory.collection.filter((p) => {
    if (p.level < MAX_LEVEL) return false
    if (p.isShiny) return false
    if (daycare.hasSlug(p.slug)) return false
    if (seen.has(p.slug)) return false
    seen.add(p.slug)
    return true
  })
})

function rarityLabel(r: Rarity): string {
  return t(RARITY_LABELS_FR[r], RARITY_LABELS_EN[r])
}

function formatDmg(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function slotProgress(slot: DaycareSlot): number {
  return Math.min(100, (slot.damageDealt / slot.damageRequired) * 100)
}

function slotReady(slot: DaycareSlot): boolean {
  return slot.damageDealt >= slot.damageRequired
}

function depositPokemon(poke: OwnedPokemon) {
  if (daycare.isFull) return
  if (daycare.hasSlug(poke.slug)) return
  if (!player.spendGold(DAYCARE_COST)) return
  // Remove from team before depositing
  if (poke.teamSlot !== null) {
    inventory.removeFromTeam(poke.id)
  }
  daycare.deposit({
    slug: poke.slug,
    nameFr: poke.nameFr,
    nameEn: poke.nameEn,
    stars: poke.stars,
    rarity: poke.rarity,
  })
  showPicker.value = false
}

function removeSlot(index: number) {
  daycare.remove(index)
}

function collectAll() {
  const hatched = daycare.collectHatched()
  const results: typeof hatchResults.value = []
  for (const { slot, isShiny } of hatched) {
    const { isNew, pokemon: owned } = inventory.addPokemon({
      slug: slot.slug,
      nameFr: slot.nameFr,
      nameEn: slot.nameEn,
      stars: 1,
      isShiny,
      rarity: slot.rarity,
    })
    results.push({
      slug: slot.slug,
      nameFr: slot.nameFr,
      nameEn: slot.nameEn,
      isShiny,
      isNew,
      stars: owned.stars,
      rarity: slot.rarity,
    })
  }
  if (results.length > 0) {
    hatchResults.value = results
  }
}

function dismissResults() {
  hatchResults.value = []
}

// Auto-check for hatched eggs
const readyCount = computed(() => daycare.slots.filter(slotReady).length)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-green-400">
        {{ t('Pension Pokémon', 'Pokémon Daycare') }}
      </h2>
      <p class="mt-1 text-sm text-gray-400 max-w-md">
        {{ t(
          'Dépose un Pokémon niv.100 (non-shiny). Il éclot après un certain nombre de dégâts en combat. Les 5★ ont 1/50 de chance shiny !',
          'Leave a Lv.100 Pokémon (non-shiny). It hatches after dealing enough combat damage. 5★ have 1/50 shiny chance!'
        ) }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ t('Slots', 'Slots') }}: {{ daycare.slots.length }}/{{ MAX_DAYCARE_SLOTS }}
        · {{ t('Coût', 'Cost') }}: {{ DAYCARE_COST }} {{ t('or', 'gold') }}
      </p>
    </div>

    <!-- Daycare Slots -->
    <div class="grid w-full max-w-2xl gap-3 sm:grid-cols-1">
      <!-- Filled slots -->
      <div
        v-for="(slot, i) in daycare.slots"
        :key="i"
        class="flex items-center gap-3 rounded-xl border bg-gray-800/80 p-3 transition-all"
        :class="slotReady(slot) ? 'border-green-500/70 bg-green-500/10' : 'border-gray-700'"
      >
        <!-- Sprite -->
        <img
          :src="getSpriteUrl(slot.slug)"
          :alt="t(slot.nameFr, slot.nameEn)"
          class="h-14 w-14 flex-shrink-0 object-contain"
        />

        <!-- Info + progress -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-bold text-white">{{ t(slot.nameFr, slot.nameEn) }}</p>
            <div class="flex items-center gap-0.5">
              <Star v-for="s in slot.stars" :key="s" class="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            <span class="text-[10px] font-bold" :style="{ color: RARITY_COLORS[slot.rarity] }">
              {{ rarityLabel(slot.rarity) }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="slotReady(slot) ? 'bg-green-500' : 'bg-blue-500'"
              :style="{ width: `${slotProgress(slot)}%` }"
            />
          </div>
          <p class="mt-0.5 text-[10px] text-gray-400">
            <template v-if="slotReady(slot)">
              {{ t('Prêt à éclore !', 'Ready to hatch!') }}
            </template>
            <template v-else>
              {{ formatDmg(slot.damageDealt) }} / {{ formatDmg(slot.damageRequired) }} {{ t('dégâts', 'damage') }}
            </template>
          </p>
        </div>

        <!-- Actions -->
        <button
          v-if="!slotReady(slot)"
          class="flex-shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
          :title="t('Retirer', 'Remove')"
          @click="removeSlot(i)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
        <Egg v-else class="h-6 w-6 flex-shrink-0 animate-bounce text-green-400" />
      </div>

      <!-- Empty slots -->
      <button
        v-for="n in daycare.freeSlots"
        :key="'empty-' + n"
        class="flex h-20 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/30 text-sm text-gray-500 transition-all hover:border-green-500/40 hover:bg-gray-800/60 hover:text-green-400"
        :disabled="player.gold < DAYCARE_COST"
        @click="showPicker = true"
      >
        <Plus class="h-5 w-5" />
        {{ t('Déposer un Pokémon', 'Deposit a Pokémon') }}
        <span class="flex items-center gap-1 text-yellow-500/70">
          <Coins class="h-3.5 w-3.5" /> {{ DAYCARE_COST }}
        </span>
      </button>
    </div>

    <!-- Collect button -->
    <button
      v-if="readyCount > 0"
      class="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-green-500 active:scale-95 animate-pulse"
      @click="collectAll"
    >
      <Egg class="h-5 w-5" />
      {{ t(`Récupérer ${readyCount} œuf(s)`, `Collect ${readyCount} egg(s)`) }}
    </button>

    <!-- Hatch results modal -->
    <Teleport to="body">
      <div
        v-if="hatchResults.length > 0"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="dismissResults"
      >
        <div class="relative w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
          <h3 class="mb-4 text-center text-lg font-bold text-green-400">
            {{ t('Éclosion !', 'Hatched!') }}
          </h3>
          <div class="flex flex-col gap-3">
            <div
              v-for="(r, i) in hatchResults"
              :key="i"
              class="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3"
            >
              <img
                :src="r.isShiny ? getShinySpriteUrl(r.slug) : getSpriteUrl(r.slug)"
                :alt="t(r.nameFr, r.nameEn)"
                class="h-14 w-14 object-contain"
                :style="{ filter: r.isShiny ? 'drop-shadow(0 0 12px #fbbf24)' : 'none' }"
              />
              <div class="flex-1">
                <p class="font-bold" :style="{ color: r.isShiny ? '#fbbf24' : RARITY_COLORS[r.rarity] }">
                  {{ t(r.nameFr, r.nameEn) }}
                  <span v-if="r.isShiny" class="text-sm">✨</span>
                </p>
                <div class="flex items-center gap-1">
                  <Star v-for="s in r.stars" :key="s" class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <p v-if="r.isShiny && r.isNew" class="text-xs font-bold text-yellow-400">
                  {{ t('Shiny obtenu !', 'Shiny obtained!') }}
                </p>
                <p v-else-if="r.isNew" class="text-xs text-green-400">
                  {{ t('Nouveau !', 'New!') }}
                </p>
                <p v-else class="text-xs text-slate-400">
                  {{ t('Doublon → ★', 'Duplicate → ★') }}{{ r.stars }}
                </p>
              </div>
            </div>
          </div>
          <button
            class="mt-4 w-full rounded-lg bg-gray-700 py-2 text-sm font-medium transition-colors hover:bg-gray-600"
            @click="dismissResults"
          >
            OK
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Damage thresholds info -->
    <div class="w-full max-w-2xl rounded-xl border border-gray-700/50 bg-gray-800/30 p-4">
      <h4 class="mb-2 text-xs font-semibold text-gray-400 uppercase">
        {{ t('Dégâts requis par étoile', 'Damage required per star') }}
      </h4>
      <div class="flex flex-wrap gap-2">
        <div v-for="s in 5" :key="s" class="rounded-lg bg-gray-800 px-3 py-1.5 text-xs">
          <span class="text-yellow-400">{{ '★'.repeat(s) }}</span>
          <span class="ml-1 text-gray-300">{{ formatDmg(HATCH_DAMAGE[s]!) }}</span>
          <span v-if="s === 5" class="ml-1 text-amber-400">(1/{{ Math.round(1 / FIVE_STAR_SHINY_CHANCE) }} shiny)</span>
        </div>
      </div>
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
        @click.self="showPicker = false"
      >
        <div class="relative w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
          <button class="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white" @click="showPicker = false">
            <X class="h-5 w-5" />
          </button>
          <h3 class="mb-1 text-lg font-bold text-white">
            {{ t('Déposer un Pokémon', 'Deposit a Pokémon') }}
          </h3>
          <p class="mb-4 text-xs text-gray-500">
            {{ t('Niv.100 requis · Pas de shiny', 'Lv.100 required · No shinies') }}
          </p>
          <div class="grid max-h-96 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
            <button
              v-for="poke in eligiblePokemon"
              :key="poke.id"
              class="flex flex-col items-center gap-1 rounded-xl border border-gray-700 bg-gray-800 p-2 transition-all hover:border-green-500/50 hover:bg-gray-750 active:scale-95"
              @click="depositPokemon(poke)"
            >
              <img
                :src="getSpriteUrl(poke.slug)"
                :alt="t(poke.nameFr, poke.nameEn)"
                class="h-12 w-12 object-contain"
              />
              <p class="w-full truncate text-center text-[9px] text-gray-300">
                {{ t(poke.nameFr, poke.nameEn) }}
              </p>
              <div class="flex items-center gap-0.5">
                <Star v-for="s in poke.stars" :key="s" class="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              </div>
              <span class="text-[8px] font-bold" :style="{ color: RARITY_COLORS[poke.rarity] }">
                {{ rarityLabel(poke.rarity) }}
              </span>
            </button>
          </div>
          <p v-if="eligiblePokemon.length === 0" class="py-8 text-center text-sm text-gray-500">
            {{ t('Aucun Pokémon éligible (niv.100, non-shiny)', 'No eligible Pokémon (lv.100, non-shiny)') }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
