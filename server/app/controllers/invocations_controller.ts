import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Species from '#models/species'
import UserPokemon from '#models/user_pokemon'
import { getBannerById, pullFromBanner, type PullResult } from '../services/gacha_service.js'

// ── Species slug→id cache (shared lightweight cache) ──
let speciesCache: Map<string, number> | null = null
let speciesCacheTime = 0
const SPECIES_CACHE_TTL = 5 * 60 * 1000

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

export default class InvocationsController {
  /**
   * POST /api/invocations
   *
   * Body: { bannerId: string, count?: number }
   *   - bannerId: which banner to pull from (e.g. 'kanto', 'johto')
   *   - count: number of pulls (1–10, default 1)
   *
   * Atomic flow inside a transaction:
   *   1. Lock user row (FOR UPDATE)
   *   2. Verify gold >= totalCost
   *   3. Server-side RNG pull(s)
   *   4. Resolve species IDs (auto-create missing species)
   *   5. Insert new UserPokemon rows
   *   6. Debit gold
   *   7. Return drawn Pokémon to client
   */
  async invoke({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const { bannerId, count: rawCount } = request.body() as {
      bannerId?: string
      count?: number
    }

    if (!bannerId || typeof bannerId !== 'string') {
      return response.badRequest({ message: 'bannerId is required' })
    }

    const banner = getBannerById(bannerId)
    if (!banner) {
      return response.badRequest({ message: `Unknown banner: ${bannerId}` })
    }

    const count = Math.max(1, Math.min(10, Math.floor(rawCount ?? 1)))
    const totalCost = banner.costGold * count

    // Read user's shiny charm count (outside transaction — read-only, stale is fine)
    const shinyCharms = user.shinyCharms ?? 0
    const completedGens = (user.completedPokedexGens as number[]) ?? []
    const pokedexMaster = completedGens.length >= 9

    // Perform pulls (server-side RNG — before transaction to minimise lock time)
    const pulls: PullResult[] = []
    for (let i = 0; i < count; i++) {
      pulls.push(pullFromBanner(banner, shinyCharms, pokedexMaster))
    }

    // Resolve species IDs for the pulled Pokémon
    const slugToId = new Map(await getSpeciesCache())
    const missingSlugs = new Set<string>()
    for (const pull of pulls) {
      if (!slugToId.has(pull.pokemon.slug)) {
        missingSlugs.add(pull.pokemon.slug)
      }
    }

    // Auto-create any missing species (rare: megas, new gens)
    if (missingSlugs.size > 0) {
      for (const slug of missingSlugs) {
        const pullData = pulls.find((p) => p.pokemon.slug === slug)!.pokemon
        try {
          const created = await Species.updateOrCreate(
            { slug },
            {
              tyradexId: 0,
              nameFr: pullData.nameFr,
              nameEn: pullData.nameEn,
              slug,
              type1: 'Normal',
              type2: null,
              generation: banner.generation,
              baseStats: {},
              evolutionFamily: null,
              spriteRegular: `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`,
              spriteShiny: `https://play.pokemonshowdown.com/sprites/ani-shiny/${slug}.gif`,
            }
          )
          slugToId.set(slug, created.id)
        } catch {
          const existing = await Species.findBy('slug', slug)
          if (existing) slugToId.set(slug, existing.id)
        }
      }
      invalidateSpeciesCache()
    }

    // Verify all species resolved
    for (const pull of pulls) {
      if (!slugToId.has(pull.pokemon.slug)) {
        return response.internalServerError({
          message: `Failed to resolve species: ${pull.pokemon.slug}`,
        })
      }
    }

    // ── Atomic transaction: lock user → check gold → insert pokemon → debit gold ──
    let createdPokemons: UserPokemon[] = []
    try {
      await db.transaction(async (trx) => {
        // 1. Lock user row
        const u = await User.query({ client: trx }).where('id', user.id).forUpdate().first()
        if (!u) throw new Error('User not found')

        // 2. Check gold
        if (u.gold < totalCost) {
          throw new Error('INSUFFICIENT_GOLD')
        }

        // 3. Insert new Pokémon
        const pokemonData = pulls.map((pull) => ({
          userId: user.id,
          speciesId: slugToId.get(pull.pokemon.slug)!,
          level: 1,
          xp: 0,
          stars: 1,
          isShiny: pull.isShiny,
          rarity: pull.pokemon.rarity,
          teamSlot: null,
        }))

        createdPokemons = await UserPokemon.createMany(pokemonData, { client: trx })

        // 4. Debit gold
        u.gold -= totalCost
        await u.save()
      })
    } catch (err: any) {
      if (err.message === 'INSUFFICIENT_GOLD') {
        return response.badRequest({
          message: 'Not enough gold',
          required: totalCost,
          current: user.gold,
        })
      }
      throw err // re-throw unexpected errors
    }

    // Build response with the drawn Pokémon details
    const results = pulls.map((pull, i) => ({
      id: createdPokemons[i]?.id ?? null,
      speciesId: slugToId.get(pull.pokemon.slug)!,
      slug: pull.pokemon.slug,
      nameFr: pull.pokemon.nameFr,
      nameEn: pull.pokemon.nameEn,
      rarity: pull.pokemon.rarity,
      isShiny: pull.isShiny,
      level: 1,
      xp: 0,
      stars: 1,
    }))

    // Return new gold balance so client can sync immediately
    const updatedUser = await User.find(user.id)

    return response.ok({
      message: `${count} Pokémon drawn from ${banner.nameEn}`,
      results,
      goldSpent: totalCost,
      goldRemaining: updatedUser?.gold ?? user.gold - totalCost,
    })
  }
}
