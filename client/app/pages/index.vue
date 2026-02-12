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
    name: t(`${poke.nameFr} sauvage`, `Wild ${poke.nameEn}`),
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
    name: t(`Boss : ${boss.nameFr}`, `Boss: ${boss.nameEn}`),
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

function handleClick() {
  if (!combat.enemy) {
    spawnEnemy()
    return
  }
  combat.clickAttack()
  checkEnemyDeath()
}

function checkEnemyDeath() {
  if (combat.isEnemyDead && combat.enemy) {
    const goldReward = combat.enemy.goldReward
    const xpReward = combat.enemy.xpReward
    player.addGold(goldReward)
    player.addXp(xpReward)

    const wasBoss = combat.enemy.isBoss
    combat.killEnemy()

    if (wasBoss) {
      player.advanceStage()
    }

    setTimeout(() => spawnEnemy(), 500)
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
  <div class="flex flex-col items-center gap-8">
    <!-- Stage Info -->
    <div class="text-center">
      <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
        <MapPin class="h-3.5 w-3.5" />
        <span>{{ zoneName }}</span>
      </div>
      <p class="text-lg font-bold text-yellow-400">{{ player.stageLabel }}</p>
      <p v-if="player.isBossStage" class="mt-1 text-xs font-bold uppercase tracking-wider text-red-400">
        {{ t('Combat de Boss', 'Boss Fight') }}
      </p>
    </div>

    <!-- Boss Timer -->
    <div
      v-if="combat.isBossFight && combat.bossTimeRemaining !== null"
      class="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-red-400"
    >
      <Timer class="h-5 w-5" />
      <span class="font-mono text-lg font-bold">{{ combat.bossTimeRemaining }}s</span>
    </div>

    <!-- Enemy Display -->
    <div
      v-if="combat.enemy"
      class="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border p-8 shadow-xl"
      :class="combat.isBossFight
        ? 'border-red-500/50 bg-gray-800 ring-1 ring-red-500/20'
        : 'border-gray-700 bg-gray-800'"
    >
      <p class="text-lg font-semibold">
        {{ combat.enemy.name }}
        <span class="text-gray-400">Lv.{{ combat.enemy.level }}</span>
      </p>

      <!-- Boss Team Preview -->
      <div v-if="combat.isBossFight && currentZone?.boss" class="flex gap-1">
        <img
          v-for="(p, i) in currentZone.boss.team"
          :key="i"
          :src="getSpriteUrl(p.slug)"
          :alt="t(p.nameFr, p.nameEn)"
          class="h-8 w-8 object-contain opacity-60"
          :title="t(p.nameFr, p.nameEn)"
        />
      </div>

      <!-- Enemy Sprite (clickable) -->
      <button
        class="group relative transition-transform active:scale-95"
        @click="handleClick"
      >
        <img
          :src="combat.enemy.spriteUrl"
          :alt="combat.enemy.name"
          class="h-40 w-40 object-contain drop-shadow-lg transition-transform group-hover:scale-105"
          :class="{ 'drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]': combat.isBossFight }"
        />
        <div class="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-active:opacity-100" />
      </button>

      <!-- HP Bar -->
      <div class="w-full">
        <div class="mb-1 flex justify-between text-xs text-gray-400">
          <span>HP</span>
          <span>{{ Math.ceil(combat.enemy.currentHp) }} / {{ combat.enemy.maxHp }}</span>
        </div>
        <div class="h-4 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            class="h-full rounded-full transition-all duration-150"
            :class="combat.isBossFight
              ? 'bg-gradient-to-r from-red-600 to-orange-500'
              : 'bg-gradient-to-r from-red-500 to-green-500'"
            :style="{ width: `${combat.enemyHpPercent}%` }"
          />
        </div>
      </div>

      <!-- Rewards Preview -->
      <div class="flex gap-4 text-xs text-gray-500">
        <span>+{{ combat.enemy.goldReward }} {{ t('or', 'gold') }}</span>
        <span>+{{ combat.enemy.xpReward }} xp</span>
      </div>
    </div>

    <!-- Waiting for enemy -->
    <div v-else class="flex flex-col items-center gap-4 py-12 text-gray-500">
      <Swords class="h-12 w-12 animate-pulse" />
      <p>{{ t('Recherche d\'un ennemi...', 'Searching for enemy...') }}</p>
    </div>

    <!-- Player Level & XP -->
    <div class="w-full max-w-xs">
      <div class="mb-1 flex justify-between text-xs text-gray-400">
        <span>{{ t('Niveau', 'Level') }} {{ player.level }}</span>
        <span>{{ player.xp }} / {{ player.xpToNextLevel }} XP</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
          :style="{ width: `${player.xpPercent}%` }"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="flex gap-6 text-center text-sm text-gray-400">
      <div>
        <p class="text-xl font-bold text-white">{{ combat.clickDamage }}</p>
        <p class="flex items-center gap-1"><Swords class="h-3 w-3" /> {{ t('Click', 'Click') }}</p>
      </div>
      <div>
        <p class="text-xl font-bold text-white">{{ combat.teamDps }}</p>
        <p class="flex items-center gap-1"><Zap class="h-3 w-3" /> DPS</p>
      </div>
      <div>
        <p class="text-xl font-bold text-white">{{ combat.totalKills }}</p>
        <p class="flex items-center gap-1"><Skull class="h-3 w-3" /> Kills</p>
      </div>
    </div>
  </div>
</template>
