import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('maintenance_mode').defaultTo(false)
      table.string('maintenance_message', 255).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('maintenance_mode')
      table.dropColumn('maintenance_message')
    })
  }
}
