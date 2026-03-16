<script setup lang="ts">
import { Swords, Users, Clock, Crown, Copy, Check, X, ChevronLeft, Zap, Trophy, Sparkles, Shield } from 'lucide-vue-next'
import { useRaidSocket } from '~/composables/useRaidSocket'
import { useRaidStore } from '~/stores/useRaidStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'
import { getSpriteUrl, getShinySpriteUrl } from '~/utils/showdown'
import { getSlugGeneration } from '~/data/gacha'
import { getEvolutionStage } from '~/data/evolutions'

definePageMeta({
  layout: 'game',
})

const { t } = useLocale()
const player = usePlayerStore()
const inventory = useInventoryStore()
const auth = useAuthStore()
const raid = useRaidStore()
const raidSocket = useRaidSocket()

// Beta gate: only admin or beta users can access raids
const hasBetaAccess = computed(() => auth.user?.role === 'admin' || auth.user?.betaAccess === true)

function pokeSprite(slug: string, isShiny: boolean): string {
  return isShiny ? getShinySpriteUrl(slug) : getSpriteUrl(slug)
}

const joinCode = ref('')
const errorMsg = ref<string | null>(null)
const view = ref<'home' | 'room'>('home')
const filterEvoStage = ref<number | null>(null)

const evoStageOptions = computed(() => [
  { value: null, label: t('Tous stades', 'All stages') },
  { value: 0, label: t('Base', 'Base') },
  { value: 1, label: t('Stade 1', 'Stage 1') },
  { value: 2, label: t('Stade 2', 'Stage 2') },
])

const GENERATION_NAMES: Record<number, string> = {
  1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh', 5: 'Unys', 6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea',
}

// Generations available for raids: unlocked after zone 9+ (past gym 8)
const availableGens = computed(() => {
  const gens: number[] = []
  for (let g = 1; g <= player.currentGeneration; g++) {
    // Current gen: only if past zone 8
    if (g === player.currentGeneration && player.currentZone <= 8) continue
    gens.push(g)
  }
  return gens
})

// Pokémon available for team selection (from selected raid gen)
const availablePokemon = computed(() => {
  if (!raid.room) return []
  const gen = raid.room.generation
  return inventory.collection.filter(p => {
    const pokeGen = getSlugGeneration(p.slug)
    if (pokeGen !== gen) return false
    if (filterEvoStage.value !== null && getEvolutionStage(p.slug) !== filterEvoStage.value) return false
    return true
  }).sort((a, b) => b.level - a.level)
})

const isInSelectedTeam = (pokeId: number) => raid.selectedTeam.some(p => p.id === pokeId)

const myUserId = computed(() => auth.user?.id ?? 0)

const currentPlayer = computed(() => {
  if (!raid.room) return null
  return raid.room.players.find(p => p.userId === myUserId.value)
})

const isHost = computed(() => raid.room?.hostUserId === myUserId.value)
const isReady = computed(() => currentPlayer.value?.ready ?? false)
const canReady = computed(() => raid.selectedTeam.length > 0)

// Connect socket on mount
onMounted(() => {
  if (auth.isAuthenticated) {
    raidSocket.connect()
    raidSocket.listLobbies()
  }
})

onUnmounted(() => {
  // Don't disconnect — keep socket alive for combat notifications
})

async function handleCreateRoom(gen: number) {
  errorMsg.value = null
  const res = await raidSocket.createRoom(gen)
  if (res.error) {
    errorMsg.value = t(
      getErrorMessage(res.error).fr,
      getErrorMessage(res.error).en,
    )
    return
  }
  view.value = 'room'
}

async function handleJoinRoom() {
  if (!joinCode.value.trim()) return
  errorMsg.value = null
  const res = await raidSocket.joinRoom(joinCode.value.trim())
  if (res.error) {
    errorMsg.value = t(
      getErrorMessage(res.error).fr,
      getErrorMessage(res.error).en,
    )
    return
  }
  view.value = 'room'
}

async function handleJoinLobby(code: string) {
  errorMsg.value = null
  const res = await raidSocket.joinRoom(code)
  if (res.error) {
    errorMsg.value = t(
      getErrorMessage(res.error).fr,
      getErrorMessage(res.error).en,
    )
    return
  }
  view.value = 'room'
}

async function handleLeaveRoom() {
  await raidSocket.leaveRoom()
  view.value = 'home'
  raidSocket.listLobbies()
}

function togglePokemon(poke: { id: number; serverId: number | null; slug: string; nameFr: string; nameEn: string; level: number; stars: number; isShiny: boolean; rarity: string }) {
  raid.toggleTeamMember({
    id: poke.id,
    serverId: poke.serverId,
    slug: poke.slug,
    nameFr: poke.nameFr,
    nameEn: poke.nameEn,
    level: poke.level,
    stars: poke.stars,
    isShiny: poke.isShiny,
    rarity: poke.rarity,
  })
}

async function sendTeam() {
  const team = raid.selectedTeam.map(p => ({
    id: p.serverId ?? p.id, // server needs DB id for ownership verification
    slug: p.slug,
    level: p.level,
    stars: p.stars,
    isShiny: p.isShiny,
    rarity: p.rarity,
  }))
  await raidSocket.setTeam(team)
}

async function toggleReady() {
  // Always send team first
  await sendTeam()
  await raidSocket.setReady(!isReady.value)
}

function copyCode() {
  if (raid.room?.code) {
    navigator.clipboard.writeText(raid.room.code)
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDamage(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function getErrorMessage(code: string): { fr: string; en: string } {
  const map: Record<string, { fr: string; en: string }> = {
    already_in_room: { fr: 'Tu es déjà dans un raid !', en: 'You are already in a raid!' },
    room_not_found: { fr: 'Salon introuvable !', en: 'Room not found!' },
    room_full: { fr: 'Salon plein !', en: 'Room is full!' },
    room_not_in_lobby: { fr: 'Le combat a déjà commencé !', en: 'Combat has already started!' },
    invalid_generation: { fr: 'Génération invalide', en: 'Invalid generation' },
    not_in_room: { fr: 'Tu n\'es pas dans un salon', en: 'You are not in a room' },
    no_team: { fr: 'Sélectionne une équipe d\'abord !', en: 'Select a team first!' },
  }
  return map[code] ?? { fr: `Erreur: ${code}`, en: `Error: ${code}` }
}

// Watch for room changes (e.g. disbanded)
watch(() => raid.room, (room) => {
  if (!room && view.value === 'room') {
    view.value = 'home'
  }
})

// Auto-switch to room view if reconnected to a room
watch(() => raid.room, (room) => {
  if (room && view.value === 'home') {
    view.value = 'room'
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Beta access gate -->
    <div v-if="!hasBetaAccess" class="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Shield class="h-16 w-16 text-slate-600" />
      <h2 class="text-2xl font-bold text-slate-400">{{ t('Fonctionnalité en bêta', 'Beta Feature') }}</h2>
      <p class="max-w-md text-sm text-slate-500">
        {{ t('Les raids PVE sont actuellement en bêta. Contactez un administrateur pour obtenir l\'accès.', 'PVE Raids are currently in beta. Contact an admin to get access.') }}
      </p>
    </div>

    <template v-else>
    <h2 class="flex items-center gap-2 text-2xl font-bold">
      <Shield class="h-6 w-6 text-purple-400" />
      {{ t('Raid PVE', 'PVE Raid') }}
    </h2>

    <!-- Pending result notification -->
    <div v-if="raid.pendingResult" class="rounded-xl border-2 p-4" :class="raid.pendingResult.victory ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'">
      <h3 class="mb-2 text-lg font-bold" :class="raid.pendingResult.victory ? 'text-green-400' : 'text-red-400'">
        {{ raid.pendingResult.victory ? t('Raid terminé — Victoire !', 'Raid ended — Victory!') : t('Raid terminé — Défaite', 'Raid ended — Defeat') }}
      </h3>
      <div v-if="raid.pendingResult.victory" class="space-y-1 text-sm text-gray-300">
        <p v-for="pr in raid.pendingResult.players.filter(p => p.userId === myUserId)" :key="pr.userId">
          <span v-if="pr.caught" class="text-green-400 font-bold">{{ t('Légendaire capturé !', 'Legendary caught!') }} ✨</span>
          <span v-else class="text-gray-400">{{ t('Légendaire non capturé...', 'Legendary not caught...') }}</span>
          — 🪙 +{{ pr.goldReward.toLocaleString() }}
        </p>
      </div>
      <button class="mt-2 rounded-lg bg-gray-700 px-3 py-1 text-xs text-white hover:bg-gray-600" @click="raid.clearPendingResult()">
        {{ t('Fermer', 'Dismiss') }}
      </button>
    </div>

    <!-- Error message -->
    <div v-if="errorMsg" class="rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm font-bold text-red-400">
      {{ errorMsg }}
    </div>

    <!-- ═══════════════ HOME VIEW ═══════════════ -->
    <template v-if="view === 'home' && !raid.inRoom">

      <!-- Connection status -->
      <div class="flex items-center gap-2 text-xs">
        <div class="h-2 w-2 rounded-full" :class="raid.connected ? 'bg-green-500' : 'bg-red-500'" />
        <span class="text-gray-500">{{ raid.connected ? t('Connecté', 'Connected') : t('Connexion...', 'Connecting...') }}</span>
      </div>

      <!-- Join by code -->
      <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 class="mb-3 text-sm font-semibold text-gray-400">{{ t('Rejoindre un raid', 'Join a raid') }}</h3>
        <div class="flex gap-2">
          <input
            v-model="joinCode"
            class="flex-1 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm font-mono text-white uppercase placeholder-gray-600 focus:border-purple-500 focus:outline-none"
            :placeholder="t('Code du salon', 'Room code')"
            maxlength="6"
            @keydown.enter="handleJoinRoom"
          />
          <button
            class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
            :disabled="!joinCode.trim() || !raid.connected"
            @click="handleJoinRoom"
          >
            {{ t('Rejoindre', 'Join') }}
          </button>
        </div>
      </div>

      <!-- Create raid -->
      <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 class="mb-3 text-sm font-semibold text-gray-400">{{ t('Créer un raid', 'Create a raid') }}</h3>
        <div v-if="availableGens.length === 0" class="py-4 text-center text-sm text-gray-500">
          {{ t('Tu dois terminer au moins 8 zones d\'une génération pour débloquer les raids.', 'You must complete at least 8 zones of a generation to unlock raids.') }}
        </div>
        <div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            v-for="gen in availableGens"
            :key="gen"
            class="flex flex-col items-center gap-1 rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm transition-all hover:border-purple-500/50 hover:bg-purple-500/10 disabled:opacity-40"
            :disabled="!raid.connected"
            @click="handleCreateRoom(gen)"
          >
            <span class="text-lg font-bold text-purple-400">Gen {{ gen }}</span>
            <span class="text-xs text-gray-500">{{ GENERATION_NAMES[gen] }}</span>
          </button>
        </div>
      </div>

      <!-- Open lobbies -->
      <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 class="mb-3 text-sm font-semibold text-gray-400">
          <Users class="mr-1 inline h-4 w-4" />
          {{ t('Salons ouverts', 'Open lobbies') }}
        </h3>
        <div v-if="raid.lobbies.length === 0" class="py-4 text-center text-sm text-gray-500">
          {{ t('Aucun salon ouvert pour le moment.', 'No open lobbies right now.') }}
        </div>
        <div v-else class="flex flex-col gap-2">
          <button
            v-for="lobby in raid.lobbies"
            :key="lobby.code"
            class="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900 p-3 transition-all hover:border-purple-500/50"
            @click="handleJoinLobby(lobby.code)"
          >
            <div class="flex items-center gap-3">
              <img :src="pokeSprite(lobby.bossSlug, lobby.bossIsShiny)" class="h-10 w-10" :alt="t(lobby.bossNameFr, lobby.bossNameEn)" />
              <div class="text-left">
                <p class="font-bold text-white">
                  <span v-if="lobby.bossIsShiny" class="text-yellow-400">✨ </span>
                  {{ t(lobby.bossNameFr, lobby.bossNameEn) }}
                </p>
                <p class="text-xs text-gray-500">Gen {{ lobby.generation }} — {{ GENERATION_NAMES[lobby.generation] }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Users class="h-4 w-4 text-gray-500" />
              <span class="font-bold" :class="lobby.playerCount >= lobby.maxPlayers ? 'text-red-400' : 'text-green-400'">
                {{ lobby.playerCount }}/{{ lobby.maxPlayers }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </template>

    <!-- ═══════════════ ROOM VIEW ═══════════════ -->
    <template v-if="raid.inRoom && raid.room">

      <!-- Room header -->
      <div class="flex items-center justify-between">
        <button class="flex items-center gap-1 text-sm text-gray-400 hover:text-white" @click="handleLeaveRoom">
          <ChevronLeft class="h-4 w-4" />
          {{ t('Quitter', 'Leave') }}
        </button>
        <div class="flex items-center gap-2">
          <span class="rounded-lg bg-gray-800 px-3 py-1 font-mono text-sm font-bold text-purple-400">{{ raid.room.code }}</span>
          <button class="rounded-lg bg-gray-800 p-1.5 text-gray-400 hover:text-white" @click="copyCode" :title="t('Copier le code', 'Copy code')">
            <Copy class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Boss display -->
      <div class="rounded-xl border-2 p-4 text-center" :class="raid.room.boss.isShiny ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-purple-500/50 bg-purple-500/5'">
        <img
          :src="pokeSprite(raid.room.boss.slug, raid.room.boss.isShiny)"
          class="mx-auto h-32 w-32 drop-shadow-lg"
          :alt="t(raid.room.boss.nameFr, raid.room.boss.nameEn)"
        />
        <h3 class="mt-2 text-xl font-black" :class="raid.room.boss.isShiny ? 'text-yellow-400' : 'text-white'">
          <span v-if="raid.room.boss.isShiny">✨ </span>
          {{ t(raid.room.boss.nameFr, raid.room.boss.nameEn) }}
          <span v-if="raid.room.boss.isShiny"> ✨</span>
        </h3>
        <div class="mt-1 flex items-center justify-center gap-1">
          <span
            v-for="type in raid.room.boss.types"
            :key="type"
            class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
            :style="{ backgroundColor: getTypeColor(type) }"
          >{{ type }}</span>
        </div>

        <!-- Boss HP bar (visible in combat) -->
        <div v-if="raid.inCombat || raid.isVictory || raid.isDefeat" class="mt-4">
          <div class="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span>HP</span>
            <span>{{ formatDamage(raid.room.boss.currentHp) }} / {{ formatDamage(raid.room.boss.maxHp) }}</span>
          </div>
          <div class="h-4 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="raid.bossHpPercent > 50 ? 'bg-green-500' : raid.bossHpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'"
              :style="{ width: `${raid.bossHpPercent}%` }"
            />
          </div>
        </div>

        <!-- Timer -->
        <div v-if="raid.inCombat" class="mt-3 flex items-center justify-center gap-1 text-lg font-bold" :class="raid.room.timeLeft <= 30 ? 'text-red-400' : 'text-white'">
          <Clock class="h-5 w-5" />
          {{ formatTime(raid.room.timeLeft) }}
        </div>
      </div>

      <!-- ── LOBBY PHASE ── -->
      <template v-if="raid.inLobby">

        <!-- Players list -->
        <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Users class="h-4 w-4" />
            {{ t('Joueurs', 'Players') }} ({{ raid.room.players.length }}/4)
          </h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="p in raid.room.players"
              :key="p.userId"
              class="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2"
            >
              <div class="flex items-center gap-2">
                <Crown v-if="p.userId === raid.room.hostUserId" class="h-4 w-4 text-yellow-400" />
                <span class="font-bold text-white">{{ p.username }}</span>
                <span class="text-xs text-gray-500">({{ p.team.length }}/6)</span>
              </div>
              <div>
                <span v-if="p.ready" class="flex items-center gap-1 text-xs font-bold text-green-400">
                  <Check class="h-3 w-3" /> {{ t('Prêt', 'Ready') }}
                </span>
                <span v-else class="text-xs text-gray-500">{{ t('En attente', 'Waiting') }}</span>
              </div>
            </div>
          </div>
          <p v-if="raid.room.players.length < 2" class="mt-2 text-center text-xs text-gray-500">
            {{ t('Il faut au moins 2 joueurs pour lancer le raid.', 'At least 2 players are needed to start the raid.') }}
          </p>
        </div>

        <!-- Team selection -->
        <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 class="mb-3 flex items-center justify-between text-sm font-semibold text-gray-400">
            <span class="flex items-center gap-2">
              <Swords class="h-4 w-4" />
              {{ t('Ton équipe', 'Your team') }} ({{ raid.selectedTeam.length }}/6)
            </span>
            <button v-if="raid.selectedTeam.length > 0" class="text-xs text-red-400 hover:text-red-300" @click="raid.clearTeam()">
              {{ t('Vider', 'Clear') }}
            </button>
          </h3>

          <!-- Selected team preview -->
          <div v-if="raid.selectedTeam.length > 0" class="mb-3 flex flex-wrap gap-2">
            <div
              v-for="poke in raid.selectedTeam"
              :key="poke.id"
              class="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-xs"
            >
              <img :src="pokeSprite(poke.slug, poke.isShiny)" class="h-6 w-6" />
              <span class="font-bold text-white">{{ t(poke.nameFr, poke.nameEn) }}</span>
              <span class="text-gray-400">Lv.{{ poke.level }}</span>
              <button class="text-red-400 hover:text-red-300" @click="togglePokemon(poke)">
                <X class="h-3 w-3" />
              </button>
            </div>
          </div>

          <!-- Evo stage filter -->
          <div class="mb-3 flex items-center gap-2">
            <CustomSelect
              :model-value="filterEvoStage"
              :options="evoStageOptions"
              @update:model-value="filterEvoStage = $event"
            />
          </div>

          <!-- Available Pokémon grid -->
          <div class="max-h-60 overflow-y-auto">
            <div v-if="availablePokemon.length === 0" class="py-4 text-center text-sm text-gray-500">
              {{ t('Aucun Pokémon de cette génération dans ton inventaire.', 'No Pokémon from this generation in your inventory.') }}
            </div>
            <div v-else class="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              <button
                v-for="poke in availablePokemon"
                :key="poke.id"
                class="flex flex-col items-center rounded-lg border p-1.5 text-center transition-all"
                :class="isInSelectedTeam(poke.id)
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'"
                :disabled="!isInSelectedTeam(poke.id) && raid.selectedTeam.length >= 6"
                @click="togglePokemon(poke)"
              >
                <img :src="pokeSprite(poke.slug, poke.isShiny)" class="h-8 w-8" />
                <span class="text-[9px] font-bold text-white truncate w-full">{{ t(poke.nameFr, poke.nameEn) }}</span>
                <span class="text-[8px] text-gray-500">Lv.{{ poke.level }} ★{{ poke.stars }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Ready button -->
        <button
          class="w-full rounded-xl py-3 text-center text-lg font-black transition-all disabled:opacity-40"
          :class="isReady
            ? 'bg-red-600 text-white hover:bg-red-500'
            : 'bg-green-600 text-white hover:bg-green-500'"
          :disabled="!canReady"
          @click="toggleReady"
        >
          {{ isReady ? t('Annuler (Prêt)', 'Cancel (Ready)') : t('PRÊT !', 'READY!') }}
        </button>
      </template>

      <!-- ── COMBAT PHASE ── -->
      <template v-if="raid.inCombat">
        <div class="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Zap class="h-4 w-4 text-yellow-400" />
            {{ t('Statistiques en direct', 'Live stats') }}
          </h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="p in [...raid.room.players].sort((a, b) => b.totalDamage - a.totalDamage)"
              :key="p.userId"
              class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white" :class="{ 'opacity-50': !p.connected }">
                    {{ p.username }}
                  </span>
                  <span v-if="!p.connected" class="text-[10px] text-red-400">{{ t('Déconnecté', 'Disconnected') }}</span>
                </div>
                <span class="text-sm font-bold text-yellow-400">{{ formatDamage(p.totalDamage) }}</span>
              </div>
              <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>DPS: {{ formatDamage(p.dps) }}/s</span>
                <span>{{ raid.totalDamage > 0 ? Math.round((p.totalDamage / raid.totalDamage) * 100) : 0 }}%</span>
              </div>
              <!-- Damage bar -->
              <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  class="h-full rounded-full bg-purple-500 transition-all duration-500"
                  :style="{ width: `${raid.totalDamage > 0 ? (p.totalDamage / raid.totalDamage) * 100 : 0}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── RESULT PHASE ── -->
      <template v-if="(raid.isVictory || raid.isDefeat) && raid.result">
        <div class="rounded-xl border-2 p-6 text-center" :class="raid.result.victory ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'">
          <div class="mb-4">
            <Trophy v-if="raid.result.victory" class="mx-auto h-12 w-12 text-yellow-400" />
            <X v-else class="mx-auto h-12 w-12 text-red-400" />
          </div>
          <h3 class="text-2xl font-black" :class="raid.result.victory ? 'text-green-400' : 'text-red-400'">
            {{ raid.result.victory ? t('VICTOIRE !', 'VICTORY!') : t('DÉFAITE...', 'DEFEAT...') }}
          </h3>
        </div>

        <!-- Individual results -->
        <div v-if="raid.result.victory" class="flex flex-col gap-3">
          <div
            v-for="pr in raid.result.players"
            :key="pr.userId"
            class="rounded-xl border border-gray-700 bg-gray-800 p-4"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">{{ pr.username }}</span>
              <span class="text-sm text-gray-400">{{ formatDamage(pr.totalDamage) }} {{ t('dégâts', 'damage') }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-2 text-xs">
              <span class="rounded-lg bg-yellow-500/10 px-2 py-1 text-yellow-400">🪙 +{{ pr.goldReward.toLocaleString() }}</span>
              <span v-for="(qty, size) in pr.candyReward" :key="size" class="rounded-lg bg-green-500/10 px-2 py-1 text-green-400">
                {{ size }}: +{{ qty }}
              </span>
              <span v-if="pr.caught" class="rounded-lg bg-purple-500/10 px-2 py-1 font-bold text-purple-400">
                <Sparkles class="mr-0.5 inline h-3 w-3" />
                {{ t('Capturé !', 'Caught!') }}
              </span>
              <span v-else class="rounded-lg bg-gray-700/50 px-2 py-1 text-gray-500">
                {{ t('Non capturé', 'Not caught') }}
              </span>
            </div>
          </div>
        </div>

        <button
          class="w-full rounded-xl bg-gray-700 py-3 text-center font-bold text-white transition-colors hover:bg-gray-600"
          @click="handleLeaveRoom"
        >
          {{ t('Retour', 'Back') }}
        </button>
      </template>
    </template>
    </template>
  </div>
</template>

<script lang="ts">
// Type color helper (duplicated from types.ts for template use)
const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
}

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#888'
}
</script>
