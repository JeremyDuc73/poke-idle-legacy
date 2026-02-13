import { defineStore } from 'pinia'

const BONUSES_KEY = 'poke-idle-bonuses'

function loadBonusesFromStorage(): { clickDamageBonus: number; teamDpsBonus: number } {
  try {
    const raw = localStorage.getItem(BONUSES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { clickDamageBonus: 0, teamDpsBonus: 0 }
}

function saveBonusesToStorage(clickDamageBonus: number, teamDpsBonus: number) {
  try {
    localStorage.setItem(BONUSES_KEY, JSON.stringify({ clickDamageBonus, teamDpsBonus }))
  } catch { /* ignore */ }
}

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
const KILLS_PER_STAGE = 10

function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(50 * Math.pow(level, 1.8))
}

interface PlayerState {
  username: string
  gold: number
  gems: number
  xp: number
  level: number
  currentGeneration: number
  currentZone: number
  currentStage: number
  stageKills: number
  clickDamage: number
  clickDamageBonus: number
  teamDpsBonus: number
  badges: number
  isLoggedIn: boolean
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => {
    const saved = typeof localStorage !== 'undefined' ? loadBonusesFromStorage() : { clickDamageBonus: 0, teamDpsBonus: 0 }
    return {
      username: '',
      gold: 0,
      gems: 0,
      xp: 0,
      level: 1,
      currentGeneration: 1,
      currentZone: 1,
      currentStage: 1,
      stageKills: 0,
      clickDamage: 1,
      clickDamageBonus: saved.clickDamageBonus,
      teamDpsBonus: saved.teamDpsBonus,
      badges: 0,
      isLoggedIn: false,
    }
  },

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
    killsPerStage: (): number => KILLS_PER_STAGE,
    stageKillsPercent: (state): number => {
      return Math.min(100, ((state.stageKills ?? 0) / KILLS_PER_STAGE) * 100)
    },
    xpToNextLevel: (state): number => {
      return xpForLevel(state.level + 1)
    },
    xpPercent(state): number {
      const needed = xpForLevel(state.level + 1)
      const prevNeeded = xpForLevel(state.level)
      const progress = state.xp - prevNeeded
      const range = needed - prevNeeded
      return range > 0 ? Math.min(100, Math.max(0, (progress / range) * 100)) : 0
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

    addXp(amount: number) {
      this.xp += amount
      while (this.xp >= xpForLevel(this.level + 1)) {
        this.level++
      }
      this.clickDamage = Math.floor(1 + this.level * 0.5 + this.badges * 2) + this.clickDamageBonus
    },

    addStageKill(): boolean {
      this.stageKills = (this.stageKills ?? 0) + 1
      if (this.stageKills >= KILLS_PER_STAGE) {
        this.stageKills = 0
        this.advanceStage()
        return true
      }
      return false
    },

    advanceStage() {
      if (this.currentStage < STAGES_PER_ZONE) {
        this.currentStage++
      } else {
        this.currentStage = 1
        this.currentZone++
        this.badges++
      }
      this.stageKills = 0
    },

    retreatStage() {
      if (this.currentStage > 1) {
        this.currentStage--
      }
      this.stageKills = 0
    },

    saveBonuses() {
      saveBonusesToStorage(this.clickDamageBonus, this.teamDpsBonus)
    },

    setPlayer(data: Partial<PlayerState>) {
      Object.assign(this, data)
      this.saveBonuses()
    },

    reset() {
      this.$reset()
    },
  },
})
