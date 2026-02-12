import { defineStore } from 'pinia'

export interface OwnedPokemon {
  id: number
  slug: string
  nameFr: string
  nameEn: string
  level: number
  xp: number
  stars: number
  isShiny: boolean
  teamSlot: number | null
}

interface InventoryState {
  collection: OwnedPokemon[]
  nextId: number
}

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
        return sum + Math.floor(p.level * (1 + p.stars * 0.25))
      }, 0)
    },
    collectionCount: (state): number => state.collection.length,
    uniqueSlugs: (state): Set<string> => new Set(state.collection.map((p) => p.slug)),
  },

  actions: {
    addPokemon(pokemon: Omit<OwnedPokemon, 'id' | 'level' | 'xp' | 'teamSlot'>): {
      isNew: boolean
      pokemon: OwnedPokemon
    } {
      const existing = this.collection.find(
        (p) => p.slug === pokemon.slug && p.isShiny === pokemon.isShiny
      )

      if (existing) {
        existing.stars = Math.min(existing.stars + 1, 5)
        return { isNew: false, pokemon: existing }
      }

      const newPokemon: OwnedPokemon = {
        ...pokemon,
        id: this.nextId++,
        level: 1,
        xp: 0,
        teamSlot: this.team.length < 6 ? this.team.length + 1 : null,
      }
      this.collection.push(newPokemon)
      return { isNew: true, pokemon: newPokemon }
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
  },
})
