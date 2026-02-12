import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Species from '#models/species'

interface TyradexPokemon {
  pokedex_id: number
  generation: number
  name: {
    fr: string
    en: string
    jp: string
  }
  types: Array<{
    name: string
    image: string
  }> | null
  stats: {
    hp: number
    atk: number
    def: number
    spe_atk: number
    spe_def: number
    vit: number
  } | null
  sprites: {
    regular: string
    shiny: string | null
  } | null
}

export default class SeedPokedex extends BaseCommand {
  static commandName = 'seed:pokedex'
  static description = 'Seed the species table from the Tyradex API'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const genArg = this.parsed?.args?.[0]
    const gensToSeed = genArg ? [Number(genArg)] : [1]

    this.logger.info(`Seeding Pokédex for generation(s): ${gensToSeed.join(', ')}`)

    for (const gen of gensToSeed) {
      if (!generations.includes(gen)) {
        this.logger.warning(`Generation ${gen} is not valid. Skipping.`)
        continue
      }

      this.logger.info(`Fetching generation ${gen} from Tyradex API...`)

      try {
        const response = await fetch(`https://tyradex.vercel.app/api/v1/gen/${gen}`)

        if (!response.ok) {
          this.logger.error(`Failed to fetch gen ${gen}: HTTP ${response.status}`)
          continue
        }

        const pokemons = (await response.json()) as TyradexPokemon[]
        let count = 0

        for (const pokemon of pokemons) {
          if (!pokemon.pokedex_id || pokemon.pokedex_id === 0) {
            continue
          }

          const baseStats = pokemon.stats
            ? {
                hp: pokemon.stats.hp,
                atk: pokemon.stats.atk,
                def: pokemon.stats.def,
                spe_atk: pokemon.stats.spe_atk,
                spe_def: pokemon.stats.spe_def,
                speed: pokemon.stats.vit,
              }
            : ({ hp: 0, atk: 0, def: 0, spe_atk: 0, spe_def: 0, speed: 0 } as Record<string, number>)

          await Species.updateOrCreate(
            { tyradexId: pokemon.pokedex_id },
            {
              tyradexId: pokemon.pokedex_id,
              nameFr: pokemon.name.fr,
              nameEn: pokemon.name.en,
              type1: pokemon.types?.[0]?.name ?? 'Normal',
              type2: pokemon.types?.[1]?.name ?? null,
              generation: pokemon.generation ?? gen,
              baseStats,
              spriteRegular: pokemon.sprites?.regular ?? null,
              spriteShiny: pokemon.sprites?.shiny ?? null,
            }
          )
          count++
        }

        this.logger.success(`Generation ${gen}: ${count} Pokémon seeded successfully.`)
      } catch (error) {
        this.logger.error(`Error seeding generation ${gen}: ${error}`)
      }
    }

    this.logger.success('Pokédex seeding complete!')
  }
}
