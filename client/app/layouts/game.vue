<script setup lang="ts">
import { Swords, Backpack, User, Star, ShoppingBag, Globe, Trophy, LogOut, LogIn, BookOpen, Award, Egg, HelpCircle, Bug, Shield } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { useAfkReward } from '~/composables/useAfkReward'
import { useSpeciesCache } from '~/composables/useSpeciesCache'
import { useCombatLoop } from '~/composables/useCombatLoop'

const player = usePlayerStore()
const auth = useAuthStore()
const inventory = useInventoryStore()
const { locale, setLocale, t } = useLocale()
const { showPopup, afkResult, checkAfkRewards, dismissPopup } = useAfkReward()
const { loadSpecies } = useSpeciesCache()
const { init: initCombat } = useCombatLoop()

let autoSaveInterval: ReturnType<typeof setInterval> | null = null

function saveOnUnload() {
  auth.saveGameState(true)
}

onMounted(() => {
  // Auth + species cache handled by auth.global middleware
  initCombat()

  // Migrate rarities for existing Pokemon (starters Gen 2/3 rare → epic)
  inventory.migrateRarities()

  // Auto-save every 10s (works for both authenticated and guest mode)
  autoSaveInterval = setInterval(() => {
    auth.saveGameState()
  }, 10_000)

  window.addEventListener('beforeunload', saveOnUnload)
})

onUnmounted(() => {
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  window.removeEventListener('beforeunload', saveOnUnload)
})

function toggleLocale() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
}

const navItems = computed(() => {
  const items = [
    { label: t('Combat', 'Combat'), icon: Swords, to: '/' },
    { label: t('Inventaire', 'Inventory'), icon: Backpack, to: '/inventory' },
    { label: t('Invocation', 'Gacha'), icon: Star, to: '/gacha' },
    { label: t('Pension', 'Daycare'), icon: Egg, to: '/daycare' },
    { label: t('Badges', 'Badges'), icon: Award, to: '/badges' },
    { label: t('Boutique', 'Shop'), icon: ShoppingBag, to: '/shop' },
    { label: t('Profil', 'Profile'), icon: User, to: '/profile' },
    { label: t('Guide', 'Guide'), icon: HelpCircle, to: '/guide' },
    { label: t('Pokédex', 'Pokédex'), icon: BookOpen, to: '/pokedex' },
  ]
  
  if (auth.user?.role === 'admin') {
    items.push({ label: 'Admin', icon: Shield, to: '/admin' })
    items.push({ label: 'Debug', icon: Bug, to: '/debug' })
  }
  
  return items
})
</script>

<template>
  <div class="flex h-screen text-white" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%)">
    <!-- Sidebar -->
    <aside class="flex w-20 flex-col items-center gap-1 py-4 lg:w-56" style="background: linear-gradient(180deg, #dc2626 0%, #991b1b 4%, #1e293b 4%, #0f172a 100%)">
      <!-- Logo -->
      <div class="mb-3 flex flex-col items-center gap-1 px-2">
        <div class="relative h-8 w-8">
          <div class="absolute inset-0 rounded-full" style="background: linear-gradient(to bottom, #ee1515 0%, #ee1515 50%, #ffffff 50%, #ffffff 100%); border: 3px solid #1e293b; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(238,21,21,0.4)"></div>
          <div class="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style="background: #1e293b; border: 2px solid #ffffff; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5)"></div>
        </div>
        <span class="hidden font-pixel text-[10px] leading-tight lg:inline" style="color: #ffcc00">POKE-IDLE</span>
        <span class="hidden font-pixel text-[7px] lg:inline" style="color: #ee1515">LEGACY</span>
      </div>

      <!-- Trainer Level -->
      <div class="mb-2 flex w-full flex-col items-center gap-1 px-3">
        <div class="flex w-full items-center justify-between text-xs">
          <span class="font-bold" style="color: #60a5fa">{{ auth.isAuthenticated ? player.username : t('Invité', 'Guest') }}</span>
          <span class="font-bold" style="color: #ffcc00">Lv.{{ player.level }}</span>
        </div>
        <div class="h-2.5 w-full overflow-hidden rounded-full" style="background: #1e3a5f; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5)">
          <div class="h-full rounded-full transition-all duration-500" style="background: linear-gradient(to right, #3b82f6, #60a5fa); box-shadow: 0 0 8px rgba(96,165,250,0.6)" :style="{ width: `${player.xpPercent}%` }" />
        </div>
        <div class="mt-1 hidden w-full flex-col gap-0.5 text-[9px] text-slate-400 lg:flex">
          <div class="flex items-center justify-between"><span>{{ t('XP', 'XP') }}</span><span class="font-bold text-blue-300">{{ player.xp }}/{{ player.xpToNextLevel }}</span></div>
          <div class="flex items-center justify-between"><span>{{ t('DPS', 'DPS') }}</span><span class="font-bold text-emerald-400">×{{ player.teamDpsMult.toFixed(2) }}</span></div>
          <div class="flex items-center justify-between"><span>{{ t('PokéDollar+', 'PokéDollar+') }}</span><span class="font-bold text-yellow-400">+{{ Math.round((player.goldBonusMult - 1) * 100) }}%</span></div>
        </div>
      </div>

      <nav class="flex w-full flex-1 flex-col gap-1 px-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
          :class="$route.path === item.to 
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg font-bold' 
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span class="hidden lg:inline">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Region + Badges -->
      <div class="mt-auto flex w-full flex-col gap-2 px-2 pb-2">
        <div class="rounded-lg p-2 text-center" style="background: linear-gradient(135deg, rgba(59,76,202,0.15), rgba(147,51,234,0.15)); border: 1px solid rgba(59,76,202,0.3)">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{{ t('Région', 'Region') }}</p>
          <p class="font-pixel text-xs font-bold" style="color: #60a5fa">{{ player.regionName }}</p>
        </div>
        <div v-if="player.badges > 0" class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold" style="background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2)); border: 1px solid rgba(251,191,36,0.4); color: #fbbf24">
          <Trophy class="h-4 w-4" />
          <span>{{ player.badges }} {{ t('Badges', 'Badges') }}</span>
        </div>
        <!-- Locale Toggle -->
        <button
          class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-slate-500 transition-colors hover:bg-slate-700/40 hover:text-white"
          @click="toggleLocale"
        >
          <Globe class="h-3 w-3" />
          <span class="hidden lg:inline">{{ locale === 'fr' ? 'FR' : 'EN' }}</span>
          <span class="lg:hidden">{{ locale.toUpperCase() }}</span>
        </button>
        <!-- Auth -->
        <NuxtLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors hover:opacity-80" style="background: rgba(59,76,202,0.2); color: #3b4cca"
        >
          <LogIn class="h-3 w-3" />
          <span class="hidden lg:inline">{{ t('Connexion', 'Sign in') }}</span>
        </NuxtLink>
        <button
          v-else
          class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          @click="auth.logout()"
        >
          <LogOut class="h-3 w-3" />
          <span class="hidden lg:inline">{{ t('Déco', 'Logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto border-l border-slate-700/50">
      <!-- Top Bar -->
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 px-6 py-2.5 backdrop-blur-md" style="background: rgba(15, 23, 42, 0.9)">
        <div class="flex items-center gap-3">
          <h1 class="font-pixel text-xs" style="color: #ee1515">POKE-IDLE</h1>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style="background: rgba(255,204,0,0.08)">
            <span class="text-base">🪙</span>
            <span class="font-bold" style="color: #ffcc00">{{ player.formattedGold }}</span>
          </div>
          <div class="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style="background: rgba(168,85,247,0.08)">
            <span class="text-base">💎</span>
            <span class="font-bold text-purple-400">{{ player.formattedGems }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-6" style="background-image: radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px); background-size: 20px 20px;">
        <slot />
      </div>
    </main>

    <!-- AFK Reward Popup (disabled for now) -->
    <!-- <AfkRewardPopup
      v-if="afkResult"
      :show="showPopup"
      :hours-away="afkResult.hoursAway"
      :gold-earned="afkResult.goldEarned"
      :enemies-defeated="afkResult.enemiesDefeated"
      @dismiss="dismissPopup"
    /> -->
  </div>
</template>
