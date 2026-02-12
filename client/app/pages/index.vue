<script setup lang="ts">
import { Swords, Zap, Timer, Skull, MapPin } from 'lucide-vue-next'
import { getSpriteUrl, getTrainerSpriteUrl } from '~/utils/showdown'
import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { getZone } from '~/data/zones'
import type { WildPokemon, BossTrainer } from '~/data/zones'

definePageMeta({
  layout: 'game',
})

const combat = useCombatStore()
const player = usePlayerStore()
const inventory = useInventoryStore()
const { t } = useLocale()

watch(() => inventory.teamDps, (dps) => {
  combat.teamDps = dps
}, { immediate: true })

watch(() => player.clickDamage, (dmg) => {
  combat.clickDamage = dmg
}, { immediate: true })

const currentZone = computed(() => getZone(player.currentGeneration, player.currentZone))
const zoneName = computed(() => {
  const z = currentZone.value
  return z ? t(z.nameFr, z.nameEn) : `Zone ${player.currentZone}`
})

function randomWild(): WildPokemon {
  const zone = currentZone.value
  if (!zone || zone.wild.length === 0) {
    return { nameFr: 'Rattata', nameEn: 'Rattata', slug: 'rattata', baseHp: 30, baseAtk: 6 }
  }
  return zone.wild[Math.floor(Math.random() * zone.wild.length)]
}

function spawnEnemy() {
  const stage = player.currentStage
  const zone = player.currentZone
  const difficulty = (zone - 1) * 10 + stage

  if (player.isBossStage) {
    const boss = currentZone.value?.boss
    if (boss) {
      spawnBoss(boss, difficulty)
    }
  } else {
    spawnWild(difficulty)
  }
}

function spawnWild(difficulty: number) {
  const poke = randomWild()
  const hp = Math.round(poke.baseHp * (1 + difficulty * 0.5))
  combat.setEnemy({
    nameFr: `${poke.nameFr} sauvage`,
    nameEn: `Wild ${poke.nameEn}`,
    slug: poke.slug,
    spriteUrl: getSpriteUrl(poke.slug),
    maxHp: hp,
    currentHp: hp,
    level: difficulty,
    goldReward: 5 * difficulty,
    xpReward: 3 * difficulty,
    isBoss: false,
    bossTimerSeconds: null,
  })
}

function spawnBoss(boss: BossTrainer, difficulty: number) {
  const totalHp = boss.team.reduce((sum, p) => sum + Math.round(50 * p.level * (1 + difficulty * 0.1)), 0)
  combat.setEnemy({
    nameFr: `Boss : ${boss.nameFr}`,
    nameEn: `Boss: ${boss.nameEn}`,
    slug: boss.slug,
    spriteUrl: getTrainerSpriteUrl(boss.slug),
    maxHp: totalHp,
    currentHp: totalHp,
    level: Math.max(...boss.team.map((p) => p.level)),
    goldReward: 50 * difficulty,
    xpReward: 20 * difficulty,
    isBoss: true,
    bossTimerSeconds: boss.timerSeconds,
  })
}

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

function checkEnemyDeath() {
  if (combat.isEnemyDead && combat.enemy) {
    const goldReward = combat.enemy.goldReward
    const xpReward = combat.enemy.xpReward
    const wasBoss = combat.enemy.isBoss
    player.addGold(goldReward)
    player.addXp(xpReward)

    // Give XP to team pokemon
    const team = inventory.team
    if (team.length > 0) {
      const xpPerPokemon = Math.max(1, Math.floor(xpReward / team.length))
      for (const poke of team) {
        inventory.addPokemonXp(poke.id, xpPerPokemon)
      }
    }

    combat.killEnemy()

    if (wasBoss) {
      player.advanceStage()
    } else {
      player.addStageKill()
    }

    setTimeout(() => spawnEnemy(), 400)
  }
}

watch(() => combat.bossTimedOut, (timedOut) => {
  if (timedOut) {
    combat.bossFailed()
    player.retreatStage()
    setTimeout(() => spawnEnemy(), 1000)
  }
})

watch(() => combat.enemy?.currentHp, () => {
  checkEnemyDeath()
})

onMounted(() => {
  spawnEnemy()
})

onUnmounted(() => {
  combat.clearTimers()
})
</script>

<template>
  <div class="flex flex-col items-center gap-6 select-none">
    <!-- Stage Info -->
    <div class="w-full max-w-md text-center">
      <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
        <MapPin class="h-3 w-3" />
        <span>{{ zoneName }}</span>
      </div>
      <p class="font-pixel mt-1 text-[11px] text-yellow-400">{{ player.stageLabel }}</p>
      <p v-if="player.isBossStage" class="mt-1.5 inline-block rounded-full bg-red-600/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">
        {{ t('Combat de Boss', 'Boss Fight') }}
      </p>
      <!-- Stage Kill Progress -->
      <div v-if="!player.isBossStage" class="mt-2">
        <div class="mb-1 flex items-center justify-between text-[9px] text-gray-500">
          <span>{{ t('Progression', 'Progress') }}</span>
          <span>{{ player.stageKills }} / {{ player.killsPerStage }}</span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a2e] ring-1 ring-white/5">
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
      <span class="font-pixel text-sm text-red-400">{{ combat.bossTimeRemaining }}s</span>
    </div>

    <!-- Enemy Display -->
    <div
      v-if="combat.enemy"
      class="pk-card flex w-full max-w-md flex-col items-center gap-4 p-8"
      :class="{ 'pk-card-boss': combat.isBossFight }"
    >
      <!-- Enemy Name Tag -->
      <div class="flex items-center gap-2">
        <span class="font-pixel text-[10px]" :class="combat.isBossFight ? 'text-red-400' : 'text-blue-300'">
          {{ t(combat.enemy.nameFr, combat.enemy.nameEn) }}
        </span>
        <span class="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">Lv.{{ combat.enemy.level }}</span>
      </div>

      <!-- Boss Team Preview -->
      <div v-if="combat.isBossFight && currentZone?.boss" class="flex gap-1.5">
        <img
          v-for="(p, i) in currentZone.boss.team"
          :key="i"
          :src="getSpriteUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="h-8 w-8 rounded-lg bg-white/5 object-contain p-0.5 opacity-70"
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
            : 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)' }"
        />
        <img
          :src="combat.enemy.spriteUrl"
          :alt="t(combat.enemy.nameFr, combat.enemy.nameEn)"
          class="relative h-36 w-36 object-contain transition-transform group-hover:scale-110"
          style="image-rendering: pixelated;"
        />
      </button>

      <!-- HP Bar (Pokemon style) -->
      <div class="w-full rounded-xl bg-[#0f0f1e] p-3">
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-widest" :class="combat.isBossFight ? 'text-red-400' : 'text-green-400'">HP</span>
          <span class="font-pixel text-[9px] text-gray-400">{{ Math.ceil(combat.enemy.currentHp) }} / {{ combat.enemy.maxHp }}</span>
        </div>
        <div class="h-3 w-full overflow-hidden rounded-full bg-[#1a1a2e] ring-1 ring-white/5">
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
      <div class="flex gap-4 text-[10px]">
        <span class="flex items-center gap-1 text-yellow-500">🪙 +{{ combat.enemy.goldReward }}</span>
        <span class="flex items-center gap-1 text-blue-400">✦ +{{ combat.enemy.xpReward }} xp</span>
      </div>
    </div>

    <!-- Waiting for enemy -->
    <div v-else class="pk-card flex flex-col items-center gap-4 px-12 py-16 text-gray-600">
      <div class="animate-pokeball-shake text-4xl">🔴</div>
      <p class="font-pixel text-[9px]">{{ t('Recherche...', 'Searching...') }}</p>
    </div>

    <!-- Stats Row -->
    <div class="flex gap-3">
      <div class="flex items-center gap-2 rounded-xl bg-[#16213e] px-4 py-2.5 ring-1 ring-[#1e3a5f]">
        <Swords class="h-4 w-4 text-orange-400" />
        <div class="text-center">
          <p class="text-sm font-bold text-white">{{ combat.clickDamage }}</p>
          <p class="text-[8px] uppercase tracking-wider text-gray-500">{{ t('Click', 'Click') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-xl bg-[#16213e] px-4 py-2.5 ring-1 ring-[#1e3a5f]">
        <Zap class="h-4 w-4 text-cyan-400" />
        <div class="text-center">
          <p class="text-sm font-bold text-white">{{ combat.teamDps }}</p>
          <p class="text-[8px] uppercase tracking-wider text-gray-500">DPS</p>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-xl bg-[#16213e] px-4 py-2.5 ring-1 ring-[#1e3a5f]">
        <Skull class="h-4 w-4 text-red-400" />
        <div class="text-center">
          <p class="text-sm font-bold text-white">{{ combat.totalKills }}</p>
          <p class="text-[8px] uppercase tracking-wider text-gray-500">Kills</p>
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
