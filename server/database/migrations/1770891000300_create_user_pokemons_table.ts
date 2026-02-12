import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_pokemons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('species_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('species')
        .onDelete('CASCADE')
      table.integer('xp').unsigned().notNullable().defaultTo(0)
      table.integer('level').unsigned().notNullable().defaultTo(1)
      table.boolean('is_shiny').notNullable().defaultTo(false)
      table.integer('stars').unsigned().notNullable().defaultTo(1)
      table.integer('team_slot').unsigned().nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
