import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { cuid } from '@adonisjs/core/helpers'
import { join } from 'node:path'
import { mkdir, unlink } from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import Species from '#models/species'
import { saveGameStateValidator } from '#validators/game_state'
import UserPokemon from '#models/user_pokemon'

// ── Species slug→id cache (avoids full table scan on every save) ──
let speciesCache: Map<string, number> | null = null
let speciesCacheTime = 0
const SPECIES_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getSpeciesCache(): Promise<Map<string, number>> {
  const now = Date.now()
  if (speciesCache && now - speciesCacheTime < SPECIES_CACHE_TTL) {
    return speciesCache
  }
  const allSpecies = await Species.query()
  const map = new Map<string, number>()
  for (const s of allSpecies) {
    map.set(s.slug, s.id)
  }
  speciesCache = map
  speciesCacheTime = now
  return map
}

function invalidateSpeciesCache() {
  speciesCache = null
}

// ── lastLoginAt throttle (per-user, max once every 5 min) ──
const lastLoginThrottle = new Map<number, number>()
const LOGIN_THROTTLE_MS = 5 * 60 * 1000

export default class GameController {
  async loadState({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    await user.load('pokemons', (query) => {
      query.preload('species')
    })

    user.lastLoginAt = DateTime.now()
    await user.save()

    return response.ok({
      player: {
        id: user.id,
        username: user.username,
        gold: user.gold,
        xp: user.xp,
        level: user.level,
        currentGeneration: user.currentGeneration,
        currentZone: user.currentZone,
        currentStage: user.currentStage,
        clickDamage: user.clickDamage,
        clickDamageBonus: (user as any).clickDamageBonus ?? 0,
        teamDpsBonus: (user as any).teamDpsBonus ?? 0,
        badges: user.badges,
        defeatedBosses: (user as any).defeatedBosses ?? [],
        candies: user.candies ?? { S: 0, M: 0, L: 0, XL: 0 },
        daycare: user.daycare ?? [],
        savedTeams: user.savedTeams ?? [],
        adminVersion: user.adminVersion ?? 0,
        shinyCharms: user.shinyCharms ?? 0,
        completedPokedexGens: user.completedPokedexGens ?? [],
        penaltyType: user.penaltyType ?? null,
        penaltyPercent: user.penaltyPercent ?? 0,
        avatarUrl: user.avatarUrl ?? null,
        betaAccess: user.betaAccess ?? false,
        role: user.role ?? 'user',
      },
      pokemons: user.pokemons.map((p) => ({
        id: p.id,
        speciesId: p.speciesId,
        slug: p.species?.slug ?? '',
        nameFr: p.species?.nameFr ?? '',
        nameEn: p.species?.nameEn ?? '',
        level: p.level,
        xp: p.xp,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity ?? 'common',
        teamSlot: p.teamSlot,
      })),
    })
  }

  async saveState({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const data = await request.validateUsing(saveGameStateValidator)

    // ── Anti-cheat: reload fresh user from DB to compare deltas ──
    const freshUser = await User.find(user.id)
    if (!freshUser) {
      return response.unauthorized({ message: 'User not found' })
    }
    const MAX_GOLD_INCREASE = 50_000_000

    // Cap gold increase per save cycle (decrease is always allowed — spending)
    user.gold = Math.min(data.gold, freshUser.gold + MAX_GOLD_INCREASE)
    user.xp = data.xp
    user.level = data.level
    user.currentGeneration = data.currentGeneration
    user.currentZone = data.currentZone
    user.currentStage = data.currentStage
    user.clickDamage = data.clickDamage
    user.badges = data.badges
    if ((request.body() as any).candies) {
      user.candies = (request.body() as any).candies
    }
    if ((request.body() as any).daycare !== undefined) {
      user.daycare = (request.body() as any).daycare
    }
    if ((request.body() as any).savedTeams !== undefined) {
      user.savedTeams = (request.body() as any).savedTeams
    }
    if ((request.body() as any).clickDamageBonus !== undefined) {
      ;(user as any).clickDamageBonus = (request.body() as any).clickDamageBonus
    }
    if ((request.body() as any).teamDpsBonus !== undefined) {
      ;(user as any).teamDpsBonus = (request.body() as any).teamDpsBonus
    }
    if ((request.body() as any).defeatedBosses !== undefined) {
      ;(user as any).defeatedBosses = (request.body() as any).defeatedBosses
    }
    // Persist shiny charms & completed pokedex gens (validated: max 9 gens)
    if ((request.body() as any).completedPokedexGens !== undefined) {
      const gens = (request.body() as any).completedPokedexGens
      if (Array.isArray(gens)) {
        const validGens = [...new Set(gens.filter((g: number) => g >= 1 && g <= 9))] as number[]
        user.completedPokedexGens = validGens
        user.shinyCharms = validGens.length
      }
    }
    // Check if admin modified this user since last client load
    const clientAdminVersion = Number((request.body() as any).adminVersion ?? 0)
    const serverAdminVersion = user.adminVersion ?? 0

    if (clientAdminVersion < serverAdminVersion) {
      // Admin made changes — tell client to reload fresh data
      return response.ok({ message: 'Admin override', reload: true })
    }

    // Throttle lastLoginAt updates to once every 5 minutes
    const now = Date.now()
    const lastUpdate = lastLoginThrottle.get(user.id) ?? 0
    if (now - lastUpdate > LOGIN_THROTTLE_MS) {
      user.lastLoginAt = DateTime.now()
      lastLoginThrottle.set(user.id, now)
    }
    await user.save()

    return response.ok({ message: 'Game state saved', reload: false })
  }

  async savePokemons({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const body = request.body() as {
      pokemons: Array<{
        slug: string
        nameFr?: string
        nameEn?: string
        pokedexId?: number
        gen?: number
        speciesId?: number
        level: number
        xp: number
        stars: number
        isShiny: boolean
        rarity?: string
        teamSlot: number | null
      }>
      adminVersion?: number
    }

    const { pokemons } = body

    // Check if admin modified this user since last client load (prevent re-saving after reset)
    const clientAdminVersion = Number(body.adminVersion ?? 0)
    const serverAdminVersion = user.adminVersion ?? 0
    if (clientAdminVersion < serverAdminVersion) {
      return response.ok({ message: 'Admin override — skipping pokemon save', reload: true })
    }

    if (!pokemons || pokemons.length === 0) {
      await UserPokemon.query().where('userId', user.id).delete()
      return response.ok({ message: 'Pokémon saved' })
    }

    // ── Anti-cheat: hard caps ──
    const MAX_POKEMON_COUNT = 1500
    const MAX_LEVEL = 100
    const MAX_STARS = 5
    const MAX_XP = 50_000_000

    if (pokemons.length > MAX_POKEMON_COUNT) {
      return response.badRequest({ message: 'Too many Pokémon' })
    }

    // ── Anti-cheat: deduplicate slug+isShiny (keep best) ──
    const seenKeys = new Map<string, number>()
    for (let i = 0; i < pokemons.length; i++) {
      const key = `${pokemons[i].slug}-${pokemons[i].isShiny}`
      if (!seenKeys.has(key)) {
        seenKeys.set(key, i)
      } else {
        const prev = seenKeys.get(key)!
        const prevP = pokemons[prev]
        const currP = pokemons[i]
        // Keep the one with better stats
        if (
          currP.stars > prevP.stars ||
          (currP.stars === prevP.stars && currP.level > prevP.level)
        ) {
          pokemons[prev] = { ...currP, teamSlot: prevP.teamSlot ?? currP.teamSlot }
        }
        pokemons[i] = null as any // mark for removal
      }
    }
    const dedupedPokemons = pokemons.filter(Boolean)

    // ── Anti-cheat: validate & clamp team slots ──
    const usedSlots = new Set<number>()
    for (const p of dedupedPokemons) {
      // Clamp values
      p.level = Math.max(1, Math.min(MAX_LEVEL, Math.floor(p.level ?? 1)))
      p.xp = Math.max(0, Math.min(MAX_XP, Math.floor(p.xp ?? 0)))
      p.stars = Math.max(1, Math.min(MAX_STARS, Math.floor(p.stars ?? 1)))

      // Validate team slots: must be 1-6, unique, max 6
      if (p.teamSlot !== null && p.teamSlot !== undefined) {
        const slot = Math.floor(p.teamSlot)
        if (slot >= 1 && slot <= 6 && !usedSlots.has(slot)) {
          p.teamSlot = slot
          usedSlots.add(slot)
        } else {
          p.teamSlot = null
        }
      }
    }

    // Build slug → speciesId mapping from cached species
    const slugToId = new Map(await getSpeciesCache())

    // Auto-create missing species from client data
    const missingSlugs = dedupedPokemons.filter((p) => p.slug && !slugToId.has(p.slug))
    const uniqueMissing = new Map<string, (typeof dedupedPokemons)[0]>()
    for (const p of missingSlugs) {
      if (!uniqueMissing.has(p.slug)) uniqueMissing.set(p.slug, p)
    }

    if (uniqueMissing.size > 0) {
      for (const [slug, p] of uniqueMissing) {
        const created = await Species.updateOrCreate(
          { slug },
          {
            tyradexId: p.pokedexId ?? 0,
            nameFr: p.nameFr ?? slug,
            nameEn: p.nameEn ?? slug,
            slug,
            type1: 'Normal',
            type2: null,
            generation: p.gen ?? 1,
            baseStats: {},
            evolutionFamily: null,
            spriteRegular: `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`,
            spriteShiny: `https://play.pokemonshowdown.com/sprites/ani-shiny/${slug}.gif`,
          }
        )
        slugToId.set(slug, created.id)
      }
      // Invalidate cache since new species were added
      invalidateSpeciesCache()
    }

    // Now save all pokemons in a transaction to prevent duplication on concurrent saves
    const mapped = dedupedPokemons.map((p, idx) => ({
      idx,
      data: {
        userId: user.id,
        speciesId: p.speciesId ?? slugToId.get(p.slug) ?? 0,
        level: p.level,
        xp: p.xp,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity ?? 'common',
        teamSlot: p.teamSlot,
      },
    }))
    const valid = mapped.filter((m) => m.data.speciesId > 0)

    let created: UserPokemon[] = []
    await db.transaction(async (trx) => {
      // Lock the user row to prevent concurrent saves from duplicating pokemon
      await User.query({ client: trx }).where('id', user.id).forUpdate().first()
      await UserPokemon.query({ client: trx }).where('userId', user.id).delete()
      if (valid.length > 0) {
        created = await UserPokemon.createMany(
          valid.map((m) => m.data),
          { client: trx }
        )
      }
    })

    // Build positional ID array matching the original pokemons order
    const ids: (number | null)[] = new Array(pokemons.length).fill(null)
    for (const [i, entry] of valid.entries()) {
      ids[entry.idx] = created[i]?.id ?? null
    }

    return response.ok({
      message: `${valid.length} Pokémon saved`,
      ids,
    })
  }

  async updateUsername({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const { username } = request.body() as { username?: string }
    if (!username || typeof username !== 'string') {
      return response.badRequest({ message: 'Username is required' })
    }

    const trimmed = username.trim()
    if (trimmed.length < 3 || trimmed.length > 20) {
      return response.badRequest({ message: 'Username must be between 3 and 20 characters' })
    }

    // Check uniqueness (case-insensitive)
    const existing = await db
      .from('users')
      .where('username', trimmed)
      .whereNot('id', user.id)
      .first()
    if (existing) {
      return response.conflict({ message: 'Username already taken' })
    }

    user.username = trimmed
    await user.save()

    return response.ok({ message: 'Username updated', username: user.username })
  }

  async uploadAvatar({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    })

    if (!avatar) {
      return response.badRequest({ message: 'No file uploaded' })
    }

    if (!avatar.isValid) {
      return response.badRequest({ message: avatar.errors[0]?.message ?? 'Invalid file' })
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      try {
        const oldPath = join(app.makePath('storage'), user.avatarUrl)
        await unlink(oldPath)
      } catch {
        /* ignore missing file */
      }
    }

    const dir = join(app.makePath('storage'), 'uploads', 'avatars')
    await mkdir(dir, { recursive: true })

    const fileName = `${user.id}-${cuid()}.${avatar.extname}`
    await avatar.move(dir, { name: fileName, overwrite: true })

    user.avatarUrl = `uploads/avatars/${fileName}`
    await user.save()

    return response.ok({ avatarUrl: user.avatarUrl })
  }

  async deleteAvatar({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    if (user.avatarUrl) {
      try {
        const oldPath = join(app.makePath('storage'), user.avatarUrl)
        await unlink(oldPath)
      } catch {
        /* ignore missing file */
      }
    }

    user.avatarUrl = null
    await user.save()

    return response.ok({ message: 'Avatar removed' })
  }

  async serveAvatar({ params, response }: HttpContext) {
    const filePath = join(app.makePath('storage'), 'uploads', 'avatars', params.filename)
    return response.download(filePath)
  }

  async pokedex({ response }: HttpContext) {
    const species = await Species.query().orderBy('tyradexId', 'asc')
    return response.ok(species)
  }
}
