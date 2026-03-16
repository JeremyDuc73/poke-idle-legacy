/**
 * Pinia store for raid state management.
 */

import { defineStore } from 'pinia'

export interface RaidBoss {
  slug: string
  nameFr: string
  nameEn: string
  types: string[]
  isShiny: boolean
  maxHp: number
  currentHp: number
}

export interface RaidPlayerState {
  userId: number
  username: string
  team: Array<{
    slug: string
    level: number
    stars: number
    isShiny: boolean
    rarity: string
  }>
  ready: boolean
  connected: boolean
  dps: number
  totalDamage: number
}

export interface RaidRoomState {
  code: string
  generation: number
  phase: 'lobby' | 'combat' | 'victory' | 'defeat' | 'closed'
  boss: RaidBoss
  hostUserId: number
  timeLeft: number
  players: RaidPlayerState[]
}

export interface RaidLobbyEntry {
  code: string
  generation: number
  bossSlug: string
  bossNameFr: string
  bossNameEn: string
  bossIsShiny: boolean
  playerCount: number
  maxPlayers: number
}

export interface RaidResultData {
  victory: boolean
  bossSlug: string
  bossIsShiny: boolean
  players: Array<{
    userId: number
    username: string
    totalDamage: number
    caught: boolean
    goldReward: number
    candyReward: Record<string, number>
  }>
}

export const useRaidStore = defineStore('raid', {
  state: () => ({
    connected: false,
    room: null as RaidRoomState | null,
    lobbies: [] as RaidLobbyEntry[],
    result: null as RaidResultData | null,
    pendingResult: null as RaidResultData | null,

    // Local team selection (before sending to server)
    selectedTeam: [] as Array<{
      id: number
      serverId: number | null
      slug: string
      nameFr: string
      nameEn: string
      level: number
      stars: number
      isShiny: boolean
      rarity: string
    }>,
  }),

  getters: {
    inRoom: (state) => state.room !== null,
    inLobby: (state) => state.room?.phase === 'lobby',
    inCombat: (state) => state.room?.phase === 'combat',
    isVictory: (state) => state.room?.phase === 'victory',
    isDefeat: (state) => state.room?.phase === 'defeat',
    bossHpPercent: (state) => {
      if (!state.room?.boss) return 0
      return Math.max(0, (state.room.boss.currentHp / state.room.boss.maxHp) * 100)
    },
    totalDamage: (state) => {
      if (!state.room) return 0
      return state.room.players.reduce((sum, p) => sum + p.totalDamage, 0)
    },
  },

  actions: {
    updateRoomState(data: RaidRoomState) {
      this.room = data
      // Clear result when entering a new room
      if (data.phase === 'lobby') {
        this.result = null
      }
    },

    updateTick(data: {
      bossCurrentHp: number
      bossMaxHp: number
      timeLeft: number
      players: Array<{ userId: number; username: string; dps: number; totalDamage: number; connected: boolean }>
    }) {
      if (!this.room) return
      this.room.boss.currentHp = data.bossCurrentHp
      this.room.boss.maxHp = data.bossMaxHp
      this.room.timeLeft = data.timeLeft
      // Update player stats
      for (const update of data.players) {
        const player = this.room.players.find(p => p.userId === update.userId)
        if (player) {
          player.dps = update.dps
          player.totalDamage = update.totalDamage
          player.connected = update.connected
        }
      }
    },

    setResult(data: RaidResultData) {
      this.result = data
      if (this.room) {
        this.room.phase = data.victory ? 'victory' : 'defeat'
      }
    },

    setPendingResult(data: RaidResultData) {
      this.pendingResult = data
    },

    clearPendingResult() {
      this.pendingResult = null
    },

    // Team selection helpers
    toggleTeamMember(pokemon: typeof this.selectedTeam[0]) {
      const idx = this.selectedTeam.findIndex(p => p.id === pokemon.id)
      if (idx >= 0) {
        this.selectedTeam.splice(idx, 1)
      } else if (this.selectedTeam.length < 6) {
        this.selectedTeam.push(pokemon)
      }
    },

    clearTeam() {
      this.selectedTeam = []
    },

    reset() {
      this.room = null
      this.result = null
      this.selectedTeam = []
    },
  },
})
