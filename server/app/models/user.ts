import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import UserPokemon from '#models/user_pokemon'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare gold: number

  @column()
  declare gems: number

  @column()
  declare currentGeneration: number

  @column()
  declare currentZone: number

  @column()
  declare currentStage: number

  @column()
  declare clickDamage: number

  @column()
  declare xp: number

  @column()
  declare level: number

  @column()
  declare badges: number

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @hasMany(() => UserPokemon)
  declare pokemons: HasMany<typeof UserPokemon>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
