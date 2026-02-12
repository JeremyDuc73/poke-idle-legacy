import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserPokemon from '#models/user_pokemon'

export interface EvolutionStage {
  pokedexId: number
  name: string
  condition: string | null
}

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
  declare slug: string

  @column()
  declare type1: string

  @column()
  declare type2: string | null

  @column()
  declare generation: number

  @column({
    prepare: (value: Record<string, number>) => JSON.stringify(value),
    consume: (value: string | Record<string, number>) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare baseStats: Record<string, number>

  @column({
    prepare: (value: EvolutionStage[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | EvolutionStage[] | null) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare evolutionFamily: EvolutionStage[] | null

  @column()
  declare spriteRegular: string

  @column()
  declare spriteShiny: string

  @hasMany(() => UserPokemon)
  declare userPokemons: HasMany<typeof UserPokemon>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
