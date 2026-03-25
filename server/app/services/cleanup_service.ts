/**
 * Periodic cleanup: delete user accounts inactive for 30+ days.
 * Admins are never deleted.
 * Runs once on startup, then every 24 hours.
 */

import { DateTime } from 'luxon'
import User from '#models/user'
import UserPokemon from '#models/user_pokemon'

const INACTIVE_DAYS = 30
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function purgeInactiveUsers(): Promise<number> {
  const cutoff = DateTime.now().minus({ days: INACTIVE_DAYS }).toISO()!

  // Users who either:
  //  - have lastLoginAt older than 30 days
  //  - have never logged in (lastLoginAt is null) and were created 30+ days ago
  // Exclude admins
  const inactiveUsers = await User.query()
    .where('role', '!=', 'admin')
    .where((q) => {
      q.where('lastLoginAt', '<', cutoff).orWhere((sub) => {
        sub.whereNull('lastLoginAt').where('createdAt', '<', cutoff)
      })
    })

  if (inactiveUsers.length === 0) return 0

  const userIds = inactiveUsers.map((u) => u.id)

  // Delete pokemons first (foreign key)
  await UserPokemon.query().whereIn('userId', userIds).delete()

  // Delete users
  await User.query().whereIn('id', userIds).delete()

  console.log(
    `[Cleanup] Purged ${inactiveUsers.length} inactive user(s): ${inactiveUsers.map((u) => u.username).join(', ')}`
  )

  return inactiveUsers.length
}

let _cleanupInterval: ReturnType<typeof setInterval> | null = null

export function startCleanupScheduler() {
  // Run immediately on startup
  purgeInactiveUsers().catch((err) => {
    console.error('[Cleanup] Initial purge failed:', err)
  })

  // Then every 24 hours
  _cleanupInterval = setInterval(() => {
    purgeInactiveUsers().catch((err) => {
      console.error('[Cleanup] Scheduled purge failed:', err)
    })
  }, CLEANUP_INTERVAL_MS)

  console.log(`[Cleanup] Scheduler started — purging accounts inactive for ${INACTIVE_DAYS}+ days every 24h`)
}

export function stopCleanupScheduler() {
  if (_cleanupInterval) {
    clearInterval(_cleanupInterval)
    _cleanupInterval = null
  }
}
