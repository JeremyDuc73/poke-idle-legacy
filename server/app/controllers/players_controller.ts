import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import UserPokemon from '#models/user_pokemon'
import Species from '#models/species'
import type { EvolutionStage } from '#models/species'

// ── DPS helpers (mirrors raid_dps.ts but without boss type effectiveness) ──
const RARITY_DPS_MULT: Record<string, number> = {
  common: 1.0,
  rare: 1.1,
  epic: 1.5,
  legendary: 4.0,
}
const STAR_DPS_MULT = [1, 1, 1.1, 1.2, 1.3, 1.5]
const STAR_DPS_MULT_SHINY = [1, 1, 1.5, 2, 3, 5]

function getStarMult(stars: number, isShiny: boolean): number {
  const t = isShiny ? STAR_DPS_MULT_SHINY : STAR_DPS_MULT
  return t[Math.min(stars, t.length - 1)] ?? 1
}

function getEvoMult(evoStage: number): number {
  if (evoStage >= 3) return 1.4
  if (evoStage === 2) return 1.2
  return 1.0
}

function evoStageFromFamily(slug: string, family: EvolutionStage[] | null): number {
  if (!family || family.length === 0) return 1
  const idx = family.findIndex(
    (f) => f.name?.toLowerCase() === slug || f.pokedexId?.toString() === slug
  )
  return idx < 0 ? 1 : Math.min(idx + 1, 3)
}

function baseDps(
  level: number,
  stars: number,
  isShiny: boolean,
  rarity: string,
  evoStage: number
): number {
  const baseDmg = level * 2
  const evo = getEvoMult(evoStage)
  const rar = RARITY_DPS_MULT[rarity] ?? 1.0
  const shiny = isShiny ? 4.0 : 1.0
  const star = getStarMult(stars, isShiny)
  return Math.floor(baseDmg * evo * rar * shiny * star)
}

export default class PlayersController {
  /**
   * Public player list — no email, no admin actions
   */
  async index({ response }: HttpContext) {
    const rows = await db.rawQuery(`
      SELECT
        u.id,
        u.username,
        u.level,
        u.badges,
        u.gold,
        u.current_generation,
        u.avatar_url,
        u.last_login_at,
        u.created_at,
        COUNT(up.id)::int AS total_pokemon,
        COUNT(DISTINCT CASE WHEN up.is_shiny = false THEN up.species_id END)::int AS unique_pokemon,
        COUNT(CASE WHEN up.is_shiny = true THEN 1 END)::int AS shiny_count,
        COUNT(CASE WHEN up.rarity = 'legendary' THEN 1 END)::int AS legendary_count
      FROM users u
      LEFT JOIN user_pokemons up ON up.user_id = u.id
      WHERE u.role != 'admin' AND u.badges > 0
      GROUP BY u.id, u.username, u.level, u.badges, u.gold, u.current_generation,
               u.avatar_url, u.last_login_at, u.created_at
      ORDER BY u.badges DESC, u.level DESC
    `)

    return response.ok(rows.rows)
  }

  /**
   * Public player detail — shows progression, team, pokemon stats
   */
  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Player not found' })
    }

    const pokemons = await UserPokemon.query().where('userId', user.id).preload('species')

    const teamPokemons = pokemons
      .filter((p) => p.teamSlot !== null)
      .sort((a, b) => (a.teamSlot ?? 0) - (b.teamSlot ?? 0))

    const shinyCount = pokemons.filter((p) => p.isShiny).length
    const legendaryCount = pokemons.filter((p) => p.rarity === 'legendary').length
    const epicCount = pokemons.filter((p) => p.rarity === 'epic').length

    // Build a gen cache for mega evolutions → base form gen
    const megaSlugs = pokemons.map((p) => p.species?.slug ?? '').filter((s) => s.includes('-mega'))
    const baseGenMap = new Map<string, number>()
    if (megaSlugs.length > 0) {
      const baseSlugs = [...new Set(megaSlugs.map((s) => s.replace(/-mega[xy]?$/, '')))]
      const baseSpecies = await Species.query()
        .whereIn('slug', baseSlugs)
        .select('slug', 'generation')
      for (const sp of baseSpecies) {
        baseGenMap.set(sp.slug, sp.generation)
      }
    }

    function resolveGen(slug: string, dbGen: number): number {
      if (slug.includes('-mega')) {
        const baseSlug = slug.replace(/-mega[xy]?$/, '')
        return baseGenMap.get(baseSlug) ?? dbGen
      }
      return dbGen
    }

    // Compute DPS for all pokemon
    const allWithDps = pokemons.map((p) => {
      const slug = p.species?.slug ?? ''
      const evoStage = evoStageFromFamily(slug, p.species?.evolutionFamily ?? null)
      const dps = baseDps(p.level, p.stars, p.isShiny, p.rarity, evoStage)
      return { p, dps, gen: resolveGen(slug, p.species?.generation ?? 0) }
    })

    // Top pokemon by DPS (return all, client filters by gen)
    const topPokemon = [...allWithDps].sort((a, b) => b.dps - a.dps).slice(0, 50)

    // Pokemon per generation (use resolved gen for megas) — exclude shinys
    const genCounts: Record<number, number> = {}
    for (const entry of allWithDps) {
      if (entry.p.isShiny) continue
      genCounts[entry.gen] = (genCounts[entry.gen] ?? 0) + 1
    }

    // Unique species per generation (for pokedex completion) — exclude shinys
    const uniquePerGen: Record<number, Set<string>> = {}
    for (const entry of allWithDps) {
      if (entry.p.isShiny) continue
      const slug = entry.p.species?.slug ?? ''
      if (!slug) continue
      if (!uniquePerGen[entry.gen]) uniquePerGen[entry.gen] = new Set()
      uniquePerGen[entry.gen].add(slug)
    }
    const uniqueGenCounts: Record<number, number> = {}
    for (const [gen, slugs] of Object.entries(uniquePerGen)) {
      uniqueGenCounts[Number(gen)] = slugs.size
    }

    // Total species per generation from Species table
    const speciesPerGen = await db.rawQuery(`
      SELECT generation, COUNT(*)::int AS total
      FROM species
      WHERE generation BETWEEN 1 AND 9
      GROUP BY generation
    `)
    const totalPerGen: Record<number, number> = {}
    for (const row of speciesPerGen.rows) {
      totalPerGen[row.generation] = row.total
    }

    // Rarity distribution
    const rarityCounts: Record<string, number> = {}
    for (const p of pokemons) {
      rarityCounts[p.rarity] = (rarityCounts[p.rarity] ?? 0) + 1
    }

    return response.ok({
      id: user.id,
      username: user.username,
      role: user.role,
      gold: user.gold,
      level: user.level,
      badges: user.badges,
      xp: user.xp,
      currentGeneration: user.currentGeneration,
      currentZone: user.currentZone,
      currentStage: user.currentStage,
      defeatedBosses: user.defeatedBosses ?? [],
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      pokemonCount: pokemons.length,
      uniquePokemon: new Set(pokemons.filter((p) => !p.isShiny).map((p) => p.species?.slug)).size,
      shinyCount,
      legendaryCount,
      epicCount,
      rarityCounts,
      genCounts,
      uniqueGenCounts,
      totalPerGen,
      teamPokemons: teamPokemons.map((p) => {
        const evoStage = evoStageFromFamily(
          p.species?.slug ?? '',
          p.species?.evolutionFamily ?? null
        )
        return {
          slug: p.species?.slug ?? 'unknown',
          nameFr: p.species?.nameFr ?? '???',
          nameEn: p.species?.nameEn ?? '???',
          level: p.level,
          stars: p.stars,
          isShiny: p.isShiny,
          rarity: p.rarity,
          dps: baseDps(p.level, p.stars, p.isShiny, p.rarity, evoStage),
        }
      }),
      topPokemon: topPokemon.map(({ p, dps, gen }) => ({
        slug: p.species?.slug ?? 'unknown',
        nameFr: p.species?.nameFr ?? '???',
        nameEn: p.species?.nameEn ?? '???',
        level: p.level,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity,
        dps,
        gen,
      })),
      shinyPokemon: allWithDps
        .filter(({ p }) => p.isShiny)
        .sort((a, b) => a.gen - b.gen || b.dps - a.dps)
        .map(({ p, dps, gen }) => ({
          slug: p.species?.slug ?? 'unknown',
          nameFr: p.species?.nameFr ?? '???',
          nameEn: p.species?.nameEn ?? '???',
          level: p.level,
          stars: p.stars,
          rarity: p.rarity,
          dps,
          gen,
        })),
    })
  }
}
