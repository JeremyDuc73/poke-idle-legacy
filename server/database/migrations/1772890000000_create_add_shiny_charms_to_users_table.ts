import BaseSchema from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.integer('shiny_charms').defaultTo(0)
      table.jsonb('completed_pokedex_gens').defaultTo('[]')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('shiny_charms')
      table.dropColumn('completed_pokedex_gens')
    })
  }
}
