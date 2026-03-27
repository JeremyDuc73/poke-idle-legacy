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
  declare googleId: string | null

  @column()
  declare role: 'user' | 'admin'

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
  declare clickDamageBonus: number

  @column()
  declare teamDpsBonus: number

  @column()
  declare xp: number

  @column()
  declare level: number

  @column()
  declare badges: number

  @column({
    prepare: (value: Record<string, number>) => JSON.stringify(value),
    consume: (value: string | Record<string, number>) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare candies: Record<string, number>

  @column({
    prepare: (value: any[]) => JSON.stringify(value),
    consume: (value: string | any[]) =>
      typeof value === 'string' ? JSON.parse(value) : (value ?? []),
  })
  declare daycare: any[]

  @column({
    prepare: (value: any[]) => JSON.stringify(value),
    consume: (value: string | any[]) =>
      typeof value === 'string' ? JSON.parse(value) : (value ?? []),
  })
  declare savedTeams: any[]

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string | string[]) =>
      typeof value === 'string' ? JSON.parse(value) : (value ?? []),
  })
  declare defeatedBosses: string[]

  @column()
  declare shinyCharms: number

  @column({
    prepare: (value: number[]) => JSON.stringify(value),
    consume: (value: string | number[]) =>
      typeof value === 'string' ? JSON.parse(value) : (value ?? []),
  })
  declare completedPokedexGens: number[]

  @column()
  declare adminVersion: number

  @column()
  declare penaltyType: string | null

  @column()
  declare penaltyPercent: number

  @column()
  declare avatarUrl: string | null

  @column()
  declare betaAccess: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @hasMany(() => UserPokemon)
  declare pokemons: HasMany<typeof UserPokemon>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
