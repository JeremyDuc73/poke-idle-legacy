import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pvp_challenges'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('boss_slug', 100).nullable()
      table.string('boss_name_fr', 100).nullable()
      table.string('boss_name_en', 100).nullable()
      table.jsonb('boss_types').nullable()
      table.integer('boss_generation').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('boss_slug')
      table.dropColumn('boss_name_fr')
      table.dropColumn('boss_name_en')
      table.dropColumn('boss_types')
      table.dropColumn('boss_generation')
    })
  }
}
