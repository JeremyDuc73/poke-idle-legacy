import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import UserPokemon from '#models/user_pokemon'

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
        COUNT(DISTINCT up.species_id)::int AS unique_pokemon,
        COUNT(CASE WHEN up.is_shiny = true THEN 1 END)::int AS shiny_count,
        COUNT(CASE WHEN up.rarity = 'legendary' THEN 1 END)::int AS legendary_count
      FROM users u
      LEFT JOIN user_pokemons up ON up.user_id = u.id
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

    // Top pokemon by level
    const topPokemon = [...pokemons]
      .sort((a, b) => b.level - a.level || b.stars - a.stars)
      .slice(0, 12)

    // Pokemon per generation
    const genCounts: Record<number, number> = {}
    for (const p of pokemons) {
      const gen = p.species?.generation ?? 0
      genCounts[gen] = (genCounts[gen] ?? 0) + 1
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
      uniquePokemon: new Set(pokemons.map((p) => p.species?.slug)).size,
      shinyCount,
      legendaryCount,
      epicCount,
      rarityCounts,
      genCounts,
      teamPokemons: teamPokemons.map((p) => ({
        slug: p.species?.slug ?? 'unknown',
        nameFr: p.species?.nameFr ?? '???',
        nameEn: p.species?.nameEn ?? '???',
        level: p.level,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity,
      })),
      topPokemon: topPokemon.map((p) => ({
        slug: p.species?.slug ?? 'unknown',
        nameFr: p.species?.nameFr ?? '???',
        nameEn: p.species?.nameEn ?? '???',
        level: p.level,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity,
      })),
    })
  }
}
