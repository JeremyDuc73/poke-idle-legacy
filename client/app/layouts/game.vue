<script setup lang="ts">
import { Swords, Backpack, User, Star, ShoppingBag } from 'lucide-vue-next'

const navItems = [
  { label: 'Combat', icon: Swords, to: '/' },
  { label: 'Inventory', icon: Backpack, to: '/inventory' },
  { label: 'Gacha', icon: Star, to: '/gacha' },
  { label: 'Shop', icon: ShoppingBag, to: '/shop' },
  { label: 'Profile', icon: User, to: '/profile' },
]
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
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Top Bar -->
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-gray-800/80 px-6 py-3 backdrop-blur">
        <h1 class="text-lg font-semibold">Poke-Idle Legacy</h1>
        <div class="flex items-center gap-4 text-sm">
          <span class="flex items-center gap-1 text-yellow-400">
            <span class="font-bold">🪙</span> 0
          </span>
          <span class="flex items-center gap-1 text-purple-400">
            <span class="font-bold">💎</span> 0
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
