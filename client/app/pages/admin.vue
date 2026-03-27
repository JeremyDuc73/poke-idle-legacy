<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, TrendingUp, Users, Sparkles, Award, MapPin, ChevronDown, ChevronUp, X, RefreshCw, Crown, Zap, Shield as ShieldIcon, Eye, Pencil, Gift, RotateCcw, Trash2, Ban, ImageOff, Megaphone, Swords, FlaskConical } from 'lucide-vue-next'
import { GENERATIONS } from '~/data/zones'

definePageMeta({ layout: 'game' })

const API_BASE = useRuntimeConfig().public.apiBase

const GENERATION_NAMES: Record<number, string> = {
  1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh', 5: 'Unys',
  6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea',
}

interface DashboardStats {
  totalUsers: number
  totalPokemons: number
  adminUsers: number
  totalShinys: number
  totalLegendaries: number
  activePlayers24h: number
  avgLevel: number
  avgBadges: number
  totalGold: number
  maxLevel: number
  maxBadges: number
}

interface UserRaw {
  id: number
  username: string
  email: string
  role: string
  gold: number
  level: number
  badges: number
  current_generation?: number
  currentGeneration?: number
  beta_access?: boolean
  betaAccess?: boolean
  created_at?: string
  createdAt?: string
  last_login_at?: string | null
  lastLoginAt?: string | null
}

interface User {
  id: number
  username: string
  email: string
  role: string
  gold: number
  level: number
  badges: number
  current_generation: number
  beta_access: boolean
  last_login_at: string | null
}

function normalizeUser(raw: UserRaw): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    role: raw.role,
    gold: raw.gold,
    level: raw.level,
    badges: raw.badges,
    current_generation: raw.current_generation ?? raw.currentGeneration ?? 1,
    beta_access: raw.beta_access ?? raw.betaAccess ?? false,
    last_login_at: raw.last_login_at ?? raw.lastLoginAt ?? null,
  }
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
  avatarUrl: string | null
  created_at: string
}

function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return `${API_BASE}/api/avatars/${path.split('/').pop()}`
}

const stats = ref<DashboardStats | null>(null)
const users = ref<User[]>([])
const loading = ref(false)
const selectedUser = ref<User | null>(null)
const userDetails = ref<UserDetails | null>(null)
const showUserModal = ref(false)
const showDetailsModal = ref(false)
const showGiveItemsModal = ref(false)
const showPenaltyModal = ref(false)
const penaltyType = ref<'dps' | 'gold'>('dps')
const penaltyPercent = ref<5 | 10 | 25 | 50>(10)
const goldToGive = ref(0)
const xpToGive = ref(0)
const levelToSet = ref(0)
const searchQuery = ref('')
const roleFilter = ref<'all' | 'user' | 'admin'>('all')
const sortBy = ref<'username' | 'level' | 'gold' | 'badges'>('level')
const sortOrder = ref<'asc' | 'desc'>('desc')
const refreshing = ref(false)
const bannerMessage = ref('')
const currentBanner = ref<string | null>(null)
const bannerLoading = ref(false)
const progressionGen = ref(1)
const progressionLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalUserCount = ref(0)
const perPage = ref(50)

const filteredUsers = computed(() => {
  let filtered = users.value.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
    return matchesSearch && matchesRole
  })
  
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

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Jamais'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}j`
  return `${Math.floor(days / 30)}mois`
}

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

async function loadUsers(page = currentPage.value) {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/api/admin/users?page=${page}&limit=${perPage.value}`, {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      users.value = (data.data as UserRaw[]).map(normalizeUser)
      currentPage.value = data.meta?.currentPage ?? page
      totalPages.value = data.meta?.lastPage ?? 1
      totalUserCount.value = data.meta?.total ?? users.value.length
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadUsers(page)
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
  if (goldToGive.value <= 0 && xpToGive.value <= 0) return

  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${selectedUser.value.id}/give-items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gold: Number(goldToGive.value),
        xp: Number(xpToGive.value),
      }),
    })
    if (response.ok) {
      const data = await response.json()
      alert(data.message || 'Items donnés !')
      showGiveItemsModal.value = false
      goldToGive.value = 0
      xpToGive.value = 0
      await loadUsers()
    } else {
      const err = await response.json().catch(() => null)
      alert(`Erreur: ${err?.message || response.statusText}`)
    }
  } catch (error) {
    alert(`Erreur réseau: ${error}`)
  }
}

async function toggleBetaAccess(userId: number) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/beta-access`, {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      // Update local user state
      const user = users.value.find(u => u.id === userId)
      if (user) user.beta_access = data.betaAccess
      alert(data.message)
    }
  } catch (error) {
    console.error('Failed to toggle beta access:', error)
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

async function resetLevel(userId: number) {
  if (!confirm('Réinitialiser le niveau de cet utilisateur ? (remet niveau 1, 0 XP)')) return
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/reset-level`, {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      alert(data.message || 'Niveau réinitialisé')
      await loadUsers()
    }
  } catch (error) {
    console.error('Failed to reset level:', error)
  }
}

async function resetAvatar(userId: number) {
  if (!confirm('Réinitialiser la photo de profil de cet utilisateur ?')) return
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/avatar`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (response.ok) {
      if (userDetails.value && userDetails.value.id === userId) {
        userDetails.value.avatarUrl = null
      }
      alert('Avatar réinitialisé')
    }
  } catch (error) {
    console.error('Failed to reset avatar:', error)
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
  goldToGive.value = 0
  xpToGive.value = 0
  showGiveItemsModal.value = true
}

function openPenaltyModal(user: User) {
  selectedUser.value = user
  penaltyType.value = 'dps'
  penaltyPercent.value = 10
  showPenaltyModal.value = true
}

async function setPenalty() {
  if (!selectedUser.value) return
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${selectedUser.value.id}/penalty`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ penaltyType: penaltyType.value, penaltyPercent: penaltyPercent.value }),
    })
    if (response.ok) {
      const data = await response.json()
      alert(data.message)
      showPenaltyModal.value = false
    } else {
      const err = await response.json().catch(() => null)
      alert(`Erreur: ${err?.message || response.statusText}`)
    }
  } catch (error) {
    alert(`Erreur réseau: ${error}`)
  }
}

async function removePenalty(userId: number) {
  if (!confirm('Retirer le malus de ce joueur ?')) return
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/penalty`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      alert(data.message)
    }
  } catch (error) {
    alert(`Erreur réseau: ${error}`)
  }
}

async function loadBanner() {
  try {
    const res = await fetch(`${API_BASE}/api/banner`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      currentBanner.value = data.message ?? null
      if (data.message) bannerMessage.value = data.message
    }
  } catch { /* ignore */ }
}

async function setBanner() {
  if (!bannerMessage.value.trim()) return
  bannerLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/admin/banner`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: bannerMessage.value.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      currentBanner.value = data.message
      alert('Bandeau publié !')
    }
  } catch (e) {
    alert(`Erreur: ${e}`)
  } finally {
    bannerLoading.value = false
  }
}

async function clearBanner() {
  if (!confirm('Retirer le bandeau ?')) return
  bannerLoading.value = true
  try {
    await fetch(`${API_BASE}/api/admin/banner`, { method: 'DELETE', credentials: 'include' })
    currentBanner.value = null
    bannerMessage.value = ''
    alert('Bandeau retiré')
  } catch (e) {
    alert(`Erreur: ${e}`)
  } finally {
    bannerLoading.value = false
  }
}

const progressionOptions = computed(() => {
  return GENERATIONS.map((gen) => {
    const totalBosses = GENERATIONS
      .filter((g) => g.id < gen.id)
      .reduce((sum, g) => sum + g.zones.length, 0)
    return {
      genId: gen.id,
      label: `Gen ${gen.id} — ${gen.regionFr} (${totalBosses} badges)`,
      badges: totalBosses,
      defeatedBosses: GENERATIONS
        .filter((g) => g.id < gen.id)
        .flatMap((g) => g.zones.map((z) => z.boss.slug)),
    }
  })
})

async function setProgression() {
  const opt = progressionOptions.value.find((o) => o.genId === progressionGen.value)
  if (!opt) return
  if (!confirm(`Passer à Gen ${opt.genId} (${opt.badges} badges) ?`)) return
  progressionLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/admin/self/set-progression`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        badges: opt.badges,
        currentGeneration: opt.genId,
        currentZone: 1,
        currentStage: 1,
        defeatedBosses: opt.defeatedBosses,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      alert(data.message)
    } else {
      const err = await res.json().catch(() => null)
      alert(`Erreur: ${err?.message || res.statusText}`)
    }
  } catch (e) {
    alert(`Erreur réseau: ${e}`)
  } finally {
    progressionLoading.value = false
  }
}

async function resetAllPlayers() {
  if (!confirm('⚠️ RESET GLOBAL — Tous les joueurs seront réinitialisés (progression, pokémon, classements). Cette action est IRRÉVERSIBLE. Continuer ?')) return
  if (!confirm('Dernière confirmation : TOUT sera supprimé. Êtes-vous absolument sûr ?')) return
  try {
    const res = await fetch(`${API_BASE}/api/admin/reset-all`, {
      method: 'POST',
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      alert(data.message)
      await refreshAll()
    } else {
      const err = await res.json().catch(() => null)
      alert(`Erreur: ${err?.message || res.statusText}`)
    }
  } catch (e) {
    alert(`Erreur réseau: ${e}`)
  }
}

async function dedupPokemons() {
  if (!confirm('Dédupliquer les pokémon de tous les joueurs et corriger les équipes > 6 ?')) return
  try {
    const res = await fetch(`${API_BASE}/api/admin/dedup-pokemons`, {
      method: 'POST',
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      alert(data.message)
    } else {
      const err = await res.json().catch(() => null)
      alert(`Erreur: ${err?.message || res.statusText}`)
    }
  } catch (e) {
    alert(`Erreur réseau: ${e}`)
  }
}

async function purgeInactive() {
  if (!confirm('Supprimer les comptes inactifs depuis 30+ jours ? (les admins ne sont jamais supprimés)')) return
  try {
    const res = await fetch(`${API_BASE}/api/admin/purge-inactive`, {
      method: 'POST',
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      alert(data.message)
      await refreshAll()
    } else {
      const err = await res.json().catch(() => null)
      alert(`Erreur: ${err?.message || res.statusText}`)
    }
  } catch (e) {
    alert(`Erreur réseau: ${e}`)
  }
}

async function refreshAll() {
  refreshing.value = true
  await Promise.all([loadDashboard(), loadUsers(), loadBanner()])
  refreshing.value = false
}

onMounted(async () => {
  await loadDashboard()
  await loadUsers()
  await loadBanner()
})
</script>

<template>
  <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white sm:text-4xl">Dashboard Admin</h1>
          <p class="mt-1 text-xs text-slate-400 sm:text-sm">Gestion des utilisateurs et statistiques</p>
        </div>
        <button
          class="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 hover:text-white"
          :class="{ 'animate-spin': refreshing }"
          @click="refreshAll"
        >
          <RefreshCw class="h-4 w-4" />
          <span class="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      <!-- Banner Management -->
      <section class="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:mb-8">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-amber-400">
          <Megaphone class="h-4 w-4" /> Bandeau d'annonce
        </h2>
        <div v-if="currentBanner" class="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          <span class="font-bold">Actif :</span> {{ currentBanner }}
        </div>
        <div v-else class="mb-3 text-xs text-slate-500">Aucun bandeau actif</div>
        <div class="flex flex-wrap items-end gap-2">
          <div class="flex-1">
            <label class="mb-1 block text-[10px] font-medium text-slate-400">Message</label>
            <input
              v-model="bannerMessage"
              type="text"
              maxlength="200"
              placeholder="Ex: Maintenance prévue à 22h..."
              class="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            class="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
            :disabled="bannerLoading || !bannerMessage.trim()"
            @click="setBanner"
          >
            Publier
          </button>
          <button
            v-if="currentBanner"
            class="rounded-lg bg-red-600/20 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-600/30 disabled:opacity-50"
            :disabled="bannerLoading"
            @click="clearBanner"
          >
            Retirer
          </button>
        </div>
      </section>

      <!-- Stats Grid -->
      <div v-if="stats" class="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-blue-400 sm:text-xs">Utilisateurs</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ stats.totalUsers }}</div>
              <div class="mt-0.5 text-[10px] text-slate-500">{{ stats.adminUsers }} admin{{ Number(stats.adminUsers) > 1 ? 's' : '' }}</div>
            </div>
            <Users class="hidden h-10 w-10 text-blue-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-green-400 sm:text-xs">Actifs (24h)</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ stats.activePlayers24h }}</div>
            </div>
            <Zap class="hidden h-10 w-10 text-green-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-purple-400 sm:text-xs">Pokémon</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ Number(stats.totalPokemons).toLocaleString() }}</div>
            </div>
            <Sparkles class="hidden h-10 w-10 text-purple-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-cyan-400 sm:text-xs">Shiny</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ Number(stats.totalShinys).toLocaleString() }}</div>
            </div>
            <span class="hidden text-3xl sm:block">✨</span>
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-orange-400 sm:text-xs">Légendaires</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ Number(stats.totalLegendaries).toLocaleString() }}</div>
            </div>
            <Crown class="hidden h-10 w-10 text-orange-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-emerald-400 sm:text-xs">Niveau Moy.</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ stats.avgLevel }}</div>
              <div class="mt-0.5 text-[10px] text-slate-500">Max: {{ stats.maxLevel }}</div>
            </div>
            <TrendingUp class="hidden h-10 w-10 text-emerald-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-amber-400 sm:text-xs">Badges Moy.</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ stats.avgBadges }}</div>
              <div class="mt-0.5 text-[10px] text-slate-500">Max: {{ stats.maxBadges }}</div>
            </div>
            <Award class="hidden h-10 w-10 text-amber-500/30 sm:block" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-700 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-4 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-yellow-400 sm:text-xs">Gold Total</div>
              <div class="mt-1 text-2xl font-bold text-white">{{ Number(stats.totalGold).toLocaleString() }}</div>
            </div>
            <span class="hidden text-3xl sm:block">🪙</span>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="rounded-xl border border-slate-700 bg-slate-800/50 p-3 shadow-xl sm:p-6">
        <div class="mb-4 flex flex-col gap-3 sm:mb-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <!-- Role filter -->
          <div class="flex gap-2">
            <button
              v-for="rf in (['all', 'user', 'admin'] as const)"
              :key="rf"
              class="rounded-lg border px-3 py-1.5 text-xs font-bold transition-all"
              :class="roleFilter === rf
                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'"
              @click="roleFilter = rf"
            >
              {{ rf === 'all' ? 'Tous' : rf === 'admin' ? 'Admins' : 'Users' }}
            </button>
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
                <th class="hidden px-4 py-3 lg:table-cell">Région</th>
                <th class="hidden px-4 py-3 lg:table-cell">Dernière co.</th>
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
                  <div class="flex flex-wrap items-center gap-1">
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
                    <span
                      v-if="user.beta_access"
                      class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400"
                    >
                      BETA
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">{{ user.gold.toLocaleString() }}</td>
                <td class="px-4 py-3">{{ user.level }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-0.5">
                    <Award class="h-3 w-3 text-yellow-500" />
                    <span class="font-medium text-yellow-400">{{ user.badges }}</span>
                  </div>
                </td>
                <td class="hidden px-4 py-3 lg:table-cell">
                  <span class="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {{ GENERATION_NAMES[user.current_generation ?? 1] ?? `Gen ${user.current_generation ?? 1}` }}
                  </span>
                </td>
                <td class="hidden px-4 py-3 text-xs text-slate-400 lg:table-cell">
                  {{ relativeTime(user.last_login_at) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1.5">
                    <button
                      class="rounded-lg bg-cyan-600/20 p-2 text-cyan-400 transition-all hover:bg-cyan-600/30"
                      @click="openDetailsModal(user)"
                      title="Voir détails"
                    >
                      <Eye class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg bg-blue-600/20 p-2 text-blue-400 transition-all hover:bg-blue-600/30"
                      @click="openUserModal(user)"
                      title="Modifier"
                    >
                      <Pencil class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg bg-green-600/20 p-2 text-green-400 transition-all hover:bg-green-600/30"
                      @click="openGiveItemsModal(user)"
                      title="Donner items"
                    >
                      <Gift class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg p-2 transition-all"
                      :class="user.beta_access
                        ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                        : 'bg-slate-600/20 text-slate-500 hover:bg-slate-600/30'"
                      @click="toggleBetaAccess(user.id)"
                      :title="user.beta_access ? 'Retirer accès bêta' : 'Donner accès bêta'"
                    >
                      <FlaskConical class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg bg-orange-600/20 p-2 text-orange-400 transition-all hover:bg-orange-600/30"
                      @click="openPenaltyModal(user)"
                      title="Malus"
                    >
                      <Ban class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg bg-cyan-600/20 p-2 text-cyan-400 transition-all hover:bg-cyan-600/30"
                      @click="resetLevel(user.id)"
                      title="Reset Niveau"
                    >
                      <TrendingUp class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg bg-amber-600/20 p-2 text-amber-400 transition-all hover:bg-amber-600/30"
                      @click="resetUser(user.id)"
                      title="Réinitialiser tout"
                    >
                      <RotateCcw class="h-3.5 w-3.5" />
                    </button>
                    <button
                      class="rounded-lg bg-red-600/20 p-2 text-red-400 transition-all hover:bg-red-600/30"
                      @click="deleteUser(user.id)"
                      title="Supprimer"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-slate-400">
            Page {{ currentPage }} / {{ totalPages }} — {{ totalUserCount }} utilisateurs
          </div>
          <div class="flex items-center gap-1">
            <button
              class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="currentPage <= 1"
              @click="goToPage(1)"
            >
              &laquo;
            </button>
            <button
              class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)"
            >
              &lsaquo;
            </button>
            <template v-for="p in totalPages" :key="p">
              <button
                v-if="p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)"
                class="rounded-lg border px-3 py-1.5 text-xs font-bold transition-all"
                :class="p === currentPage
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>
              <span
                v-else-if="p === currentPage - 3 || p === currentPage + 3"
                class="px-1 text-slate-500"
              >…</span>
            </template>
            <button
              class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
            >
              &rsaquo;
            </button>
            <button
              class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="currentPage >= totalPages"
              @click="goToPage(totalPages)"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Progression -->
      <section class="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 sm:mt-8">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-purple-400">
          <Swords class="h-4 w-4" /> Ma progression (admin)
        </h2>
        <p class="mb-3 text-xs text-slate-400">
          Débloquer une génération et obtenir tous les badges des générations précédentes.
        </p>
        <div class="flex flex-wrap items-end gap-2">
          <div class="flex-1">
            <label class="mb-1 block text-[10px] font-medium text-slate-400">Débloquer jusqu'à</label>
            <select
              v-model.number="progressionGen"
              class="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              <option
                v-for="opt in progressionOptions"
                :key="opt.genId"
                :value="opt.genId"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <button
            class="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
            :disabled="progressionLoading"
            @click="setProgression"
          >
            Appliquer
          </button>
        </div>
      </section>

      <!-- Dedup Pokémon -->
      <section class="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:mt-8">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-400">
          <Sparkles class="h-4 w-4" /> Dédupliquer les Pokémon
        </h2>
        <p class="mb-3 text-xs text-slate-400">
          Supprime les doublons (même espèce + même shiny) pour tous les joueurs. Garde le pokémon de plus haut niveau/étoiles. Corrige aussi les équipes qui dépassent 6 membres.
        </p>
        <button
          class="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-500"
          @click="dedupPokemons"
        >
          Dédupliquer maintenant
        </button>
      </section>

      <!-- Purge Inactive -->
      <section class="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 sm:mt-8">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-orange-400">
          <Trash2 class="h-4 w-4" /> Purger les comptes inactifs
        </h2>
        <p class="mb-3 text-xs text-slate-400">
          Supprimer les comptes qui ne se sont pas connectés depuis 30+ jours. Les admins ne sont jamais supprimés. La purge s'exécute aussi automatiquement toutes les 24h.
        </p>
        <button
          class="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-500"
          @click="purgeInactive"
        >
          Purger maintenant
        </button>
      </section>

      <!-- Global Reset -->
      <section class="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:mt-8">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-red-400">
          <RotateCcw class="h-4 w-4" /> Reset global
        </h2>
        <p class="mb-3 text-xs text-slate-400">
          Réinitialiser TOUS les joueurs : progression, pokémon, classements. Les comptes (email, mot de passe) sont conservés.
        </p>
        <button
          class="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-500"
          @click="resetAllPlayers"
        >
          Réinitialiser tous les joueurs
        </button>
      </section>

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
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                <img v-if="userDetails?.avatarUrl" :src="getAvatarUrl(userDetails.avatarUrl)!" alt="" class="h-full w-full object-cover" />
                <Users v-else class="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">{{ selectedUser.username }}</h3>
                <p class="text-sm text-slate-400">{{ selectedUser.email }}</p>
              </div>
              <button
                v-if="userDetails?.avatarUrl"
                class="ml-2 flex items-center gap-1 rounded-lg bg-red-600/20 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/30"
                @click="resetAvatar(selectedUser.id)"
              >
                <ImageOff class="h-3 w-3" />
                Reset avatar
              </button>
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
              <label class="mb-1 block text-sm text-gray-400">🪙 Gold</label>
              <input
                v-model.number="goldToGive"
                type="number"
                min="0"
                class="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
              <div class="mt-1 flex gap-1">
                <button v-for="amt in [1000, 5000, 10000, 50000]" :key="amt" class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-yellow-400 hover:bg-slate-600" @click="goldToGive = amt">{{ amt.toLocaleString() }}</button>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm text-gray-400">✨ XP Joueur</label>
              <input
                v-model.number="xpToGive"
                type="number"
                min="0"
                class="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              />
              <div class="mt-1 flex gap-1">
                <button v-for="amt in [1000, 10000, 50000, 500000]" :key="amt" class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-cyan-400 hover:bg-slate-600" @click="xpToGive = amt">{{ amt.toLocaleString() }}</button>
              </div>
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

    <!-- Penalty Modal -->
    <teleport to="body">
      <div
        v-if="showPenaltyModal && selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click="showPenaltyModal = false"
      >
        <div
          class="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6"
          @click.stop
        >
          <h3 class="mb-4 text-xl font-bold text-white">
            Malus — {{ selectedUser.username }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm text-gray-400">Type de malus</label>
              <div class="flex gap-2">
                <button
                  v-for="pt in (['dps', 'gold'] as const)"
                  :key="pt"
                  class="flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition-all"
                  :class="penaltyType === pt
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'"
                  @click="penaltyType = pt"
                >
                  {{ pt === 'dps' ? '⚔️ DPS' : '🪙 Gold' }}
                </button>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm text-gray-400">Pourcentage de réduction</label>
              <div class="flex gap-2">
                <button
                  v-for="pp in ([5, 10, 25, 50] as const)"
                  :key="pp"
                  class="flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition-all"
                  :class="penaltyPercent === pp
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'"
                  @click="penaltyPercent = pp"
                >
                  -{{ pp }}%
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                @click="setPenalty"
              >
                Appliquer malus
              </button>
              <button
                class="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                @click="removePenalty(selectedUser.id); showPenaltyModal = false"
              >
                Retirer
              </button>
              <button
                class="rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700"
                @click="showPenaltyModal = false"
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
