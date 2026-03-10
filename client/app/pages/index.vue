<script setup lang="ts">
import { Swords, Zap, Timer, Skull, MapPin, ChevronDown, RotateCcw, X } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { useCombatLoop } from '~/composables/useCombatLoop'
import { getPokemonType, getPokemonTypes, getTypeInfo, getEffectiveness, TYPES } from '~/data/types'
import type { PokemonType } from '~/data/types'
import { pokemonXpForLevel, getEvolutionStage, getEvoStageMult } from '~/data/evolutions'
import { GENERATIONS } from '~/data/zones'
import { getSlugGeneration, RARITY_DPS_MULT, RARITY_COLORS, RARITY_LABELS_FR, RARITY_LABELS_EN, getStarDpsMult } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import { CANDY_XP } from '~/stores/usePlayerStore'
import type { CandySize } from '~/stores/usePlayerStore'
import { MAX_LEVEL } from '~/stores/useInventoryStore'
import type { OwnedPokemon } from '~/stores/useInventoryStore'
import GuestModeModal from '~/components/GuestModeModal.vue'

definePageMeta({
  layout: 'game',
})

const combat = useCombatStore()
const player = usePlayerStore()
const inventory = useInventoryStore()
const auth = useAuthStore()
const { t } = useLocale()
const { spawnEnemy, checkEnemyDeath, getEffectiveDps, getPokeDps, currentZone } = useCombatLoop()

const showGuestModal = ref(false)
const showRouteSelector = ref(false)

// Build list of all farmable zones (all zones before the player's current frontier)
const completedRoutes = computed(() => {
  const routes: Array<{ gen: number; zone: number; genName: string; zoneName: string }> = []
  for (const g of GENERATIONS) {
    // Skip generations beyond the player's current one
    if (g.id > player.currentGeneration) break
    for (const z of g.zones) {
      // For current generation: only zones before the current zone
      // For previous generations: all zones
      if (g.id < player.currentGeneration || z.id < player.currentZone) {
        routes.push({
          gen: g.id,
          zone: z.id,
          genName: g.regionFr,
          zoneName: t(z.nameFr, z.nameEn),
        })
      }
    }
  }
  return routes
})

function selectRoute(gen: number, zone: number) {
  player.travelTo(gen, zone)
  showRouteSelector.value = false
  combat.clearTimers()
  setTimeout(() => spawnEnemy(), 200)
}

function goBackToFrontier() {
  player.returnToFrontier()
  showRouteSelector.value = false
  combat.clearTimers()
  setTimeout(() => spawnEnemy(), 200)
}

onMounted(() => {
  if (!auth.isAuthenticated) {
    const hasSeenGuestModal = localStorage.getItem('poke-idle-guest-modal-seen')
    if (!hasSeenGuestModal) {
      setTimeout(() => {
        showGuestModal.value = true
      }, 1000)
    }
  }
})

function closeGuestModal() {
  showGuestModal.value = false
  localStorage.setItem('poke-idle-guest-modal-seen', 'true')
}

function goToRegister() {
  showGuestModal.value = false
  localStorage.setItem('poke-idle-guest-modal-seen', 'true')
  navigateTo('/login?register=1')
}

watch(() => player.clickDamage, (dmg) => {
  combat.clickDamage = dmg
}, { immediate: true })

const zone = computed(() => currentZone())
const zoneName = computed(() => {
  const z = zone.value
  return z ? t(z.nameFr, z.nameEn) : `Zone ${player.currentZone}`
})

const effectiveDps = computed(() => {
  if (!combat.enemy) return 0
  return getEffectiveDps(combat.enemy.types)
})

const teamBreakdown = computed(() => {
  const enemyTypes = combat.enemy?.types ?? []
  return inventory.team.map((poke) => {
    const stats = getPokeDps(poke, enemyTypes)
    return { ...poke, ...stats, pokeTypes: getPokemonTypes(poke.slug) }
  })
})

interface DmgFloat {
  id: number
  damage: number
  x: number
  y: number
}
const floatingDamages = ref<DmgFloat[]>([])
let dmgId = 0

function spawnDamageNumber(damage: number, event?: MouseEvent) {
  const x = event ? event.clientX + (Math.random() - 0.5) * 40 : 300
  const y = event ? event.clientY - 20 : 200
  const id = dmgId++
  floatingDamages.value.push({ id, damage, x, y })
  setTimeout(() => {
    floatingDamages.value = floatingDamages.value.filter((d) => d.id !== id)
  }, 900)
}

function handleClick(event?: MouseEvent) {
  if (!combat.enemy) {
    spawnEnemy()
    return
  }
  combat.clickAttack()
  spawnDamageNumber(combat.clickDamage, event)
  checkEnemyDeath()
}

function pokemonXpPercent(poke: { level: number; xp: number; rarity?: string }): number {
  const current = pokemonXpForLevel(poke.level, poke.rarity)
  const next = pokemonXpForLevel(poke.level + 1, poke.rarity)
  const range = next - current
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((poke.xp - current) / range) * 100))
}

// --- Team Detail Modal ---
const detailPokemon = ref<OwnedPokemon | null>(null)
const candySizes: CandySize[] = ['S', 'M', 'L', 'XL']
const CANDY_COLORS: Record<CandySize, string> = { S: '#4ade80', M: '#60a5fa', L: '#c084fc', XL: '#fbbf24' }

function openTeamDetail(poke: OwnedPokemon) {
  detailPokemon.value = poke
}

function closeTeamDetail() {
  detailPokemon.value = null
}

function useCandy(poke: OwnedPokemon, size: CandySize) {
  if (poke.level >= MAX_LEVEL) return
  if (!player.useCandy(size)) return
  inventory.addPokemonXp(poke.id, CANDY_XP[size], player.currentGeneration)
  auth.saveGameState()
}

function getTeamDetailStats(poke: OwnedPokemon) {
  const baseDmg = poke.level * 2
  const evoStage = getEvolutionStage(poke.slug)
  const evoMult = getEvoStageMult(poke.slug)
  const rarityMult = RARITY_DPS_MULT[poke.rarity ?? 'common'] ?? 1.0
  const shinyMult = poke.isShiny ? 4.0 : 1.0
  const starMult = getStarDpsMult(poke.stars, poke.isShiny)
  const permanentDps = Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult)

  const attackerTypes = getPokemonTypes(poke.slug)
  const typeMatchups = TYPES.map((tp) => {
    const mult = Math.max(...attackerTypes.map(atkType => getEffectiveness(atkType, tp.id)))
    return { type: tp, mult }
  })

  return { baseDmg, evoStage, evoMult, rarityMult, shinyMult, starMult, permanentDps, typeMatchups }
}

function rarityLabel(r: Rarity): string {
  return t(RARITY_LABELS_FR[r], RARITY_LABELS_EN[r])
}

function removeFromTeam(pokeId: number) {
  inventory.removeFromTeam(pokeId)
  closeTeamDetail()
  auth.saveGameState()
}
</script>

<template>
  <div class="flex flex-col items-center gap-5 select-none" @contextmenu.prevent>
    <!-- Guest Mode Modal -->
    <GuestModeModal :show="showGuestModal" @close="closeGuestModal" @create-account="goToRegister" />

    <!-- Region Unlock Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="player.regionUnlockMessage"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          @click="player.regionUnlockMessage = null"
        >
          <div
            class="relative w-full max-w-lg rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-900/95 to-orange-900/95 p-8 shadow-2xl"
            @click.stop
          >
            <div class="text-center">
              <div class="mb-4 text-6xl">🎉</div>
              <h2 class="mb-2 text-3xl font-bold text-amber-300">{{ t('Félicitations !', 'Congratulations!') }}</h2>
              <p class="mb-6 text-xl text-amber-100">{{ player.regionUnlockMessage }}</p>
              
              <div class="mb-6 rounded-xl bg-black/30 p-4 text-left">
                <h3 class="mb-3 text-sm font-bold uppercase text-amber-400">{{ t('Nouveau contenu débloqué', 'New content unlocked') }}</h3>
                <ul class="space-y-2 text-sm text-gray-200">
                  <li class="flex items-center gap-2">
                    <span class="text-green-400">✓</span>
                    <span>{{ t('Nouvelle région à explorer', 'New region to explore') }}</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-green-400">✓</span>
                    <span>{{ t('Nouveaux Pokémon disponibles au Gacha', 'New Pokémon available in Gacha') }}</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-green-400">✓</span>
                    <span>{{ t('Nouvelles zones et boss à vaincre', 'New zones and bosses to defeat') }}</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-green-400">✓</span>
                    <span>{{ t('Évolutions exclusives à cette génération', 'Exclusive evolutions for this generation') }}</span>
                  </li>
                </ul>
              </div>

              <button
                class="w-full rounded-lg bg-amber-500 py-3 font-bold text-black transition-all hover:bg-amber-400 active:scale-95"
                @click="player.regionUnlockMessage = null"
              >
                {{ t('Continuer l\'aventure', 'Continue adventure') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Layout Desktop: 2 colonnes | Mobile: colonne -->
    <div class="flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      <!-- Colonne Gauche: Combat + Stats -->
      <div class="flex flex-1 flex-col items-center gap-5">
        <!-- Stage Info -->
    <div class="w-full max-w-md text-center">
      <!-- Farming banner -->
      <div v-if="player.isFarming" class="mb-2 flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
        <span class="text-xs font-bold text-amber-400">{{ t('Mode Farm', 'Farm Mode') }}</span>
        <button
          class="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 transition-colors hover:bg-amber-500/30"
          @click="goBackToFrontier"
        >
          <RotateCcw class="h-3 w-3" />
          {{ t('Retour frontière', 'Back to frontier') }}
        </button>
      </div>

      <div class="flex items-center justify-center gap-2 text-sm text-slate-400">
        <MapPin class="h-3.5 w-3.5" />
        <span>{{ zoneName }}</span>
        <button
          class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-white"
          :title="t('Changer de route', 'Change route')"
          @click="showRouteSelector = !showRouteSelector"
        >
          <ChevronDown class="h-4 w-4" :class="{ 'rotate-180': showRouteSelector }" />
        </button>
      </div>

      <!-- Route Selector Dropdown -->
      <Transition name="fade">
        <div v-if="showRouteSelector" class="relative z-30 mt-2">
          <div class="mx-auto max-h-60 w-full max-w-sm overflow-y-auto rounded-xl border border-slate-600 shadow-2xl" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%)">
            <div class="sticky top-0 border-b border-slate-700 px-3 py-2" style="background: rgba(15,23,42,0.95)">
              <button
                class="w-full rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                :class="!player.isFarming
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'"
                @click="goBackToFrontier"
              >
                {{ t('Frontière actuelle', 'Current frontier') }} — {{ player.stageLabel }}
              </button>
            </div>
            <div class="py-1">
              <template v-for="g in GENERATIONS" :key="g.id">
                <template v-if="completedRoutes.some(r => r.gen === g.id)">
                  <div class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {{ g.regionFr }}
                  </div>
                  <button
                    v-for="r in completedRoutes.filter(r => r.gen === g.id)"
                    :key="`${r.gen}-${r.zone}`"
                    class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors"
                    :class="player.isFarming && player.combatGeneration === r.gen && player.combatZone === r.zone
                      ? 'bg-amber-500/20 font-bold text-amber-400'
                      : 'text-gray-300 hover:bg-slate-700/60 hover:text-white'"
                    @click="selectRoute(r.gen, r.zone)"
                  >
                    <span class="w-5 text-center text-[10px] text-slate-500">{{ r.zone }}</span>
                    {{ r.zoneName }}
                  </button>
                </template>
              </template>
            </div>
          </div>
        </div>
      </Transition>

      <div v-if="zone?.types" class="mt-1 flex items-center justify-center gap-1">
        <TypeBadge v-for="tp in zone.types" :key="tp" :type="tp" size="sm" />
      </div>
      <p class="font-pixel mt-1 text-xs text-yellow-400">{{ player.stageLabel }}</p>
      <p v-if="player.isBossStage" class="mt-1.5 inline-block rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
        {{ t('Combat de Boss', 'Boss Fight') }}
      </p>
      <!-- Stage Kill Progress -->
      <div v-if="!player.isBossStage && !player.isFarming" class="mt-2">
        <div class="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{{ t('Progression', 'Progress') }}</span>
          <span class="font-bold">{{ player.stageKills ?? 0 }} / {{ player.killsPerStage }}</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-[#1a1a2e] ring-1 ring-white/5">
          <div
            class="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300"
            :style="{ width: `${player.stageKillsPercent}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Boss Timer -->
    <div
      v-if="combat.isBossFight && combat.bossTimeRemaining !== null"
      class="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2"
    >
      <Timer class="h-5 w-5 text-red-400" />
      <span class="font-pixel text-base text-red-400">{{ combat.bossTimeRemaining }}s</span>
    </div>

    <!-- Boss Team Preview (ligne au-dessus de la carte) -->
    <div v-if="combat.enemy && combat.isBossFight && zone?.boss" class="flex items-center justify-center gap-2">
      <img
        v-for="(p, i) in zone.boss.team"
        :key="i"
        :src="getSpriteUrl(p.slug)"
        :alt="t(p.nameFr, p.nameEn)"
        class="h-14 w-14 rounded-xl border-2 border-slate-700 bg-slate-800/90 object-contain p-2 shadow-lg transition-transform hover:scale-110"
        :title="t(p.nameFr, p.nameEn)"
      />
    </div>

    <!-- Enemy Display -->
    <div
      v-if="combat.enemy"
      class="relative w-full max-w-md overflow-hidden rounded-2xl border-4 shadow-2xl"
      :class="combat.isBossFight ? 'border-red-500/50 bg-gradient-to-b from-red-950/40 to-slate-900' : 'border-blue-500/50 bg-gradient-to-b from-blue-950/40 to-slate-900'"
      style="background-image: radial-gradient(rgba(255,255,255,0.03) 1.5px, transparent 1.5px); background-size: 30px 30px;"
    >
      <!-- Enemy Info Box (centré en haut) -->
      <div class="absolute left-4 right-4 top-4 z-10 mx-auto rounded-xl border-3 border-slate-800 bg-gradient-to-br from-slate-800/95 to-slate-900/95 p-4 shadow-lg">
        <div class="mb-2 flex flex-col gap-1.5">
          <span class="text-center font-pixel text-sm font-bold" :class="combat.isBossFight ? 'text-red-400' : 'text-blue-400'">
            {{ t(combat.enemy.nameFr, combat.enemy.nameEn) }}
          </span>
          <div class="flex items-center justify-center gap-1">
            <TypeBadge v-for="type in combat.enemy.types" :key="type" :type="type" size="sm" />
          </div>
        </div>
        <div class="mb-3 flex items-center justify-center gap-2">
          <span class="rounded-md bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-400">Lv{{ combat.enemy.level }}</span>
          <span v-if="combat.isBossFight" class="rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">BOSS</span>
        </div>
        <!-- HP Bar stylisée -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span>HP</span>
            <span class="ml-auto text-slate-400">{{ Math.round(combat.enemy.currentHp) }}/{{ Math.round(combat.enemy.maxHp) }}</span>
          </div>
          <!-- Barre HP segmentée -->
          <div class="relative h-2.5 overflow-hidden rounded-full" style="background: linear-gradient(to bottom, #1e293b 0%, #0f172a 100%); box-shadow: inset 0 2px 4px rgba(0,0,0,0.5)">
            <div
              class="h-full transition-all duration-200"
              :style="{
                width: `${combat.enemyHpPercent}%`,
                background: combat.enemyHpPercent > 50 
                  ? 'linear-gradient(to right, #10b981, #34d399)'
                  : combat.enemyHpPercent > 20
                    ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                    : 'linear-gradient(to right, #dc2626, #ef4444)',
                boxShadow: combat.enemyHpPercent > 50
                  ? '0 0 10px rgba(16,185,129,0.6)'
                  : combat.enemyHpPercent > 20
                    ? '0 0 10px rgba(245,158,11,0.6)'
                    : '0 0 10px rgba(220,38,38,0.6)'
              }"
            >
              <!-- Segments de la barre HP -->
              <div class="absolute inset-0 flex">
                <div v-for="i in 20" :key="i" class="flex-1 border-r border-slate-900/30" />
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Zone de combat centrale -->
      <div class="flex flex-col items-center gap-6 px-6 pb-8 pt-48">
        <!-- Plateforme de combat -->
        <div class="relative">
          <div class="absolute -bottom-4 left-1/2 h-6 w-48 -translate-x-1/2 rounded-full opacity-30"
            :style="{ background: combat.isBossFight
              ? 'radial-gradient(ellipse, rgba(239,68,68,0.5) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(59,130,246,0.5) 0%, transparent 70%)' }"
          />
          <!-- Enemy Sprite (clickable, left + right click) -->
          <button
            class="group relative cursor-pointer transition-transform active:scale-90"
            @click="handleClick($event)"
            @contextmenu.prevent="handleClick($event)"
          >
            <div v-if="combat.enemy.isShiny" class="absolute inset-0 animate-pulse rounded-full bg-yellow-400/20 blur-xl" />
            <img
              :src="combat.enemy.spriteUrl"
              :alt="t(combat.enemy.nameFr, combat.enemy.nameEn)"
              class="pointer-events-none relative h-40 w-40 select-none object-contain transition-all group-hover:scale-110"
              :style="{
                imageRendering: 'pixelated',
                filter: combat.enemy.isShiny
                  ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 16px rgba(234,179,8,0.6))'
                  : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }"
              draggable="false"
            />
            <span v-if="combat.enemy.isShiny" class="absolute -right-2 -top-2 text-xl animate-bounce">✨</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Rewards Preview (sous la carte, centré) -->
    <div v-if="combat.enemy" class="flex gap-4">
      <div class="flex items-center gap-2 rounded-xl border-2 border-slate-700/50 bg-slate-800/95 px-4 py-2 shadow-lg backdrop-blur-sm">
        <span class="text-xl">🪙</span>
        <div class="text-left">
          <p class="text-[10px] text-slate-400">{{ t('PokéDollar', 'PokéDollar') }}</p>
          <p class="text-sm font-bold text-yellow-400">+{{ combat.enemy.goldReward }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-xl border-2 border-slate-700/50 bg-slate-800/95 px-4 py-2 shadow-lg backdrop-blur-sm">
        <span class="text-xl">✦</span>
        <div class="text-left">
          <p class="text-[10px] text-slate-400">XP</p>
          <p class="text-sm font-bold text-blue-400">+{{ combat.enemy.xpReward }}</p>
        </div>
      </div>
    </div>

    <!-- Waiting for enemy -->
    <div v-else class="pk-card flex flex-col items-center gap-4 px-12 py-16 text-slate-500">
      <div class="animate-pokeball-shake text-5xl">🔴</div>
      <p class="font-pixel text-xs">{{ t('Recherche...', 'Searching...') }}</p>
    </div>

        <!-- Stats Row -->
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
          <div class="flex items-center gap-2 rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/50 to-slate-900 px-3 py-2 shadow-lg sm:gap-3 sm:px-5 sm:py-3">
            <div class="rounded-lg bg-orange-500/20 p-1.5 sm:p-2">
              <Swords class="h-4 w-4 text-orange-400 sm:h-5 sm:w-5" />
            </div>
            <div class="text-left">
              <p class="text-[10px] font-medium uppercase tracking-wider text-orange-300/70 sm:text-xs">{{ t('Click', 'Click') }}</p>
              <p class="text-base font-bold text-orange-400 sm:text-lg">{{ combat.clickDamage }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 to-slate-900 px-3 py-2 shadow-lg sm:gap-3 sm:px-5 sm:py-3">
            <div class="rounded-lg bg-cyan-500/20 p-1.5 sm:p-2">
              <Zap class="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
            </div>
            <div class="text-left">
              <p class="text-[10px] font-medium uppercase tracking-wider text-cyan-300/70 sm:text-xs">DPS</p>
              <p class="text-base font-bold text-cyan-400 sm:text-lg">{{ effectiveDps }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-950/50 to-slate-900 px-3 py-2 shadow-lg sm:gap-3 sm:px-5 sm:py-3">
            <div class="rounded-lg bg-red-500/20 p-1.5 sm:p-2">
              <Skull class="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
            </div>
            <div class="text-left">
              <p class="text-[10px] font-medium uppercase tracking-wider text-red-300/70 sm:text-xs">{{ t('Mis KOs', 'KOs') }}</p>
              <p class="text-base font-bold text-red-400 sm:text-lg">{{ combat.totalKills }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Droite: Team (desktop) / Bas (mobile) -->
      <div v-if="teamBreakdown.length > 0" class="w-full lg:w-96">
        <div class="mb-4 flex items-center justify-center gap-2">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <h3 class="text-sm font-bold uppercase tracking-widest text-blue-400">
            {{ t('Mon équipe', 'My Team') }}
          </h3>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>
        <div class="flex flex-col gap-3">
        <div
          v-for="poke in teamBreakdown"
          :key="poke.id"
          class="relative cursor-pointer overflow-hidden rounded-xl border-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-lg transition-all hover:scale-[1.02]"
          :class="poke.isShiny ? 'border-yellow-500/50' : 'border-slate-700/50'"
          @click="openTeamDetail(poke)"
        >
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;" />
          
          <div class="relative flex items-center gap-3 p-3">
            <!-- Sprite avec fond -->
            <div class="relative shrink-0">
              <div class="absolute inset-0 rounded-lg" :class="poke.isShiny ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20' : 'bg-slate-700/30'" />
              <img
                :src="poke.isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug)"
                :alt="t(poke.nameFr, poke.nameEn)"
                class="relative h-14 w-14 object-contain"
                style="image-rendering: pixelated; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"
              />
              <div v-if="poke.isShiny" class="absolute -right-1 -top-1 text-lg">✨</div>
            </div>
            
            <!-- Info -->
            <div class="flex min-w-0 flex-1 flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <p class="truncate font-pixel text-xs font-bold text-slate-100">{{ t(poke.nameFr, poke.nameEn) }}</p>
                <div class="flex gap-0.5">
                  <TypeBadge v-for="type in poke.pokeTypes" :key="type" :type="type" size="xs" />
                </div>
                <span class="ml-auto shrink-0 rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">Lv{{ poke.level }}</span>
              </div>
              
              <!-- XP Bar améliorée -->
              <div class="relative h-2 overflow-hidden rounded-full" style="background: linear-gradient(to bottom, #1e293b, #0f172a); box-shadow: inset 0 1px 3px rgba(0,0,0,0.5)">
                <div
                  class="h-full transition-all duration-300"
                  style="background: linear-gradient(to right, #06b6d4, #3b82f6); box-shadow: 0 0 8px rgba(59,130,246,0.5)"
                  :style="{ width: `${pokemonXpPercent(poke)}%` }"
                >
                  <div class="absolute inset-0 flex">
                    <div v-for="i in 10" :key="i" class="flex-1 border-r border-slate-900/30" />
                  </div>
                </div>
              </div>
              
              <!-- Stats DPS -->
              <div class="flex items-center gap-3 text-[10px]">
                <div class="flex items-center gap-1">
                  <span class="text-slate-400">{{ t('Base', 'Base') }}:</span>
                  <span class="font-bold text-slate-200">{{ poke.permanentDps }}</span>
                </div>
                <div v-if="poke.regionMult < 1" class="flex items-center gap-1">
                  <span class="font-bold text-orange-400">{{ t('Hors région', 'Off-region') }} x{{ poke.regionMult }}</span>
                </div>
                <div v-if="poke.typeMult !== 1" class="flex items-center gap-1">
                  <span class="text-slate-400">{{ t('Type', 'Type') }}:</span>
                  <span class="font-bold" :class="poke.typeMult > 1 ? 'text-green-400' : 'text-red-400'">
                    x{{ poke.typeMult }}
                  </span>
                </div>
                <div v-if="poke.isShiny" class="flex items-center gap-1">
                  <span class="font-bold text-yellow-400">Shiny x4</span>
                </div>
                <div class="ml-auto flex items-center gap-1 rounded-md px-2 py-1" :class="poke.typeMult > 1 ? 'bg-green-500/20' : poke.typeMult < 1 ? 'bg-red-500/20' : 'bg-slate-700/50'">
                  <span class="text-[9px] font-medium text-slate-400">DPS</span>
                  <span class="font-bold" :class="poke.typeMult > 1 ? 'text-green-400' : poke.typeMult < 1 ? 'text-red-400' : 'text-white'">
                    {{ poke.effectiveDps }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Team Detail Modal -->
    <Teleport to="body">
      <div
        v-if="detailPokemon"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeTeamDetail"
      >
        <div class="relative w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl mx-4">
          <button class="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white" @click="closeTeamDetail">
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
                  <TypeBadge v-for="tp in getPokemonTypes(detailPokemon.slug)" :key="tp" :type="tp" />
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

          <!-- Damage breakdown -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Détail des dégâts', 'Damage Breakdown') }}</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-lg bg-gray-800 px-3 py-2">
                <p class="text-[10px] uppercase text-gray-500">{{ t('Dégâts de base', 'Base damage') }}</p>
                <p class="text-lg font-bold text-white">{{ getTeamDetailStats(detailPokemon).baseDmg }}</p>
                <p class="text-[10px] text-gray-600">= {{ t('niveau × 2', 'level × 2') }}</p>
              </div>
              <div class="rounded-lg bg-gray-800 px-3 py-2">
                <p class="text-[10px] uppercase text-gray-500">{{ t('DPS permanent', 'Permanent DPS') }}</p>
                <p class="text-lg font-bold text-cyan-400">{{ getTeamDetailStats(detailPokemon).permanentDps }}</p>
              </div>
            </div>

            <!-- Multipliers -->
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Multiplicateurs', 'Multipliers') }}</h4>
            <div class="flex flex-wrap gap-2">
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">{{ t('Évolution', 'Evolution') }}</span>
                <span class="ml-1 font-bold" :class="getTeamDetailStats(detailPokemon).evoMult > 1 ? 'text-green-400' : 'text-gray-400'">
                  x{{ getTeamDetailStats(detailPokemon).evoMult }}
                </span>
                <span class="ml-1 text-[10px] text-gray-600">
                  ({{ ['Base', 'Stade 1', 'Stade 2'][getTeamDetailStats(detailPokemon).evoStage] }})
                </span>
              </div>
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">{{ t('Rareté', 'Rarity') }}</span>
                <span class="ml-1 font-bold" :style="{ color: RARITY_COLORS[detailPokemon.rarity ?? 'common'] }">
                  x{{ getTeamDetailStats(detailPokemon).rarityMult }}
                </span>
              </div>
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">Shiny</span>
                <span class="ml-1 font-bold" :class="detailPokemon.isShiny ? 'text-yellow-400' : 'text-gray-400'">
                  x{{ getTeamDetailStats(detailPokemon).shinyMult }}
                </span>
              </div>
              <div class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs">
                <span class="text-gray-500">★{{ detailPokemon.stars }}</span>
                <span class="ml-1 font-bold" :class="getTeamDetailStats(detailPokemon).starMult > 1 ? 'text-amber-400' : 'text-gray-400'">
                  x{{ getTeamDetailStats(detailPokemon).starMult }}
                </span>
              </div>
            </div>

            <!-- Type matchups -->
            <h4 class="text-sm font-semibold text-gray-300">{{ t('Table des types', 'Type Matchups') }}</h4>
            <div class="flex flex-wrap gap-1">
              <template v-for="m in getTeamDetailStats(detailPokemon).typeMatchups" :key="m.type.id">
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

            <!-- Remove from team -->
            <div class="pt-2">
              <button
                class="w-full rounded-lg bg-red-500/20 py-2 text-sm font-bold text-red-400 hover:bg-red-500/30"
                @click="removeFromTeam(detailPokemon.id)"
              >
                {{ t('Retirer de l\'équipe', 'Remove from Team') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Floating Damage Numbers -->
    <FloatingDamage
      v-for="d in floatingDamages"
      :key="d.id"
      :damage="d.damage"
      :x="d.x"
      :y="d.y"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .relative {
  transform: scale(0.9);
}

.fade-leave-to .relative {
  transform: scale(0.9);
}
</style>
