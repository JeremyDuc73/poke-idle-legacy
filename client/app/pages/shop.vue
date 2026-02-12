<script setup lang="ts">
import { Coins, Gem, Zap, Swords, ShieldPlus, Sparkles } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useCombatStore } from '~/stores/useCombatStore'
import { useLocale } from '~/composables/useLocale'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const combat = useCombatStore()
const { t } = useLocale()

const purchaseFlash = ref<string | null>(null)

function flash(id: string) {
  purchaseFlash.value = id
  setTimeout(() => (purchaseFlash.value = null), 600)
}

function buyGems(amount: number, goldCost: number) {
  if (player.spendGold(goldCost)) {
    player.addGems(amount)
    flash(`gems-${amount}`)
  }
}

interface ShopItem {
  id: string
  iconComponent: any
  iconClass: string
  labelFr: string
  labelEn: string
  descFr: string
  descEn: string
  cost: number
  currency: 'gold' | 'gems'
  action: () => void
}

const gemExchanges = [
  { gems: 1, gold: 500 },
  { gems: 5, gold: 2200 },
  { gems: 10, gold: 4000 },
]

const shopItems = computed<ShopItem[]>(() => [
  {
    id: 'click-boost',
    iconComponent: Swords,
    iconClass: 'text-orange-400',
    labelFr: 'Force du clic +1',
    labelEn: 'Click Power +1',
    descFr: `Dégâts actuels : ${combat.clickDamage}`,
    descEn: `Current damage: ${combat.clickDamage}`,
    cost: Math.floor(100 * Math.pow(1.5, combat.clickDamage - 1)),
    currency: 'gold' as const,
    action: () => {
      const price = Math.floor(100 * Math.pow(1.5, combat.clickDamage - 1))
      if (player.spendGold(price)) {
        player.clickDamage++
        combat.clickDamage = player.clickDamage
        flash('click-boost')
      }
    },
  },
  {
    id: 'gold-boost',
    iconComponent: Coins,
    iconClass: 'text-yellow-400',
    labelFr: 'Or bonus x2 (temp)',
    labelEn: 'Gold boost x2 (temp)',
    descFr: 'Double les gains d\'or pendant 5 min',
    descEn: 'Double gold earnings for 5 min',
    cost: 2,
    currency: 'gems' as const,
    action: () => {
      if (player.spendGems(2)) {
        flash('gold-boost')
      }
    },
  },
  {
    id: 'team-heal',
    iconComponent: ShieldPlus,
    iconClass: 'text-green-400',
    labelFr: 'Bonus DPS équipe +5',
    labelEn: 'Team DPS Bonus +5',
    descFr: `DPS actuel : ${combat.teamDps}`,
    descEn: `Current DPS: ${combat.teamDps}`,
    cost: Math.floor(200 * Math.pow(1.4, Math.floor(combat.teamDps / 5))),
    currency: 'gold' as const,
    action: () => {
      const price = Math.floor(200 * Math.pow(1.4, Math.floor(combat.teamDps / 5)))
      if (player.spendGold(price)) {
        combat.upgradeTeamDps(5)
        flash('team-heal')
      }
    },
  },
])
</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="text-2xl font-bold">{{ t('Boutique', 'Shop') }}</h2>

    <!-- Gem Exchange -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Gem class="h-4 w-4 text-purple-400" />
        {{ t('Échange Or → Gemmes', 'Gold → Gems Exchange') }}
      </h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          v-for="ex in gemExchanges"
          :key="ex.gems"
          class="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 p-4 transition-all hover:border-purple-500/50 hover:bg-gray-750 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-purple-500/50': purchaseFlash === `gems-${ex.gems}` }"
          :disabled="player.gold < ex.gold"
          @click="buyGems(ex.gems, ex.gold)"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Sparkles class="h-5 w-5 text-purple-400" />
            </div>
            <div class="text-left">
              <p class="font-bold text-purple-300">{{ ex.gems }} {{ t('gemme(s)', 'gem(s)') }}</p>
            </div>
          </div>
          <span class="flex items-center gap-1 text-sm font-bold text-yellow-400">
            🪙 {{ ex.gold.toLocaleString() }}
          </span>
        </button>
      </div>
    </section>

    <!-- Upgrades -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <Zap class="h-4 w-4 text-cyan-400" />
        {{ t('Améliorations', 'Upgrades') }}
      </h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="item in shopItems"
          :key="item.id"
          class="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition-all hover:border-cyan-500/30 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-green-500/50': purchaseFlash === item.id }"
          :disabled="item.currency === 'gold' ? player.gold < item.cost : player.gems < item.cost"
          @click="item.action()"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700">
              <component :is="item.iconComponent" class="h-5 w-5" :class="item.iconClass" />
            </div>
            <div>
              <p class="font-bold text-white">{{ t(item.labelFr, item.labelEn) }}</p>
              <p class="text-xs text-gray-500">{{ t(item.descFr, item.descEn) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 text-sm font-bold" :class="item.currency === 'gold' ? 'text-yellow-400' : 'text-purple-400'">
            <span>{{ item.currency === 'gold' ? '🪙' : '💎' }}</span>
            {{ item.cost.toLocaleString() }}
          </div>
        </button>
      </div>
    </section>

    <!-- Balance -->
    <div class="flex gap-6 rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-sm">
      <span class="flex items-center gap-1.5 text-yellow-400">
        <Coins class="h-4 w-4" /> {{ player.formattedGold }} {{ t('or', 'gold') }}
      </span>
      <span class="flex items-center gap-1.5 text-purple-400">
        <Gem class="h-4 w-4" /> {{ player.formattedGems }} {{ t('gemmes', 'gems') }}
      </span>
    </div>
  </div>
</template>
