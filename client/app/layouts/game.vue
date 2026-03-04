<script setup lang="ts">
import { Swords, Backpack, User, Star, ShoppingBag, Globe, Trophy, LogOut, LogIn, BookOpen, Award, Egg, HelpCircle, Bug, Shield, X, MoreHorizontal } from 'lucide-vue-next'
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

const mobileMenuOpen = ref(false)
let autoSaveInterval: ReturnType<typeof setInterval> | null = null

function saveOnUnload() {
  auth.saveGameState(true)
}

onMounted(() => {
  // Auth + species cache handled by auth.global middleware
  initCombat()

  // Migrate rarities for existing Pokemon (starters Gen 2/3 rare → epic)
  inventory.migrateRarities()

  // Migrate starter evolutions to epic (fix for existing Pokemon)
  inventory.migrateStarterRarities()

  // Migrate Gen 4 evolutions to correct rarity
  inventory.migrateGen4Evolutions()

  // Check evolutions on mount
  inventory.checkAllEvolutions(player.currentGeneration)

  // Auto-save every 10s (works for both authenticated and guest mode)
  autoSaveInterval = setInterval(() => {
    auth.saveGameState()
  }, 10_000)

  window.addEventListener('beforeunload', saveOnUnload)
})

// Check evolutions on every page change
const route = useRoute()
watch(() => route.path, () => {
  inventory.checkAllEvolutions(player.currentGeneration)
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
  <div class="flex h-screen flex-col text-white md:flex-row" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%)">
    <!-- Sidebar (desktop only) -->
    <aside class="hidden w-20 flex-col items-center gap-1 py-4 md:flex lg:w-56" style="background: linear-gradient(180deg, #dc2626 0%, #991b1b 4%, #1e293b 4%, #0f172a 100%)">
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
        </div>
      </div>

      <nav class="flex w-full flex-1 flex-col gap-1 overflow-y-auto px-2">
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
    <main class="flex-1 overflow-y-auto border-l border-slate-700/50 pb-20 md:pb-0">
      <!-- Top Bar -->
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 px-4 py-2 backdrop-blur-md md:px-6 md:py-2.5" style="background: rgba(15, 23, 42, 0.95)">
        <div class="flex items-center gap-2">
          <div class="relative h-6 w-6 md:hidden">
            <div class="absolute inset-0 rounded-full" style="background: linear-gradient(to bottom, #ee1515 0%, #ee1515 50%, #ffffff 50%, #ffffff 100%); border: 2px solid #1e293b;"></div>
            <div class="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
          </div>
          <h1 class="font-pixel text-xs" style="color: #ee1515">POKE-IDLE</h1>
          <span class="text-[10px] font-bold text-slate-500 md:hidden">Lv.{{ player.level }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm md:gap-4">
          <div class="flex items-center gap-1 rounded-lg px-2 py-1 md:gap-1.5 md:px-3 md:py-1.5" style="background: rgba(255,204,0,0.08)">
            <span class="text-sm md:text-base">🪙</span>
            <span class="text-xs font-bold md:text-sm" style="color: #ffcc00">{{ player.formattedGold }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-3 md:p-6" style="background-image: radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px); background-size: 20px 20px;">
        <slot />
      </div>
    </main>

    <!-- Bottom Navigation (mobile only) -->
    <nav class="fixed bottom-0 left-0 right-0 z-20 flex items-stretch justify-around border-t border-slate-700/50 md:hidden" style="background: rgba(15, 23, 42, 0.97); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
      <NuxtLink
        v-for="item in navItems.slice(0, 5)"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-medium transition-colors"
        :class="$route.path === item.to
          ? 'text-red-400'
          : 'text-slate-500'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.label }}</span>
      </NuxtLink>
      <!-- More button -->
      <button
        class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-medium text-slate-500 transition-colors"
        :class="{ 'text-red-400': mobileMenuOpen }"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <component :is="mobileMenuOpen ? X : MoreHorizontal" class="h-5 w-5" />
        <span>{{ t('Plus', 'More') }}</span>
      </button>
    </nav>

    <!-- Mobile "More" slide-up panel -->
    <Transition name="slide-up">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-10 md:hidden"
        @click="mobileMenuOpen = false"
      >
        <div class="absolute bottom-16 left-0 right-0 rounded-t-2xl border-t border-slate-700 p-4 shadow-2xl" style="background: rgba(15, 23, 42, 0.98); backdrop-filter: blur(16px);" @click.stop>
          <div class="mb-3 flex items-center justify-between px-1">
            <span class="text-xs font-bold text-slate-400">{{ auth.isAuthenticated ? player.username : t('Invité', 'Guest') }} · Lv.{{ player.level }}</span>
            <span class="text-[10px] text-slate-500">{{ player.regionName }}</span>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <NuxtLink
              v-for="item in navItems.slice(5)"
              :key="item.to"
              :to="item.to"
              class="flex flex-col items-center gap-1 rounded-xl p-3 text-[10px] font-medium transition-all"
              :class="$route.path === item.to
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-white'"
              @click="mobileMenuOpen = false"
            >
              <component :is="item.icon" class="h-5 w-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
            <!-- Locale -->
            <button
              class="flex flex-col items-center gap-1 rounded-xl bg-slate-800/80 p-3 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-700/80 hover:text-white"
              @click="toggleLocale(); mobileMenuOpen = false"
            >
              <Globe class="h-5 w-5" />
              <span>{{ locale === 'fr' ? 'FR' : 'EN' }}</span>
            </button>
            <!-- Auth -->
            <NuxtLink
              v-if="!auth.isAuthenticated"
              to="/login"
              class="flex flex-col items-center gap-1 rounded-xl bg-blue-500/10 p-3 text-[10px] font-medium text-blue-400 transition-all hover:bg-blue-500/20"
              @click="mobileMenuOpen = false"
            >
              <LogIn class="h-5 w-5" />
              <span>{{ t('Connexion', 'Login') }}</span>
            </NuxtLink>
            <button
              v-else
              class="flex flex-col items-center gap-1 rounded-xl bg-slate-800/80 p-3 text-[10px] font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              @click="auth.logout(); mobileMenuOpen = false"
            >
              <LogOut class="h-5 w-5" />
              <span>{{ t('Déco', 'Logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
