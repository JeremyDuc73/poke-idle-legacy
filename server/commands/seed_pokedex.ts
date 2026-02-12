import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Species from '#models/species'
import { toShowdownSlug, getSpriteUrl, getShinySpiteUrl } from '#services/showdown_service'

interface TyradexEvolution {
  pokedex_id: number
  name: string
  condition: string | null
}

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
  evolution: {
    pre: TyradexEvolution[] | null
    next: TyradexEvolution[] | null
    mega: TyradexEvolution[] | null
  } | null
}

export default class SeedPokedex extends BaseCommand {
  static commandName = 'seed:pokedex'
  static description = 'Seed the species table from the Tyradex API (defaults to Gen 1)'
  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Generation number to seed (1-9), defaults to 1', required: false })
  declare generation: string

  async run() {
    const validGens = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const gen = this.generation ? Number(this.generation) : 1

    if (!validGens.includes(gen)) {
      this.logger.error(`Invalid generation: ${gen}. Must be 1-9.`)
      return
    }

    this.logger.info(`Seeding Pokédex for generation ${gen}...`)

    try {
      const response = await fetch(`https://tyradex.vercel.app/api/v1/gen/${gen}`)

      if (!response.ok) {
        this.logger.error(`Failed to fetch gen ${gen}: HTTP ${response.status}`)
        return
      }

      const pokemons = (await response.json()) as TyradexPokemon[]
      let count = 0

      for (const pokemon of pokemons) {
        if (!pokemon.pokedex_id || pokemon.pokedex_id === 0) {
          continue
        }

        const nameEn = pokemon.name.en
        const slug = toShowdownSlug(nameEn)

        const baseStats: Record<string, number> = pokemon.stats
          ? {
              hp: pokemon.stats.hp,
              atk: pokemon.stats.atk,
              def: pokemon.stats.def,
              spe_atk: pokemon.stats.spe_atk,
              spe_def: pokemon.stats.spe_def,
              speed: pokemon.stats.vit,
            }
          : { hp: 0, atk: 0, def: 0, spe_atk: 0, spe_def: 0, speed: 0 }

        const evolutionFamily = this.buildEvolutionFamily(pokemon)

        await Species.updateOrCreate(
          { tyradexId: pokemon.pokedex_id },
          {
            tyradexId: pokemon.pokedex_id,
            nameFr: pokemon.name.fr,
            nameEn,
            slug,
            type1: pokemon.types?.[0]?.name ?? 'Normal',
            type2: pokemon.types?.[1]?.name ?? null,
            generation: pokemon.generation ?? gen,
            baseStats,
            evolutionFamily,
            spriteRegular: getSpriteUrl(slug),
            spriteShiny: getShinySpiteUrl(slug),
          }
        )
        count++
      }

      this.logger.success(`Generation ${gen}: ${count} Pokémon seeded successfully.`)
    } catch (error) {
      this.logger.error(`Error seeding generation ${gen}: ${error}`)
    }
  }

  private buildEvolutionFamily(pokemon: TyradexPokemon) {
    const family: Array<{ pokedexId: number; name: string; condition: string | null }> = []

    if (pokemon.evolution?.pre) {
      for (const evo of pokemon.evolution.pre) {
        family.push({
          pokedexId: evo.pokedex_id,
          name: evo.name,
          condition: evo.condition,
        })
      }
    }

    family.push({
      pokedexId: pokemon.pokedex_id,
      name: pokemon.name.en,
      condition: null,
    })

    if (pokemon.evolution?.next) {
      for (const evo of pokemon.evolution.next) {
        family.push({
          pokedexId: evo.pokedex_id,
          name: evo.name,
          condition: evo.condition,
        })
      }
    }

    return family.length > 1 ? family : null
  }
}
