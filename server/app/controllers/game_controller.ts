import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
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

    const now = DateTime.now()
    const lastLogin = user.lastLoginAt

    let afkReward = null
    if (lastLogin) {
      const diffMs = now.diff(lastLogin, 'milliseconds').milliseconds
      const diffMinutes = diffMs / (1000 * 60)

      if (diffMinutes >= 5) {
        const cappedHours = Math.min(diffMinutes / 60, 24)
        const teamDps = user.pokemons
          .filter((p) => p.teamSlot !== null)
          .reduce((sum, p) => sum + Math.floor(p.level * (1 + 0.25)), 0)

        if (teamDps > 0) {
          const enemiesPerHour = (teamDps * 3600) / 50
          const enemiesDefeated = Math.floor(enemiesPerHour * cappedHours)
          const goldEarned = Math.floor(enemiesDefeated * 5 * user.level)

          user.gold += goldEarned
          afkReward = {
            hoursAway: cappedHours,
            goldEarned,
            enemiesDefeated,
          }
        }
      }
    }

    user.lastLoginAt = now
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
        badges: user.badges,
        candies: user.candies ?? { S: 0, M: 0, L: 0, XL: 0 },
        daycare: user.daycare ?? [],
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
      afkReward,
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
    user.lastLoginAt = DateTime.now()
    await user.save()

    return response.ok({ message: 'Game state saved' })
  }

  async savePokemons({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    const { pokemons } = request.body() as {
      pokemons: Array<{
        speciesId: number
        level: number
        xp: number
        stars: number
        isShiny: boolean
        rarity?: string
        teamSlot: number | null
      }>
    }

    await UserPokemon.query().where('userId', user.id).delete()

    if (pokemons && pokemons.length > 0) {
      await UserPokemon.createMany(
        pokemons.map((p) => ({
          userId: user.id,
          speciesId: p.speciesId,
          level: p.level,
          xp: p.xp,
          stars: p.stars,
          isShiny: p.isShiny,
          rarity: p.rarity ?? 'common',
          teamSlot: p.teamSlot,
        }))
      )
    }

    return response.ok({ message: 'Pokémon saved' })
  }

  async pokedex({ response }: HttpContext) {
    const species = await Species.query().orderBy('tyradexId', 'asc')
    return response.ok(species)
  }
}
