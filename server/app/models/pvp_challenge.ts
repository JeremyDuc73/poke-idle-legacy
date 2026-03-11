import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type PvpChallengeStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'completed'

export default class PvpChallenge extends BaseModel {
  static table = 'pvp_challenges'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare challengerId: number

  @column()
  declare challengedId: number

  @column()
  declare betAmount: number

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | string[] | null) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare challengerTeam: string[] | null

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | string[] | null) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare challengedTeam: string[] | null

  @column()
  declare status: PvpChallengeStatus

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'challengerId' })
  declare challenger: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'challengedId' })
  declare challenged: BelongsTo<typeof User>
}
