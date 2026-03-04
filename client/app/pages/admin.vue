<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, TrendingUp, Users, Sparkles, Award, MapPin, ChevronDown, ChevronUp, X } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'

const playerStore = usePlayerStore()
const API_BASE = useRuntimeConfig().public.apiBase

interface DashboardStats {
  totalUsers: number
  totalPokemons: number
  adminUsers: number
}

interface User {
  id: number
  username: string
  email: string
  role: string
  gold: number
  level: number
  badges: number
  created_at: string
  last_login_at: string | null
}

interface UserDetails extends User {
  currentGeneration: number
  currentZone: number
  currentStage: number
  xp: number
  clickDamage: number
  clickDamageBonus: number
  teamDpsBonus: number
  defeatedBosses: string[]
  pokemonCount: number
  shinyCount: number
  teamPokemons: any[]
}

const stats = ref<DashboardStats | null>(null)
const users = ref<User[]>([])
const loading = ref(false)
const selectedUser = ref<User | null>(null)
const userDetails = ref<UserDetails | null>(null)
const showUserModal = ref(false)
const showDetailsModal = ref(false)
const showGiveItemsModal = ref(false)
const goldToGive = ref(0)
const searchQuery = ref('')
const sortBy = ref<'username' | 'level' | 'gold' | 'badges'>('level')
const sortOrder = ref<'asc' | 'desc'>('desc')

const filteredUsers = computed(() => {
  let filtered = users.value.filter(u => 
    u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  
  return filtered.sort((a, b) => {
    const multiplier = sortOrder.value === 'asc' ? 1 : -1
    const aVal = sortBy.value === 'username' ? a[sortBy.value].toLowerCase() : a[sortBy.value]
    const bVal = sortBy.value === 'username' ? b[sortBy.value].toLowerCase() : b[sortBy.value]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier
    }
    return ((aVal as number) - (bVal as number)) * multiplier
  })
})

const statsComputed = computed(() => {
  if (!users.value.length) return null
  
  const totalGold = users.value.reduce((sum, u) => sum + u.gold, 0)
  const totalLevel = users.value.reduce((sum, u) => sum + u.level, 0)
  const avgGold = Math.floor(totalGold / users.value.length)
  const avgLevel = Math.floor(totalLevel / users.value.length)
  const maxLevel = Math.max(...users.value.map(u => u.level))
  
  return { avgGold, avgLevel, maxLevel }
})

async function loadDashboard() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      stats.value = data.stats
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      users.value = data.data
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

async function updateUser(user: User) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    if (response.ok) {
      showUserModal.value = false
      await loadUsers()
    }
  } catch (error) {
    console.error('Failed to update user:', error)
  }
}

async function deleteUser(userId: number) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (response.ok) {
      await loadUsers()
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

async function giveItems() {
  if (!selectedUser.value) return

  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${selectedUser.value.id}/give-items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gold: goldToGive.value,
      }),
    })
    if (response.ok) {
      showGiveItemsModal.value = false
      goldToGive.value = 0
      await loadUsers()
    }
  } catch (error) {
    console.error('Failed to give items:', error)
  }
}

async function resetUser(userId: number) {
  if (!confirm('Êtes-vous sûr de vouloir réinitialiser la progression de cet utilisateur ?')) return

  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/reset`, {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      await loadUsers()
    }
  } catch (error) {
    console.error('Failed to reset user:', error)
  }
}

function openUserModal(user: User) {
  selectedUser.value = { ...user }
  showUserModal.value = true
}

async function openDetailsModal(user: User) {
  selectedUser.value = user
  showDetailsModal.value = true
  userDetails.value = null
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${user.id}/details`, {
      credentials: 'include',
    })
    if (response.ok) {
      userDetails.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load user details:', error)
  }
}

function toggleSort(field: 'username' | 'level' | 'gold' | 'badges') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

function openGiveItemsModal(user: User) {
  selectedUser.value = user
  showGiveItemsModal.value = true
}

onMounted(async () => {
  await loadDashboard()
  await loadUsers()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl font-bold text-white sm:text-4xl">Dashboard Admin</h1>
        <p class="mt-1 text-xs text-slate-400 sm:text-sm">Gestion des utilisateurs et statistiques</p>
      </div>

      <!-- Stats Grid -->
      <div v-if="stats" class="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 shadow-lg sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-blue-400 sm:text-xs">Utilisateurs</div>
              <div class="mt-1 text-2xl font-bold text-white sm:mt-2 sm:text-3xl">{{ stats.totalUsers }}</div>
            </div>
            <Users class="hidden h-12 w-12 text-blue-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 shadow-lg sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-purple-400 sm:text-xs">Pokémon</div>
              <div class="mt-1 text-2xl font-bold text-white sm:mt-2 sm:text-3xl">{{ stats.totalPokemons }}</div>
            </div>
            <Sparkles class="hidden h-12 w-12 text-purple-500/30 sm:block" />
          </div>
        </div>
        <div v-if="statsComputed" class="rounded-xl border border-slate-700 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-medium uppercase tracking-wider text-green-400">Niveau Moy.</div>
              <div class="mt-2 text-3xl font-bold text-white">{{ statsComputed.avgLevel }}</div>
              <div class="mt-1 text-xs text-slate-400">Max: {{ statsComputed.maxLevel }}</div>
            </div>
            <TrendingUp class="h-12 w-12 text-green-500/30" />
          </div>
        </div>
        <div v-if="statsComputed" class="rounded-xl border border-slate-700 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-6 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-medium uppercase tracking-wider text-yellow-400">Gold Moy.</div>
              <div class="mt-2 text-3xl font-bold text-white">{{ statsComputed.avgGold.toLocaleString() }}</div>
            </div>
            <span class="text-4xl">🪙</span>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="rounded-xl border border-slate-700 bg-slate-800/50 p-3 shadow-xl sm:p-6">
        <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-bold text-white sm:text-2xl">Utilisateurs ({{ filteredUsers.length }})</h2>
          
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 sm:w-64"
            />
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="border-b-2 border-slate-700 text-xs uppercase text-slate-400">
              <tr>
                <th class="px-4 py-3">ID</th>
                <th class="cursor-pointer px-4 py-3 transition-colors hover:text-white" @click="toggleSort('username')">
                  <div class="flex items-center gap-1">
                    Nom
                    <ChevronDown v-if="sortBy === 'username' && sortOrder === 'desc'" class="h-3 w-3" />
                    <ChevronUp v-else-if="sortBy === 'username' && sortOrder === 'asc'" class="h-3 w-3" />
                  </div>
                </th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Rôle</th>
                <th class="cursor-pointer px-4 py-3 transition-colors hover:text-white" @click="toggleSort('gold')">
                  <div class="flex items-center gap-1">
                    Gold
                    <ChevronDown v-if="sortBy === 'gold' && sortOrder === 'desc'" class="h-3 w-3" />
                    <ChevronUp v-else-if="sortBy === 'gold' && sortOrder === 'asc'" class="h-3 w-3" />
                  </div>
                </th>
                <th class="cursor-pointer px-4 py-3 transition-colors hover:text-white" @click="toggleSort('level')">
                  <div class="flex items-center gap-1">
                    Level
                    <ChevronDown v-if="sortBy === 'level' && sortOrder === 'desc'" class="h-3 w-3" />
                    <ChevronUp v-else-if="sortBy === 'level' && sortOrder === 'asc'" class="h-3 w-3" />
                  </div>
                </th>
                <th class="cursor-pointer px-4 py-3 transition-colors hover:text-white" @click="toggleSort('badges')">
                  <div class="flex items-center gap-1">
                    Badges
                    <ChevronDown v-if="sortBy === 'badges' && sortOrder === 'desc'" class="h-3 w-3" />
                    <ChevronUp v-else-if="sortBy === 'badges' && sortOrder === 'asc'" class="h-3 w-3" />
                  </div>
                </th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="border-b border-slate-700/50 transition-colors hover:bg-slate-700/30"
              >
                <td class="px-4 py-3">{{ user.id }}</td>
                <td class="px-4 py-3 font-medium text-white">{{ user.username }}</td>
                <td class="px-4 py-3">{{ user.email }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="
                      user.role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    "
                    class="rounded px-2 py-1 text-xs font-bold"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3">{{ user.gold.toLocaleString() }}</td>
                <td class="px-4 py-3">{{ user.level }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-0.5">
                    <Award class="h-3 w-3 text-yellow-500" />
                    <span class="font-medium text-yellow-400">{{ user.badges }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1.5">
                    <button
                      class="rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-700 px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110"
                      @click="openDetailsModal(user)"
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button
                      class="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110"
                      @click="openUserModal(user)"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      class="rounded-lg bg-gradient-to-br from-green-600 to-green-700 px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110"
                      @click="openGiveItemsModal(user)"
                      title="Donner items"
                    >
                      🎁
                    </button>
                    <button
                      class="rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-700 px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110"
                      @click="resetUser(user.id)"
                      title="Réinitialiser"
                    >
                      🔄
                    </button>
                    <button
                      class="rounded-lg bg-gradient-to-br from-red-600 to-red-700 px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110"
                      @click="deleteUser(user.id)"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <teleport to="body">
      <div
        v-if="showDetailsModal && selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        @click="showDetailsModal = false"
      >
        <div
          class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
          @click.stop
        >
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-white">{{ selectedUser.username }}</h3>
              <p class="text-sm text-slate-400">{{ selectedUser.email }}</p>
            </div>
            <button
              class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              @click="showDetailsModal = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div v-if="!userDetails" class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>

          <div v-else class="space-y-6">
            <!-- Stats principales -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div class="text-xs font-medium text-slate-400">Gold</div>
                <div class="mt-1 text-2xl font-bold text-yellow-400">{{ userDetails.gold.toLocaleString() }}</div>
              </div>
              <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div class="text-xs font-medium text-slate-400">Level</div>
                <div class="mt-1 text-2xl font-bold text-blue-400">{{ userDetails.level }}</div>
              </div>
              <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div class="text-xs font-medium text-slate-400">Badges</div>
                <div class="mt-1 flex items-center gap-1.5">
                  <Award class="h-5 w-5 text-yellow-500" />
                  <span class="text-2xl font-bold text-yellow-400">{{ userDetails.badges }}</span>
                </div>
              </div>
            </div>

            <!-- Progression -->
            <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <MapPin class="h-4 w-4" />
                Progression
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Génération</span>
                  <span class="font-medium text-white">Gen {{ userDetails.currentGeneration }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Zone actuelle</span>
                  <span class="font-medium text-white">Zone {{ userDetails.currentZone }} - Stage {{ userDetails.currentStage }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">XP</span>
                  <span class="font-medium text-white">{{ userDetails.xp.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Combat stats -->
            <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h4 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-300">Combat</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Dégâts clics</span>
                  <span class="font-medium text-white">{{ userDetails.clickDamage }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Bonus clics (boutique)</span>
                  <span class="font-medium text-green-400">+{{ userDetails.clickDamageBonus }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Bonus DPS équipe (boutique)</span>
                  <span class="font-medium text-green-400">+{{ userDetails.teamDpsBonus }}</span>
                </div>
              </div>
            </div>

            <!-- Pokémon stats -->
            <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h4 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Sparkles class="h-4 w-4" />
                Pokémon
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="text-slate-400">Collection</div>
                  <div class="text-2xl font-bold text-purple-400">{{ userDetails.pokemonCount }}</div>
                </div>
                <div>
                  <div class="text-slate-400">Shiny</div>
                  <div class="text-2xl font-bold text-yellow-400">{{ userDetails.shinyCount }}</div>
                </div>
              </div>

              <!-- Équipe -->
              <div v-if="userDetails.teamPokemons?.length" class="mt-4">
                <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Équipe actuelle</div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="(poke, idx) in userDetails.teamPokemons"
                    :key="idx"
                    class="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs"
                  >
                    <span class="font-medium text-slate-300">{{ poke.nameFr }}</span>
                    <span class="text-[10px] text-slate-500">Lv.{{ poke.level }}</span>
                    <span v-if="poke.isShiny" class="text-yellow-400">✨</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Boss vaincus -->
            <div v-if="userDetails.defeatedBosses?.length" class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h4 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-300">
                Boss vaincus ({{ userDetails.defeatedBosses.length }})
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="boss in userDetails.defeatedBosses"
                  :key="boss"
                  class="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400"
                >
                  {{ boss }}
                </span>
              </div>
            </div>

            <!-- Dates -->
            <div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h4 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-300">Informations</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Rôle</span>
                  <span
                    :class="userDetails.role === 'admin' ? 'text-red-400' : 'text-blue-400'"
                    class="font-medium"
                  >
                    {{ userDetails.role }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Inscription</span>
                  <span class="font-medium text-white">{{ new Date(userDetails.created_at).toLocaleDateString('fr-FR') }}</span>
                </div>
                <div v-if="userDetails.last_login_at" class="flex justify-between">
                  <span class="text-slate-400">Dernière connexion</span>
                  <span class="font-medium text-white">{{ new Date(userDetails.last_login_at).toLocaleDateString('fr-FR') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Edit User Modal -->
    <teleport to="body">
      <div
        v-if="showUserModal && selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click="showUserModal = false"
      >
        <div
          class="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6"
          @click.stop
        >
          <h3 class="mb-4 text-xl font-bold text-white">Modifier l'utilisateur</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm text-gray-400">Nom d'utilisateur</label>
              <input
                v-model="selectedUser.username"
                type="text"
                class="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm text-gray-400">Email</label>
              <input
                v-model="selectedUser.email"
                type="email"
                class="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm text-gray-400">Rôle</label>
              <select
                v-model="selectedUser.role"
                class="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                @click="updateUser(selectedUser)"
              >
                Sauvegarder
              </button>
              <button
                class="flex-1 rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700"
                @click="showUserModal = false"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Give Items Modal -->
    <teleport to="body">
      <div
        v-if="showGiveItemsModal && selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click="showGiveItemsModal = false"
      >
        <div
          class="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6"
          @click.stop
        >
          <h3 class="mb-4 text-xl font-bold text-white">
            Donner des items à {{ selectedUser.username }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm text-gray-400">Gold</label>
              <input
                v-model.number="goldToGive"
                type="number"
                min="0"
                class="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                @click="giveItems"
              >
                Donner
              </button>
              <button
                class="flex-1 rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700"
                @click="showGiveItemsModal = false"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
