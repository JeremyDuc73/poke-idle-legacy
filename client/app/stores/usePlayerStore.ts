import { defineStore } from 'pinia'

const GENERATION_NAMES: Record<number, string> = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Paldea',
}

const STAGES_PER_ZONE = 10

interface PlayerState {
  username: string
  gold: number
  gems: number
  currentGeneration: number
  currentZone: number
  currentStage: number
  clickDamage: number
  isLoggedIn: boolean
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    username: '',
    gold: 0,
    gems: 0,
    currentGeneration: 1,
    currentZone: 1,
    currentStage: 1,
    clickDamage: 1,
    isLoggedIn: false,
  }),

  getters: {
    formattedGold: (state): string => {
      return state.gold.toLocaleString()
    },
    formattedGems: (state): string => {
      return state.gems.toLocaleString()
    },
    regionName: (state): string => {
      return GENERATION_NAMES[state.currentGeneration] ?? 'Unknown'
    },
    isBossStage: (state): boolean => {
      return state.currentStage === STAGES_PER_ZONE
    },
    stageLabel: (state): string => {
      const region = GENERATION_NAMES[state.currentGeneration] ?? '???'
      return `${region} - Zone ${state.currentZone} - Stage ${state.currentStage}/${STAGES_PER_ZONE}`
    },
  },

  actions: {
    addGold(amount: number) {
      this.gold += amount
    },

    spendGold(amount: number): boolean {
      if (this.gold < amount) return false
      this.gold -= amount
      return true
    },

    addGems(amount: number) {
      this.gems += amount
    },

    spendGems(amount: number): boolean {
      if (this.gems < amount) return false
      this.gems -= amount
      return true
    },

    advanceStage() {
      if (this.currentStage < STAGES_PER_ZONE) {
        this.currentStage++
      } else {
        this.currentStage = 1
        this.currentZone++
      }
    },

    retreatStage() {
      if (this.currentStage > 1) {
        this.currentStage--
      }
    },

    setPlayer(data: Partial<PlayerState>) {
      Object.assign(this, data)
    },

    reset() {
      this.$reset()
    },
  },
})
