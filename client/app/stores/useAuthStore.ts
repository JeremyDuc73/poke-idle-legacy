import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { POKEDEX } from '~/data/pokedex'
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
}

// Save lock to prevent concurrent server saves (race condition causes pokemon duplication)
let _saveLock = false
let _savePending = false

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
      }
    },

    async loadGameState() {
      if (!this.isAuthenticated) return null
      
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
          defeatedBosses: (data.player as any).defeatedBosses ?? [],
          candies: (data.player as any).candies ?? { S: 0, M: 0, L: 0, XL: 0 },
          adminVersion: (data.player as any).adminVersion ?? 0,
          shinyCharms: (data.player as any).shinyCharms ?? 0,
          completedPokedexGens: (data.player as any).completedPokedexGens ?? [],
          penaltyType: (data.player as any).penaltyType ?? null,
          penaltyPercent: (data.player as any).penaltyPercent ?? 0,
          avatarUrl: (data.player as any).avatarUrl ?? null,
          isLoggedIn: true,
        })

        // Overwrite localStorage bonuses with server data
        player.saveBonuses()

        // If clickDamageBonus is 0 (e.g. after admin reset), clear purchased click boosts
        if ((data.player.clickDamageBonus ?? 0) === 0) {
          localStorage.removeItem('poke-idle-click-boosts')
        }

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
        // Fix rarities for existing Pokemon that inherited wrong rarity from parent
        inventory.migrateRarities()
        // Fix stale FR/EN names
        inventory.migrateNames()
        // Rebuild hasEvolved flags so checkAllEvolutions doesn't re-create existing evolutions
        inventory.rebuildHasEvolvedFlags()

        // Restore daycare
        const daycareStore = useDaycareStore()
        const daycareData = (data.player as any).daycare
        if (Array.isArray(daycareData)) {
          daycareStore.slots = daycareData.map((s: any) => ({ ...s, isShiny: s.isShiny ?? false }))
        }

        return null
      } catch (e) {
        console.error('Failed to load game state:', e)
        return null
      }
    },

    async saveGameState(keepalive = false) {
      if (!this.isAuthenticated) return

      // Prevent concurrent saves (race condition causes pokemon duplication)
      if (_saveLock) {
        _savePending = true
        return
      }
      _saveLock = true
      _savePending = false

      try {
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
          defeatedBosses: player.defeatedBosses,
          daycare: useDaycareStore().slots,
          adminVersion: player.adminVersion,
          shinyCharms: player.shinyCharms,
          completedPokedexGens: player.completedPokedexGens,
        } as Record<string, unknown>

        // Save player data
        try {
          if (keepalive) {
            api.post('/api/game/save', playerPayload, fetchOpts)
          } else {
            const saveResult = await api.post<{ reload?: boolean }>('/api/game/save', playerPayload)
            if (saveResult?.reload) {
              console.log('[SAVE] Admin override detected — reloading game state')
              await this.loadGameState()
              return // lock released in finally
            }
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

          if (pokemons.length > 0 || inventory.collectionCount === 0) {
            const pokemonsPayload = { pokemons, adminVersion: player.adminVersion } as Record<string, unknown>
            if (keepalive) {
              api.post('/api/game/save-pokemons', pokemonsPayload, fetchOpts)
            } else {
              await api.post('/api/game/save-pokemons', pokemonsPayload)
            }
          }
        } catch (e) {
          console.error('[SAVE] Pokémon save failed:', e)
        }
      } finally {
        // Always release lock, even on error or early return
        _saveLock = false
      }

      // Retry if a save was requested while we were saving
      if (_savePending) {
        _savePending = false
        this.saveGameState()
      }
    },
  },
})
