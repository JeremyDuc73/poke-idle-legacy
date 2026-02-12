export interface WildPokemon {
  nameFr: string
  nameEn: string
  slug: string
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
        wild: [
          { nameFr: 'Rattata', nameEn: 'Rattata', slug: 'rattata', baseHp: 30, baseAtk: 6 },
          { nameFr: 'Roucool', nameEn: 'Pidgey', slug: 'pidgey', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Chenipan', nameEn: 'Caterpie', slug: 'caterpie', baseHp: 25, baseAtk: 3 },
          { nameFr: 'Aspicot', nameEn: 'Weedle', slug: 'weedle', baseHp: 25, baseAtk: 4 },
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
        wild: [
          { nameFr: 'Nosferapti', nameEn: 'Zubat', slug: 'zubat', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Racaillou', nameEn: 'Geodude', slug: 'geodude', baseHp: 40, baseAtk: 8 },
          { nameFr: 'Paras', nameEn: 'Paras', slug: 'paras', baseHp: 35, baseAtk: 7 },
          { nameFr: 'Mélofée', nameEn: 'Clefairy', slug: 'clefairy', baseHp: 50, baseAtk: 5 },
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
        wild: [
          { nameFr: 'Mystherbe', nameEn: 'Oddish', slug: 'oddish', baseHp: 45, baseAtk: 6 },
          { nameFr: 'Abra', nameEn: 'Abra', slug: 'abra', baseHp: 25, baseAtk: 10 },
          { nameFr: 'Abo', nameEn: 'Ekans', slug: 'ekans', baseHp: 35, baseAtk: 6 },
          { nameFr: 'Férosinge', nameEn: 'Mankey', slug: 'mankey', baseHp: 40, baseAtk: 8 },
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
        wild: [
          { nameFr: 'Insécateur', nameEn: 'Scyther', slug: 'scyther', baseHp: 50, baseAtk: 11 },
          { nameFr: 'Scarabrute', nameEn: 'Pinsir', slug: 'pinsir', baseHp: 55, baseAtk: 12 },
          { nameFr: 'Papilusion', nameEn: 'Butterfree', slug: 'butterfree', baseHp: 45, baseAtk: 5 },
          { nameFr: 'Dardargnan', nameEn: 'Beedrill', slug: 'beedrill', baseHp: 45, baseAtk: 8 },
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
        wild: [
          { nameFr: 'Fantominus', nameEn: 'Gastly', slug: 'gastly', baseHp: 30, baseAtk: 10 },
          { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', baseHp: 45, baseAtk: 12 },
          { nameFr: 'Osselait', nameEn: 'Cubone', slug: 'cubone', baseHp: 50, baseAtk: 7 },
          { nameFr: 'Smogo', nameEn: 'Koffing', slug: 'koffing', baseHp: 40, baseAtk: 7 },
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
        wild: [
          { nameFr: 'Tentacool', nameEn: 'Tentacool', slug: 'tentacool', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Kokiyas', nameEn: 'Shellder', slug: 'shellder', baseHp: 30, baseAtk: 7 },
          { nameFr: 'Otaria', nameEn: 'Seel', slug: 'seel', baseHp: 55, baseAtk: 5 },
          { nameFr: 'Stari', nameEn: 'Staryu', slug: 'staryu', baseHp: 30, baseAtk: 7 },
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
        wild: [
          { nameFr: 'Caninos', nameEn: 'Growlithe', slug: 'growlithe', baseHp: 55, baseAtk: 7 },
          { nameFr: 'Ponyta', nameEn: 'Ponyta', slug: 'ponyta', baseHp: 50, baseAtk: 8 },
          { nameFr: 'Tadmorv', nameEn: 'Grimer', slug: 'grimer', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', baseHp: 25, baseAtk: 10 },
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
        wild: [
          { nameFr: 'Machopeur', nameEn: 'Machoke', slug: 'machoke', baseHp: 70, baseAtk: 10 },
          { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', baseHp: 35, baseAtk: 5 },
          { nameFr: 'Marowak', nameEn: 'Marowak', slug: 'marowak', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Grolem', nameEn: 'Golem', slug: 'golem', baseHp: 70, baseAtk: 11 },
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
