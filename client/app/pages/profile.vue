<script setup lang="ts">
import { User, Trophy, Swords, Zap, Skull, Star, MapPin, Coins, Gem } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useCombatStore } from '~/stores/useCombatStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const combat = useCombatStore()
const inventory = useInventoryStore()
const { t } = useLocale()

interface StatItem {
  labelFr: string
  labelEn: string
  value: string | number
  icon: any
  color: string
}

const stats = computed<StatItem[]>(() => [
  {
    labelFr: 'Niveau',
    labelEn: 'Level',
    value: player.level,
    icon: User,
    color: 'text-blue-400',
  },
  {
    labelFr: 'Or total',
    labelEn: 'Total Gold',
    value: player.formattedGold,
    icon: Coins,
    color: 'text-yellow-400',
  },
  {
    labelFr: 'Gemmes',
    labelEn: 'Gems',
    value: player.formattedGems,
    icon: Gem,
    color: 'text-purple-400',
  },
  {
    labelFr: 'Badges',
    labelEn: 'Badges',
    value: player.badges,
    icon: Trophy,
    color: 'text-yellow-500',
  },
  {
    labelFr: 'Dégâts au clic',
    labelEn: 'Click Damage',
    value: combat.clickDamage,
    icon: Swords,
    color: 'text-orange-400',
  },
  {
    labelFr: 'DPS Équipe',
    labelEn: 'Team DPS',
    value: combat.teamDps,
    icon: Zap,
    color: 'text-cyan-400',
  },
  {
    labelFr: 'Ennemis vaincus',
    labelEn: 'Enemies Defeated',
    value: combat.totalKills.toLocaleString(),
    icon: Skull,
    color: 'text-red-400',
  },
  {
    labelFr: 'Pokémon collectés',
    labelEn: 'Pokémon Collected',
    value: inventory.collectionCount,
    icon: Star,
    color: 'text-green-400',
  },
  {
    labelFr: 'Région actuelle',
    labelEn: 'Current Region',
    value: player.regionName,
    icon: MapPin,
    color: 'text-indigo-400',
  },
])
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
        <User class="h-8 w-8 text-indigo-400" />
      </div>
      <div>
        <h2 class="text-2xl font-bold">{{ player.username || t('Dresseur', 'Trainer') }}</h2>
        <p class="text-sm text-gray-400">
          {{ t('Niveau', 'Level') }} {{ player.level }} · {{ player.regionName }}
        </p>
      </div>
    </div>

    <!-- XP Bar -->
    <div>
      <div class="mb-1 flex justify-between text-xs text-gray-400">
        <span>{{ t('Expérience', 'Experience') }}</span>
        <span>{{ player.xp }} / {{ player.xpToNextLevel }} XP</span>
      </div>
      <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
          :style="{ width: `${player.xpPercent}%` }"
        />
      </div>
    </div>

    <!-- Progression -->
    <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h3 class="mb-2 text-sm font-semibold text-gray-400">{{ t('Progression', 'Progression') }}</h3>
      <p class="text-lg font-bold text-white">{{ player.stageLabel }}</p>
      <p v-if="player.isBossStage" class="text-xs font-bold uppercase text-red-400">
        {{ t('Combat de Boss', 'Boss Fight') }}
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.labelEn"
        class="flex flex-col gap-2 rounded-xl border border-gray-700 bg-gray-800 p-4"
      >
        <div class="flex items-center gap-2">
          <component :is="stat.icon" class="h-4 w-4" :class="stat.color" />
          <span class="text-xs text-gray-400">{{ t(stat.labelFr, stat.labelEn) }}</span>
        </div>
        <p class="text-xl font-bold text-white">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Team Overview -->
    <div v-if="inventory.team.length > 0">
      <h3 class="mb-3 text-sm font-semibold text-gray-400">{{ t('Équipe active', 'Active Team') }}</h3>
      <div class="flex gap-3">
        <div
          v-for="pokemon in inventory.team"
          :key="pokemon.id"
          class="flex flex-col items-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3"
        >
          <img
            :src="pokemon.isShiny
              ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemon.slug}.gif`
              : `https://play.pokemonshowdown.com/sprites/ani/${pokemon.slug}.gif`"
            :alt="t(pokemon.nameFr, pokemon.nameEn)"
            class="h-12 w-12 object-contain"
          />
          <span class="text-[10px] font-medium text-gray-300">{{ t(pokemon.nameFr, pokemon.nameEn) }}</span>
          <div class="flex gap-0.5">
            <Star
              v-for="s in pokemon.stars"
              :key="s"
              class="h-2 w-2 fill-yellow-400 text-yellow-400"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
