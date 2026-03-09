const GUEST_SAVE_KEY = 'poke-idle-guest-save'

type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

interface GuestSaveData {
  player: {
    username: string
    gold: number
    gems: number
    xp: number
    level: number
    currentGeneration: number
    currentZone: number
    currentStage: number
    clickDamage: number
    clickDamageBonus: number
    teamDpsBonus: number
    badges: number
    candies: Record<string, number>
    defeatedBosses: string[]
    shinyCharms?: number
    completedPokedexGens?: number[]
  }
  inventory: {
    collection: Array<{
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
    }>
    nextId: number
  }
  daycare: {
    slots: Array<{
      slug: string
      nameFr: string
      nameEn: string
      stars: number
      rarity: Rarity
      damageDealt: number
      damageRequired: number
    }>
  }
  lastSaved: number
}

export function useLocalStorage() {
  function saveGuestData(data: GuestSaveData): boolean {
    try {
      localStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Failed to save guest data:', e)
      return false
    }
  }

  function loadGuestData(): GuestSaveData | null {
    try {
      const raw = localStorage.getItem(GUEST_SAVE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as GuestSaveData
    } catch (e) {
      console.error('Failed to load guest data:', e)
      return null
    }
  }

  function clearGuestData(): boolean {
    try {
      localStorage.removeItem(GUEST_SAVE_KEY)
      return true
    } catch (e) {
      console.error('Failed to clear guest data:', e)
      return false
    }
  }

  function hasGuestData(): boolean {
    return localStorage.getItem(GUEST_SAVE_KEY) !== null
  }

  return {
    saveGuestData,
    loadGuestData,
    clearGuestData,
    hasGuestData,
  }
}
