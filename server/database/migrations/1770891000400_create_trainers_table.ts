import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trainers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 100).notNullable()
      table.string('slug', 100).notNullable()
      table.integer('generation').unsigned().notNullable()
      table.integer('zone').unsigned().notNullable()
      table.integer('stage_number').unsigned().notNullable()
      table.boolean('is_boss').notNullable().defaultTo(false)
      table.integer('boss_timer_seconds').unsigned().nullable()
      table.jsonb('team_json').notNullable().defaultTo('[]')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['generation', 'zone', 'stage_number'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
