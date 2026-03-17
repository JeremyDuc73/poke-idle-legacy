<script setup lang="ts">
import { Swords, Package, User, Sparkles, Store, Globe, Trophy, LogOut, LogIn, BookOpen, Medal, Egg, HelpCircle, Bug, Shield, X, MoreHorizontal, Megaphone, Flame, UsersRound } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'
import { useSpeciesCache } from '~/composables/useSpeciesCache'
import { useCombatLoop } from '~/composables/useCombatLoop'
import { useDaycareStore } from '~/stores/useDaycareStore'
import { EVOLUTIONS, EVO_ITEMS } from '~/data/evolutions'
import { getGenForSlug, getPokedexByGen } from '~/data/pokedex'
import { useToast } from '~/composables/useToast'
import { useCombatStore } from '~/stores/useCombatStore'

const player = usePlayerStore()
const auth = useAuthStore()
const inventory = useInventoryStore()
const daycare = useDaycareStore()
const combat = useCombatStore()
const { locale, setLocale, t } = useLocale()
const config = useRuntimeConfig()

function getAvatarUrl(path: string | null): string | null {
  if (!path) return null
  return `${config.public.apiBase}/api/avatars/${path.split('/').pop()}`
}
const { loadSpecies } = useSpeciesCache()
const { init: initCombat } = useCombatLoop()
const { toasts, addToast, removeToast } = useToast()

const mobileMenuOpen = ref(false)

function toggleEvoNotifs() {
  inventory.showEvoNotifs = !inventory.showEvoNotifs
  addToast(
    inventory.showEvoNotifs
      ? t('Notifs évolution activées', 'Evolution notifs enabled')
      : t('Notifs évolution désactivées', 'Evolution notifs disabled'),
    '🔔',
    'info',
    2000,
  )
}
const adminBanner = ref<string | null>(null)
let autoSaveInterval: ReturnType<typeof setInterval> | null = null
let debouncedSaveTimer: ReturnType<typeof setTimeout> | null = null
let bannerPollInterval: ReturnType<typeof setInterval> | null = null

async function fetchBanner() {
  try {
    const res = await fetch(`${config.public.apiBase}/api/banner`)
    if (res.ok) {
      const data = await res.json()
      adminBanner.value = data.message ?? null
    }
  } catch { /* ignore */ }
}

function saveOnUnload() {
  if (!auth.isAuthenticated) return
  auth.saveGameState(true)
}

function saveOnVisibilityChange() {
  if (document.hidden) {
    auth.saveGameState()
  }
}

// Debounced save: triggers 2s after any state change
function debouncedSave() {
  if (debouncedSaveTimer) clearTimeout(debouncedSaveTimer)
  debouncedSaveTimer = setTimeout(() => {
    auth.saveGameState()
  }, 2000)
}

onMounted(() => {
  // Only init gameplay systems for authenticated users
  if (auth.isAuthenticated) {
    initCombat()

    // Migrate rarities for existing Pokemon (starters Gen 2/3 rare → epic)
    inventory.migrateRarities()

    // Migrate names from POKEDEX (fixes stale FR/EN names from older saves)
    inventory.migrateNames()

    // Migrate starter evolutions to epic (fix for existing Pokemon)
    inventory.migrateStarterRarities()

    // Migrate Gen 4 evolutions to correct rarity
    inventory.migrateGen4Evolutions()

    // Check evolutions on mount
    inventory.checkAllEvolutions(player.currentGeneration)

    // Auto-save every 10s as safety net
    autoSaveInterval = setInterval(() => {
      auth.saveGameState()
    }, 10_000)

    window.addEventListener('beforeunload', saveOnUnload)
    document.addEventListener('visibilitychange', saveOnVisibilityChange)
  }

  // Fetch banner for all users (including visitors)
  fetchBanner()
  bannerPollInterval = setInterval(fetchBanner, 30_000)
})

// Debounced reactive save: any important state change triggers save after 2s
watch(
  () => [
    player.gold,
    player.gems,
    player.candies,
    player.currentGeneration,
    player.currentZone,
    player.currentStage,
    player.badges,
    player.clickDamageBonus,
    player.teamDpsBonus,
    inventory.collectionCount,
    inventory.team.map(p => `${p.id}-${p.teamSlot}-${p.level}-${p.xp}-${p.stars}`).join(','),
  ],
  () => { debouncedSave() },
  { deep: true },
)

// Check evolutions on every page change
const route = useRoute()
watch(() => route.path, () => {
  inventory.checkAllEvolutions(player.currentGeneration)
})

onUnmounted(() => {
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  if (debouncedSaveTimer) clearTimeout(debouncedSaveTimer)
  if (bannerPollInterval) clearInterval(bannerPollInterval)
  window.removeEventListener('beforeunload', saveOnUnload)
  document.removeEventListener('visibilitychange', saveOnVisibilityChange)
})

function toggleLocale() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
}

// Notification badges
const readyEggs = computed(() => daycare.slots.filter(s => s.damageDealt >= s.damageRequired).length)

const evolvableWithItem = computed(() => {
  const ownedKeys = new Set(inventory.collection.map(p => `${p.slug}-${p.isShiny}`))
  const seen = new Set<string>()
  let count = 0
  for (const p of inventory.collection) {
    const key = `${p.slug}-${p.isShiny}`
    if (seen.has(key)) continue
    const evos = EVOLUTIONS.filter(e => e.fromSlug === p.slug)
    const hasItemEvo = evos.some(e => {
      if (!(e.method === 'stone' || e.method === 'trade' || e.method === 'happiness') || !e.itemRequired) return false
      if (ownedKeys.has(`${e.toSlug}-${p.isShiny}`)) return false
      if (getGenForSlug(e.toSlug) > player.currentGeneration) return false
      return true
    })
    if (hasItemEvo) { count++; seen.add(key) }
  }
  return count
})

const navItems = computed(() => {
  if (!auth.isAuthenticated) {
    return [
      { label: t('Guide', 'Guide'), icon: HelpCircle, to: '/guide', badge: 0 },
      { label: t('Pokédex', 'Pokédex'), icon: BookOpen, to: '/pokedex', badge: 0 },
      { label: t('Classement', 'Leaderboard'), icon: Trophy, to: '/leaderboard', badge: 0 },
    ]
  }

  const items = [
    { label: t('Combat', 'Combat'), icon: Swords, to: '/', badge: 0 },
    { label: t('Inventaire', 'Inventory'), icon: Package, to: '/inventory', badge: inventory.showEvoNotifs ? evolvableWithItem.value : 0 },
    { label: t('Invocation', 'Gacha'), icon: Sparkles, to: '/gacha', badge: 0 },
    { label: t('Pension', 'Daycare'), icon: Egg, to: '/daycare', badge: readyEggs.value },
    { label: t('Badges', 'Badges'), icon: Medal, to: '/badges', badge: 0 },
    ...(auth.user?.role === 'admin' || auth.user?.betaAccess
      ? [{ label: t('Raid', 'Raid'), icon: Flame, to: '/raid', badge: 0 }]
      : []),
    { label: t('Boutique', 'Shop'), icon: Store, to: '/shop', badge: 0 },
    { label: t('Profil', 'Profile'), icon: User, to: '/profile', badge: 0 },
    { label: t('Guide', 'Guide'), icon: HelpCircle, to: '/guide', badge: 0 },
    { label: t('Pokédex', 'Pokédex'), icon: BookOpen, to: '/pokedex', badge: 0 },
    { label: t('Joueurs', 'Players'), icon: UsersRound, to: '/players', badge: 0 },
    { label: t('Classement', 'Leaderboard'), icon: Trophy, to: '/leaderboard', badge: 0 },
  ]
  
  if (auth.user?.role === 'admin') {
    items.push({ label: 'Admin', icon: Shield, to: '/admin', badge: 0 })
    items.push({ label: 'Debug', icon: Bug, to: '/debug', badge: 0 })
  }
  
  return items
})

// Toast: daycare eggs ready
watch(readyEggs, (newVal, oldVal) => {
  if (newVal > oldVal) {
    const diff = newVal - oldVal
    addToast(
      t(
        `${diff} œuf${diff > 1 ? 's' : ''} prêt${diff > 1 ? 's' : ''} à éclore !`,
        `${diff} egg${diff > 1 ? 's' : ''} ready to hatch!`
      ),
      '🥚',
      'success',
      5000,
    )
  }
})

// Toast: evolutions
watch(() => inventory.evolutionLog.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    const newEvents = inventory.evolutionLog.slice(oldLen)
    for (const ev of newEvents) {
      const name = t(ev.toNameFr, ev.toNameEn)
      const from = t(ev.fromNameFr, ev.fromNameEn)
      if (ev.wasInTeam) {
        addToast(
          t(
            `${from} a évolué en ${name} ! (remplacé slot ${ev.slot})`,
            `${from} evolved into ${name}! (replaced slot ${ev.slot})`
          ),
          '✨',
          'success',
          6000,
        )
      } else {
        addToast(
          t(
            `${from} a évolué en ${name} !`,
            `${from} evolved into ${name}!`
          ),
          '🔄',
          'success',
          5000,
        )
      }
    }
  }
})

// Toast: wild shiny encounter
watch(() => combat.enemy, (enemy) => {
  if (enemy?.isShiny) {
    addToast(
      t(
        `Un ${enemy.nameFr.replace('✨ ', '').replace(' ✨', '')} shiny apparaît ! (×5 or, ×3 XP)`,
        `A shiny ${enemy.nameEn.replace('✨ ', '').replace(' ✨', '')} appeared! (×5 gold, ×3 XP)`
      ),
      '✨',
      'warning',
      5000,
    )
  }
})

// Gen completion rewards: shiny charm + gold bonus
const GEN_COMPLETION_REWARDS: Record<number, { gold: number; label: string }> = {
  1: { gold: 50000, label: 'Kanto' },
  2: { gold: 100000, label: 'Johto' },
  3: { gold: 200000, label: 'Hoenn' },
  4: { gold: 400000, label: 'Sinnoh' },
  5: { gold: 800000, label: 'Unova' },
  6: { gold: 1600000, label: 'Kalos' },
  7: { gold: 3200000, label: 'Alola' },
  8: { gold: 6400000, label: 'Galar' },
  9: { gold: 12800000, label: 'Paldea' },
}

const ownedSlugs = computed(() => new Set(inventory.collection.map(p => p.slug)))

function checkGenCompletions() {
  for (let gen = 1; gen <= player.currentGeneration; gen++) {
    if (player.completedPokedexGens.includes(gen)) continue
    const genPokemon = getPokedexByGen(gen)
    const allOwned = genPokemon.every(p => ownedSlugs.value.has(p.slug))
    if (allOwned && genPokemon.length > 0) {
      // Mark as completed
      player.completedPokedexGens.push(gen)
      player.shinyCharms++
      const reward = GEN_COMPLETION_REWARDS[gen]
      const goldReward = reward?.gold ?? 100000
      const regionName = reward?.label ?? `Gen ${gen}`
      player.addGold(goldReward)
      addToast(
        t(
          `Pokédex ${regionName} complété ! Charme Chroma obtenu + ${goldReward.toLocaleString()} or !`,
          `${regionName} Pokédex completed! Shiny Charm obtained + ${goldReward.toLocaleString()} gold!`
        ),
        '🏆',
        'warning',
        8000,
      )
      auth.saveGameState()
    }
  }

  // Check for Pokédex Master (all 9 gens completed)
  checkPokedexMaster()
}

const MAX_GEN = 9

function checkPokedexMaster() {
  if (player.pokedexMaster) return
  const allGensCompleted = Array.from({ length: MAX_GEN }, (_, i) => i + 1)
    .every(gen => player.completedPokedexGens.includes(gen))
  if (!allGensCompleted) return

  player.pokedexMaster = true
  const masterGold = 50000000
  player.addGold(masterGold)
  addToast(
    t(
      `🏆 MAÎTRE POKÉDEX ! Tous les Pokémon collectés ! Shiny ×3 permanent + ${masterGold.toLocaleString()} or !`,
      `🏆 POKÉDEX MASTER! All Pokémon collected! Permanent ×3 Shiny rate + ${masterGold.toLocaleString()} gold!`
    ),
    '👑',
    'warning',
    15000,
  )
  auth.saveGameState()
}

// On initial load, silently backfill completedPokedexGens for old saves that don't have it
let _initialLoadDone = false
watch(() => inventory.collectionCount, () => {
  if (!_initialLoadDone) {
    _initialLoadDone = true
    // Silently mark already-complete gens (fixes old saves missing completedPokedexGens)
    const owned = new Set(inventory.collection.map(p => p.slug))
    for (let gen = 1; gen <= player.currentGeneration; gen++) {
      if (player.completedPokedexGens.includes(gen)) continue
      const genPokemon = getPokedexByGen(gen)
      if (genPokemon.length > 0 && genPokemon.every(p => owned.has(p.slug))) {
        player.completedPokedexGens.push(gen)
        player.shinyCharms++
      }
    }
    // Also check master for old saves
    checkPokedexMaster()
    return
  }
  checkGenCompletions()
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

      <!-- Trainer Level (authenticated only) -->
      <div v-if="auth.isAuthenticated" class="mb-2 flex w-full flex-col items-center gap-1 px-3">
        <div class="flex w-full items-center justify-between text-xs">
          <span class="font-bold" style="color: #60a5fa">{{ player.username }}</span>
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
          @contextmenu.prevent="item.to === '/inventory' ? toggleEvoNotifs() : undefined"
        >
          <div class="relative">
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span
              v-if="item.badge > 0"
              class="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg"
            >{{ item.badge }}</span>
          </div>
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
          <span v-if="auth.isAuthenticated" class="text-[10px] font-bold text-slate-500 md:hidden">Lv.{{ player.level }}</span>
        </div>
        <div v-if="auth.isAuthenticated" class="flex items-center gap-2 text-sm md:gap-4">
          <div class="flex items-center gap-1 rounded-lg px-2 py-1 md:gap-1.5 md:px-3 md:py-1.5" style="background: rgba(255,204,0,0.08)">
            <span class="text-sm md:text-base">🪙</span>
            <span class="text-xs font-bold md:text-sm" style="color: #ffcc00">{{ player.formattedGold }}</span>
          </div>
          <NuxtLink to="/profile" class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20 transition-opacity hover:opacity-80">
            <img v-if="player.avatarUrl" :src="getAvatarUrl(player.avatarUrl)!" alt="" class="h-full w-full object-cover" />
            <User v-else class="h-4 w-4 text-indigo-400" />
          </NuxtLink>
        </div>
      </header>

      <!-- Admin Banner -->
      <div v-if="adminBanner" class="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center">
        <Megaphone class="h-4 w-4 shrink-0 text-amber-400" />
        <p class="flex-1 text-sm font-medium text-amber-200">{{ adminBanner }}</p>
      </div>

      <!-- Login Banner (visitors) -->
      <div v-if="!auth.isAuthenticated" class="mx-3 mt-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 md:mx-6 md:mt-4">
        <p class="text-sm text-indigo-200">
          {{ t('Connectez-vous ou créez un compte pour jouer !', 'Sign in or create an account to play!') }}
        </p>
        <NuxtLink
          to="/login"
          class="shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
        >
          {{ t('Connexion', 'Sign in') }}
        </NuxtLink>
      </div>

      <!-- Page Content -->
      <div class="p-3 md:p-6" style="background-image: radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px); background-size: 20px 20px;">
        <slot />
      </div>
    </main>

    <!-- Bottom Navigation (mobile only) -->
    <nav class="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-700/50 md:hidden" style="background: rgba(15, 23, 42, 0.97); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
      <div class="mx-auto flex max-w-lg items-stretch justify-around">
        <NuxtLink
          v-for="item in navItems.slice(0, 5)"
          :key="item.to"
          :to="item.to"
          class="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-medium transition-all"
          :class="$route.path === item.to
            ? 'text-red-400'
            : 'text-slate-500 active:text-slate-300'"
          @contextmenu.prevent="item.to === '/inventory' ? toggleEvoNotifs() : undefined"
        >
          <div
            v-if="$route.path === item.to"
            class="absolute top-0 h-0.5 w-8 rounded-full bg-red-400"
          />
          <div class="relative">
            <component :is="item.icon" class="h-[18px] w-[18px]" :stroke-width="$route.path === item.to ? 2.5 : 1.5" />
            <span
              v-if="item.badge > 0"
              class="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
            >{{ item.badge }}</span>
          </div>
          <span>{{ item.label }}</span>
        </NuxtLink>
        <!-- More button -->
        <button
          class="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-medium transition-all"
          :class="mobileMenuOpen ? 'text-red-400' : 'text-slate-500 active:text-slate-300'"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <div
            v-if="mobileMenuOpen"
            class="absolute top-0 h-0.5 w-8 rounded-full bg-red-400"
          />
          <component :is="mobileMenuOpen ? X : MoreHorizontal" class="h-[18px] w-[18px]" :stroke-width="mobileMenuOpen ? 2.5 : 1.5" />
          <span>{{ t('Plus', 'More') }}</span>
        </button>
      </div>
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
            <span class="text-xs font-bold text-slate-400">{{ auth.isAuthenticated ? `${player.username} · Lv.${player.level}` : t('Visiteur', 'Visitor') }}</span>
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
              <div class="relative">
                <component :is="item.icon" class="h-5 w-5" />
                <span
                  v-if="item.badge > 0"
                  class="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                >{{ item.badge }}</span>
              </div>
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
    <!-- Toast container -->
    <Teleport to="body">
      <div class="fixed right-4 top-16 z-50 flex flex-col gap-2 md:top-4">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="flex items-center gap-2 rounded-xl border border-slate-600/50 px-4 py-3 shadow-2xl backdrop-blur-md"
            :class="{
              'bg-slate-800/95 text-white': toast.type === 'info',
              'bg-green-900/95 text-green-200 border-green-500/50': toast.type === 'success',
              'bg-amber-900/95 text-amber-200 border-amber-500/50': toast.type === 'warning',
            }"
            style="min-width: 250px; max-width: 380px;"
          >
            <span class="text-lg">{{ toast.icon }}</span>
            <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
            <button class="ml-2 text-slate-400 hover:text-white" @click="removeToast(toast.id)">
              <X class="h-4 w-4" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
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

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
.toast-move {
  transition: transform 0.25s ease;
}
</style>
