import { defineStore } from 'pinia'

interface PlayerState {
  username: string
  gold: number
  gems: number
  currentStage: number
  isLoggedIn: boolean
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    username: '',
    gold: 0,
    gems: 0,
    currentStage: 1,
    isLoggedIn: false,
  }),

  getters: {
    formattedGold: (state): string => {
      return state.gold.toLocaleString()
    },
    formattedGems: (state): string => {
      return state.gems.toLocaleString()
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
      this.currentStage++
    },

    setPlayer(data: Partial<PlayerState>) {
      Object.assign(this, data)
    },

    reset() {
      this.$reset()
    },
  },
})
