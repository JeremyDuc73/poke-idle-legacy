import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pvp_challenges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('challenger_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('challenged_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('bet_amount').notNullable().defaultTo(0)
      table.jsonb('challenger_team').nullable()
      table.jsonb('challenged_team').nullable()
      table.string('status', 20).notNullable().defaultTo('pending')
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['challenged_id', 'status'])
      table.index(['challenger_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
