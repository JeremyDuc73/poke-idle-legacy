import { defineStore } from 'pinia'
import { canEvolveByLevel, canEvolveByItem, pokemonXpForLevel, getEvoStageMult } from '~/data/evolutions'
import type { Evolution } from '~/data/evolutions'
import { getRarityDpsMult, getStarDpsMult, getRarity } from '~/data/gacha'
import type { Rarity } from '~/data/gacha'
import { getGenForSlug } from '~/data/pokedex'

export interface OwnedPokemon {
  id: number
  slug: string
  nameFr: string
  nameEn: string
  level: number
  xp: number
  stars: number
  isShiny: boolean
  rarity: Rarity
  teamSlot: number | null
}

interface SavedTeam {
  name: string
  pokemonIds: number[]
}

interface InventoryState {
  collection: OwnedPokemon[]
  nextId: number
  savedTeams: SavedTeam[]
}

export const MAX_STARS = 5
export const MAX_LEVEL = 100

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    collection: [],
    nextId: 1,
    savedTeams: [],
  }),

  getters: {
    team: (state): OwnedPokemon[] => {
      return state.collection
        .filter((p) => p.teamSlot !== null)
        .sort((a, b) => (a.teamSlot ?? 0) - (b.teamSlot ?? 0))
    },
    teamDps(): number {
      return this.team.reduce((sum: number, p: OwnedPokemon) => {
        const baseDmg = p.level
        const evoMult = getEvoStageMult(p.slug)
        const rarityMult = getRarityDpsMult(p.slug)
        const shinyMult = p.isShiny ? 1.2 : 1.0
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
    // Migration: update rarity of existing Pokemon to match current gacha data
    migrateRarities() {
      for (const pokemon of this.collection) {
        const currentRarity = getRarity(pokemon.slug)
        if (pokemon.rarity !== currentRarity) {
          pokemon.rarity = currentRarity
        }
      }
    },

    addPokemon(pokemon: Omit<OwnedPokemon, 'id' | 'level' | 'xp' | 'teamSlot'>): {
      isNew: boolean
      isMaxed: boolean
      pokemon: OwnedPokemon
    } {
      const existing = this.collection.find(
        (p) => p.slug === pokemon.slug && p.isShiny === pokemon.isShiny
      )

      if (existing) {
        if (existing.stars >= MAX_STARS) {
          return { isNew: false, isMaxed: true, pokemon: existing }
        }
        existing.stars = Math.min(existing.stars + 1, MAX_STARS)
        return { isNew: false, isMaxed: existing.stars >= MAX_STARS, pokemon: existing }
      }

      const newPokemon: OwnedPokemon = {
        ...pokemon,
        id: this.nextId++,
        level: 1,
        xp: 0,
        teamSlot: this.team.length < 6 ? this.team.length + 1 : null,
      }
      this.collection.push(newPokemon)
      return { isNew: true, isMaxed: false, pokemon: newPokemon }
    },

    addPokemonRaw(pokemon: Omit<OwnedPokemon, 'id' | 'level' | 'xp' | 'teamSlot'>): OwnedPokemon {
      const newPokemon: OwnedPokemon = {
        ...pokemon,
        id: this.nextId++,
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
        this.applyEvolution(p, evo)
      }
      return targets.length
    },

    applyEvolution(pokemon: OwnedPokemon, evo: Evolution) {
      // Living dex: keep the original pokemon, add the evolution as a new entry at level 1
      const evolved: OwnedPokemon = {
        id: this.nextId++,
        slug: evo.toSlug,
        nameFr: evo.toNameFr,
        nameEn: evo.toNameEn,
        level: 1,
        xp: 0,
        stars: 1,
        isShiny: pokemon.isShiny,
        rarity: pokemon.rarity, // Inherit rarity from original pokemon
        teamSlot: pokemon.teamSlot,
      }
      // Remove original from team, put evolved in its slot
      pokemon.teamSlot = null
      this.collection.push(evolved)
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
      
      // Clear current team
      for (const p of this.collection) {
        p.teamSlot = null
      }
      
      // Load saved team
      saved.pokemonIds.forEach((id, index) => {
        const pokemon = this.collection.find(p => p.id === id)
        if (pokemon) {
          pokemon.teamSlot = index + 1
        }
      })
    },

    deleteTeam(name: string) {
      this.savedTeams = this.savedTeams.filter(t => t.name !== name)
    },

    // Check all possible evolutions for all Pokemon
    checkAllEvolutions(currentGeneration?: number) {
      const maxGen = currentGeneration ?? 9
      for (const pokemon of this.collection) {
        if (pokemon.level >= MAX_LEVEL) continue
        
        // Check level-based evolution
        const evo = canEvolveByLevel(pokemon.slug, pokemon.level)
        if (evo && evo.levelRequired && pokemon.level >= evo.levelRequired) {
          const targetGen = getGenForSlug(evo.toSlug)
          if (targetGen <= maxGen) {
            this.applyEvolution(pokemon, evo)
          }
        }
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
  },
})
