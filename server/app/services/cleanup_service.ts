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

const DEDUP_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

export async function dedupAllPokemons(): Promise<{ duplicatesRemoved: number; teamsFixed: number; affectedUsernames: string[] }> {
  const allPokemons = await UserPokemon.query().orderBy('userId').orderBy('speciesId')

  const groups = new Map<string, UserPokemon[]>()
  for (const p of allPokemons) {
    const key = `${p.userId}:${p.speciesId}:${p.isShiny}`
    const arr = groups.get(key) ?? []
    arr.push(p)
    groups.set(key, arr)
  }

  const toDelete: number[] = []
  const affectedUserIds = new Set<number>()

  for (const [, pokemons] of groups) {
    if (pokemons.length <= 1) continue

    pokemons.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level
      if (b.stars !== a.stars) return b.stars - a.stars
      return b.xp - a.xp
    })

    const keeper = pokemons[0]
    for (let i = 1; i < pokemons.length; i++) {
      toDelete.push(pokemons[i].id)
      affectedUserIds.add(pokemons[i].userId)
      if (keeper.teamSlot === null && pokemons[i].teamSlot !== null) {
        keeper.teamSlot = pokemons[i].teamSlot
      }
    }
    keeper.stars = Math.min(keeper.stars, 5)
    await keeper.save()
  }

  if (toDelete.length > 0) {
    await UserPokemon.query().whereIn('id', toDelete).delete()
  }

  const affectedUsers =
    affectedUserIds.size > 0
      ? await User.query()
          .whereIn('id', [...affectedUserIds])
          .select('username')
      : []
  const affectedUsernames = affectedUsers.map((u) => u.username)

  // Fix teams with >6 members per user
  const userTeams = new Map<number, UserPokemon[]>()
  const teamPokemons = await UserPokemon.query().whereNotNull('teamSlot').orderBy('userId')
  for (const p of teamPokemons) {
    const arr = userTeams.get(p.userId) ?? []
    arr.push(p)
    userTeams.set(p.userId, arr)
  }

  let teamsFixed = 0
  for (const [, team] of userTeams) {
    if (team.length <= 6) continue
    team.sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99))
    for (let i = 6; i < team.length; i++) {
      team[i].teamSlot = null
      await team[i].save()
    }
    teamsFixed++
  }

  if (toDelete.length > 0 || teamsFixed > 0) {
    const names =
      affectedUsernames.length > 0 ? ` — ${affectedUsernames.join(', ')}` : ''
    console.log(
      `[Dedup] ${toDelete.length} doublon(s) supprimé(s), ${teamsFixed} équipe(s) corrigée(s)${names}`
    )
  }

  return { duplicatesRemoved: toDelete.length, teamsFixed, affectedUsernames }
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null
let dedupInterval: ReturnType<typeof setInterval> | null = null

export function startCleanupScheduler() {
  // Run immediately on startup
  purgeInactiveUsers().catch((err) => {
    console.error('[Cleanup] Initial purge failed:', err)
  })

  // Then every 24 hours
  cleanupInterval = setInterval(() => {
    purgeInactiveUsers().catch((err) => {
      console.error('[Cleanup] Scheduled purge failed:', err)
    })
  }, CLEANUP_INTERVAL_MS)

  console.log(
    `[Cleanup] Scheduler started — purging accounts inactive for ${INACTIVE_DAYS}+ days every 24h`
  )

  // Dedup: run on startup then every 10 minutes
  dedupAllPokemons().catch((err) => {
    console.error('[Dedup] Initial dedup failed:', err)
  })

  dedupInterval = setInterval(() => {
    dedupAllPokemons().catch((err) => {
      console.error('[Dedup] Scheduled dedup failed:', err)
    })
  }, DEDUP_INTERVAL_MS)

  console.log('[Dedup] Scheduler started — deduplicating every 10 min')
}

export function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
  if (dedupInterval) {
    clearInterval(dedupInterval)
    dedupInterval = null
  }
}
