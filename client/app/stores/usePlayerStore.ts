import { defineStore } from 'pinia'
import { GENERATIONS } from '~/data/zones'

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
  // Augmentation: 75 → 120 (×1.6) + exposant 1.9 → 2.0
  return Math.floor(120 * Math.pow(level, 2.0))
}

export type CandySize = 'S' | 'M' | 'L' | 'XL'

export const CANDY_XP: Record<CandySize, number> = { S: 100, M: 500, L: 2000, XL: 10000 }

// Base candy costs (Gen 1)
const CANDY_COST_BASE: Record<CandySize, number> = { S: 100, M: 500, L: 2000, XL: 10000 }

// Candy cost scales with player generation (like evolution items)
export function getCandyCost(size: CandySize, generation: number): number {
  return Math.round(CANDY_COST_BASE[size] * Math.pow(2, generation - 1))
}

// Legacy export for compatibility (uses gen 1 prices)
export const CANDY_COST: Record<CandySize, number> = CANDY_COST_BASE

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
  defeatedBosses: string[] // Boss slugs defeated (unique)
  isLoggedIn: boolean
  candies: Record<CandySize, number>
  regionUnlockMessage: string | null
  combatGeneration: number | null
  combatZone: number | null
  adminVersion: number
  shinyCharms: number
  completedPokedexGens: number[]
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
      defeatedBosses: [],
      isLoggedIn: false,
      candies: { S: 0, M: 0, L: 0, XL: 0 },
      regionUnlockMessage: null,
      combatGeneration: null,
      combatZone: null,
      adminVersion: 0,
      shinyCharms: 0,
      completedPokedexGens: [],
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
      return state.combatGeneration === null && state.currentStage === STAGES_PER_ZONE
    },
    isFarming: (state): boolean => {
      return state.combatGeneration !== null
    },
    activeCombatGen: (state): number => {
      return state.combatGeneration ?? state.currentGeneration
    },
    activeCombatZone: (state): number => {
      return state.combatZone ?? state.currentZone
    },
    stageLabel: (state): string => {
      if (state.combatGeneration !== null) {
        const region = GENERATION_NAMES[state.combatGeneration] ?? '???'
        return `${region} - Zone ${state.combatZone ?? 1} (Farm)`
      }
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
    teamDpsMult(state): number {
      return 1
    },
    goldBonusMult(state): number {
      return 1
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

    recalcClickDamage() {
      // Clics: √(level) scaling — vise ~35% des dégâts totaux (30-40%)
      this.clickDamage = Math.floor(5 + Math.sqrt(this.level) * 7 + this.badges * 3) + this.clickDamageBonus
    },

    addXp(amount: number) {
      this.xp += amount
      while (this.xp >= xpForLevel(this.level + 1)) {
        this.level++
      }
      this.recalcClickDamage()
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
        
        // Add badge only if boss is defeated for the first time
        const gen = GENERATIONS.find((g) => g.id === this.currentGeneration)
        const zone = gen?.zones[this.currentZone - 1]
        const bossSlug = zone?.boss.slug
        
        if (bossSlug && !this.defeatedBosses.includes(bossSlug)) {
          this.defeatedBosses.push(bossSlug)
          this.badges++
        }
        
        // Check if there are more zones in the current generation
        if (gen && this.currentZone >= gen.zones.length) {
          // Move to next generation
          const nextGen = GENERATIONS.find((g) => g.id === this.currentGeneration + 1)
          if (nextGen) {
            this.currentGeneration++
            this.currentZone = 1
            // Show congratulations message
            const newRegionName = GENERATION_NAMES[this.currentGeneration] ?? 'Unknown'
            this.regionUnlockMessage = `🎉 Félicitations ! Vous avez débloqué la région ${newRegionName} !`
            setTimeout(() => { this.regionUnlockMessage = null }, 5000)
          } else {
            // Last generation — stay at last zone
            this.currentZone = gen.zones.length
          }
        } else {
          this.currentZone++
        }
      }
      this.stageKills = 0
    },

    retreatStage() {
      if (this.currentStage > 1) {
        this.currentStage--
      }
      this.stageKills = 0
    },

    travelTo(gen: number, zone: number) {
      this.combatGeneration = gen
      this.combatZone = zone
      this.stageKills = 0
    },

    returnToFrontier() {
      this.combatGeneration = null
      this.combatZone = null
      this.stageKills = 0
    },

    buyCandy(size: CandySize, qty: number = 1): boolean {
      const cost = getCandyCost(size, this.currentGeneration) * qty
      if (!this.spendGold(cost)) return false
      this.candies[size] = (this.candies[size] || 0) + qty
      return true
    },

    useCandy(size: CandySize): boolean {
      const count = this.candies[size] || 0
      if (count <= 0) return false
      this.candies[size] = count - 1
      return true
    },

    saveBonuses() {
      saveBonusesToStorage(this.clickDamageBonus, this.teamDpsBonus)
    },

    setPlayer(data: Partial<PlayerState>) {
      Object.assign(this, data)
      // Ensure candies always has all keys with numeric values
      for (const k of ['S', 'M', 'L', 'XL'] as CandySize[]) {
        if (typeof this.candies[k] !== 'number' || isNaN(this.candies[k])) this.candies[k] = 0
      }
      // Ensure new fields have safe defaults (old saves may not include them)
      if (typeof this.shinyCharms !== 'number' || isNaN(this.shinyCharms)) this.shinyCharms = 0
      if (!Array.isArray(this.completedPokedexGens)) this.completedPokedexGens = []
      this.recalcClickDamage()
      this.saveBonuses()
    },

    reset() {
      this.$reset()
    },
  },
})
