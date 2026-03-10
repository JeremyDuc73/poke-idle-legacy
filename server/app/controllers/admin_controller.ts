import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { join } from 'node:path'
import { unlink } from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
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
    const totalShinys = await UserPokemon.query().where('isShiny', true).count('* as total')
    const totalLegendaries = await UserPokemon.query()
      .where('rarity', 'legendary')
      .count('* as total')
    const yesterday = DateTime.now().minus({ hours: 24 }).toISO()
    const activePlayers = await User.query()
      .where('lastLoginAt', '>=', yesterday!)
      .count('* as total')
    const aggregates = await db.rawQuery(`
      SELECT
        COALESCE(AVG(level), 0)::int AS avg_level,
        COALESCE(AVG(badges), 0)::int AS avg_badges,
        COALESCE(SUM(gold), 0)::bigint AS total_gold,
        COALESCE(MAX(level), 0)::int AS max_level,
        COALESCE(MAX(badges), 0)::int AS max_badges
      FROM users
    `)
    const agg = aggregates.rows[0] || {}

    return response.ok({
      stats: {
        totalUsers: totalUsers[0].$extras.total,
        totalPokemons: totalPokemons[0].$extras.total,
        adminUsers: adminUsers[0].$extras.total,
        totalShinys: totalShinys[0].$extras.total,
        totalLegendaries: totalLegendaries[0].$extras.total,
        activePlayers24h: activePlayers[0].$extras.total,
        avgLevel: Number(agg.avg_level) || 0,
        avgBadges: Number(agg.avg_badges) || 0,
        totalGold: Number(agg.total_gold) || 0,
        maxLevel: Number(agg.max_level) || 0,
        maxBadges: Number(agg.max_badges) || 0,
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
        'current_generation',
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
    user.adminVersion = (user.adminVersion ?? 0) + 1
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
    user.adminVersion = (user.adminVersion ?? 0) + 1

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
    user.clickDamageBonus = 0
    user.teamDpsBonus = 0
    user.xp = 0
    user.level = 1
    user.badges = 0
    user.candies = {}
    user.daycare = []
    user.defeatedBosses = []
    user.adminVersion = (user.adminVersion ?? 0) + 1

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
      penaltyType: user.penaltyType,
      penaltyPercent: user.penaltyPercent,
      avatarUrl: user.avatarUrl ?? null,
      created_at: user.createdAt,
      last_login_at: user.lastLoginAt,
    })
  }

  /**
   * Set penalty on a user (dps or gold malus)
   */
  async setPenalty({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const { penaltyType, penaltyPercent } = request.only(['penaltyType', 'penaltyPercent'])

    const validTypes = ['dps', 'gold']
    const validPercents = [5, 10, 25, 50]

    if (!validTypes.includes(penaltyType)) {
      return response.badRequest({ message: 'Type de malus invalide (dps ou gold)' })
    }
    if (!validPercents.includes(Number(penaltyPercent))) {
      return response.badRequest({ message: 'Pourcentage invalide (5, 10, 25 ou 50)' })
    }

    user.penaltyType = penaltyType
    user.penaltyPercent = Number(penaltyPercent)
    user.adminVersion = (user.adminVersion ?? 0) + 1
    await user.save()

    return response.ok({
      message: `Malus ${penaltyType} -${penaltyPercent}% appliqué à ${user.username}`,
      penalty: { type: user.penaltyType, percent: user.penaltyPercent },
    })
  }

  /**
   * Remove penalty from a user
   */
  async removePenalty({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    user.penaltyType = null
    user.penaltyPercent = 0
    user.adminVersion = (user.adminVersion ?? 0) + 1
    await user.save()

    return response.ok({
      message: `Malus retiré de ${user.username}`,
    })
  }

  /**
   * Reset avatar for a user (admin)
   */
  async resetAvatar({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

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

    return response.ok({ message: `Avatar de ${user.username} réinitialisé` })
  }

  /**
   * List all pokemon for a user
   */
  async listUserPokemons({ params, response }: HttpContext) {
    const pokemons = await UserPokemon.query().where('user_id', params.id).orderBy('id', 'desc')

    return response.ok(pokemons)
  }
}
