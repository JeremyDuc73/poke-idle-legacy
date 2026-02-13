import { defineStore } from 'pinia'
import type { Rarity } from '~/data/gacha'

export interface DaycareSlot {
  slug: string
  nameFr: string
  nameEn: string
  stars: number
  rarity: Rarity
  damageDealt: number
  damageRequired: number
}

export const MAX_DAYCARE_SLOTS = 5
export const DAYCARE_COST = 500

// Damage required to hatch based on the pokemon's current star count
export const HATCH_DAMAGE: Record<number, number> = {
  1: 2_000,
  2: 6_000,
  3: 20_000,
  4: 60_000,
  5: 200_000,
}

// 5-star pokemon have a 1/50 chance to hatch shiny
export const FIVE_STAR_SHINY_CHANCE = 1 / 50

export const useDaycareStore = defineStore('daycare', {
  state: () => ({
    slots: [] as DaycareSlot[],
  }),

  getters: {
    freeSlots(): number {
      return MAX_DAYCARE_SLOTS - this.slots.length
    },
    isFull(): boolean {
      return this.slots.length >= MAX_DAYCARE_SLOTS
    },
  },

  actions: {
    hasSlug(slug: string): boolean {
      return this.slots.some((s) => s.slug === slug)
    },

    deposit(pokemon: { slug: string; nameFr: string; nameEn: string; stars: number; rarity: Rarity }): boolean {
      if (this.isFull) return false
      if (this.hasSlug(pokemon.slug)) return false
      const dmgRequired = HATCH_DAMAGE[pokemon.stars] ?? HATCH_DAMAGE[5]!
      this.slots.push({
        slug: pokemon.slug,
        nameFr: pokemon.nameFr,
        nameEn: pokemon.nameEn,
        stars: pokemon.stars,
        rarity: pokemon.rarity,
        damageDealt: 0,
        damageRequired: dmgRequired,
      })
      return true
    },

    remove(index: number) {
      if (index >= 0 && index < this.slots.length) {
        this.slots.splice(index, 1)
      }
    },

    // Called from combat loop when damage is dealt
    addDamage(amount: number) {
      for (const slot of this.slots) {
        slot.damageDealt += amount
      }
    },

    // Check if any slots are ready to hatch, return them and remove from slots
    collectHatched(): { slot: DaycareSlot; isShiny: boolean }[] {
      const hatched: { slot: DaycareSlot; isShiny: boolean }[] = []
      const remaining: DaycareSlot[] = []

      for (const slot of this.slots) {
        if (slot.damageDealt >= slot.damageRequired) {
          const isShiny = slot.stars >= 5 && Math.random() < FIVE_STAR_SHINY_CHANCE
          hatched.push({ slot: { ...slot }, isShiny })
        } else {
          remaining.push(slot)
        }
      }

      this.slots = remaining
      return hatched
    },
  },
})
