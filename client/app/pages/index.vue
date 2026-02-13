<script setup lang="ts">
import { Swords, Zap, Timer, Skull, MapPin } from 'lucide-vue-next'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { useCombatLoop } from '~/composables/useCombatLoop'
import { getPokemonType, getTypeInfo } from '~/data/types'
import { pokemonXpForLevel } from '~/data/evolutions'

definePageMeta({
  layout: 'game',
})

const combat = useCombatStore()
const player = usePlayerStore()
const inventory = useInventoryStore()
const { t } = useLocale()
const { spawnEnemy, checkEnemyDeath, getEffectiveDps, getPokeDps, currentZone } = useCombatLoop()

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
  return getEffectiveDps(combat.enemy.type)
})

const teamBreakdown = computed(() => {
  const enemyType = combat.enemy?.type
  return inventory.team.map((poke) => {
    const stats = getPokeDps(poke, enemyType)
    return { ...poke, ...stats, pokeType: getPokemonType(poke.slug) }
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

function pokemonXpPercent(poke: { level: number; xp: number }): number {
  const current = pokemonXpForLevel(poke.level)
  const next = pokemonXpForLevel(poke.level + 1)
  const range = next - current
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((poke.xp - current) / range) * 100))
}
</script>

<template>
  <div class="flex flex-col items-center gap-5 select-none">
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
      class="pk-card flex w-full max-w-md flex-col items-center gap-4 p-6"
      :class="{ 'pk-card-boss': combat.isBossFight }"
    >
      <!-- Enemy Name Tag -->
      <div class="flex items-center gap-2">
        <span class="font-pixel text-xs" :class="combat.isBossFight ? 'text-red-400' : 'text-blue-300'">
          {{ t(combat.enemy.nameFr, combat.enemy.nameEn) }}
        </span>
        <TypeBadge :type="combat.enemy.type" size="sm" />
        <span class="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-400">Lv.{{ combat.enemy.level }}</span>
      </div>

      <!-- Boss Team Preview -->
      <div v-if="combat.isBossFight && zone?.boss" class="flex gap-1.5">
        <img
          v-for="(p, i) in zone.boss.team"
          :key="i"
          :src="getSpriteUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="h-9 w-9 rounded-lg bg-white/5 object-contain p-0.5 opacity-70"
          :title="t(p.nameFr, p.nameEn)"
        />
      </div>

      <!-- Enemy Sprite (clickable) -->
      <button
        class="group relative cursor-pointer rounded-full p-4 transition-transform active:scale-90"
        @click="handleClick($event)"
      >
        <div class="absolute inset-0 rounded-full opacity-30"
          :style="{ background: combat.isBossFight
            ? 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,76,202,0.25) 0%, transparent 70%)' }"
        />
        <img
          :src="combat.enemy.spriteUrl"
          :alt="t(combat.enemy.nameFr, combat.enemy.nameEn)"
          class="relative h-36 w-36 object-contain transition-transform group-hover:scale-110"
          style="image-rendering: pixelated;"
        />
      </button>

      <!-- HP Bar -->
      <div class="w-full rounded-xl bg-[#0f172a] p-3">
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-widest" :class="combat.isBossFight ? 'text-red-400' : 'text-green-400'">HP</span>
          <span class="text-xs text-slate-400">{{ Math.ceil(combat.enemy.currentHp) }} / {{ combat.enemy.maxHp }}</span>
        </div>
        <div class="h-3.5 w-full overflow-hidden rounded-full bg-[#1e293b] ring-1 ring-white/5">
          <div
            class="h-full rounded-full transition-all duration-150"
            :class="combat.enemyHpPercent > 50
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : combat.enemyHpPercent > 20
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-600 to-red-400'"
            :style="{ width: `${combat.enemyHpPercent}%` }"
          />
        </div>
      </div>

      <!-- Rewards Preview -->
      <div class="flex gap-5 text-sm">
        <span class="flex items-center gap-1 font-medium text-yellow-500">🪙 +{{ combat.enemy.goldReward }}</span>
        <span class="flex items-center gap-1 font-medium text-blue-400">✦ +{{ combat.enemy.xpReward }} xp</span>
      </div>
    </div>

    <!-- Waiting for enemy -->
    <div v-else class="pk-card flex flex-col items-center gap-4 px-12 py-16 text-slate-500">
      <div class="animate-pokeball-shake text-5xl">🔴</div>
      <p class="font-pixel text-xs">{{ t('Recherche...', 'Searching...') }}</p>
    </div>

    <!-- Stats Row -->
    <div class="flex gap-3">
      <div class="flex items-center gap-2 rounded-xl bg-[#1e293b] px-4 py-2.5 ring-1 ring-slate-700">
        <Swords class="h-4 w-4 text-orange-400" />
        <div class="text-center">
          <p class="text-sm font-bold text-white">{{ combat.clickDamage }}</p>
          <p class="text-xs uppercase tracking-wider text-slate-500">{{ t('Click', 'Click') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-xl bg-[#1e293b] px-4 py-2.5 ring-1 ring-slate-700">
        <Zap class="h-4 w-4 text-cyan-400" />
        <div class="text-center">
          <p class="text-sm font-bold text-white">{{ effectiveDps }}</p>
          <p class="text-xs uppercase tracking-wider text-slate-500">DPS</p>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-xl bg-[#1e293b] px-4 py-2.5 ring-1 ring-slate-700">
        <Skull class="h-4 w-4 text-red-400" />
        <div class="text-center">
          <p class="text-sm font-bold text-white">{{ combat.totalKills }}</p>
          <p class="text-xs uppercase tracking-wider text-slate-500">Kills</p>
        </div>
      </div>
    </div>

    <!-- Team DPS Breakdown -->
    <div v-if="teamBreakdown.length > 0" class="w-full max-w-2xl">
      <h3 class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-slate-500">
        {{ t('Mon équipe', 'My Team') }}
      </h3>
      <div class="flex flex-col gap-2">
        <div
          v-for="poke in teamBreakdown"
          :key="poke.id"
          class="flex items-center gap-3 rounded-xl bg-[#1e293b] px-3 py-2 ring-1 ring-slate-700"
        >
          <!-- Sprite -->
          <img
            :src="poke.isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug)"
            :alt="t(poke.nameFr, poke.nameEn)"
            class="h-12 w-12 shrink-0 object-contain"
            style="image-rendering: pixelated;"
          />
          <!-- Info -->
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <span v-if="poke.isShiny" class="text-xs">✨</span>
              <p class="truncate text-xs font-medium text-slate-200">{{ t(poke.nameFr, poke.nameEn) }}</p>
              <TypeBadge :type="poke.pokeType" />
              <span class="ml-auto shrink-0 text-[10px] text-slate-500">Lv.{{ poke.level }}</span>
            </div>
            <!-- XP Bar -->
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#0f172a]">
              <div
                class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
                :style="{ width: `${pokemonXpPercent(poke)}%` }"
              />
            </div>
            <!-- DPS detail -->
            <div class="flex items-center gap-2 text-[10px]">
              <span class="text-slate-500">{{ t('Base', 'Base') }}: <span class="font-medium text-slate-300">{{ poke.baseDps }}</span></span>
              <span v-if="poke.typeMult !== 1" class="font-medium" :class="poke.typeMult > 1 ? 'text-green-400' : 'text-red-400'">
                {{ t('Type', 'Type') }} x{{ poke.typeMult }}
              </span>
              <span v-if="poke.isShiny" class="font-medium text-yellow-400">
                Shiny x1.5
              </span>
              <span class="ml-auto font-bold" :class="poke.typeMult > 1 ? 'text-green-400' : poke.typeMult < 1 ? 'text-red-400' : 'text-white'">
                {{ poke.effectiveDps }} DPS
              </span>
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
