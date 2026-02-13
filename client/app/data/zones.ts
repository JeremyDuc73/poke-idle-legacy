import type { PokemonType } from './types'

export interface WildPokemon {
  nameFr: string
  nameEn: string
  slug: string
  type: PokemonType
  baseHp: number
  baseAtk: number
}

export interface BossTrainer {
  nameFr: string
  nameEn: string
  slug: string
  team: Array<{ nameFr: string; nameEn: string; slug: string; level: number }>
  timerSeconds: number
}

export interface Zone {
  id: number
  nameFr: string
  nameEn: string
  types: PokemonType[]
  wild: WildPokemon[]
  boss: BossTrainer
}

export interface Generation {
  id: number
  nameFr: string
  nameEn: string
  regionFr: string
  regionEn: string
  zones: Zone[]
}

export const GENERATIONS: Generation[] = [
  {
    id: 1,
    nameFr: 'Génération I',
    nameEn: 'Generation I',
    regionFr: 'Kanto',
    regionEn: 'Kanto',
    zones: [
      {
        id: 1,
        nameFr: 'Route 1',
        nameEn: 'Route 1',
        types: ['normal', 'bug'],
        wild: [
          { nameFr: 'Rattata', nameEn: 'Rattata', slug: 'rattata', type: 'normal', baseHp: 30, baseAtk: 6 },
          { nameFr: 'Roucool', nameEn: 'Pidgey', slug: 'pidgey', type: 'normal', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Chenipan', nameEn: 'Caterpie', slug: 'caterpie', type: 'bug', baseHp: 25, baseAtk: 3 },
          { nameFr: 'Aspicot', nameEn: 'Weedle', slug: 'weedle', type: 'bug', baseHp: 25, baseAtk: 4 },
        ],
        boss: {
          nameFr: 'Pierre',
          nameEn: 'Brock',
          slug: 'brock',
          team: [
            { nameFr: 'Racaillou', nameEn: 'Geodude', slug: 'geodude', level: 12 },
            { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', level: 14 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 2,
        nameFr: 'Mont Sélénite',
        nameEn: 'Mt. Moon',
        types: ['poison', 'rock', 'fairy'],
        wild: [
          { nameFr: 'Nosferapti', nameEn: 'Zubat', slug: 'zubat', type: 'poison', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Racaillou', nameEn: 'Geodude', slug: 'geodude', type: 'rock', baseHp: 40, baseAtk: 8 },
          { nameFr: 'Paras', nameEn: 'Paras', slug: 'paras', type: 'bug', baseHp: 35, baseAtk: 7 },
          { nameFr: 'Mélofée', nameEn: 'Clefairy', slug: 'clefairy', type: 'fairy', baseHp: 50, baseAtk: 5 },
        ],
        boss: {
          nameFr: 'Ondine',
          nameEn: 'Misty',
          slug: 'misty',
          team: [
            { nameFr: 'Stari', nameEn: 'Staryu', slug: 'staryu', level: 18 },
            { nameFr: 'Staross', nameEn: 'Starmie', slug: 'starmie', level: 21 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 3,
        nameFr: 'Route 24 — Pont Pépite',
        nameEn: 'Route 24 — Nugget Bridge',
        types: ['grass', 'poison', 'fighting'],
        wild: [
          { nameFr: 'Mystherbe', nameEn: 'Oddish', slug: 'oddish', type: 'grass', baseHp: 45, baseAtk: 6 },
          { nameFr: 'Abra', nameEn: 'Abra', slug: 'abra', type: 'psychic', baseHp: 25, baseAtk: 10 },
          { nameFr: 'Abo', nameEn: 'Ekans', slug: 'ekans', type: 'poison', baseHp: 35, baseAtk: 6 },
          { nameFr: 'Férosinge', nameEn: 'Mankey', slug: 'mankey', type: 'fighting', baseHp: 40, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Major Bob',
          nameEn: 'Lt. Surge',
          slug: 'lt-surge',
          team: [
            { nameFr: 'Voltorbe', nameEn: 'Voltorb', slug: 'voltorb', level: 21 },
            { nameFr: 'Pikachu', nameEn: 'Pikachu', slug: 'pikachu', level: 18 },
            { nameFr: 'Raichu', nameEn: 'Raichu', slug: 'raichu', level: 24 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 4,
        nameFr: 'Forêt de Jade',
        nameEn: 'Viridian Forest',
        types: ['bug', 'grass'],
        wild: [
          { nameFr: 'Insécateur', nameEn: 'Scyther', slug: 'scyther', type: 'bug', baseHp: 50, baseAtk: 11 },
          { nameFr: 'Scarabrute', nameEn: 'Pinsir', slug: 'pinsir', type: 'bug', baseHp: 55, baseAtk: 12 },
          { nameFr: 'Papilusion', nameEn: 'Butterfree', slug: 'butterfree', type: 'bug', baseHp: 45, baseAtk: 5 },
          { nameFr: 'Dardargnan', nameEn: 'Beedrill', slug: 'beedrill', type: 'bug', baseHp: 45, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Érika',
          nameEn: 'Erika',
          slug: 'erika',
          team: [
            { nameFr: 'Saquedeneu', nameEn: 'Tangela', slug: 'tangela', level: 29 },
            { nameFr: 'Herbizarre', nameEn: 'Ivysaur', slug: 'ivysaur', level: 29 },
            { nameFr: 'Rafflesia', nameEn: 'Vileplume', slug: 'vileplume', level: 29 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 5,
        nameFr: 'Tour Pokémon',
        nameEn: 'Pokémon Tower',
        types: ['ghost', 'poison'],
        wild: [
          { nameFr: 'Fantominus', nameEn: 'Gastly', slug: 'gastly', type: 'ghost', baseHp: 30, baseAtk: 10 },
          { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', type: 'ghost', baseHp: 45, baseAtk: 12 },
          { nameFr: 'Osselait', nameEn: 'Cubone', slug: 'cubone', type: 'ground', baseHp: 50, baseAtk: 7 },
          { nameFr: 'Smogo', nameEn: 'Koffing', slug: 'koffing', type: 'poison', baseHp: 40, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Koga',
          nameEn: 'Koga',
          slug: 'koga',
          team: [
            { nameFr: 'Smogo', nameEn: 'Koffing', slug: 'koffing', level: 37 },
            { nameFr: 'Smogogo', nameEn: 'Weezing', slug: 'weezing', level: 39 },
            { nameFr: 'Smogo', nameEn: 'Koffing', slug: 'koffing', level: 37 },
            { nameFr: 'Smogogo', nameEn: 'Weezing', slug: 'weezing', level: 43 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 6,
        nameFr: 'Îles Écume',
        nameEn: 'Seafoam Islands',
        types: ['water', 'ice'],
        wild: [
          { nameFr: 'Tentacool', nameEn: 'Tentacool', slug: 'tentacool', type: 'water', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Kokiyas', nameEn: 'Shellder', slug: 'shellder', type: 'water', baseHp: 30, baseAtk: 7 },
          { nameFr: 'Otaria', nameEn: 'Seel', slug: 'seel', type: 'water', baseHp: 55, baseAtk: 5 },
          { nameFr: 'Stari', nameEn: 'Staryu', slug: 'staryu', type: 'water', baseHp: 30, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Morgane',
          nameEn: 'Sabrina',
          slug: 'sabrina',
          team: [
            { nameFr: 'Kadabra', nameEn: 'Kadabra', slug: 'kadabra', level: 38 },
            { nameFr: 'M. Mime', nameEn: 'Mr. Mime', slug: 'mr-mime', level: 37 },
            { nameFr: 'Hypnomade', nameEn: 'Hypno', slug: 'hypno', level: 38 },
            { nameFr: 'Alakazam', nameEn: 'Alakazam', slug: 'alakazam', level: 43 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 7,
        nameFr: 'Manoir Pokémon',
        nameEn: 'Pokémon Mansion',
        types: ['fire', 'poison'],
        wild: [
          { nameFr: 'Caninos', nameEn: 'Growlithe', slug: 'growlithe', type: 'fire', baseHp: 55, baseAtk: 7 },
          { nameFr: 'Ponyta', nameEn: 'Ponyta', slug: 'ponyta', type: 'fire', baseHp: 50, baseAtk: 8 },
          { nameFr: 'Tadmorv', nameEn: 'Grimer', slug: 'grimer', type: 'poison', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', type: 'electric', baseHp: 25, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Auguste',
          nameEn: 'Blaine',
          slug: 'blaine',
          team: [
            { nameFr: 'Caninos', nameEn: 'Growlithe', slug: 'growlithe', level: 42 },
            { nameFr: 'Ponyta', nameEn: 'Ponyta', slug: 'ponyta', level: 40 },
            { nameFr: 'Galopa', nameEn: 'Rapidash', slug: 'rapidash', level: 42 },
            { nameFr: 'Arcanin', nameEn: 'Arcanine', slug: 'arcanine', level: 47 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 8,
        nameFr: 'Route Victoire',
        nameEn: 'Victory Road',
        types: ['fighting', 'rock', 'ground'],
        wild: [
          { nameFr: 'Machopeur', nameEn: 'Machoke', slug: 'machoke', type: 'fighting', baseHp: 70, baseAtk: 10 },
          { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', type: 'rock', baseHp: 35, baseAtk: 5 },
          { nameFr: 'Marowak', nameEn: 'Marowak', slug: 'marowak', type: 'ground', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Grolem', nameEn: 'Golem', slug: 'golem', type: 'rock', baseHp: 70, baseAtk: 11 },
        ],
        boss: {
          nameFr: 'Giovanni',
          nameEn: 'Giovanni',
          slug: 'giovanni',
          team: [
            { nameFr: 'Rhinocorne', nameEn: 'Rhyhorn', slug: 'rhyhorn', level: 45 },
            { nameFr: 'Nidoqueen', nameEn: 'Nidoqueen', slug: 'nidoqueen', level: 44 },
            { nameFr: 'Nidoking', nameEn: 'Nidoking', slug: 'nidoking', level: 45 },
            { nameFr: 'Rhinoféros', nameEn: 'Rhydon', slug: 'rhydon', level: 50 },
          ],
          timerSeconds: 30,
        },
      },
    ],
  },
]

export function getGeneration(genId: number): Generation | undefined {
  return GENERATIONS.find((g) => g.id === genId)
}

export function getZone(genId: number, zoneId: number): Zone | undefined {
  return getGeneration(genId)?.zones.find((z) => z.id === zoneId)
}

export interface BossInfo {
  genId: number
  zoneId: number
  zoneFr: string
  zoneEn: string
  regionFr: string
  regionEn: string
  boss: BossTrainer
}

export function getAllBosses(): BossInfo[] {
  const bosses: BossInfo[] = []
  for (const gen of GENERATIONS) {
    for (const zone of gen.zones) {
      bosses.push({
        genId: gen.id,
        zoneId: zone.id,
        zoneFr: zone.nameFr,
        zoneEn: zone.nameEn,
        regionFr: gen.regionFr,
        regionEn: gen.regionEn,
        boss: zone.boss,
      })
    }
  }
  return bosses
}
