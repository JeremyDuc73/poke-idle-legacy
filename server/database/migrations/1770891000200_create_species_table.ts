import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'species'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('tyradex_id').unsigned().notNullable().unique()
      table.string('name_fr', 100).notNullable()
      table.string('name_en', 100).notNullable()
      table.string('type1', 50).notNullable()
      table.string('type2', 50).nullable()
      table.integer('generation').unsigned().notNullable().defaultTo(1)
      table.jsonb('base_stats').notNullable().defaultTo('{}')
      table.string('sprite_regular', 500).nullable()
      table.string('sprite_shiny', 500).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
