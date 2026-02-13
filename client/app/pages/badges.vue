<script setup lang="ts">
import { Trophy, Lock, Check } from 'lucide-vue-next'
import { getTrainerSpriteUrl, getSpriteUrl } from '~/utils/showdown'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useLocale } from '~/composables/useLocale'
import { getAllBosses, GENERATIONS } from '~/data/zones'
import type { BossInfo } from '~/data/zones'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const { t } = useLocale()

const allBosses = getAllBosses()

function isBossDefeated(boss: BossInfo): boolean {
  if (player.currentGeneration > boss.genId) return true
  if (player.currentGeneration === boss.genId && player.currentZone > boss.zoneId) return true
  return false
}

function isBossCurrent(boss: BossInfo): boolean {
  return player.currentGeneration === boss.genId && player.currentZone === boss.zoneId
}

const defeatedCount = computed(() => allBosses.filter(isBossDefeated).length)

const bossGroups = computed(() => {
  const groups: { genId: number; regionFr: string; regionEn: string; bosses: BossInfo[] }[] = []
  for (const gen of GENERATIONS) {
    const bosses = allBosses.filter((b) => b.genId === gen.id)
    if (bosses.length > 0) {
      groups.push({
        genId: gen.id,
        regionFr: gen.regionFr,
        regionEn: gen.regionEn,
        bosses,
      })
    }
  }
  return groups
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Trophy class="h-6 w-6 text-yellow-400" />
      <h2 class="text-xl font-bold">
        {{ t('Badges', 'Badges') }}
        <span class="text-sm font-normal text-slate-400">({{ defeatedCount }} / {{ allBosses.length }})</span>
      </h2>
    </div>

    <!-- Boss Groups by Region -->
    <div v-for="group in bossGroups" :key="group.genId" class="flex flex-col gap-3">
      <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
        <span>{{ t(group.regionFr, group.regionEn) }}</span>
        <span class="text-[10px] font-normal text-slate-600">Gen {{ group.genId }}</span>
      </h3>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <div
          v-for="boss in group.bosses"
          :key="`${boss.genId}-${boss.zoneId}`"
          class="relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
          :class="isBossDefeated(boss)
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : isBossCurrent(boss)
              ? 'border-blue-500/40 bg-blue-500/10 ring-1 ring-blue-500/20'
              : 'border-slate-700 bg-slate-800 opacity-50'"
        >
          <!-- Defeated checkmark -->
          <div
            v-if="isBossDefeated(boss)"
            class="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-500"
          >
            <Check class="h-3.5 w-3.5 text-white" />
          </div>

          <!-- Lock for future -->
          <div
            v-if="!isBossDefeated(boss) && !isBossCurrent(boss)"
            class="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-600"
          >
            <Lock class="h-3 w-3 text-slate-400" />
          </div>

          <!-- Current indicator -->
          <span
            v-if="isBossCurrent(boss)"
            class="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white"
          >
            ⚔
          </span>

          <!-- Trainer Sprite -->
          <img
            :src="getTrainerSpriteUrl(boss.boss.slug)"
            :alt="t(boss.boss.nameFr, boss.boss.nameEn)"
            class="h-20 w-20 object-contain"
            :class="{ grayscale: !isBossDefeated(boss) && !isBossCurrent(boss) }"
          />

          <!-- Boss Name -->
          <p class="text-center text-xs font-bold" :class="isBossDefeated(boss) ? 'text-yellow-400' : 'text-slate-300'">
            {{ t(boss.boss.nameFr, boss.boss.nameEn) }}
          </p>

          <!-- Zone Name -->
          <p class="text-center text-[10px] text-slate-500">
            {{ t(boss.zoneFr, boss.zoneEn) }}
          </p>

          <!-- Boss Team Preview -->
          <div class="flex gap-1">
            <img
              v-for="(p, i) in boss.boss.team"
              :key="i"
              :src="getSpriteUrl(p.slug)"
              :alt="t(p.nameFr, p.nameEn)"
              class="h-6 w-6 object-contain"
              :class="{ grayscale: !isBossDefeated(boss) && !isBossCurrent(boss) }"
              :title="t(p.nameFr, p.nameEn)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty if no bosses -->
    <div v-if="allBosses.length === 0" class="py-12 text-center text-sm text-slate-500">
      {{ t('Aucun boss disponible.', 'No bosses available.') }}
    </div>
  </div>
</template>
