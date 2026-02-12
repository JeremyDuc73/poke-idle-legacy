import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface LoginResponse {
  id: number
  username: string
  email: string
}

interface LoadGameResponse {
  player: {
    id: number
    username: string
    gold: number
    gems: number
    xp: number
    level: number
    currentGeneration: number
    currentZone: number
    currentStage: number
    clickDamage: number
    badges: number
  }
  pokemons: Array<{
    id: number
    speciesId: number
    slug: string
    nameFr: string
    nameEn: string
    level: number
    xp: number
    stars: number
    isShiny: boolean
    teamSlot: number | null
  }>
  afkReward: {
    hoursAway: number
    goldEarned: number
    enemiesDefeated: number
  } | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  actions: {
    async register(username: string, email: string, password: string) {
      this.isLoading = true
      this.error = null
      try {
        const api = useApi()
        await api.post<LoginResponse>('/auth/register', { username, email, password })
        this.isAuthenticated = true
        await this.loadGameState()
      } catch (e: any) {
        this.error = e.message
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async login(email: string, password: string) {
      this.isLoading = true
      this.error = null
      try {
        const api = useApi()
        await api.post<LoginResponse>('/auth/login', { email, password })
        this.isAuthenticated = true
        await this.loadGameState()
      } catch (e: any) {
        this.error = e.message
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        const api = useApi()
        await this.saveGameState()
        await api.post('/auth/logout')
      } catch {
        // ignore logout errors
      }
      this.isAuthenticated = false
      const player = usePlayerStore()
      player.reset()
    },

    async checkAuth() {
      try {
        const api = useApi()
        await api.get('/auth/me')
        this.isAuthenticated = true
        await this.loadGameState()
      } catch {
        this.isAuthenticated = false
      }
    },

    async loadGameState() {
      try {
        const api = useApi()
        const data = await api.get<LoadGameResponse>('/game/load')
        const player = usePlayerStore()
        const inventory = useInventoryStore()

        player.setPlayer({
          username: data.player.username,
          gold: data.player.gold,
          gems: data.player.gems,
          xp: data.player.xp,
          level: data.player.level,
          currentGeneration: data.player.currentGeneration,
          currentZone: data.player.currentZone,
          currentStage: data.player.currentStage,
          clickDamage: data.player.clickDamage,
          badges: data.player.badges,
          isLoggedIn: true,
        })

        inventory.collection = data.pokemons.map((p, i) => ({
          id: i + 1,
          slug: p.slug,
          nameFr: p.nameFr,
          nameEn: p.nameEn,
          level: p.level,
          xp: p.xp,
          stars: p.stars,
          isShiny: p.isShiny,
          teamSlot: p.teamSlot,
        }))
        inventory.nextId = data.pokemons.length + 1

        return data.afkReward
      } catch (e) {
        console.error('Failed to load game state:', e)
        return null
      }
    },

    async saveGameState() {
      if (!this.isAuthenticated) return

      try {
        const api = useApi()
        const player = usePlayerStore()

        await api.post('/game/save', {
          gold: player.gold,
          gems: player.gems,
          xp: player.xp,
          level: player.level,
          currentGeneration: player.currentGeneration,
          currentZone: player.currentZone,
          currentStage: player.currentStage,
          clickDamage: player.clickDamage,
          badges: player.badges,
        })
      } catch (e) {
        console.error('Failed to save game state:', e)
      }
    },
  },
})
