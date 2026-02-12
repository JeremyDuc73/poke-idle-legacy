import { defineStore } from 'pinia'

interface Enemy {
  name: string
  sprite: string
  maxHp: number
  currentHp: number
  level: number
  goldReward: number
}

interface CombatState {
  enemy: Enemy | null
  clickDamage: number
  autoDamage: number
  isFighting: boolean
  totalClicks: number
  totalKills: number
}

export const useCombatStore = defineStore('combat', {
  state: (): CombatState => ({
    enemy: null,
    clickDamage: 1,
    autoDamage: 0,
    isFighting: false,
    totalClicks: 0,
    totalKills: 0,
  }),

  getters: {
    enemyHpPercent: (state): number => {
      if (!state.enemy) return 0
      return (state.enemy.currentHp / state.enemy.maxHp) * 100
    },
    isEnemyDead: (state): boolean => {
      return state.enemy !== null && state.enemy.currentHp <= 0
    },
  },

  actions: {
    setEnemy(enemy: Enemy) {
      this.enemy = enemy
      this.isFighting = true
    },

    clickAttack() {
      if (!this.enemy || this.enemy.currentHp <= 0) return
      this.enemy.currentHp = Math.max(0, this.enemy.currentHp - this.clickDamage)
      this.totalClicks++
    },

    autoAttackTick() {
      if (!this.enemy || this.enemy.currentHp <= 0 || this.autoDamage <= 0) return
      this.enemy.currentHp = Math.max(0, this.enemy.currentHp - this.autoDamage)
    },

    killEnemy() {
      this.totalKills++
      this.enemy = null
      this.isFighting = false
    },

    upgradeClickDamage(amount: number) {
      this.clickDamage += amount
    },

    upgradeAutoDamage(amount: number) {
      this.autoDamage += amount
    },

    reset() {
      this.$reset()
    },
  },
})
