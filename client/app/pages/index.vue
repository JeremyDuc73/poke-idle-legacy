<script setup lang="ts">
import { Swords, Zap, Timer, Skull } from 'lucide-vue-next'
import { getSpriteUrl } from '~/utils/showdown'
import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'

definePageMeta({
  layout: 'game',
})

const combat = useCombatStore()
const player = usePlayerStore()

const WILD_POKEMON_POOL = [
  { name: 'Rattata', slug: 'rattata' },
  { name: 'Pidgey', slug: 'pidgey' },
  { name: 'Caterpie', slug: 'caterpie' },
  { name: 'Weedle', slug: 'weedle' },
  { name: 'Zubat', slug: 'zubat' },
  { name: 'Geodude', slug: 'geodude' },
  { name: 'Oddish', slug: 'oddish' },
  { name: 'Ekans', slug: 'ekans' },
]

function randomPokemon() {
  return WILD_POKEMON_POOL[Math.floor(Math.random() * WILD_POKEMON_POOL.length)]
}

function spawnEnemy() {
  const stage = player.currentStage
  const zone = player.currentZone
  const difficulty = (zone - 1) * 10 + stage

  if (player.isBossStage) {
    combat.setEnemy({
      name: 'Boss: Brock',
      slug: 'brock',
      spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
      maxHp: 50 * difficulty,
      currentHp: 50 * difficulty,
      level: difficulty * 2,
      goldReward: 50 * difficulty,
      xpReward: 20 * difficulty,
      isBoss: true,
      bossTimerSeconds: 30,
    })
  } else {
    const poke = randomPokemon()
    combat.setEnemy({
      name: `Wild ${poke.name}`,
      slug: poke.slug,
      spriteUrl: getSpriteUrl(poke.slug),
      maxHp: 10 * difficulty,
      currentHp: 10 * difficulty,
      level: difficulty,
      goldReward: 5 * difficulty,
      xpReward: 3 * difficulty,
      isBoss: false,
      bossTimerSeconds: null,
    })
  }
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
    const reward = combat.enemy.goldReward
    player.addGold(reward)

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
      <p class="text-sm text-gray-400">{{ player.stageLabel }}</p>
      <p v-if="player.isBossStage" class="mt-1 text-xs font-bold uppercase tracking-wider text-red-400">
        Boss Stage
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
        <span>+{{ combat.enemy.goldReward }} gold</span>
        <span>+{{ combat.enemy.xpReward }} xp</span>
      </div>
    </div>

    <!-- Waiting for enemy -->
    <div v-else class="flex flex-col items-center gap-4 py-12 text-gray-500">
      <Swords class="h-12 w-12 animate-pulse" />
      <p>Searching for enemy...</p>
    </div>

    <!-- Stats -->
    <div class="flex gap-6 text-center text-sm text-gray-400">
      <div>
        <p class="text-xl font-bold text-white">{{ combat.clickDamage }}</p>
        <p class="flex items-center gap-1"><Swords class="h-3 w-3" /> Click DMG</p>
      </div>
      <div>
        <p class="text-xl font-bold text-white">{{ combat.teamDps }}</p>
        <p class="flex items-center gap-1"><Zap class="h-3 w-3" /> Team DPS</p>
      </div>
      <div>
        <p class="text-xl font-bold text-white">{{ combat.totalKills }}</p>
        <p class="flex items-center gap-1"><Skull class="h-3 w-3" /> Kills</p>
      </div>
    </div>
  </div>
</template>
