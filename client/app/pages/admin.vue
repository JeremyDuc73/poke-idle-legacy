<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  gems: number
  level: number
  badges: number
  created_at: string
  last_login_at: string | null
}

const stats = ref<DashboardStats | null>(null)
const users = ref<User[]>([])
const loading = ref(false)
const selectedUser = ref<User | null>(null)
const showUserModal = ref(false)
const showGiveItemsModal = ref(false)
const goldToGive = ref(0)
const gemsToGive = ref(0)

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
        gems: gemsToGive.value,
      }),
    })
    if (response.ok) {
      showGiveItemsModal.value = false
      goldToGive.value = 0
      gemsToGive.value = 0
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
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
    <div class="mx-auto max-w-7xl">
      <h1 class="mb-8 text-4xl font-bold text-white">🔧 Dashboard Admin</h1>

      <!-- Stats -->
      <div v-if="stats" class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div class="text-sm text-gray-400">Utilisateurs totaux</div>
          <div class="text-3xl font-bold text-white">{{ stats.totalUsers }}</div>
        </div>
        <div class="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div class="text-sm text-gray-400">Pokémon capturés</div>
          <div class="text-3xl font-bold text-white">{{ stats.totalPokemons }}</div>
        </div>
        <div class="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div class="text-sm text-gray-400">Administrateurs</div>
          <div class="text-3xl font-bold text-white">{{ stats.adminUsers }}</div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
        <h2 class="mb-4 text-2xl font-bold text-white">Utilisateurs</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="border-b border-gray-700 text-xs uppercase text-gray-400">
              <tr>
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Nom</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Rôle</th>
                <th class="px-4 py-3">Gold</th>
                <th class="px-4 py-3">Gems</th>
                <th class="px-4 py-3">Level</th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-b border-gray-700/50 hover:bg-gray-700/30"
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
                <td class="px-4 py-3">{{ user.gems }}</td>
                <td class="px-4 py-3">{{ user.level }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      class="rounded bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700"
                      @click="openUserModal(user)"
                    >
                      ✏️
                    </button>
                    <button
                      class="rounded bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
                      @click="openGiveItemsModal(user)"
                    >
                      🎁
                    </button>
                    <button
                      class="rounded bg-yellow-600 px-2 py-1 text-xs hover:bg-yellow-700"
                      @click="resetUser(user.id)"
                    >
                      🔄
                    </button>
                    <button
                      class="rounded bg-red-600 px-2 py-1 text-xs hover:bg-red-700"
                      @click="deleteUser(user.id)"
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
            <div>
              <label class="mb-1 block text-sm text-gray-400">Gems</label>
              <input
                v-model.number="gemsToGive"
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
