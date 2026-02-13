<script setup lang="ts">
import { Bug, Zap, Coins, Gem, MapPin, Star, Package, Trash2 } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { GENERATIONS } from '~/data/zones'
import { BANNERS } from '~/data/gacha'

definePageMeta({ layout: 'game' })

const player = usePlayerStore()
const inventory = useInventoryStore()
const auth = useAuthStore()
const { t } = useLocale()

// ── Quick actions ──
function giveGold(amount: number) { player.addGold(amount) }
function giveGems(amount: number) { player.addGems(amount) }
function setLevel(lv: number) { player.level = lv; player.xp = 0 }

function setGenZone(genId: number, zoneId: number) {
  player.currentGeneration = genId
  player.currentZone = zoneId
  player.currentStage = 1
  player.stageKills = 0
}

function maxAllPokemon() {
  for (const p of inventory.collection) {
    p.level = 100
    p.xp = 0
  }
}

function giveAllCandies() {
  player.candies = { S: 999, M: 999, L: 999, XL: 999 }
}

function forceSave() {
  auth.saveGameState()
}
</script>

<template>
  <div class="mx-auto max-w-2xl pb-12">
    <div class="mb-6 text-center">
      <h1 class="flex items-center justify-center gap-2 text-2xl font-bold text-red-400">
        <Bug class="h-6 w-6" /> Debug Panel
      </h1>
      <p class="mt-1 text-xs text-gray-500">{{ t('Outils de test — ne pas utiliser en jeu normal', 'Testing tools — do not use in normal play') }}</p>
    </div>

    <!-- Currency -->
    <section class="mb-4 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-yellow-400">
        <Coins class="h-4 w-4" /> {{ t('Monnaie', 'Currency') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <button class="rounded bg-yellow-600/20 px-3 py-1.5 text-xs font-bold text-yellow-400 hover:bg-yellow-600/30" @click="giveGold(1000)">+1K Gold</button>
        <button class="rounded bg-yellow-600/20 px-3 py-1.5 text-xs font-bold text-yellow-400 hover:bg-yellow-600/30" @click="giveGold(10000)">+10K Gold</button>
        <button class="rounded bg-yellow-600/20 px-3 py-1.5 text-xs font-bold text-yellow-400 hover:bg-yellow-600/30" @click="giveGold(100000)">+100K Gold</button>
        <button class="rounded bg-purple-600/20 px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-600/30" @click="giveGems(100)">+100 Gems</button>
        <button class="rounded bg-purple-600/20 px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-600/30" @click="giveGems(1000)">+1K Gems</button>
      </div>
    </section>

    <!-- Player Level -->
    <section class="mb-4 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-blue-400">
        <Star class="h-4 w-4" /> {{ t('Niveau Dresseur', 'Trainer Level') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <button v-for="lv in [10, 25, 50, 75, 100]" :key="lv" class="rounded bg-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-600/30" @click="setLevel(lv)">Lv.{{ lv }}</button>
      </div>
      <p class="mt-2 text-xs text-gray-500">{{ t('Niveau actuel', 'Current level') }}: <span class="text-white">{{ player.level }}</span></p>
    </section>

    <!-- Candies -->
    <section class="mb-4 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-green-400">
        <Package class="h-4 w-4" /> {{ t('Bonbons', 'Candies') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <button class="rounded bg-green-600/20 px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-600/30" @click="giveAllCandies()">999 de chaque</button>
      </div>
      <p class="mt-2 text-xs text-gray-500">S:{{ player.candies.S }} M:{{ player.candies.M }} L:{{ player.candies.L }} XL:{{ player.candies.XL }}</p>
    </section>

    <!-- Pokemon -->
    <section class="mb-4 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-400">
        <Zap class="h-4 w-4" /> {{ t('Pokémon', 'Pokémon') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <button class="rounded bg-cyan-600/20 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-600/30" @click="maxAllPokemon()">{{ t('Tous Lv.100', 'All Lv.100') }}</button>
      </div>
      <p class="mt-2 text-xs text-gray-500">{{ t('Collection', 'Collection') }}: {{ inventory.collectionCount }} | {{ t('Équipe', 'Team') }}: {{ inventory.team.length }}/6</p>
    </section>

    <!-- Region / Zone -->
    <section class="mb-4 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-orange-400">
        <MapPin class="h-4 w-4" /> {{ t('Région / Zone', 'Region / Zone') }}
      </h2>
      <p class="mb-2 text-xs text-gray-500">
        {{ t('Actuel', 'Current') }}: Gen {{ player.currentGeneration }} / Zone {{ player.currentZone }} / Stage {{ player.currentStage }}
      </p>
      <div v-for="gen in GENERATIONS" :key="gen.id" class="mb-3">
        <p class="mb-1 text-xs font-bold text-white">{{ gen.nameFr }} ({{ gen.regionFr }})</p>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="zone in gen.zones"
            :key="zone.id"
            class="rounded px-2 py-1 text-[10px] font-bold transition-colors"
            :class="player.currentGeneration === gen.id && player.currentZone === zone.id
              ? 'bg-orange-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            @click="setGenZone(gen.id, zone.id)"
          >
            {{ zone.id }}. {{ zone.boss.nameFr }}
          </button>
        </div>
      </div>
    </section>

    <!-- Banners info -->
    <section class="mb-4 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <h2 class="mb-3 text-sm font-bold text-pink-400">{{ t('Bannières Gacha', 'Gacha Banners') }}</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="b in BANNERS" :key="b.id" class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
          {{ b.nameFr }} ({{ b.pool.length }} pokémon)
        </span>
      </div>
    </section>

    <!-- Save -->
    <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <button class="rounded bg-green-600/20 px-4 py-2 text-sm font-bold text-green-400 hover:bg-green-600/30" @click="forceSave()">
        {{ t('Forcer la sauvegarde', 'Force Save') }}
      </button>
    </section>
  </div>
</template>
