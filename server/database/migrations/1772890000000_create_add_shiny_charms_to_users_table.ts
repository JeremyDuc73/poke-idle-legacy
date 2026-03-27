import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('shiny_charms').defaultTo(0).notNullable()
      table.jsonb('completed_pokedex_gens').defaultTo('[]').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('shiny_charms')
      table.dropColumn('completed_pokedex_gens')
    })
  }
}
