import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('click_damage_bonus').unsigned().notNullable().defaultTo(0)
      table.integer('team_dps_bonus').unsigned().notNullable().defaultTo(0)
      table.jsonb('defeated_bosses').notNullable().defaultTo('[]')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('click_damage_bonus')
      table.dropColumn('team_dps_bonus')
      table.dropColumn('defeated_bosses')
    })
  }
}