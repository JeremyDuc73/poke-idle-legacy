import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username', 50).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.integer('gold').unsigned().notNullable().defaultTo(0)
      table.integer('gems').unsigned().notNullable().defaultTo(0)
      table.integer('current_generation').unsigned().notNullable().defaultTo(1)
      table.integer('current_zone').unsigned().notNullable().defaultTo(1)
      table.integer('current_stage').unsigned().notNullable().defaultTo(1)
      table.integer('click_damage').unsigned().notNullable().defaultTo(1)
      table.integer('xp').unsigned().notNullable().defaultTo(0)
      table.integer('level').unsigned().notNullable().defaultTo(1)
      table.integer('badges').unsigned().notNullable().defaultTo(0)
      table.jsonb('candies').notNullable().defaultTo('{"S":0,"M":0,"L":0,"XL":0}')
      table.jsonb('daycare').notNullable().defaultTo('[]')
      table.timestamp('last_login_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
