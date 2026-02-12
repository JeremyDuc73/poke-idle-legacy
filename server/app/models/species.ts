import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserPokemon from '#models/user_pokemon'

export default class Species extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tyradexId: number

  @column()
  declare nameFr: string

  @column()
  declare nameEn: string

  @column()
  declare type1: string

  @column()
  declare type2: string | null

  @column()
  declare generation: number

  @column()
  declare baseStats: Record<string, number>

  @column()
  declare spriteRegular: string | null

  @column()
  declare spriteShiny: string | null

  @hasMany(() => UserPokemon)
  declare userPokemons: HasMany<typeof UserPokemon>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
