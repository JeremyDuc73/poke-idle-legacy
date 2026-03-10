import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import PvpChallenge from '#models/pvp_challenge'

export interface PvpTeamSnapshot {
  pokemonId: number
  slug: string
  nameFr: string
  nameEn: string
  level: number
  stars: number
  isShiny: boolean
  rarity: string
  dps: number
  typeMult: number
  effectiveDps: number
}

export default class PvpMatch extends BaseModel {
  static table = 'pvp_matches'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare challengeId: number

  @column({ columnName: 'player1_id' })
  declare player1Id: number

  @column({ columnName: 'player2_id' })
  declare player2Id: number

  @column()
  declare bossSlug: string

  @column()
  declare bossNameFr: string

  @column()
  declare bossNameEn: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string | string[]) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare bossTypes: string[]

  @column()
  declare bossGeneration: number

  @column()
  declare durationSeconds: number

  @column({ columnName: 'player1_damage' })
  declare player1Damage: number

  @column({ columnName: 'player2_damage' })
  declare player2Damage: number

  @column({
    columnName: 'player1_team_snapshot',
    prepare: (value: PvpTeamSnapshot[]) => JSON.stringify(value),
    consume: (value: string | PvpTeamSnapshot[]) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare player1TeamSnapshot: PvpTeamSnapshot[]

  @column({
    columnName: 'player2_team_snapshot',
    prepare: (value: PvpTeamSnapshot[]) => JSON.stringify(value),
    consume: (value: string | PvpTeamSnapshot[]) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare player2TeamSnapshot: PvpTeamSnapshot[]

  @column()
  declare winnerId: number | null

  @column()
  declare betAmount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'player1Id' })
  declare player1: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'player2Id' })
  declare player2: BelongsTo<typeof User>

  @belongsTo(() => PvpChallenge, { foreignKey: 'challengeId' })
  declare challenge: BelongsTo<typeof PvpChallenge>
}
