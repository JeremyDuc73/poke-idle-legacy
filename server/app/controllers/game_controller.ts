import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { cuid } from '@adonisjs/core/helpers'
import { join } from 'node:path'
import { mkdir, unlink } from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import Species from '#models/species'
import { saveGameStateValidator } from '#validators/game_state'
import UserPokemon from '#models/user_pokemon'

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
        gems: user.gems,
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
        adminVersion: user.adminVersion ?? 0,
        penaltyType: user.penaltyType ?? null,
        penaltyPercent: user.penaltyPercent ?? 0,
        avatarUrl: user.avatarUrl ?? null,
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

    user.gold = data.gold
    user.gems = data.gems
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
    if ((request.body() as any).clickDamageBonus !== undefined) {
      ;(user as any).clickDamageBonus = (request.body() as any).clickDamageBonus
    }
    if ((request.body() as any).teamDpsBonus !== undefined) {
      ;(user as any).teamDpsBonus = (request.body() as any).teamDpsBonus
    }
    if ((request.body() as any).defeatedBosses !== undefined) {
      ;(user as any).defeatedBosses = (request.body() as any).defeatedBosses
    }
    // Check if admin modified this user since last client load
    const clientAdminVersion = Number((request.body() as any).adminVersion ?? 0)
    const serverAdminVersion = user.adminVersion ?? 0

    if (clientAdminVersion < serverAdminVersion) {
      // Admin made changes — tell client to reload fresh data
      return response.ok({ message: 'Admin override', reload: true })
    }

    user.lastLoginAt = DateTime.now()
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

    // Build slug → speciesId mapping from existing species
    const allSpecies = await Species.query()
    const slugToId = new Map<string, number>()
    for (const s of allSpecies) {
      slugToId.set(s.slug, s.id)
    }

    // Auto-create missing species from client data
    const missingSlugs = pokemons.filter((p) => p.slug && !slugToId.has(p.slug))
    const uniqueMissing = new Map<string, (typeof pokemons)[0]>()
    for (const p of missingSlugs) {
      if (!uniqueMissing.has(p.slug)) uniqueMissing.set(p.slug, p)
    }

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

    // Now save all pokemons in a transaction to prevent duplication on concurrent saves
    const validPokemons = pokemons
      .map((p) => ({
        userId: user.id,
        speciesId: p.speciesId ?? slugToId.get(p.slug) ?? 0,
        level: p.level,
        xp: p.xp,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity ?? 'common',
        teamSlot: p.teamSlot,
      }))
      .filter((p) => p.speciesId > 0)

    await db.transaction(async (trx) => {
      await UserPokemon.query({ client: trx }).where('userId', user.id).delete()
      if (validPokemons.length > 0) {
        await UserPokemon.createMany(validPokemons, { client: trx })
      }
    })

    return response.ok({ message: `${validPokemons.length} Pokémon saved` })
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
