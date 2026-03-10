import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class LeaderboardController {
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
        COUNT(up.id)::int AS total_pokemon,
        COUNT(DISTINCT up.species_id)::int AS unique_pokemon,
        COUNT(CASE WHEN up.is_shiny = true THEN 1 END)::int AS shiny_count,
        COUNT(CASE WHEN up.rarity = 'legendary' THEN 1 END)::int AS legendary_count,
        COUNT(CASE WHEN up.rarity = 'legendary' AND up.is_shiny = true THEN 1 END)::int AS shiny_legendary_count
      FROM users u
      LEFT JOIN user_pokemons up ON up.user_id = u.id
      WHERE u.badges >= 2
        AND u.role != 'admin'
      GROUP BY u.id, u.username, u.level, u.badges, u.gold, u.current_generation, u.avatar_url
    `)

    return response.ok(rows.rows)
  }
}
