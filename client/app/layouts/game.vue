<script setup lang="ts">
import { Swords, Backpack, User, Star, ShoppingBag, Globe, Trophy } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useLocale } from '~/composables/useLocale'

const player = usePlayerStore()
const { locale, setLocale, t } = useLocale()

function toggleLocale() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
}

const navItems = computed(() => [
  { label: t('Combat', 'Combat'), icon: Swords, to: '/' },
  { label: t('Inventaire', 'Inventory'), icon: Backpack, to: '/inventory' },
  { label: t('Invocation', 'Gacha'), icon: Star, to: '/gacha' },
  { label: t('Boutique', 'Shop'), icon: ShoppingBag, to: '/shop' },
  { label: t('Profil', 'Profile'), icon: User, to: '/profile' },
])
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Sidebar -->
    <aside class="flex w-20 flex-col items-center gap-2 border-r border-gray-700 bg-gray-800 py-4 lg:w-56">
      <div class="mb-6 flex items-center gap-2 px-2">
        <img src="/favicon.ico" alt="logo" class="h-8 w-8" />
        <span class="hidden text-lg font-bold text-yellow-400 lg:inline">Poke-Idle</span>
      </div>

      <nav class="flex w-full flex-1 flex-col gap-1 px-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          active-class="!bg-indigo-600 !text-white"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span class="hidden lg:inline">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Region + Badges -->
      <div class="mt-auto flex w-full flex-col gap-2 px-2 pb-2">
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-widest text-gray-500">{{ t('Région', 'Region') }}</p>
          <p class="text-xs font-bold text-indigo-400">{{ player.regionName }}</p>
        </div>
        <div v-if="player.badges > 0" class="flex items-center justify-center gap-1 text-xs text-yellow-500">
          <Trophy class="h-3 w-3" />
          <span>{{ player.badges }} {{ t('badges', 'badges') }}</span>
        </div>
        <!-- Locale Toggle -->
        <button
          class="flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          @click="toggleLocale"
        >
          <Globe class="h-3 w-3" />
          <span class="hidden lg:inline">{{ locale === 'fr' ? 'Français' : 'English' }}</span>
          <span class="lg:hidden">{{ locale.toUpperCase() }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Top Bar -->
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-gray-800/80 px-6 py-3 backdrop-blur">
        <div class="flex items-center gap-3">
          <h1 class="text-lg font-semibold">Poke-Idle Legacy</h1>
          <span class="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            Lv.{{ player.level }}
          </span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="flex items-center gap-1 text-yellow-400">
            <span class="font-bold">🪙</span> {{ player.formattedGold }}
          </span>
          <span class="flex items-center gap-1 text-purple-400">
            <span class="font-bold">💎</span> {{ player.formattedGems }}
          </span>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
