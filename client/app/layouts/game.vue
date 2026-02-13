<script setup lang="ts">
import { Swords, Backpack, User, Star, ShoppingBag, Globe, Trophy, LogOut, LogIn, BookOpen } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { useAfkReward } from '~/composables/useAfkReward'
import { useSpeciesCache } from '~/composables/useSpeciesCache'
import { useCombatLoop } from '~/composables/useCombatLoop'

const player = usePlayerStore()
const auth = useAuthStore()
const { locale, setLocale, t } = useLocale()
const { showPopup, afkResult, checkAfkRewards, dismissPopup } = useAfkReward()
const { loadSpecies } = useSpeciesCache()
const { init: initCombat } = useCombatLoop()

let autoSaveInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  loadSpecies()
  await auth.checkAuth()
  // checkAfkRewards() // disabled for now
  initCombat()

  autoSaveInterval = setInterval(() => {
    if (auth.isAuthenticated) {
      auth.saveGameState()
    }
  }, 30_000)
})

onUnmounted(() => {
  if (autoSaveInterval) clearInterval(autoSaveInterval)
})

function toggleLocale() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
}

const navItems = computed(() => [
  { label: t('Combat', 'Combat'), icon: Swords, to: '/' },
  { label: t('Inventaire', 'Inventory'), icon: Backpack, to: '/inventory' },
  { label: t('Invocation', 'Gacha'), icon: Star, to: '/gacha' },
  { label: t('Pokédex', 'Pokédex'), icon: BookOpen, to: '/pokedex' },
  { label: t('Boutique', 'Shop'), icon: ShoppingBag, to: '/shop' },
  { label: t('Profil', 'Profile'), icon: User, to: '/profile' },
])
</script>

<template>
  <div class="flex h-screen text-white" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%)">
    <!-- Sidebar -->
    <aside class="flex w-20 flex-col items-center gap-1 py-4 lg:w-56" style="background: linear-gradient(180deg, #dc2626 0%, #991b1b 4%, #1e293b 4%, #0f172a 100%)">
      <!-- Logo -->
      <div class="mb-3 flex flex-col items-center gap-1 px-2">
        <span class="text-2xl">🔴</span>
        <span class="hidden font-pixel text-[10px] leading-tight lg:inline" style="color: #ffcc00">POKE-IDLE</span>
        <span class="hidden font-pixel text-[7px] lg:inline" style="color: #ee1515">LEGACY</span>
      </div>

      <!-- Trainer Level -->
      <div class="mb-2 flex w-full flex-col items-center gap-1 px-3">
        <div class="flex w-full items-center justify-between text-xs">
          <span class="font-bold" style="color: #60a5fa">Lv.{{ player.level }}</span>
          <span class="text-gray-500 text-[10px]">{{ player.xp }}/{{ player.xpToNextLevel }}</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-[#0f172a]">
          <div class="pk-xp-bar h-full rounded-full transition-all duration-500" :style="{ width: `${player.xpPercent}%` }" />
        </div>
      </div>

      <nav class="flex w-full flex-1 flex-col gap-0.5 px-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white"
          active-class="!text-white shadow-lg" style="--tw-shadow-color: rgba(238,21,21,0.2)"
          :class="{ '!bg-[#ee1515]': $route.path === item.to }"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span class="hidden lg:inline">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Region + Badges -->
      <div class="mt-auto flex w-full flex-col gap-2 px-2 pb-2">
        <div class="rounded-lg bg-[#0f172a]/60 p-2 text-center">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">{{ t('Région', 'Region') }}</p>
          <p class="font-pixel text-xs" style="color: #3b4cca">{{ player.regionName }}</p>
        </div>
        <div v-if="player.badges > 0" class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold" style="background: rgba(255,204,0,0.1); color: #ffcc00">
          <Trophy class="h-3.5 w-3.5" />
          <span>{{ player.badges }}</span>
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
      <div class="p-6">
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
