import { defineStore } from 'pinia'
import { canEvolveByLevel, canEvolveByItem, pokemonXpForLevel, getEvoStageMult, EVOLUTIONS } from '~/data/evolutions'
import type { Evolution } from '~/data/evolutions'
import { getRarityDpsMult, getStarDpsMult, getRarity, hasKnownRarity, RARITY_DPS_MULT } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import { getGenForSlug, POKEDEX } from '~/data/pokedex'
import { useDaycareStore } from '~/stores/useDaycareStore'

const FILTERS_KEY = 'poke-idle-inventory-filters'

function loadFiltersFromStorage() {
  try {
    const raw = localStorage.getItem(FILTERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveFiltersToStorage(filters: Record<string, unknown>) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
  } catch { /* ignore */ }
}

export interface OwnedPokemon {
  id: number
  serverId: number | null
  slug: string
  nameFr: string
  nameEn: string
  level: number
  xp: number
  stars: number
  isShiny: boolean
  rarity: Rarity
  teamSlot: number | null
  hasEvolved?: boolean
}

interface SavedTeam {
  name: string
  pokemonIds: number[]
}

export interface EvolutionEvent {
  fromNameFr: string
  fromNameEn: string
  toNameFr: string
  toNameEn: string
  wasInTeam: boolean
  slot: number | null
}

interface InventoryState {
  collection: OwnedPokemon[]
  nextId: number
  savedTeams: SavedTeam[]
  evolutionLog: EvolutionEvent[]
  // UI filter state (persists across page navigations, not saved to server)
  filterSortBy: 'stars' | 'level' | 'name' | 'dps' | 'pokedex' | 'rarity'
  filterSearch: string
  filterType: string | null
  filterShiny: boolean | null
  filterTeam: boolean | null
  filterEvoStage: number | null
  filterGen: number | null
  showEvoNotifs: boolean
}

export const MAX_STARS = 5
export const MAX_LEVEL = 100

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => {
    const saved = typeof localStorage !== 'undefined' ? loadFiltersFromStorage() : {}
    return {
      collection: [],
      nextId: 1,
      savedTeams: [],
      evolutionLog: [],
      filterSortBy: saved.filterSortBy ?? 'stars',
      filterSearch: saved.filterSearch ?? '',
      filterType: saved.filterType ?? null,
      filterShiny: saved.filterShiny ?? null,
      filterTeam: saved.filterTeam ?? null,
      filterEvoStage: saved.filterEvoStage ?? null,
      filterGen: saved.filterGen ?? null,
      showEvoNotifs: true,
    }
  },

  getters: {
    team: (state): OwnedPokemon[] => {
      return state.collection
        .filter((p) => p.teamSlot !== null)
        .sort((a, b) => (a.teamSlot ?? 0) - (b.teamSlot ?? 0))
    },
    teamDps(): number {
      return this.team.reduce((sum: number, p: OwnedPokemon) => {
        const baseDmg = p.level * 2
        const evoMult = getEvoStageMult(p.slug)
        const rarityMult = RARITY_DPS_MULT[p.rarity] ?? 1.0
        const shinyMult = p.isShiny ? 4.0 : 1.0
        const starMult = getStarDpsMult(p.stars, p.isShiny)
        return sum + Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult)
      }, 0)
    },
    collectionCount: (state): number => state.collection.length,
    uniqueSlugs: (state): Set<string> => new Set(state.collection.map((p) => p.slug)),
    maxedSlugs: (state): Set<string> => {
      return new Set(
        state.collection.filter((p) => p.stars >= MAX_STARS).map((p) => p.slug)
      )
    },
    ownedSlugStars: (state): Map<string, number> => {
      const map = new Map<string, number>()
      for (const p of state.collection) {
        const current = map.get(p.slug) ?? 0
        if (p.stars > current) map.set(p.slug, p.stars)
      }
      return map
    },
  },

  actions: {
    persistFilters() {
      saveFiltersToStorage({
        filterSortBy: this.filterSortBy,
        filterSearch: this.filterSearch,
        filterType: this.filterType,
        filterShiny: this.filterShiny,
        filterTeam: this.filterTeam,
        filterEvoStage: this.filterEvoStage,
        filterGen: this.filterGen,
      })
    },

    // Migration: update rarity of existing Pokemon to match current gacha data
    migrateRarities() {
      for (const pokemon of this.collection) {
        // Only update rarity for Pokemon that exist in gacha pools
        // Evolved forms (Ivysaur, Charizard, etc.) are NOT in gacha - keep inherited rarity
        if (!hasKnownRarity(pokemon.slug)) continue
        const currentRarity = getRarity(pokemon.slug)
        if (pokemon.rarity !== currentRarity) {
          pokemon.rarity = currentRarity
        }
      }
    },

    // Migration: sync nameFr/nameEn from POKEDEX (fixes stale names from older saves)
    migrateNames() {
      const pokedexMap = new Map(POKEDEX.map(p => [p.slug, p]))
      for (const pokemon of this.collection) {
        const entry = pokedexMap.get(pokemon.slug)
        if (!entry) continue
        if (pokemon.nameFr !== entry.nameFr) pokemon.nameFr = entry.nameFr
        if (pokemon.nameEn !== entry.nameEn) pokemon.nameEn = entry.nameEn
      }
    },

    addPokemon(pokemon: Omit<OwnedPokemon, 'id' | 'serverId' | 'level' | 'xp' | 'teamSlot'>): {
      isNew: boolean
      isMaxed: boolean
      wasAlreadyMaxed: boolean
      pokemon: OwnedPokemon
    } {
      const existing = this.collection.find(
        (p) => p.slug === pokemon.slug && p.isShiny === pokemon.isShiny
      )

      if (existing) {
        const wasAlreadyMaxed = existing.stars >= MAX_STARS
        existing.stars = Math.min(existing.stars + 1, MAX_STARS)
        return { 
          isNew: false, 
          isMaxed: existing.stars >= MAX_STARS, 
          wasAlreadyMaxed,
          pokemon: existing 
        }
      }

      // Find first available team slot (1-6), or null if team is full
      const usedSlots = new Set(this.team.map((p) => p.teamSlot))
      let freeSlot: number | null = null
      for (let s = 1; s <= 6; s++) {
        if (!usedSlots.has(s)) {
          freeSlot = s
          break
        }
      }

      const newPokemon: OwnedPokemon = {
        ...pokemon,
        id: this.nextId++,
        serverId: null,
        level: 1,
        xp: 0,
        teamSlot: freeSlot,
      }
      this.collection.push(newPokemon)
      return { isNew: true, isMaxed: false, wasAlreadyMaxed: false, pokemon: newPokemon }
    },

    addPokemonRaw(pokemon: Omit<OwnedPokemon, 'id' | 'serverId' | 'level' | 'xp' | 'teamSlot'>): OwnedPokemon {
      const newPokemon: OwnedPokemon = {
        ...pokemon,
        id: this.nextId++,
        serverId: null,
        level: 1,
        xp: 0,
        teamSlot: null,
      }
      this.collection.push(newPokemon)
      return newPokemon
    },

    setTeamSlot(pokemonId: number, slot: number | null) {
      const pokemon = this.collection.find((p) => p.id === pokemonId)
      if (!pokemon) return

      if (slot !== null) {
        // Block if team already has 6 members and this pokemon isn't already in team
        if (pokemon.teamSlot === null && this.team.length >= 6) return
        // Ensure slot is within 1-6
        if (slot < 1 || slot > 6) return

        const occupant = this.collection.find((p) => p.teamSlot === slot)
        if (occupant) {
          occupant.teamSlot = pokemon.teamSlot
        }
      }
      pokemon.teamSlot = slot
    },

    removeFromTeam(pokemonId: number) {
      const pokemon = this.collection.find((p) => p.id === pokemonId)
      if (pokemon) pokemon.teamSlot = null
    },

    addPokemonXp(pokemonId: number, amount: number, currentGeneration?: number) {
      const pokemon = this.collection.find((p) => p.id === pokemonId)
      if (!pokemon || pokemon.level >= MAX_LEVEL) return
      const levelBefore = pokemon.level
      pokemon.xp += amount
      while (pokemon.level < MAX_LEVEL && pokemon.xp >= pokemonXpForLevel(pokemon.level + 1, pokemon.rarity)) {
        pokemon.level++
      }
      // After all level-ups, check if we crossed any evolution threshold
      if (pokemon.level > levelBefore) {
        const evo = canEvolveByLevel(pokemon.slug, pokemon.level)
        if (evo && evo.levelRequired && levelBefore < evo.levelRequired) {
          const targetGen = getGenForSlug(evo.toSlug)
          const maxGen = currentGeneration ?? 9
          if (targetGen <= maxGen) {
            // Reset hasEvolved so level-up evolutions work even if another evo path was taken
            pokemon.hasEvolved = false
            this.applyEvolution(pokemon, evo)
          }
        }
      }
    },

    evolveWithItem(pokemonId: number, itemId: string, currentGeneration?: number): boolean {
      const pokemon = this.collection.find((p) => p.id === pokemonId)
      if (!pokemon) return false
      const evo = canEvolveByItem(pokemon.slug, itemId)
      if (!evo) return false
      const maxGen = currentGeneration ?? 9
      if (getGenForSlug(evo.toSlug) > maxGen) return false
      // Reset hasEvolved so item evolutions always work (living dex: original stays for future stones)
      pokemon.hasEvolved = false
      this.applyEvolution(pokemon, evo)
      return true
    },

    evolveAllWithItem(slug: string, itemId: string, currentGeneration?: number): number {
      const evo = canEvolveByItem(slug, itemId)
      if (!evo) return 0
      const maxGen = currentGeneration ?? 9
      if (getGenForSlug(evo.toSlug) > maxGen) return 0
      const targets = this.collection.filter((p) => p.slug === slug)
      for (const p of targets) {
        // Reset hasEvolved so item evolutions always work (living dex: original stays for future stones)
        p.hasEvolved = false
        this.applyEvolution(p, evo)
      }
      return targets.length
    },

    applyEvolution(pokemon: OwnedPokemon, evo: Evolution) {
      // Guard: if this pokemon was already evolved, skip
      if (pokemon.hasEvolved) return
      
      // Mark this pokemon as having evolved to prevent multiple evolutions
      pokemon.hasEvolved = true
      
      const wasInTeam = pokemon.teamSlot !== null
      const slot = pokemon.teamSlot
      
      // Living dex: keep the original pokemon, add the evolution as a new entry at level 1
      const evolved: OwnedPokemon = {
        id: this.nextId++,
        serverId: null,
        slug: evo.toSlug,
        nameFr: evo.toNameFr,
        nameEn: evo.toNameEn,
        level: 1,
        xp: 0,
        stars: 1,
        isShiny: pokemon.isShiny,
        rarity: hasKnownRarity(evo.toSlug) ? getRarity(evo.toSlug) : pokemon.rarity,
        teamSlot: pokemon.teamSlot,
        hasEvolved: false,
      }
      // Remove original from team, put evolved in its slot
      pokemon.teamSlot = null
      this.collection.push(evolved)
      
      // Log evolution for toast notifications
      this.evolutionLog.push({
        fromNameFr: pokemon.nameFr,
        fromNameEn: pokemon.nameEn,
        toNameFr: evo.toNameFr,
        toNameEn: evo.toNameEn,
        wasInTeam,
        slot,
      })
    },

    // Team management
    saveTeam(name: string) {
      const currentTeam = this.team.map(p => p.id)
      if (currentTeam.length === 0) return
      
      const existingIndex = this.savedTeams.findIndex(t => t.name === name)
      if (existingIndex >= 0) {
        const existing = this.savedTeams[existingIndex]
        if (existing) {
          existing.pokemonIds = currentTeam
        }
      } else {
        this.savedTeams.push({ name, pokemonIds: currentTeam })
      }
    },

    loadTeam(name: string) {
      const saved = this.savedTeams.find(t => t.name === name)
      if (!saved) return

      const daycare = useDaycareStore()
      
      // Clear current team
      for (const p of this.collection) {
        p.teamSlot = null
      }
      
      // Load saved team — skip pokemon currently in daycare
      let slot = 1
      for (const id of saved.pokemonIds) {
        if (slot > 6) break
        const pokemon = this.collection.find(p => p.id === id)
        if (!pokemon) continue
        if (daycare.hasSlug(pokemon.slug, pokemon.isShiny)) continue
        pokemon.teamSlot = slot++
      }
    },

    deleteTeam(name: string) {
      this.savedTeams = this.savedTeams.filter(t => t.name !== name)
    },

    // Remove duplicate Pokemon (same slug + isShiny)
    // Keep the one with most stars, then highest level
    removeDuplicates() {
      const seen = new Map<string, OwnedPokemon>()
      const toRemove: number[] = []

      for (const pokemon of this.collection) {
        const key = `${pokemon.slug}-${pokemon.isShiny}`
        const existing = seen.get(key)

        if (!existing) {
          seen.set(key, pokemon)
        } else {
          // Compare: keep the one with more stars, then higher level
          const keepExisting = 
            existing.stars > pokemon.stars || 
            (existing.stars === pokemon.stars && existing.level >= pokemon.level)
          
          if (keepExisting) {
            toRemove.push(pokemon.id)
          } else {
            toRemove.push(existing.id)
            seen.set(key, pokemon)
          }
        }
      }

      if (toRemove.length > 0) {
        console.log(`[Inventory] Removing ${toRemove.length} duplicate Pokemon:`, toRemove)
        this.collection = this.collection.filter(p => !toRemove.includes(p.id))
      }
    },

    // Rebuild hasEvolved flags after loading from server (not persisted)
    // Match base forms to evolved forms 1:1 (don't mark ALL bases as evolved)
    rebuildHasEvolvedFlags() {
      // Reset all flags first
      for (const p of this.collection) p.hasEvolved = false

      // Count how many of each evolved form exist
      const evolvedCounts = new Map<string, number>()
      for (const p of this.collection) {
        const key = `${p.slug}-${p.isShiny}`
        evolvedCounts.set(key, (evolvedCounts.get(key) ?? 0) + 1)
      }

      // Track how many evolved forms have been "claimed" by base forms
      const claimed = new Map<string, number>()

      for (const pokemon of this.collection) {
        const evos = EVOLUTIONS.filter(e => e.fromSlug === pokemon.slug)
        for (const evo of evos) {
          const key = `${evo.toSlug}-${pokemon.isShiny}`
          const total = evolvedCounts.get(key) ?? 0
          const used = claimed.get(key) ?? 0
          if (total > used) {
            pokemon.hasEvolved = true
            claimed.set(key, used + 1)
            break
          }
        }
      }
    },

    // Check all possible evolutions for all Pokemon
    // Uses target existence check instead of hasEvolved to support multi-evolution (Slowpoke→Slowbro/Slowking)
    checkAllEvolutions(currentGeneration?: number) {
      const maxGen = currentGeneration ?? 9
      // Build set of existing slug+shiny combos to avoid duplicates
      const existingKeys = new Set<string>()
      for (const p of this.collection) existingKeys.add(`${p.slug}-${p.isShiny}`)

      for (const pokemon of this.collection) {
        const evo = canEvolveByLevel(pokemon.slug, pokemon.level)
        if (!evo || !evo.levelRequired || pokemon.level < evo.levelRequired) continue
        const targetKey = `${evo.toSlug}-${pokemon.isShiny}`
        if (existingKeys.has(targetKey)) continue // Target already exists
        const targetGen = getGenForSlug(evo.toSlug)
        if (targetGen > maxGen) continue
        pokemon.hasEvolved = false
        this.applyEvolution(pokemon, evo)
        existingKeys.add(targetKey)
      }
    },

    // Migrate starter evolutions to epic rarity
    migrateStarterRarities() {
      const starterSlugs = new Set([
        // Gen 1
        'bulbasaur', 'ivysaur', 'venusaur',
        'charmander', 'charmeleon', 'charizard',
        'squirtle', 'wartortle', 'blastoise',
        // Gen 2
        'chikorita', 'bayleef', 'meganium',
        'cyndaquil', 'quilava', 'typhlosion',
        'totodile', 'croconaw', 'feraligatr',
        // Gen 3
        'treecko', 'grovyle', 'sceptile',
        'torchic', 'combusken', 'blaziken',
        'mudkip', 'marshtomp', 'swampert',
        // Gen 4
        'turtwig', 'grotle', 'torterra',
        'chimchar', 'monferno', 'infernape',
        'piplup', 'prinplup', 'empoleon',
      ])

      for (const pokemon of this.collection) {
        if (starterSlugs.has(pokemon.slug) && pokemon.rarity !== 'epic') {
          pokemon.rarity = 'epic'
        }
      }
    },

    // Migrate Gen 4 evolutions to correct rarity based on their base form
    migrateGen4Evolutions() {
      // Map: evolution slug → correct rarity based on base form
      const evolutionRarities: Record<string, 'common' | 'rare' | 'epic'> = {
        // Budew → Roselia → Roserade (common line)
        'roserade': 'common',
        // Burmy → Wormadam/Mothim (common)
        'wormadam': 'common',
        'mothim': 'common',
        // Aipom → Ambipom (common)
        'ambipom': 'common',
        // Sneasel → Weavile (rare)
        'weavile': 'rare',
        // Magneton → Magnezone (rare - from Magnemite common)
        'magnezone': 'rare',
        // Lickitung → Lickilicky (rare)
        'lickilicky': 'rare',
        // Rhydon → Rhyperior (rare)
        'rhyperior': 'rare',
        // Tangela → Tangrowth (rare)
        'tangrowth': 'rare',
        // Electabuzz → Electivire (rare)
        'electivire': 'rare',
        // Magmar → Magmortar (rare)
        'magmortar': 'rare',
        // Togetic → Togekiss (epic - from Togepi)
        'togekiss': 'epic',
        // Yanma → Yanmega (common)
        'yanmega': 'common',
        // Eevee → Glaceon/Leafeon (epic)
        'glaceon': 'epic',
        'leafeon': 'epic',
        // Gligar → Gliscor (rare)
        'gliscor': 'rare',
        // Piloswine → Mamoswine (common from Swinub)
        'mamoswine': 'common',
        // Porygon2 → Porygon-Z (rare)
        'porygonz': 'rare',
        // Kirlia → Gallade (rare from Ralts)
        'gallade': 'rare',
        // Mime Jr. → Mr. Mime (common)
        'mrmime': 'rare', // Actually Mr. Mime is rare in gacha
        // Dusclops → Dusknoir (rare from Duskull)
        'dusknoir': 'rare',
        // Snorunt → Froslass (common)
        'froslass': 'common',
      }

      for (const pokemon of this.collection) {
        const correctRarity = evolutionRarities[pokemon.slug]
        if (correctRarity && pokemon.rarity !== correctRarity) {
          pokemon.rarity = correctRarity
        }
      }
    },
  },
})
