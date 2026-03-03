<script setup lang="ts">
import { Swords, Zap, Timer, Skull, MapPin } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { useCombatLoop } from '~/composables/useCombatLoop'
import { getPokemonType, getPokemonTypes, getTypeInfo } from '~/data/types'
import { pokemonXpForLevel } from '~/data/evolutions'
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
</script>

<template>
  <div class="flex flex-col items-center gap-5 select-none">
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
      <div class="flex items-center justify-center gap-2 text-sm text-slate-400">
        <MapPin class="h-3.5 w-3.5" />
        <span>{{ zoneName }}</span>
      </div>
      <div v-if="zone?.types" class="mt-1 flex items-center justify-center gap-1">
        <TypeBadge v-for="tp in zone.types" :key="tp" :type="tp" size="sm" />
      </div>
      <p class="font-pixel mt-1 text-xs text-yellow-400">{{ player.stageLabel }}</p>
      <p v-if="player.isBossStage" class="mt-1.5 inline-block rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
        {{ t('Combat de Boss', 'Boss Fight') }}
      </p>
      <!-- Stage Kill Progress -->
      <div v-if="!player.isBossStage" class="mt-2">
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
            <span class="ml-auto text-slate-400">{{ Math.ceil(combat.enemy.currentHp) }}/{{ combat.enemy.maxHp }}</span>
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

      <!-- Boss Team Preview -->
      <div v-if="combat.isBossFight && zone?.boss" class="absolute left-4 top-4 z-10 flex gap-1.5">
        <img
          v-for="(p, i) in zone.boss.team"
          :key="i"
          :src="getSpriteUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="h-10 w-10 rounded-lg border-2 border-slate-700 bg-slate-800/90 object-contain p-1 shadow-lg transition-transform hover:scale-110"
          :title="t(p.nameFr, p.nameEn)"
        />
      </div>

      <!-- Zone de combat centrale -->
      <div class="flex flex-col items-center gap-6 px-6 pb-8 pt-40">
        <!-- Plateforme de combat -->
        <div class="relative">
          <div class="absolute -bottom-4 left-1/2 h-6 w-48 -translate-x-1/2 rounded-full opacity-30"
            :style="{ background: combat.isBossFight
              ? 'radial-gradient(ellipse, rgba(239,68,68,0.5) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(59,130,246,0.5) 0%, transparent 70%)' }"
          />
          <!-- Enemy Sprite (clickable) -->
          <button
            class="group relative cursor-pointer transition-transform active:scale-90"
            @click="handleClick($event)"
          >
            <img
              :src="combat.enemy.spriteUrl"
              :alt="t(combat.enemy.nameFr, combat.enemy.nameEn)"
              class="relative h-40 w-40 object-contain transition-all group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              style="image-rendering: pixelated; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));"
            />
          </button>
        </div>

        <!-- Rewards Preview -->
        <div class="flex gap-4 rounded-xl border-2 border-slate-700/50 bg-slate-800/80 px-6 py-3 shadow-lg backdrop-blur-sm">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🪙</span>
            <div class="text-left">
              <p class="text-xs text-slate-400">{{ t('Or', 'Gold') }}</p>
              <p class="font-bold text-yellow-400">+{{ combat.enemy.goldReward }}</p>
            </div>
          </div>
          <div class="h-10 w-px bg-slate-700" />
          <div class="flex items-center gap-2">
            <span class="text-2xl">✦</span>
            <div class="text-left">
              <p class="text-xs text-slate-400">XP</p>
              <p class="font-bold text-blue-400">+{{ combat.enemy.xpReward }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Waiting for enemy -->
    <div v-else class="pk-card flex flex-col items-center gap-4 px-12 py-16 text-slate-500">
      <div class="animate-pokeball-shake text-5xl">🔴</div>
      <p class="font-pixel text-xs">{{ t('Recherche...', 'Searching...') }}</p>
    </div>

        <!-- Stats Row -->
        <div class="flex gap-3">
          <div class="flex items-center gap-3 rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/50 to-slate-900 px-5 py-3 shadow-lg">
            <div class="rounded-lg bg-orange-500/20 p-2">
              <Swords class="h-5 w-5 text-orange-400" />
            </div>
            <div class="text-left">
              <p class="text-xs font-medium uppercase tracking-wider text-orange-300/70">{{ t('Click', 'Click') }}</p>
              <p class="text-lg font-bold text-orange-400">{{ combat.clickDamage }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 to-slate-900 px-5 py-3 shadow-lg">
            <div class="rounded-lg bg-cyan-500/20 p-2">
              <Zap class="h-5 w-5 text-cyan-400" />
            </div>
            <div class="text-left">
              <p class="text-xs font-medium uppercase tracking-wider text-cyan-300/70">DPS</p>
              <p class="text-lg font-bold text-cyan-400">{{ effectiveDps }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-950/50 to-slate-900 px-5 py-3 shadow-lg">
            <div class="rounded-lg bg-red-500/20 p-2">
              <Skull class="h-5 w-5 text-red-400" />
            </div>
            <div class="text-left">
              <p class="text-xs font-medium uppercase tracking-wider text-red-300/70">Kills</p>
              <p class="text-lg font-bold text-red-400">{{ combat.totalKills }}</p>
            </div>
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
          class="relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-lg transition-all hover:scale-[1.02]"
          :class="poke.isShiny ? 'border-yellow-500/50' : 'border-slate-700/50'"
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
                <div v-if="poke.typeMult !== 1" class="flex items-center gap-1">
                  <span class="text-slate-400">{{ t('Type', 'Type') }}:</span>
                  <span class="font-bold" :class="poke.typeMult > 1 ? 'text-green-400' : 'text-red-400'">
                    x{{ poke.typeMult }}
                  </span>
                </div>
                <div v-if="poke.isShiny" class="flex items-center gap-1">
                  <span class="font-bold text-yellow-400">Shiny x1.5</span>
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
