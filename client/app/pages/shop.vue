<script setup lang="ts">
import { Coins, Gem, Zap, Swords, ShieldPlus, Sparkles, FlaskConical } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useCombatStore } from '~/stores/useCombatStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { EVO_ITEMS, getEvolutionsFor } from '~/data/evolutions'

definePageMeta({
  layout: 'game',
})

const player = usePlayerStore()
const combat = useCombatStore()
const inventory = useInventoryStore()
const { t } = useLocale()

const purchaseFlash = ref<string | null>(null)
const evoMessage = ref<string | null>(null)

function flash(id: string) {
  purchaseFlash.value = id
  setTimeout(() => (purchaseFlash.value = null), 600)
}

// Evolution items cost
const EVO_ITEM_COST = 1500

function buyEvoItem(itemId: string) {
  if (!player.spendGold(EVO_ITEM_COST)) return

  // Find first Pokemon in collection that can use this item
  const candidates = inventory.collection.filter((p) => {
    const evos = getEvolutionsFor(p.slug)
    return evos.some((e) => (e.method === 'stone' || e.method === 'trade') && e.itemRequired === itemId)
  })

  if (candidates.length === 0) {
    player.addGold(EVO_ITEM_COST) // Refund
    evoMessage.value = t('Aucun Pokémon compatible !', 'No compatible Pokémon!')
    setTimeout(() => (evoMessage.value = null), 2000)
    return
  }

  const target = candidates[0]!
  const success = inventory.evolveWithItem(target.id, itemId)
  if (success) {
    flash(`evo-${itemId}`)
    evoMessage.value = t(
      `${target.nameFr} a évolué !`,
      `${target.nameEn} evolved!`
    )
    setTimeout(() => (evoMessage.value = null), 3000)
  } else {
    player.addGold(EVO_ITEM_COST) // Refund
  }
}

function buyGems(amount: number, goldCost: number) {
  if (player.spendGold(goldCost)) {
    player.addGems(amount)
    flash(`gems-${amount}`)
  }
}

// PokeAPI item sprite URLs
const ITEM_SPRITES: Record<string, string> = {
  'fire-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png',
  'water-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png',
  'thunder-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png',
  'leaf-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png',
  'moon-stone': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png',
  'link-cable': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/linking-cord.png',
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
  { gems: 1, gold: 100 },
  { gems: 5, gold: 450 },
  { gems: 10, gold: 800 },
]

const clickUpgradeLevel = computed(() => player.clickDamageBonus)
const dpsUpgradeLevel = computed(() => player.teamDpsBonus)
const clickUpgradeCost = computed(() => Math.floor(100 * Math.pow(1.5, clickUpgradeLevel.value)))
const dpsUpgradeCost = computed(() => Math.floor(200 * Math.pow(1.4, Math.floor(dpsUpgradeLevel.value / 5))))

const shopItems = computed<ShopItem[]>(() => [
  {
    id: 'click-boost',
    iconComponent: Swords,
    iconClass: 'text-orange-400',
    labelFr: `Force du clic +1 (bonus: +${clickUpgradeLevel.value})`,
    labelEn: `Click Power +1 (bonus: +${clickUpgradeLevel.value})`,
    descFr: `Dégâts actuels : ${player.clickDamage}`,
    descEn: `Current damage: ${player.clickDamage}`,
    cost: clickUpgradeCost.value,
    currency: 'gold' as const,
    action: () => {
      if (player.spendGold(clickUpgradeCost.value)) {
        player.clickDamageBonus++
        player.clickDamage = Math.floor(1 + player.level * 0.5 + player.badges * 2) + player.clickDamageBonus
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
    id: 'team-dps',
    iconComponent: ShieldPlus,
    iconClass: 'text-green-400',
    labelFr: `Bonus DPS équipe +5 (bonus: +${dpsUpgradeLevel.value})`,
    labelEn: `Team DPS Bonus +5 (bonus: +${dpsUpgradeLevel.value})`,
    descFr: `Bonus DPS : +${dpsUpgradeLevel.value}`,
    descEn: `DPS bonus: +${dpsUpgradeLevel.value}`,
    cost: dpsUpgradeCost.value,
    currency: 'gold' as const,
    action: () => {
      if (player.spendGold(dpsUpgradeCost.value)) {
        player.teamDpsBonus += 5
        flash('team-dps')
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

    <!-- Evolution Items -->
    <section>
      <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
        <FlaskConical class="h-4 w-4 text-green-400" />
        {{ t('Objets d\'évolution', 'Evolution Items') }}
      </h3>
      <!-- Evo message -->
      <div v-if="evoMessage" class="mb-3 rounded-lg bg-green-500/10 px-4 py-2 text-center text-sm font-bold text-green-400">
        {{ evoMessage }}
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="item in EVO_ITEMS"
          :key="item.id"
          class="flex flex-col gap-2 rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition-all hover:border-green-500/30 active:scale-[0.98] disabled:opacity-40"
          :class="{ 'ring-2 ring-green-500/50': purchaseFlash === `evo-${item.id}` }"
          :disabled="player.gold < EVO_ITEM_COST"
          @click="buyEvoItem(item.id)"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700">
              <img
                v-if="ITEM_SPRITES[item.id]"
                :src="ITEM_SPRITES[item.id]"
                :alt="t(item.nameFr, item.nameEn)"
                class="h-8 w-8 object-contain"
              />
              <span v-else class="text-xl">{{ item.icon }}</span>
            </div>
            <div>
              <p class="font-bold text-white">{{ t(item.nameFr, item.nameEn) }}</p>
              <p class="text-xs text-gray-500">{{ t(item.descFr, item.descEn) }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-gray-600">
              {{ item.applicableTo.length }} {{ t('Pokémon compatibles', 'compatible Pokémon') }}
            </span>
            <span class="flex items-center gap-1 text-sm font-bold text-yellow-400">
              🪙 {{ EVO_ITEM_COST.toLocaleString() }}
            </span>
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
