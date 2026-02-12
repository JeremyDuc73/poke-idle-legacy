import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Species from '#models/species'

export default class UserPokemon extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare speciesId: number

  @column()
  declare xp: number

  @column()
  declare level: number

  @column()
  declare isShiny: boolean

  @column()
  declare stars: number

  @column()
  declare teamSlot: number | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Species)
  declare species: BelongsTo<typeof Species>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
