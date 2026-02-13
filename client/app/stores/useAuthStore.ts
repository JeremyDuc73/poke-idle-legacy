import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { useSpeciesCache } from '~/composables/useSpeciesCache'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { getRarity } from '~/data/gacha'

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
    clickDamageBonus?: number
    teamDpsBonus?: number
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
          clickDamageBonus: data.player.clickDamageBonus ?? 0,
          teamDpsBonus: data.player.teamDpsBonus ?? 0,
          badges: data.player.badges,
          candies: (data.player as any).candies ?? { S: 0, M: 0, L: 0, XL: 0 },
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
          rarity: (p as any).rarity ?? getRarity(p.slug),
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
        const inventory = useInventoryStore()
        const { getSpeciesId } = useSpeciesCache()

        await api.post('/game/save', {
          gold: player.gold,
          gems: player.gems,
          xp: player.xp,
          level: player.level,
          currentGeneration: player.currentGeneration,
          currentZone: player.currentZone,
          currentStage: player.currentStage,
          clickDamage: player.clickDamage,
          clickDamageBonus: player.clickDamageBonus,
          teamDpsBonus: player.teamDpsBonus,
          badges: player.badges,
          candies: player.candies,
        })

        const pokemons = inventory.collection
          .map((p) => ({
            speciesId: getSpeciesId(p.slug),
            level: p.level,
            xp: p.xp,
            stars: p.stars,
            isShiny: p.isShiny,
            rarity: p.rarity ?? 'common',
            teamSlot: p.teamSlot,
          }))
          .filter((p) => p.speciesId !== null)

        if (pokemons.length > 0) {
          await api.post('/game/save-pokemons', { pokemons })
        }
      } catch (e) {
        console.error('Failed to save game state:', e)
      }
    },
  },
})
