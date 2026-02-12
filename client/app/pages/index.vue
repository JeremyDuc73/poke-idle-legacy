<script setup lang="ts">
import { Swords, Zap } from 'lucide-vue-next'
import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'

definePageMeta({
  layout: 'game',
})

const combat = useCombatStore()
const player = usePlayerStore()

function spawnEnemy() {
  combat.setEnemy({
    name: 'Wild Rattata',
    sprite: 'https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/19/regular.png',
    maxHp: 10 * player.currentStage,
    currentHp: 10 * player.currentStage,
    level: player.currentStage,
    goldReward: 5 * player.currentStage,
  })
}

function handleClick() {
  if (!combat.enemy) {
    spawnEnemy()
    return
  }

  combat.clickAttack()

  if (combat.isEnemyDead && combat.enemy) {
    const reward = combat.enemy.goldReward
    player.addGold(reward)
    combat.killEnemy()

    setTimeout(() => spawnEnemy(), 500)
  }
}

onMounted(() => {
  spawnEnemy()
})
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <!-- Stage Info -->
    <div class="text-center">
      <p class="text-sm text-gray-400">Stage</p>
      <p class="text-2xl font-bold text-yellow-400">{{ player.currentStage }}</p>
    </div>

    <!-- Enemy Display -->
    <div
      v-if="combat.enemy"
      class="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-xl"
    >
      <p class="text-lg font-semibold">{{ combat.enemy.name }} <span class="text-gray-400">Lv.{{ combat.enemy.level }}</span></p>

      <!-- Enemy Sprite (clickable) -->
      <button
        class="group relative transition-transform active:scale-95"
        @click="handleClick"
      >
        <img
          :src="combat.enemy.sprite"
          :alt="combat.enemy.name"
          class="h-40 w-40 drop-shadow-lg transition-transform group-hover:scale-105"
        />
        <div class="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-active:opacity-100" />
      </button>

      <!-- HP Bar -->
      <div class="w-full">
        <div class="mb-1 flex justify-between text-xs text-gray-400">
          <span>HP</span>
          <span>{{ combat.enemy.currentHp }} / {{ combat.enemy.maxHp }}</span>
        </div>
        <div class="h-4 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            class="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-150"
            :style="{ width: `${combat.enemyHpPercent}%` }"
          />
        </div>
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
        <p class="text-xl font-bold text-white">{{ combat.autoDamage }}</p>
        <p class="flex items-center gap-1"><Zap class="h-3 w-3" /> Auto DPS</p>
      </div>
      <div>
        <p class="text-xl font-bold text-white">{{ combat.totalKills }}</p>
        <p>Kills</p>
      </div>
    </div>
  </div>
</template>
