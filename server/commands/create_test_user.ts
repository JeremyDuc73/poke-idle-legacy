import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class CreateTestUser extends BaseCommand {
  static commandName = 'user:create'
  static description = 'Create a test user with configurable gold/gems'
  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Username', required: false })
  declare username: string

  @args.string({ description: 'Email', required: false })
  declare email: string

  @args.string({ description: 'Password', required: false })
  declare password: string

  async run() {
    const username = this.username || 'jeremy'
    const email = this.email || 'jeremy@test.com'
    const password = this.password || 'password123'

    const existing = await User.findBy('email', email)
    if (existing) {
      existing.gold = 999999
      existing.gems = 9999
      await existing.save()
      this.logger.success(`User "${username}" already exists — reset to 999999 gold, 9999 gems.`)
      return
    }

    await User.create({
      username,
      email,
      password,
      gold: 999999,
      gems: 9999,
      xp: 0,
      level: 1,
      currentGeneration: 1,
      currentZone: 1,
      currentStage: 1,
      clickDamage: 1,
      badges: 0,
      candies: { S: 0, M: 0, L: 0, XL: 0 },
    })

    this.logger.success(`User "${username}" created with 999999 gold, 9999 gems.`)
  }
}
