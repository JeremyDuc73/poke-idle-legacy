import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'

const AFK_STORAGE_KEY = 'poke-idle-last-login'
const MIN_AFK_MINUTES = 5

interface AfkResult {
  hoursAway: number
  goldEarned: number
  enemiesDefeated: number
}

const showPopup = ref(false)
const afkResult = ref<AfkResult | null>(null)

export function useAfkReward() {
  function checkAfkRewards() {
    const lastLoginStr = localStorage.getItem(AFK_STORAGE_KEY)
    const now = Date.now()

    localStorage.setItem(AFK_STORAGE_KEY, now.toString())

    if (!lastLoginStr) return

    const lastLogin = Number(lastLoginStr)
    const elapsedMs = now - lastLogin
    const elapsedMinutes = elapsedMs / (1000 * 60)

    if (elapsedMinutes < MIN_AFK_MINUTES) return

    const player = usePlayerStore()
    const inventory = useInventoryStore()

    const teamDps = inventory.teamDps
    if (teamDps <= 0) return

    const elapsedHours = elapsedMinutes / 60
    const cappedHours = Math.min(elapsedHours, 24)

    const enemiesPerHour = teamDps * 3600 / 50
    const enemiesDefeated = Math.floor(enemiesPerHour * cappedHours)
    const goldEarned = Math.floor(enemiesDefeated * 5 * player.level)

    player.addGold(goldEarned)

    afkResult.value = {
      hoursAway: cappedHours,
      goldEarned,
      enemiesDefeated,
    }
    showPopup.value = true
  }

  function dismissPopup() {
    showPopup.value = false
    afkResult.value = null
  }

  function updateTimestamp() {
    localStorage.setItem(AFK_STORAGE_KEY, Date.now().toString())
  }

  return {
    showPopup: readonly(showPopup),
    afkResult: readonly(afkResult),
    checkAfkRewards,
    dismissPopup,
    updateTimestamp,
  }
}
