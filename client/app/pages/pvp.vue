<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Swords, Trophy, Search, Check, X, Clock, User, Shield, Eye } from 'lucide-vue-next'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useLocale } from '~/composables/useLocale'

definePageMeta({ layout: 'game' })

const player = usePlayerStore()
const auth = useAuthStore()
const inventory = useInventoryStore()
const { t } = useLocale()
const config = useRuntimeConfig()
const API = config.public.apiBase

// ── State ──
type Tab = 'arena' | 'leaderboard' | 'history'
const activeTab = ref<Tab>('arena')
const loading = ref(false)
const searchQuery = ref('')

// Players
const onlinePlayers = ref<any[]>([])
const allPlayers = ref<any[]>([])
const showAllPlayers = ref(false)

// Challenges
const receivedChallenges = ref<any[]>([])
const sentChallenges = ref<any[]>([])

// Leaderboard
const pvpLeaderboard = ref<any[]>([])

// History
const matchHistory = ref<any[]>([])

// Challenge modal
const showChallengeModal = ref(false)
const challengeTarget = ref<any>(null)
const betAmount = ref(1000)

// Team selection modal
const showTeamModal = ref(false)
const teamModalMode = ref<'challenge' | 'accept'>('challenge')
const acceptingChallengeId = ref<number | null>(null)
const selectedTeam = ref<number[]>([])
const teamSearch = ref('')
const teamSort = ref<'level' | 'stars' | 'name'>('level')
const teamRarity = ref<string | null>(null)

// Match result modal
const showMatchResult = ref(false)
const matchResult = ref<any>(null)
const animationProgress = ref(0)
const animationDone = ref(false)

// Polling
let pollInterval: ReturnType<typeof setInterval> | null = null

function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return `${API}/api/avatars/${path.split('/').pop()}`
}

// ── API Calls ──
async function fetchPlayers() {
  try {
    const [onlineRes, allRes] = await Promise.all([
      fetch(`${API}/api/pvp/players`, { credentials: 'include' }),
      fetch(`${API}/api/pvp/all-players`, { credentials: 'include' }),
    ])
    if (onlineRes.ok) onlinePlayers.value = await onlineRes.json()
    if (allRes.ok) allPlayers.value = await allRes.json()
  } catch { /* ignore */ }
}

async function fetchChallenges() {
  try {
    const res = await fetch(`${API}/api/pvp/challenges`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      receivedChallenges.value = data.received
      sentChallenges.value = data.sent
    }
  } catch { /* ignore */ }
}

async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API}/api/pvp/leaderboard`, { credentials: 'include' })
    if (res.ok) pvpLeaderboard.value = await res.json()
  } catch { /* ignore */ }
}

async function fetchHistory() {
  try {
    const res = await fetch(`${API}/api/pvp/history`, { credentials: 'include' })
    if (res.ok) matchHistory.value = await res.json()
  } catch { /* ignore */ }
}

async function loadAll() {
  loading.value = true
  await Promise.all([fetchPlayers(), fetchChallenges(), fetchLeaderboard(), fetchHistory()])
  loading.value = false
}

// ── Helpers ──
function toSlugs(clientIds: number[]): string[] {
  return clientIds.map(cid => {
    const p = inventory.collection.find(pk => pk.id === cid)
    return p?.slug ?? ''
  }).filter(s => s !== '')
}

// ── Challenge Flow ──
function openChallengeModal(target: any) {
  challengeTarget.value = target
  betAmount.value = Math.min(1000, Math.floor(player.gold * 0.1))
  showChallengeModal.value = true
}

function confirmChallenge() {
  showChallengeModal.value = false
  teamModalMode.value = 'challenge'
  selectedTeam.value = []
  showTeamModal.value = true
}

async function sendChallenge() {
  if (selectedTeam.value.length !== 6) return
  try {
    const res = await fetch(`${API}/api/pvp/challenge`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengedId: challengeTarget.value.id,
        betAmount: betAmount.value,
        team: toSlugs(selectedTeam.value),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      showTeamModal.value = false
      await fetchChallenges()
    } else {
      alert(data.message || 'Erreur')
    }
  } catch {
    alert(t('Erreur réseau', 'Network error'))
  }
}

function openAcceptModal(challenge: any) {
  acceptingChallengeId.value = challenge.id
  teamModalMode.value = 'accept'
  selectedTeam.value = []
  showTeamModal.value = true
}

async function acceptChallenge() {
  if (selectedTeam.value.length !== 6 || !acceptingChallengeId.value) return
  try {
    const res = await fetch(`${API}/api/pvp/challenge/${acceptingChallengeId.value}/accept`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: toSlugs(selectedTeam.value) }),
    })
    const data = await res.json()
    if (res.ok) {
      showTeamModal.value = false
      // Load match result and show animation
      await loadMatchResult(data.matchId)
      await fetchChallenges()
      await fetchHistory()
    } else {
      alert(data.message || 'Erreur')
    }
  } catch {
    alert(t('Erreur réseau', 'Network error'))
  }
}

async function declineChallenge(id: number) {
  try {
    await fetch(`${API}/api/pvp/challenge/${id}/decline`, {
      method: 'POST',
      credentials: 'include',
    })
    await fetchChallenges()
  } catch { /* ignore */ }
}

async function loadMatchResult(matchId: number) {
  try {
    const res = await fetch(`${API}/api/pvp/match/${matchId}`, { credentials: 'include' })
    if (res.ok) {
      matchResult.value = await res.json()
      showMatchResult.value = true
      animationProgress.value = 0
      animationDone.value = false
      startAnimation()
    }
  } catch { /* ignore */ }
}

function startAnimation() {
  const duration = 4000 // 4 seconds animation
  const start = Date.now()
  const animate = () => {
    const elapsed = Date.now() - start
    animationProgress.value = Math.min(1, elapsed / duration)
    if (animationProgress.value < 1) {
      requestAnimationFrame(animate)
    } else {
      animationDone.value = true
    }
  }
  requestAnimationFrame(animate)
}

function toggleTeamPokemon(pokemonId: number) {
  const idx = selectedTeam.value.indexOf(pokemonId)
  if (idx >= 0) {
    selectedTeam.value.splice(idx, 1)
  } else if (selectedTeam.value.length < 6) {
    selectedTeam.value.push(pokemonId)
  }
}

// ── Computed ──
const filteredPlayers = computed(() => {
  const list = showAllPlayers.value ? allPlayers.value : onlinePlayers.value
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter((p: any) => p.username.toLowerCase().includes(q))
})

const maxBet = computed(() => Math.floor(player.gold * 0.5))

const pvpUnlocked = computed(() => player.badges >= 13)

const sortedCollection = computed(() => {
  let list = [...inventory.collection]

  if (teamSearch.value) {
    const q = teamSearch.value.toLowerCase()
    list = list.filter((p) => p.nameFr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q))
  }

  if (teamRarity.value) {
    list = list.filter((p) => p.rarity === teamRarity.value)
  }

  // Always put current team members first
  list.sort((a, b) => {
    if (a.teamSlot !== null && b.teamSlot === null) return -1
    if (a.teamSlot === null && b.teamSlot !== null) return 1
    switch (teamSort.value) {
      case 'stars': return b.stars - a.stars || b.level - a.level
      case 'name': return a.nameFr.localeCompare(b.nameFr)
      default: return b.level - a.level
    }
  })

  return list
})

function getWinRate(entry: any): string {
  if (entry.total_matches === 0) return '0%'
  return `${Math.round((entry.wins / entry.total_matches) * 100)}%`
}

function isMe(id: number): boolean {
  return auth.user?.id === id
}

function formatGold(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function getSpriteUrl(slug: string): string {
  return `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`
}

function getShinySpriteUrl(slug: string): string {
  return `https://play.pokemonshowdown.com/sprites/ani-shiny/${slug}.gif`
}

// ── Lifecycle ──
onMounted(() => {
  if (auth.isAuthenticated && pvpUnlocked.value) {
    loadAll()
    pollInterval = setInterval(() => {
      fetchChallenges()
      fetchPlayers()
    }, 15000)
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
          <Swords class="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ t('Arène PvP', 'PvP Arena') }}</h1>
          <p class="text-sm text-slate-400">{{ t('Combats 1v1 — Pariez et affrontez !', '1v1 Battles — Bet and fight!') }}</p>
        </div>
      </div>
    </div>

    <!-- Locked state -->
    <div v-if="!pvpUnlocked" class="flex flex-col items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-12 text-center">
      <Shield class="h-16 w-16 text-slate-600" />
      <h2 class="text-xl font-bold text-slate-300">{{ t('PvP verrouillé', 'PvP Locked') }}</h2>
      <p class="max-w-md text-sm text-slate-400">
        {{ t('Complétez Kanto (13 badges) pour débloquer l\'arène PvP !', 'Complete Kanto (13 badges) to unlock the PvP arena!') }}
      </p>
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <Trophy class="h-4 w-4" />
        {{ player.badges }}/13 {{ t('badges', 'badges') }}
      </div>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- Tabs -->
      <div class="flex gap-1 rounded-xl bg-slate-800/50 p-1">
        <button
          v-for="tab in ([
            { id: 'arena', labelFr: '⚔️ Arène', labelEn: '⚔️ Arena' },
            { id: 'leaderboard', labelFr: '🏆 Classement', labelEn: '🏆 Leaderboard' },
            { id: 'history', labelFr: '📜 Historique', labelEn: '📜 History' },
          ] as const)"
          :key="tab.id"
          class="flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-all"
          :class="activeTab === tab.id
            ? 'bg-slate-700 text-white shadow'
            : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab = tab.id"
        >
          {{ t(tab.labelFr, tab.labelEn) }}
        </button>
      </div>

      <!-- ═══ ARENA TAB ═══ -->
      <div v-if="activeTab === 'arena'" class="space-y-6">
        <!-- Pending challenges received -->
        <div v-if="receivedChallenges.length > 0" class="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
            <Swords class="h-4 w-4" />
            {{ t('Défis reçus', 'Received Challenges') }}
            <span class="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{{ receivedChallenges.length }}</span>
          </h3>
          <div class="space-y-2">
            <div
              v-for="c in receivedChallenges"
              :key="c.id"
              class="flex items-center justify-between rounded-lg bg-slate-800/80 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20">
                  <img v-if="c.challengerAvatarUrl" :src="getAvatarUrl(c.challengerAvatarUrl)!" alt="" class="h-full w-full object-cover" />
                  <User v-else class="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <span class="font-bold text-white">{{ c.challengerName }}</span>
                  <span class="ml-2 text-xs text-slate-400">Lv.{{ c.challengerLevel }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-yellow-400">🪙 {{ formatGold(c.betAmount) }}</span>
                <button
                  class="rounded-lg bg-green-600/20 px-3 py-1.5 text-xs font-bold text-green-400 transition-colors hover:bg-green-600/30"
                  @click="openAcceptModal(c)"
                >
                  <Check class="mr-1 inline h-3 w-3" />{{ t('Accepter', 'Accept') }}
                </button>
                <button
                  class="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-600/30"
                  @click="declineChallenge(c.id)"
                >
                  <X class="mr-1 inline h-3 w-3" />{{ t('Refuser', 'Decline') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sent challenges -->
        <div v-if="sentChallenges.length > 0" class="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Clock class="h-4 w-4" />
            {{ t('Défis envoyés', 'Sent Challenges') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="c in sentChallenges"
              :key="c.id"
              class="flex items-center justify-between rounded-lg bg-slate-800/80 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20">
                  <img v-if="c.challengedAvatarUrl" :src="getAvatarUrl(c.challengedAvatarUrl)!" alt="" class="h-full w-full object-cover" />
                  <User v-else class="h-4 w-4 text-indigo-400" />
                </div>
                <span class="font-bold text-white">{{ c.challengedName }}</span>
                <span class="text-xs text-slate-400">Lv.{{ c.challengedLevel }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-yellow-400">🪙 {{ formatGold(c.betAmount) }}</span>
                <span class="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">{{ t('En attente', 'Pending') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Player list -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">
              {{ t('Joueurs disponibles', 'Available Players') }}
            </h3>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 rounded-lg bg-slate-700/50 px-3 py-1.5">
                <Search class="h-3.5 w-3.5 text-slate-400" />
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('Rechercher...', 'Search...')"
                  class="w-24 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 sm:w-40"
                />
              </div>
              <button
                class="rounded-lg px-2 py-1 text-xs transition-colors"
                :class="showAllPlayers ? 'bg-indigo-600/30 text-indigo-400' : 'bg-slate-700/50 text-slate-400 hover:text-white'"
                @click="showAllPlayers = !showAllPlayers"
              >
                {{ showAllPlayers ? t('En ligne', 'Online') : t('Tous', 'All') }}
              </button>
            </div>
          </div>
          <div v-if="filteredPlayers.length === 0" class="flex items-center justify-center py-8 text-sm text-slate-500">
            {{ t('Aucun joueur trouvé', 'No players found') }}
          </div>
          <div v-else class="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
            <div
              v-for="p in filteredPlayers"
              :key="p.id"
              class="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-700/20"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-500/20">
                  <img v-if="p.avatarUrl" :src="getAvatarUrl(p.avatarUrl)!" alt="" class="h-full w-full object-cover" />
                  <User v-else class="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <span class="font-bold text-white">{{ p.username }}</span>
                  <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span>Lv.{{ p.level }}</span>
                    <span>·</span>
                    <span>{{ p.badges }} 🏅</span>
                  </div>
                </div>
              </div>
              <button
                class="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-600/30"
                @click="openChallengeModal(p)"
              >
                <Swords class="h-3 w-3" />
                {{ t('Défier', 'Challenge') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ LEADERBOARD TAB ═══ -->
      <div v-if="activeTab === 'leaderboard'" class="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div class="border-b border-slate-700/50 px-4 py-3">
          <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
            <Trophy class="h-4 w-4 text-yellow-400" />
            {{ t('Classement PvP', 'PvP Ranking') }}
          </h3>
        </div>
        <div v-if="pvpLeaderboard.length === 0" class="flex items-center justify-center py-12 text-sm text-slate-500">
          {{ t('Aucun combat PvP pour le moment', 'No PvP matches yet') }}
        </div>
        <div v-else class="divide-y divide-slate-700/30">
          <div
            v-for="(entry, idx) in pvpLeaderboard"
            :key="entry.id"
            class="flex items-center gap-4 px-4 py-3 transition-colors"
            :class="isMe(entry.id) ? 'bg-yellow-500/5' : 'hover:bg-slate-700/20'"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-black"
              :class="idx === 0 ? 'bg-yellow-500/30 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-amber-600/20 text-amber-500' : 'bg-slate-700/50 text-slate-400'"
            >
              <img v-if="entry.avatar_url" :src="getAvatarUrl(entry.avatar_url)!" alt="" class="h-full w-full object-cover" />
              <template v-else>{{ idx + 1 }}</template>
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-sm font-bold" :class="isMe(entry.id) ? 'text-yellow-300' : 'text-white'">
                {{ entry.username }}
                <span v-if="isMe(entry.id)" class="ml-1 text-[10px] text-yellow-500">({{ t('vous', 'you') }})</span>
              </span>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span>Lv.{{ entry.level }}</span>
                <span>·</span>
                <span class="text-green-400">{{ entry.wins }}W</span>
                <span class="text-red-400">{{ entry.losses }}L</span>
                <span v-if="entry.draws > 0" class="text-slate-500">{{ entry.draws }}D</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-yellow-400">{{ getWinRate(entry) }}</div>
              <div class="text-[10px] text-slate-500">{{ entry.total_matches }} {{ t('combats', 'matches') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ HISTORY TAB ═══ -->
      <div v-if="activeTab === 'history'" class="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div class="border-b border-slate-700/50 px-4 py-3">
          <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
            📜 {{ t('Historique des combats', 'Match History') }}
          </h3>
        </div>
        <div v-if="matchHistory.length === 0" class="flex items-center justify-center py-12 text-sm text-slate-500">
          {{ t('Aucun combat pour le moment', 'No matches yet') }}
        </div>
        <div v-else class="divide-y divide-slate-700/30">
          <div
            v-for="m in matchHistory"
            :key="m.id"
            class="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-700/20 cursor-pointer"
            @click="loadMatchResult(m.id)"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
                :class="m.winnerId === auth.user?.id ? 'bg-green-500/20 text-green-400' : m.winnerId === null ? 'bg-slate-500/20 text-slate-400' : 'bg-red-500/20 text-red-400'"
              >
                {{ m.winnerId === auth.user?.id ? 'W' : m.winnerId === null ? 'D' : 'L' }}
              </div>
              <div>
                <span class="text-sm font-bold text-white">
                  {{ m.player1.username }} <span class="text-slate-500">vs</span> {{ m.player2.username }}
                </span>
                <div class="flex items-center gap-2 text-xs text-slate-400">
                  <span>🪙 {{ formatGold(m.betAmount) }}</span>
                  <span>·</span>
                  <span>{{ m.bossNameFr }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">{{ new Date(m.createdAt).toLocaleDateString() }}</span>
              <Eye class="h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ CHALLENGE MODAL ═══ -->
    <teleport to="body">
      <div
        v-if="showChallengeModal && challengeTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click="showChallengeModal = false"
      >
        <div class="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl" @click.stop>
          <h3 class="mb-4 text-lg font-bold text-white">
            ⚔️ {{ t('Défier', 'Challenge') }} {{ challengeTarget.username }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm text-slate-400">{{ t('Mise (pokédollars)', 'Bet (pokédollars)') }}</label>
              <input
                v-model.number="betAmount"
                type="number"
                :min="100"
                :max="maxBet"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
              />
              <p class="mt-1 text-xs text-slate-500">
                Min: 100 · Max: {{ formatGold(maxBet) }} (50%)
              </p>
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700"
                @click="confirmChallenge"
              >
                {{ t('Choisir mon équipe', 'Choose my team') }}
              </button>
              <button
                class="rounded-lg bg-slate-700 px-4 py-2 font-bold text-slate-300 transition-colors hover:bg-slate-600"
                @click="showChallengeModal = false"
              >
                {{ t('Annuler', 'Cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ═══ TEAM SELECTION MODAL ═══ -->
    <teleport to="body">
      <div
        v-if="showTeamModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click="showTeamModal = false"
      >
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl" @click.stop>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">
              {{ t('Sélectionnez 6 Pokémon', 'Select 6 Pokémon') }}
            </h3>
            <span class="text-sm font-bold" :class="selectedTeam.length === 6 ? 'text-green-400' : 'text-slate-400'">
              {{ selectedTeam.length }}/6
            </span>
          </div>

          <!-- Selected team preview -->
          <div class="mb-4 flex gap-2">
            <div
              v-for="i in 6"
              :key="i"
              class="flex h-14 w-14 items-center justify-center rounded-lg border-2 transition-all"
              :class="selectedTeam[i-1]
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-dashed border-slate-600 bg-slate-800'"
            >
              <template v-if="selectedTeam[i-1]">
                <img
                  :src="(() => {
                    const p = inventory.collection.find(pk => pk.id === selectedTeam[i-1])
                    return p ? (p.isShiny ? getShinySpriteUrl(p.slug) : getSpriteUrl(p.slug)) : ''
                  })()"
                  class="h-10 w-10 object-contain"
                  alt=""
                />
              </template>
              <span v-else class="text-xs text-slate-600">{{ i }}</span>
            </div>
          </div>

          <!-- Search + filters -->
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <div class="relative flex-1 min-w-[140px]">
              <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                v-model="teamSearch"
                type="text"
                :placeholder="t('Rechercher...', 'Search...')"
                class="w-full rounded-lg border border-slate-600 bg-slate-700 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500"
              />
            </div>
            <select
              v-model="teamSort"
              class="rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
            >
              <option value="level">{{ t('Niveau', 'Level') }}</option>
              <option value="stars">{{ t('Étoiles', 'Stars') }}</option>
              <option value="name">{{ t('Nom', 'Name') }}</option>
            </select>
            <select
              v-model="teamRarity"
              class="rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
            >
              <option :value="null">{{ t('Toutes raretés', 'All rarities') }}</option>
              <option value="legendary">{{ t('Légendaire', 'Legendary') }}</option>
              <option value="epic">{{ t('Épique', 'Epic') }}</option>
              <option value="rare">{{ t('Rare', 'Rare') }}</option>
              <option value="uncommon">{{ t('Peu commun', 'Uncommon') }}</option>
              <option value="common">{{ t('Commun', 'Common') }}</option>
            </select>
          </div>

          <!-- Pokemon grid -->
          <div class="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5">
            <button
              v-for="poke in sortedCollection"
              :key="poke.id"
              class="flex flex-col items-center gap-1 rounded-lg border p-2 transition-all"
              :class="selectedTeam.includes(poke.id)
                ? 'border-red-500 bg-red-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'"
              @click="toggleTeamPokemon(poke.id)"
            >
              <img
                :src="poke.isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug)"
                class="h-10 w-10 object-contain"
                alt=""
              />
              <span class="text-[10px] font-bold text-white truncate w-full text-center">{{ poke.nameFr }}</span>
              <div class="flex items-center gap-1 text-[9px] text-slate-400">
                <span>Lv.{{ poke.level }}</span>
                <span v-if="poke.isShiny" class="text-yellow-400">✨</span>
              </div>
            </button>
          </div>

          <!-- Confirm -->
          <div class="mt-4 flex gap-2">
            <button
              class="flex-1 rounded-lg px-4 py-2.5 font-bold text-white transition-colors"
              :class="selectedTeam.length === 6 ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 cursor-not-allowed opacity-50'"
              :disabled="selectedTeam.length !== 6"
              @click="teamModalMode === 'challenge' ? sendChallenge() : acceptChallenge()"
            >
              {{ teamModalMode === 'challenge' ? t('Envoyer le défi !', 'Send challenge!') : t('Combattre !', 'Fight!') }}
            </button>
            <button
              class="rounded-lg bg-slate-700 px-4 py-2.5 font-bold text-slate-300 hover:bg-slate-600"
              @click="showTeamModal = false"
            >
              {{ t('Annuler', 'Cancel') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ═══ MATCH RESULT MODAL ═══ -->
    <teleport to="body">
      <div
        v-if="showMatchResult && matchResult"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        @click="animationDone ? (showMatchResult = false) : null"
      >
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" @click.stop>
          <!-- Boss info -->
          <div class="mb-6 text-center">
            <img :src="getSpriteUrl(matchResult.boss.slug)" class="mx-auto h-24 w-24 object-contain" alt="" />
            <h3 class="mt-2 text-lg font-bold text-white">{{ matchResult.boss.nameFr }}</h3>
            <p class="text-xs text-slate-400">{{ t('Boss imbattable', 'Unbeatable boss') }} · Gen {{ matchResult.boss.generation }}</p>
          </div>

          <!-- Damage bars -->
          <div class="space-y-4">
            <!-- Player 1 -->
            <div>
              <div class="mb-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-500/20">
                    <img v-if="matchResult.player1.avatarUrl" :src="getAvatarUrl(matchResult.player1.avatarUrl)!" alt="" class="h-full w-full object-cover" />
                    <User v-else class="h-3 w-3 text-blue-400" />
                  </div>
                  <span class="text-sm font-bold" :class="matchResult.winnerId === matchResult.player1.id ? 'text-green-400' : 'text-white'">
                    {{ matchResult.player1.username }}
                    <span v-if="matchResult.winnerId === matchResult.player1.id" class="ml-1 text-xs">👑</span>
                  </span>
                </div>
                <span class="text-sm font-bold text-blue-400">
                  {{ animationDone ? matchResult.player1.damage.toLocaleString() : Math.floor(matchResult.player1.damage * animationProgress).toLocaleString() }}
                </span>
              </div>
              <div class="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  class="h-full rounded-full transition-all duration-100"
                  :class="matchResult.winnerId === matchResult.player1.id ? 'bg-green-500' : 'bg-blue-500'"
                  :style="{
                    width: `${Math.min(100, (matchResult.player1.damage / Math.max(matchResult.player1.damage, matchResult.player2.damage)) * 100 * animationProgress)}%`
                  }"
                ></div>
              </div>
            </div>

            <!-- Player 2 -->
            <div>
              <div class="mb-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-red-500/20">
                    <img v-if="matchResult.player2.avatarUrl" :src="getAvatarUrl(matchResult.player2.avatarUrl)!" alt="" class="h-full w-full object-cover" />
                    <User v-else class="h-3 w-3 text-red-400" />
                  </div>
                  <span class="text-sm font-bold" :class="matchResult.winnerId === matchResult.player2.id ? 'text-green-400' : 'text-white'">
                    {{ matchResult.player2.username }}
                    <span v-if="matchResult.winnerId === matchResult.player2.id" class="ml-1 text-xs">👑</span>
                  </span>
                </div>
                <span class="text-sm font-bold text-red-400">
                  {{ animationDone ? matchResult.player2.damage.toLocaleString() : Math.floor(matchResult.player2.damage * animationProgress).toLocaleString() }}
                </span>
              </div>
              <div class="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  class="h-full rounded-full transition-all duration-100"
                  :class="matchResult.winnerId === matchResult.player2.id ? 'bg-green-500' : 'bg-red-500'"
                  :style="{
                    width: `${Math.min(100, (matchResult.player2.damage / Math.max(matchResult.player1.damage, matchResult.player2.damage)) * 100 * animationProgress)}%`
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Result -->
          <div v-if="animationDone" class="mt-6 text-center">
            <div v-if="matchResult.winnerId === null" class="text-xl font-bold text-slate-300">
              {{ t('Égalité !', 'Draw!') }}
            </div>
            <div v-else-if="matchResult.winnerId === auth.user?.id" class="text-xl font-bold text-green-400">
              🎉 {{ t('Victoire !', 'Victory!') }} +{{ formatGold(matchResult.betAmount) }} 🪙
            </div>
            <div v-else class="text-xl font-bold text-red-400">
              💀 {{ t('Défaite...', 'Defeat...') }} -{{ formatGold(matchResult.betAmount) }} 🪙
            </div>

            <!-- Team details -->
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div v-for="(side, sideKey) in { player1: matchResult.player1, player2: matchResult.player2 }" :key="sideKey">
                <p class="mb-2 text-xs font-bold text-slate-400">{{ side.username }}</p>
                <div class="flex flex-wrap justify-center gap-1">
                  <div
                    v-for="poke in side.team"
                    :key="poke.pokemonId"
                    class="flex flex-col items-center rounded bg-slate-800 p-1"
                    :title="`${poke.nameFr} — DPS: ${poke.effectiveDps} (x${poke.typeMult})`"
                  >
                    <img
                      :src="poke.isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug)"
                      class="h-8 w-8 object-contain"
                      alt=""
                    />
                    <span class="text-[8px] text-slate-400">{{ poke.effectiveDps }}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              class="mt-4 rounded-lg bg-slate-700 px-6 py-2 font-bold text-white hover:bg-slate-600"
              @click="showMatchResult = false"
            >
              {{ t('Fermer', 'Close') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
