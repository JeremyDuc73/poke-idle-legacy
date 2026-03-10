import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import PvpChallenge from '#models/pvp_challenge'
import PvpMatch from '#models/pvp_match'
import { resolveMatch } from '#services/pvp_combat_service'

const MIN_BET = 100
const MAX_BET_PERCENT = 0.5
const CHALLENGE_EXPIRE_MINUTES = 10
const MIN_BADGES = 8 // Kanto complet

export default class PvpController {
  /**
   * GET /api/game/pvp/players — liste des joueurs éligibles PvP (en ligne récemment)
   */
  async listPlayers({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    const fiveMinAgo = DateTime.now().minus({ minutes: 5 }).toISO()
    const players = await User.query()
      .where('badges', '>=', MIN_BADGES)
      .where('id', '!=', user.id)
      .where('role', '!=', 'admin')
      .where('lastLoginAt', '>=', fiveMinAgo!)
      .select('id', 'username', 'level', 'badges', 'currentGeneration', 'avatarUrl')
      .orderBy('level', 'desc')
      .limit(50)

    return response.ok(players)
  }

  /**
   * GET /api/game/pvp/all-players — tous les joueurs éligibles PvP
   */
  async listAllPlayers({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    const players = await User.query()
      .where('badges', '>=', MIN_BADGES)
      .where('id', '!=', user.id)
      .where('role', '!=', 'admin')
      .select('id', 'username', 'level', 'badges', 'currentGeneration', 'avatarUrl')
      .orderBy('level', 'desc')
      .limit(100)

    return response.ok(players)
  }

  /**
   * POST /api/game/pvp/challenge — envoyer un défi
   * body: { challengedId, betAmount, team: number[] (6 pokemon IDs) }
   */
  async sendChallenge({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })
    if (user.badges < MIN_BADGES) {
      return response.forbidden({
        message: 'Vous devez avoir au moins 8 badges pour accéder au PvP',
      })
    }

    const { challengedId, betAmount, team } = request.body() as {
      challengedId: number
      betAmount: number
      team: number[]
    }

    if (!challengedId || !betAmount || !team || team.length !== 6) {
      return response.badRequest({
        message: 'Données invalides: challengedId, betAmount et 6 pokémon requis',
      })
    }

    if (betAmount < MIN_BET) {
      return response.badRequest({ message: `Mise minimum: ${MIN_BET} pokédollars` })
    }

    const maxBet = Math.floor(user.gold * MAX_BET_PERCENT)
    if (betAmount > maxBet) {
      return response.badRequest({
        message: `Mise maximum: ${maxBet} pokédollars (50% de votre or)`,
      })
    }

    if (user.gold < betAmount) {
      return response.badRequest({ message: 'Pas assez de pokédollars' })
    }

    const challenged = await User.find(challengedId)
    if (!challenged) return response.notFound({ message: 'Joueur introuvable' })
    if (challenged.badges < MIN_BADGES) {
      return response.badRequest({ message: "Ce joueur n'a pas encore débloqué le PvP" })
    }
    if (challenged.gold < betAmount) {
      return response.badRequest({ message: "Ce joueur n'a pas assez de pokédollars pour ce pari" })
    }

    // Check no pending challenge between these two
    const existing = await PvpChallenge.query()
      .where('status', 'pending')
      .where((q) => {
        q.where((q2) => {
          q2.where('challengerId', user.id).where('challengedId', challengedId)
        }).orWhere((q2) => {
          q2.where('challengerId', challengedId).where('challengedId', user.id)
        })
      })
      .first()

    if (existing) {
      return response.badRequest({ message: 'Un défi est déjà en attente entre vous deux' })
    }

    const challenge = await PvpChallenge.create({
      challengerId: user.id,
      challengedId: challengedId,
      betAmount,
      challengerTeam: team,
      challengedTeam: null,
      status: 'pending',
      expiresAt: DateTime.now().plus({ minutes: CHALLENGE_EXPIRE_MINUTES }),
    })

    return response.ok({
      id: challenge.id,
      message: 'Défi envoyé !',
    })
  }

  /**
   * GET /api/game/pvp/challenges — défis reçus et envoyés en attente
   */
  async listChallenges({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    // Expire old challenges
    await PvpChallenge.query()
      .where('status', 'pending')
      .where('expiresAt', '<', DateTime.now().toSQL()!)
      .update({ status: 'expired' })

    const received = await PvpChallenge.query()
      .where('challengedId', user.id)
      .where('status', 'pending')
      .preload('challenger')
      .orderBy('createdAt', 'desc')

    const sent = await PvpChallenge.query()
      .where('challengerId', user.id)
      .where('status', 'pending')
      .preload('challenged')
      .orderBy('createdAt', 'desc')

    return response.ok({
      received: received.map((c) => ({
        id: c.id,
        challengerId: c.challengerId,
        challengerName: c.challenger.username,
        challengerLevel: c.challenger.level,
        challengerAvatarUrl: c.challenger.avatarUrl,
        betAmount: c.betAmount,
        expiresAt: c.expiresAt?.toISO(),
      })),
      sent: sent.map((c) => ({
        id: c.id,
        challengedId: c.challengedId,
        challengedName: c.challenged.username,
        challengedLevel: c.challenged.level,
        challengedAvatarUrl: c.challenged.avatarUrl,
        betAmount: c.betAmount,
        expiresAt: c.expiresAt?.toISO(),
      })),
    })
  }

  /**
   * POST /api/game/pvp/challenge/:id/accept — accepter un défi
   * body: { team: number[] (6 pokemon IDs) }
   */
  async acceptChallenge({ params, request, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    const challenge = await PvpChallenge.find(params.id)
    if (!challenge) return response.notFound({ message: 'Défi introuvable' })
    if (challenge.challengedId !== user.id) {
      return response.forbidden({ message: 'Ce défi ne vous est pas adressé' })
    }
    if (challenge.status !== 'pending') {
      return response.badRequest({ message: "Ce défi n'est plus disponible" })
    }
    if (challenge.expiresAt && challenge.expiresAt < DateTime.now()) {
      challenge.status = 'expired'
      await challenge.save()
      return response.badRequest({ message: 'Ce défi a expiré' })
    }

    const { team } = request.body() as { team: number[] }
    if (!team || team.length !== 6) {
      return response.badRequest({ message: 'Vous devez sélectionner 6 pokémon' })
    }

    // Verify gold for both
    const challenger = await User.findOrFail(challenge.challengerId)
    if (challenger.gold < challenge.betAmount) {
      challenge.status = 'expired'
      await challenge.save()
      return response.badRequest({ message: "Le challenger n'a plus assez de pokédollars" })
    }
    if (user.gold < challenge.betAmount) {
      return response.badRequest({ message: "Vous n'avez pas assez de pokédollars" })
    }

    // Determine common generations
    const minGen = Math.min(challenger.currentGeneration, user.currentGeneration)
    const commonGens = Array.from({ length: minGen }, (_, i) => i + 1)

    // Resolve combat
    const result = await resolveMatch(
      challenge.challengerId,
      user.id,
      challenge.challengerTeam!,
      team,
      commonGens
    )

    if (!result) {
      return response.internalServerError({ message: 'Impossible de résoudre le combat' })
    }

    // Update challenge
    challenge.challengedTeam = team
    challenge.status = 'completed'
    await challenge.save()

    // Create match record
    const match = await PvpMatch.create({
      challengeId: challenge.id,
      player1Id: challenge.challengerId,
      player2Id: user.id,
      bossSlug: result.bossSlug,
      bossNameFr: result.bossNameFr,
      bossNameEn: result.bossNameEn,
      bossTypes: result.bossTypes,
      bossGeneration: result.bossGeneration,
      durationSeconds: result.durationSeconds,
      player1Damage: result.player1Damage,
      player2Damage: result.player2Damage,
      player1TeamSnapshot: result.player1TeamSnapshot,
      player2TeamSnapshot: result.player2TeamSnapshot,
      winnerId: result.winnerId,
      betAmount: challenge.betAmount,
    })

    // Transfer gold
    if (result.winnerId) {
      const loserId = result.winnerId === challenge.challengerId ? user.id : challenge.challengerId
      await User.query().where('id', result.winnerId).increment('gold', challenge.betAmount)
      await User.query().where('id', loserId).decrement('gold', challenge.betAmount)
    }
    // Draw: no gold transfer

    return response.ok({
      matchId: match.id,
      message: 'Combat terminé !',
    })
  }

  /**
   * POST /api/game/pvp/challenge/:id/decline — refuser un défi
   */
  async declineChallenge({ params, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    const challenge = await PvpChallenge.find(params.id)
    if (!challenge) return response.notFound({ message: 'Défi introuvable' })
    if (challenge.challengedId !== user.id) {
      return response.forbidden({ message: 'Ce défi ne vous est pas adressé' })
    }
    if (challenge.status !== 'pending') {
      return response.badRequest({ message: "Ce défi n'est plus disponible" })
    }

    challenge.status = 'declined'
    await challenge.save()

    return response.ok({ message: 'Défi refusé' })
  }

  /**
   * GET /api/game/pvp/match/:id — détails d'un match
   */
  async getMatch({ params, response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    const match = await PvpMatch.query()
      .where('id', params.id)
      .where((q) => {
        q.where('player1Id', user.id).orWhere('player2Id', user.id)
      })
      .preload('player1')
      .preload('player2')
      .first()

    if (!match) return response.notFound({ message: 'Match introuvable' })

    return response.ok({
      id: match.id,
      player1: {
        id: match.player1Id,
        username: match.player1.username,
        avatarUrl: match.player1.avatarUrl,
        damage: Number(match.player1Damage),
        team: match.player1TeamSnapshot,
      },
      player2: {
        id: match.player2Id,
        username: match.player2.username,
        avatarUrl: match.player2.avatarUrl,
        damage: Number(match.player2Damage),
        team: match.player2TeamSnapshot,
      },
      boss: {
        slug: match.bossSlug,
        nameFr: match.bossNameFr,
        nameEn: match.bossNameEn,
        types: match.bossTypes,
        generation: match.bossGeneration,
      },
      durationSeconds: match.durationSeconds,
      winnerId: match.winnerId,
      betAmount: match.betAmount,
      createdAt: match.createdAt.toISO(),
    })
  }

  /**
   * GET /api/game/pvp/history — historique des matches
   */
  async history({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) return response.unauthorized({ message: 'Not authenticated' })

    const matches = await PvpMatch.query()
      .where((q) => {
        q.where('player1Id', user.id).orWhere('player2Id', user.id)
      })
      .preload('player1')
      .preload('player2')
      .orderBy('createdAt', 'desc')
      .limit(50)

    return response.ok(
      matches.map((m) => ({
        id: m.id,
        player1: { id: m.player1Id, username: m.player1.username, avatarUrl: m.player1.avatarUrl },
        player2: { id: m.player2Id, username: m.player2.username, avatarUrl: m.player2.avatarUrl },
        player1Damage: Number(m.player1Damage),
        player2Damage: Number(m.player2Damage),
        bossNameFr: m.bossNameFr,
        bossNameEn: m.bossNameEn,
        bossTypes: m.bossTypes,
        winnerId: m.winnerId,
        betAmount: m.betAmount,
        createdAt: m.createdAt.toISO(),
      }))
    )
  }

  /**
   * GET /api/game/pvp/leaderboard — classement PvP (W/L)
   */
  async leaderboard({ response }: HttpContext) {
    const rows = await db.rawQuery(`
      SELECT
        u.id,
        u.username,
        u.level,
        u.avatar_url,
        COUNT(CASE WHEN m.winner_id = u.id THEN 1 END)::int AS wins,
        COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != u.id THEN 1 END)::int AS losses,
        COUNT(CASE WHEN m.winner_id IS NULL THEN 1 END)::int AS draws,
        COUNT(m.id)::int AS total_matches,
        COALESCE(SUM(CASE WHEN m.winner_id = u.id THEN m.bet_amount ELSE 0 END), 0)::bigint AS total_won,
        COALESCE(SUM(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != u.id THEN m.bet_amount ELSE 0 END), 0)::bigint AS total_lost
      FROM users u
      INNER JOIN (
        SELECT id, player1_id AS user_id, winner_id, bet_amount FROM pvp_matches
        UNION ALL
        SELECT id, player2_id AS user_id, winner_id, bet_amount FROM pvp_matches
      ) m ON m.user_id = u.id
      GROUP BY u.id, u.username, u.level, u.avatar_url
      HAVING COUNT(m.id) >= 1
      ORDER BY COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) DESC, COUNT(m.id) DESC
      LIMIT 50
    `)

    return response.ok(rows.rows)
  }
}
