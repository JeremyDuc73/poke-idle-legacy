import { defineStore } from 'pinia'
import type { PokemonType } from '~/data/types'

export interface Enemy {
  nameFr: string
  nameEn: string
  slug: string
  type: PokemonType
  spriteUrl: string
  maxHp: number
  currentHp: number
  level: number
  goldReward: number
  xpReward: number
  isBoss: boolean
  bossTimerSeconds: number | null
}

interface CombatState {
  enemy: Enemy | null
  clickDamage: number
  teamDps: number
  isFighting: boolean
  totalClicks: number
  totalKills: number
  bossTimeRemaining: number | null
  autoAttackInterval: ReturnType<typeof setInterval> | null
  bossTimerInterval: ReturnType<typeof setInterval> | null
  overrideAutoAttack: (() => void) | null
}

export const useCombatStore = defineStore('combat', {
  state: (): CombatState => ({
    enemy: null,
    clickDamage: 1,
    teamDps: 0,
    isFighting: false,
    totalClicks: 0,
    totalKills: 0,
    bossTimeRemaining: null,
    autoAttackInterval: null,
    bossTimerInterval: null,
    overrideAutoAttack: null,
  }),

  getters: {
    enemyHpPercent: (state): number => {
      if (!state.enemy) return 0
      return Math.max(0, (state.enemy.currentHp / state.enemy.maxHp) * 100)
    },
    isEnemyDead: (state): boolean => {
      return state.enemy !== null && state.enemy.currentHp <= 0
    },
    isBossFight: (state): boolean => {
      return state.enemy?.isBoss ?? false
    },
    bossTimedOut: (state): boolean => {
      return state.bossTimeRemaining !== null && state.bossTimeRemaining <= 0
    },
  },

  actions: {
    setEnemy(enemy: Enemy) {
      this.clearTimers()
      this.enemy = enemy
      this.isFighting = true

      this.startAutoAttack()

      if (enemy.isBoss && enemy.bossTimerSeconds) {
        this.bossTimeRemaining = enemy.bossTimerSeconds
        this.startBossTimer()
      }
    },

    clickAttack() {
      if (!this.enemy || this.enemy.currentHp <= 0) return
      this.enemy.currentHp = Math.max(0, this.enemy.currentHp - this.clickDamage)
      this.totalClicks++
    },

    autoAttackTick() {
      if (!this.enemy || this.enemy.currentHp <= 0 || this.teamDps <= 0) return
      this.enemy.currentHp = Math.max(0, this.enemy.currentHp - this.teamDps)
    },

    startAutoAttack() {
      this.autoAttackInterval = setInterval(() => {
        if (this.overrideAutoAttack) {
          this.overrideAutoAttack()
        } else {
          this.autoAttackTick()
        }
      }, 1000)
    },

    startBossTimer() {
      this.bossTimerInterval = setInterval(() => {
        if (this.bossTimeRemaining !== null) {
          this.bossTimeRemaining--
        }
      }, 1000)
    },

    clearTimers() {
      if (this.autoAttackInterval) {
        clearInterval(this.autoAttackInterval)
        this.autoAttackInterval = null
      }
      if (this.bossTimerInterval) {
        clearInterval(this.bossTimerInterval)
        this.bossTimerInterval = null
      }
    },

    killEnemy() {
      this.clearTimers()
      this.totalKills++
      this.enemy = null
      this.isFighting = false
      this.bossTimeRemaining = null
    },

    bossFailed() {
      this.clearTimers()
      this.enemy = null
      this.isFighting = false
      this.bossTimeRemaining = null
    },

    resumeTimers() {
      if (!this.autoAttackInterval && this.enemy) {
        this.startAutoAttack()
        if (this.enemy.isBoss && this.bossTimeRemaining !== null && this.bossTimeRemaining > 0) {
          this.startBossTimer()
        }
      }
    },

    upgradeClickDamage(amount: number) {
      this.clickDamage += amount
    },

    upgradeTeamDps(amount: number) {
      this.teamDps += amount
    },

    reset() {
      this.clearTimers()
      this.$reset()
    },
  },
})
