import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Admin principal
    await User.updateOrCreate(
      { email: 'duc.jeremy@sfr.fr' },
      {
        username: 'Admin',
        email: 'duc.jeremy@sfr.fr',
        password: 'fidjie73',
        role: 'admin',
        gold: 0,
        gems: 0,
        currentGeneration: 1,
        currentZone: 1,
        currentStage: 1,
        clickDamage: 1,
        xp: 0,
        level: 1,
        badges: 0,
        candies: {},
        daycare: [],
      }
    )

    // Admin local pour tests
    await User.updateOrCreate(
      { email: 'admin@mail.com' },
      {
        username: 'Admin Local',
        email: 'admin@mail.com',
        password: 'admin',
        role: 'admin',
        gold: 0,
        gems: 0,
        currentGeneration: 1,
        currentZone: 1,
        currentStage: 1,
        clickDamage: 1,
        xp: 0,
        level: 1,
        badges: 0,
        candies: {},
        daycare: [],
      }
    )
  }
}
