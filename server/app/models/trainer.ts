import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'

interface TrainerTeamMember {
  speciesId: number
  level: number
}

export default class Trainer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare generation: number

  @column()
  declare zone: number

  @column()
  declare stageNumber: number

  @column()
  declare isBoss: boolean

  @column()
  declare bossTimerSeconds: number | null

  @column({
    prepare: (value: TrainerTeamMember[]) => JSON.stringify(value),
    consume: (value: string | TrainerTeamMember[]) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare teamJson: TrainerTeamMember[]

  @computed()
  get spriteUrl(): string {
    return `https://play.pokemonshowdown.com/sprites/trainers/${this.slug}.png`
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
