import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'species'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('tyradex_id').unsigned().notNullable().unique()
      table.string('name_fr', 100).notNullable()
      table.string('name_en', 100).notNullable()
      table.string('slug', 100).notNullable().unique()
      table.string('type_1', 50).notNullable()
      table.string('type_2', 50).nullable()
      table.integer('generation').unsigned().notNullable().defaultTo(1)
      table.jsonb('base_stats').notNullable().defaultTo('{}')
      table.jsonb('evolution_family').nullable()
      table.string('sprite_regular', 500).notNullable()
      table.string('sprite_shiny', 500).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
