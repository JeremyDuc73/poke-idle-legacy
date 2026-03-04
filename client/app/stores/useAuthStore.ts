import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { POKEDEX } from '~/data/pokedex'
import { useLocalStorage } from '~/composables/useLocalStorage'
import type { CandySize } from '~/stores/usePlayerStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useDaycareStore } from '~/stores/useDaycareStore'
import { getRarity } from '~/data/gacha'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: {
    id: number
    username: string
    email: string
    role: 'user' | 'admin'
  } | null
}

interface LoginResponse {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
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
    user: null,
  }),

  actions: {
    async register(username: string, email: string, password: string) {
      this.isLoading = true
      this.error = null
      try {
        const api = useApi()
        const response = await api.post<LoginResponse>('/api/auth/register', { username, email, password })
        this.user = response
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
        const response = await api.post<LoginResponse>('/api/auth/login', { email, password })
        this.user = response
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
        await api.post('/api/auth/logout')
      } catch {
        // ignore logout errors
      }
      this.isAuthenticated = false
      this.user = null
      const player = usePlayerStore()
      player.reset()
      navigateTo('/guide')
    },

    async checkAuth() {
      try {
        const api = useApi()
        const response = await api.get<LoginResponse>('/api/auth/me')
        this.user = response
        this.isAuthenticated = true
        await this.loadGameState()
      } catch {
        this.isAuthenticated = false
        this.user = null
        // En mode invité, charger depuis localStorage
        this.loadGuestGameState()
      }
    },

    loadGuestGameState() {
      const { loadGuestData } = useLocalStorage()
      const guestData = loadGuestData()
      
      if (!guestData) return
      
      const player = usePlayerStore()
      const inventory = useInventoryStore()
      const daycare = useDaycareStore()
      
      player.setPlayer({
        ...guestData.player,
        isLoggedIn: false,
      })
      
      inventory.collection = guestData.inventory.collection
      inventory.nextId = guestData.inventory.nextId
      daycare.slots = guestData.daycare.slots
    },

    async loadGameState() {
      // Mode invité : charger depuis localStorage
      if (!this.isAuthenticated) {
        this.loadGuestGameState()
        return null
      }
      
      try {
        const api = useApi()
        const data = await api.get<LoadGameResponse>('/api/game/load')
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

        // Overwrite localStorage bonuses with server data to prevent guest mode leakage
        player.saveBonuses()

        console.log(`[LOAD] Server returned ${data.pokemons.length} Pokémon`)
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

        // Restore daycare
        const daycareStore = useDaycareStore()
        const daycareData = (data.player as any).daycare
        if (Array.isArray(daycareData)) {
          daycareStore.slots = daycareData
        }

        return data.afkReward
      } catch (e) {
        console.error('Failed to load game state:', e)
        return null
      }
    },

    saveGuestGameState() {
      if (this.isAuthenticated) return
      
      const { saveGuestData } = useLocalStorage()
      const player = usePlayerStore()
      const inventory = useInventoryStore()
      const daycare = useDaycareStore()
      
      saveGuestData({
        player: {
          username: player.username || 'Invité',
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
          defeatedBosses: player.defeatedBosses,
        },
        inventory: {
          collection: inventory.collection,
          nextId: inventory.nextId,
        },
        daycare: {
          slots: daycare.slots,
        },
        lastSaved: Date.now(),
      })
    },

    async saveGameState(keepalive = false) {
      // Mode invité : sauvegarder dans localStorage
      if (!this.isAuthenticated) {
        this.saveGuestGameState()
        return
      }

      const api = useApi()
      const player = usePlayerStore()
      const inventory = useInventoryStore()

      const fetchOpts = keepalive ? { keepalive: true } : undefined

      const playerPayload = {
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
        daycare: useDaycareStore().slots,
      } as Record<string, unknown>

      // Save player data
      try {
        if (keepalive) {
          api.post('/api/game/save', playerPayload, fetchOpts)
        } else {
          await api.post('/api/game/save', playerPayload)
        }
      } catch (e) {
        console.error('[SAVE] Player save failed:', e)
      }

      // Save pokemons separately so player save failure doesn't block it
      try {
        const pokedexMap = new Map(POKEDEX.map((p) => [p.slug, p]))

        const pokemons = inventory.collection.map((p) => {
          const entry = pokedexMap.get(p.slug)
          return {
            slug: p.slug,
            nameFr: p.nameFr ?? entry?.nameFr ?? p.slug,
            nameEn: p.nameEn ?? entry?.nameEn ?? p.slug,
            pokedexId: entry?.id ?? 0,
            gen: entry?.gen ?? 1,
            level: p.level,
            xp: p.xp,
            stars: p.stars,
            isShiny: p.isShiny,
            rarity: p.rarity ?? 'common',
            teamSlot: p.teamSlot,
          }
        })

        console.log(`[SAVE] Collection: ${inventory.collection.length}, Sending: ${pokemons.length}`)

        if (pokemons.length > 0 || inventory.collectionCount === 0) {
          const pokemonsPayload = { pokemons } as Record<string, unknown>
          if (keepalive) {
            api.post('/api/game/save-pokemons', pokemonsPayload, fetchOpts)
          } else {
            await api.post('/api/game/save-pokemons', pokemonsPayload)
          }
          console.log(`[SAVE] Pokémon saved: ${pokemons.length}`)
        }
      } catch (e) {
        console.error('[SAVE] Pokémon save failed:', e)
      }
    },
  },
})
