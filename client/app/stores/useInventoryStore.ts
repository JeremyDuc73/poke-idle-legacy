import { defineStore } from 'pinia'
import { canEvolveByLevel, canEvolveByItem, pokemonXpForLevel, getEvoStageMult } from '~/data/evolutions'
import type { Evolution } from '~/data/evolutions'
import { getRarityDpsMult } from '~/data/gacha'
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

interface InventoryState {
  collection: OwnedPokemon[]
  nextId: number
}

export const MAX_STARS = 5
export const MAX_LEVEL = 100

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    collection: [],
    nextId: 1,
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
        return sum + Math.floor(baseDmg * evoMult * rarityMult * shinyMult)
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
      pokemon.xp += amount
      const alreadyEvolved = new Set<string>()
      while (pokemon.level < MAX_LEVEL && pokemon.xp >= pokemonXpForLevel(pokemon.level + 1)) {
        pokemon.level++
        // Check auto-evolution by level (region-restricted), only once per evo target
        const evo = canEvolveByLevel(pokemon.slug, pokemon.level)
        if (evo && !alreadyEvolved.has(evo.toSlug)) {
          const targetGen = getGenForSlug(evo.toSlug)
          const maxGen = currentGeneration ?? 9
          if (targetGen <= maxGen) {
            this.applyEvolution(pokemon, evo)
            alreadyEvolved.add(evo.toSlug)
          }
        }
      }
    },

    evolveWithItem(pokemonId: number, itemId: string): boolean {
      const pokemon = this.collection.find((p) => p.id === pokemonId)
      if (!pokemon) return false
      const evo = canEvolveByItem(pokemon.slug, itemId)
      if (!evo) return false
      this.applyEvolution(pokemon, evo)
      return true
    },

    evolveAllWithItem(slug: string, itemId: string): number {
      const evo = canEvolveByItem(slug, itemId)
      if (!evo) return 0
      const targets = this.collection.filter((p) => p.slug === slug)
      for (const p of targets) {
        this.applyEvolution(p, evo)
      }
      return targets.length
    },

    applyEvolution(pokemon: OwnedPokemon, evo: Evolution) {
      // Living dex: keep the original pokemon, add the evolution as a new entry
      const evolved: OwnedPokemon = {
        id: this.nextId++,
        slug: evo.toSlug,
        nameFr: evo.toNameFr,
        nameEn: evo.toNameEn,
        level: pokemon.level,
        xp: pokemon.xp,
        stars: pokemon.stars,
        isShiny: pokemon.isShiny,
        rarity: pokemon.rarity,
        teamSlot: pokemon.teamSlot,
      }
      // Remove original from team, put evolved in its slot
      pokemon.teamSlot = null
      this.collection.push(evolved)
    },
  },
})
