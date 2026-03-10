import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pvp_matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('challenge_id').unsigned().notNullable().references('id').inTable('pvp_challenges').onDelete('CASCADE')
      table.integer('player1_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('player2_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('boss_slug', 100).notNullable()
      table.string('boss_name_fr', 100).notNullable()
      table.string('boss_name_en', 100).notNullable()
      table.jsonb('boss_types').notNullable()
      table.integer('boss_generation').notNullable()
      table.integer('duration_seconds').notNullable().defaultTo(60)
      table.bigInteger('player1_damage').notNullable().defaultTo(0)
      table.bigInteger('player2_damage').notNullable().defaultTo(0)
      table.jsonb('player1_team_snapshot').notNullable()
      table.jsonb('player2_team_snapshot').notNullable()
      table.integer('winner_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.integer('bet_amount').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()

      table.index(['player1_id'])
      table.index(['player2_id'])
      table.index(['winner_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
