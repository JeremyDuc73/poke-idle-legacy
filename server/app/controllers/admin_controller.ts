import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserPokemon from '#models/user_pokemon'

export default class AdminController {
  /**
   * Get dashboard stats
   */
  async dashboard({ response }: HttpContext) {
    const totalUsers = await User.query().count('* as total')
    const totalPokemons = await UserPokemon.query().count('* as total')
    const adminUsers = await User.query().where('role', 'admin').count('* as total')

    return response.ok({
      stats: {
        totalUsers: totalUsers[0].$extras.total,
        totalPokemons: totalPokemons[0].$extras.total,
        adminUsers: adminUsers[0].$extras.total,
      },
    })
  }

  /**
   * List all users
   */
  async listUsers({ response, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)

    const users = await User.query()
      .select(
        'id',
        'username',
        'email',
        'role',
        'gold',
        'gems',
        'level',
        'badges',
        'created_at',
        'last_login_at'
      )
      .orderBy('id', 'desc')
      .paginate(page, limit)

    return response.ok(users)
  }

  /**
   * Update user
   */
  async updateUser({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = request.only(['username', 'email', 'role', 'gold', 'gems', 'level', 'badges'])

    user.merge(data)
    await user.save()

    return response.ok(user)
  }

  /**
   * Delete user
   */
  async deleteUser({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()

    return response.ok({ message: 'User deleted successfully' })
  }

  /**
   * Give items to user
   */
  async giveItems({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const { gold, gems } = request.only(['gold', 'gems'])

    const goldAmount = Number(gold) || 0
    const gemsAmount = Number(gems) || 0

    if (goldAmount > 0) user.gold += goldAmount
    if (gemsAmount > 0) user.gems += gemsAmount

    await user.save()

    return response.ok({
      message: `Donné ${goldAmount} gold, ${gemsAmount} gems à ${user.username}`,
      user: {
        id: user.id,
        username: user.username,
        gold: user.gold,
        gems: user.gems,
      },
    })
  }

  /**
   * Reset user progress
   */
  async resetUser({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    user.gold = 0
    user.gems = 0
    user.currentGeneration = 1
    user.currentZone = 1
    user.currentStage = 1
    user.clickDamage = 1
    user.xp = 0
    user.level = 1
    user.badges = 0
    user.candies = {}
    user.daycare = []

    await user.save()

    // Delete all user's pokemon
    await UserPokemon.query().where('user_id', user.id).delete()

    return response.ok({ message: 'User progress reset successfully' })
  }

  /**
   * Get detailed user information
   */
  async getUserDetails({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const pokemons = await UserPokemon.query().where('user_id', params.id).preload('species')

    const teamPokemons = pokemons
      .filter((p) => p.teamSlot !== null)
      .sort((a, b) => (a.teamSlot ?? 0) - (b.teamSlot ?? 0))
    const shinyCount = pokemons.filter((p) => p.isShiny).length

    return response.ok({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      gold: user.gold,
      gems: user.gems,
      level: user.level,
      badges: user.badges,
      currentGeneration: user.currentGeneration,
      currentZone: user.currentZone,
      currentStage: user.currentStage,
      xp: user.xp,
      clickDamage: user.clickDamage,
      clickDamageBonus: user.clickDamageBonus ?? 0,
      teamDpsBonus: user.teamDpsBonus ?? 0,
      defeatedBosses: user.defeatedBosses ?? [],
      pokemonCount: pokemons.length,
      shinyCount,
      teamPokemons: teamPokemons.map((p) => ({
        nameFr: p.species.nameFr,
        nameEn: p.species.nameEn,
        level: p.level,
        isShiny: p.isShiny,
      })),
      created_at: user.createdAt,
      last_login_at: user.lastLoginAt,
    })
  }

  /**
   * List all pokemon for a user
   */
  async listUserPokemons({ params, response }: HttpContext) {
    const pokemons = await UserPokemon.query().where('user_id', params.id).orderBy('id', 'desc')

    return response.ok(pokemons)
  }
}
