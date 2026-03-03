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
          slug: 'ltsurge',
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
            { nameFr: 'M. Mime', nameEn: 'Mr. Mime', slug: 'mrmime', level: 37 },
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
      {
        id: 9,
        nameFr: 'Ligue Pokémon — Olga',
        nameEn: 'Pokémon League — Lorelei',
        types: ['ice', 'water'],
        wild: [
          { nameFr: 'Lamantine', nameEn: 'Dewgong', slug: 'dewgong', type: 'water', baseHp: 80, baseAtk: 8 },
          { nameFr: 'Crustabri', nameEn: 'Cloyster', slug: 'cloyster', type: 'ice', baseHp: 50, baseAtk: 10 },
          { nameFr: 'Lokhlass', nameEn: 'Lapras', slug: 'lapras', type: 'water', baseHp: 100, baseAtk: 8 },
          { nameFr: 'Lippoutou', nameEn: 'Jynx', slug: 'jynx', type: 'ice', baseHp: 55, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Olga',
          nameEn: 'Lorelei',
          slug: 'lorelei-gen3',
          team: [
            { nameFr: 'Lamantine', nameEn: 'Dewgong', slug: 'dewgong', level: 52 },
            { nameFr: 'Crustabri', nameEn: 'Cloyster', slug: 'cloyster', level: 51 },
            { nameFr: 'Flagadoss', nameEn: 'Slowbro', slug: 'slowbro', level: 52 },
            { nameFr: 'Lippoutou', nameEn: 'Jynx', slug: 'jynx', level: 54 },
            { nameFr: 'Lokhlass', nameEn: 'Lapras', slug: 'lapras', level: 54 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 10,
        nameFr: 'Ligue Pokémon — Aldo',
        nameEn: 'Pokémon League — Bruno',
        types: ['fighting', 'rock'],
        wild: [
          { nameFr: 'Machopeur', nameEn: 'Machoke', slug: 'machoke', type: 'fighting', baseHp: 70, baseAtk: 10 },
          { nameFr: 'Mackogneur', nameEn: 'Machamp', slug: 'machamp', type: 'fighting', baseHp: 80, baseAtk: 13 },
          { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', type: 'rock', baseHp: 35, baseAtk: 5 },
          { nameFr: 'Kicklee', nameEn: 'Hitmonlee', slug: 'hitmonlee', type: 'fighting', baseHp: 50, baseAtk: 12 },
        ],
        boss: {
          nameFr: 'Aldo',
          nameEn: 'Bruno',
          slug: 'bruno',
          team: [
            { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', level: 51 },
            { nameFr: 'Kicklee', nameEn: 'Hitmonlee', slug: 'hitmonlee', level: 53 },
            { nameFr: 'Tygnon', nameEn: 'Hitmonchan', slug: 'hitmonchan', level: 53 },
            { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', level: 54 },
            { nameFr: 'Mackogneur', nameEn: 'Machamp', slug: 'machamp', level: 56 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 11,
        nameFr: 'Ligue Pokémon — Agatha',
        nameEn: 'Pokémon League — Agatha',
        types: ['ghost', 'poison'],
        wild: [
          { nameFr: 'Ectoplasma', nameEn: 'Gengar', slug: 'gengar', type: 'ghost', baseHp: 60, baseAtk: 13 },
          { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', type: 'ghost', baseHp: 45, baseAtk: 12 },
          { nameFr: 'Arbok', nameEn: 'Arbok', slug: 'arbok', type: 'poison', baseHp: 60, baseAtk: 9 },
          { nameFr: 'Nosféralto', nameEn: 'Golbat', slug: 'golbat', type: 'poison', baseHp: 65, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Agatha',
          nameEn: 'Agatha',
          slug: 'agatha-gen3',
          team: [
            { nameFr: 'Ectoplasma', nameEn: 'Gengar', slug: 'gengar', level: 54 },
            { nameFr: 'Nosféralto', nameEn: 'Golbat', slug: 'golbat', level: 54 },
            { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', level: 53 },
            { nameFr: 'Arbok', nameEn: 'Arbok', slug: 'arbok', level: 56 },
            { nameFr: 'Ectoplasma', nameEn: 'Gengar', slug: 'gengar', level: 58 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 12,
        nameFr: 'Ligue Pokémon — Peter',
        nameEn: 'Pokémon League — Lance',
        types: ['dragon', 'flying'],
        wild: [
          { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', type: 'dragon', baseHp: 90, baseAtk: 14 },
          { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', type: 'water', baseHp: 80, baseAtk: 12 },
          { nameFr: 'Ptéra', nameEn: 'Aerodactyl', slug: 'aerodactyl', type: 'rock', baseHp: 70, baseAtk: 10 },
          { nameFr: 'Draco', nameEn: 'Dragonair', slug: 'dragonair', type: 'dragon', baseHp: 60, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Peter',
          nameEn: 'Lance',
          slug: 'lance',
          team: [
            { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', level: 56 },
            { nameFr: 'Draco', nameEn: 'Dragonair', slug: 'dragonair', level: 54 },
            { nameFr: 'Draco', nameEn: 'Dragonair', slug: 'dragonair', level: 54 },
            { nameFr: 'Ptéra', nameEn: 'Aerodactyl', slug: 'aerodactyl', level: 58 },
            { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', level: 62 },
          ],
          timerSeconds: 60,
        },
      },
      {
        id: 13,
        nameFr: 'Maître — Blue',
        nameEn: 'Champion — Blue',
        types: ['normal', 'water', 'fire'],
        wild: [
          { nameFr: 'Roucarnage', nameEn: 'Pidgeot', slug: 'pidgeot', type: 'normal', baseHp: 80, baseAtk: 8 },
          { nameFr: 'Alakazam', nameEn: 'Alakazam', slug: 'alakazam', type: 'psychic', baseHp: 55, baseAtk: 14 },
          { nameFr: 'Rhinoféros', nameEn: 'Rhydon', slug: 'rhydon', type: 'ground', baseHp: 90, baseAtk: 13 },
          { nameFr: 'Arcanin', nameEn: 'Arcanine', slug: 'arcanine', type: 'fire', baseHp: 80, baseAtk: 11 },
        ],
        boss: {
          nameFr: 'Blue',
          nameEn: 'Blue',
          slug: 'blue',
          team: [
            { nameFr: 'Roucarnage', nameEn: 'Pidgeot', slug: 'pidgeot', level: 59 },
            { nameFr: 'Alakazam', nameEn: 'Alakazam', slug: 'alakazam', level: 57 },
            { nameFr: 'Rhinoféros', nameEn: 'Rhydon', slug: 'rhydon', level: 59 },
            { nameFr: 'Noadkoko', nameEn: 'Exeggutor', slug: 'exeggutor', level: 61 },
            { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', level: 61 },
            { nameFr: 'Dracaufeu', nameEn: 'Charizard', slug: 'charizard', level: 65 },
          ],
          timerSeconds: 60,
        },
      },
    ],
  },
  {
    id: 2,
    nameFr: 'Génération II',
    nameEn: 'Generation II',
    regionFr: 'Johto',
    regionEn: 'Johto',
    zones: [
      {
        id: 1,
        nameFr: 'Route 30 — Mauville',
        nameEn: 'Route 30 — Violet City',
        types: ['normal', 'flying'],
        wild: [
          { nameFr: 'Fouinette', nameEn: 'Sentret', slug: 'sentret', type: 'normal', baseHp: 35, baseAtk: 5 },
          { nameFr: 'Hoothoot', nameEn: 'Hoothoot', slug: 'hoothoot', type: 'flying', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Corniaud', nameEn: 'Houndour', slug: 'houndour', type: 'fire', baseHp: 35, baseAtk: 7 },
          { nameFr: 'Tournegrin', nameEn: 'Sunkern', slug: 'sunkern', type: 'grass', baseHp: 20, baseAtk: 3 },
        ],
        boss: {
          nameFr: 'Albert',
          nameEn: 'Falkner',
          slug: 'falkner',
          team: [
            { nameFr: 'Roucool', nameEn: 'Pidgey', slug: 'pidgey', level: 7 },
            { nameFr: 'Roucoups', nameEn: 'Pidgeotto', slug: 'pidgeotto', level: 9 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 2,
        nameFr: 'Bois aux Chênes',
        nameEn: 'Azalea Town',
        types: ['bug', 'grass'],
        wild: [
          { nameFr: 'Mimigal', nameEn: 'Spinarak', slug: 'spinarak', type: 'bug', baseHp: 30, baseAtk: 6 },
          { nameFr: 'Coxy', nameEn: 'Ledyba', slug: 'ledyba', type: 'bug', baseHp: 30, baseAtk: 4 },
          { nameFr: 'Granivol', nameEn: 'Hoppip', slug: 'hoppip', type: 'grass', baseHp: 25, baseAtk: 4 },
          { nameFr: 'Germignon', nameEn: 'Chikorita', slug: 'chikorita', type: 'grass', baseHp: 35, baseAtk: 5 },
        ],
        boss: {
          nameFr: 'Hector',
          nameEn: 'Bugsy',
          slug: 'bugsy',
          team: [
            { nameFr: 'Coconfort', nameEn: 'Kakuna', slug: 'kakuna', level: 14 },
            { nameFr: 'Insécateur', nameEn: 'Scyther', slug: 'scyther', level: 16 },
            { nameFr: 'Chrysacier', nameEn: 'Metapod', slug: 'metapod', level: 14 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 3,
        nameFr: 'Doublonville',
        nameEn: 'Goldenrod City',
        types: ['normal', 'fairy'],
        wild: [
          { nameFr: 'Snubbull', nameEn: 'Snubbull', slug: 'snubbull', type: 'fairy', baseHp: 50, baseAtk: 8 },
          { nameFr: 'Queulorior', nameEn: 'Smeargle', slug: 'smeargle', type: 'normal', baseHp: 40, baseAtk: 3 },
          { nameFr: 'Leuphorie', nameEn: 'Chansey', slug: 'chansey', type: 'normal', baseHp: 100, baseAtk: 3 },
          { nameFr: 'Écremeuh', nameEn: 'Miltank', slug: 'miltank', type: 'normal', baseHp: 70, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Blanche',
          nameEn: 'Whitney',
          slug: 'whitney',
          team: [
            { nameFr: 'Mélofée', nameEn: 'Clefairy', slug: 'clefairy', level: 18 },
            { nameFr: 'Écremeuh', nameEn: 'Miltank', slug: 'miltank', level: 20 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 4,
        nameFr: 'Rosalia',
        nameEn: 'Ecruteak City',
        types: ['ghost', 'fire'],
        wild: [
          { nameFr: 'Fantominus', nameEn: 'Gastly', slug: 'gastly', type: 'ghost', baseHp: 30, baseAtk: 10 },
          { nameFr: 'Feuforêve', nameEn: 'Misdreavus', slug: 'misdreavus', type: 'ghost', baseHp: 45, baseAtk: 8 },
          { nameFr: 'Caninos', nameEn: 'Growlithe', slug: 'growlithe', type: 'fire', baseHp: 55, baseAtk: 7 },
          { nameFr: 'Magby', nameEn: 'Magby', slug: 'magby', type: 'fire', baseHp: 35, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Mortimer',
          nameEn: 'Morty',
          slug: 'morty',
          team: [
            { nameFr: 'Fantominus', nameEn: 'Gastly', slug: 'gastly', level: 21 },
            { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', level: 21 },
            { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', level: 23 },
            { nameFr: 'Ectoplasma', nameEn: 'Gengar', slug: 'gengar', level: 25 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 5,
        nameFr: 'Ironto',
        nameEn: 'Cianwood City',
        types: ['fighting'],
        wild: [
          { nameFr: 'Machoc', nameEn: 'Machop', slug: 'machop', type: 'fighting', baseHp: 50, baseAtk: 7 },
          { nameFr: 'Têtarte', nameEn: 'Poliwhirl', slug: 'poliwhirl', type: 'water', baseHp: 55, baseAtk: 6 },
          { nameFr: 'Krabby', nameEn: 'Krabby', slug: 'krabby', type: 'water', baseHp: 30, baseAtk: 10 },
          { nameFr: 'Tentacool', nameEn: 'Tentacool', slug: 'tentacool', type: 'water', baseHp: 30, baseAtk: 5 },
        ],
        boss: {
          nameFr: 'Chuck',
          nameEn: 'Chuck',
          slug: 'chuck',
          team: [
            { nameFr: 'Colossinge', nameEn: 'Primeape', slug: 'primeape', level: 27 },
            { nameFr: 'Tartard', nameEn: 'Poliwrath', slug: 'poliwrath', level: 30 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 6,
        nameFr: 'Oliville',
        nameEn: 'Olivine City',
        types: ['steel', 'electric'],
        wild: [
          { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', type: 'electric', baseHp: 25, baseAtk: 10 },
          { nameFr: 'Steelix', nameEn: 'Steelix', slug: 'steelix', type: 'steel', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Wattouat', nameEn: 'Mareep', slug: 'mareep', type: 'electric', baseHp: 40, baseAtk: 6 },
          { nameFr: 'Voltorbe', nameEn: 'Voltorb', slug: 'voltorb', type: 'electric', baseHp: 30, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Jasmine',
          nameEn: 'Jasmine',
          slug: 'jasmine',
          team: [
            { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', level: 30 },
            { nameFr: 'Steelix', nameEn: 'Steelix', slug: 'steelix', level: 35 },
            { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', level: 30 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 7,
        nameFr: 'Acajou',
        nameEn: 'Mahogany Town',
        types: ['ice', 'water'],
        wild: [
          { nameFr: 'Marcacrin', nameEn: 'Swinub', slug: 'swinub', type: 'ice', baseHp: 40, baseAtk: 6 },
          { nameFr: 'Cadoizo', nameEn: 'Delibird', slug: 'delibird', type: 'ice', baseHp: 35, baseAtk: 5 },
          { nameFr: 'Otaria', nameEn: 'Seel', slug: 'seel', type: 'water', baseHp: 55, baseAtk: 5 },
          { nameFr: 'Lamantine', nameEn: 'Dewgong', slug: 'dewgong', type: 'ice', baseHp: 70, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Frédo',
          nameEn: 'Pryce',
          slug: 'pryce',
          team: [
            { nameFr: 'Lamantine', nameEn: 'Dewgong', slug: 'dewgong', level: 30 },
            { nameFr: 'Cochignon', nameEn: 'Piloswine', slug: 'piloswine', level: 34 },
            { nameFr: 'Crustabri', nameEn: 'Cloyster', slug: 'cloyster', level: 32 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 8,
        nameFr: 'Ébènelle',
        nameEn: 'Blackthorn City',
        types: ['dragon', 'flying'],
        wild: [
          { nameFr: 'Draco', nameEn: 'Dragonair', slug: 'dragonair', type: 'dragon', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Coatox', nameEn: 'Murkrow', slug: 'murkrow', type: 'dark', baseHp: 40, baseAtk: 8 },
          { nameFr: 'Airmure', nameEn: 'Skarmory', slug: 'skarmory', type: 'steel', baseHp: 55, baseAtk: 8 },
          { nameFr: 'Minidraco', nameEn: 'Dratini', slug: 'dratini', type: 'dragon', baseHp: 35, baseAtk: 6 },
        ],
        boss: {
          nameFr: 'Sandra',
          nameEn: 'Clair',
          slug: 'clair',
          team: [
            { nameFr: 'Draco', nameEn: 'Dragonair', slug: 'dragonair', level: 37 },
            { nameFr: 'Draco', nameEn: 'Dragonair', slug: 'dragonair', level: 37 },
            { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', level: 38 },
            { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', level: 40 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 9,
        nameFr: 'Ligue — Clément',
        nameEn: 'League — Will',
        types: ['psychic'],
        wild: [
          { nameFr: 'Natu', nameEn: 'Natu', slug: 'natu', type: 'psychic', baseHp: 30, baseAtk: 7 },
          { nameFr: 'Xatu', nameEn: 'Xatu', slug: 'xatu', type: 'psychic', baseHp: 55, baseAtk: 9 },
          { nameFr: 'Mentali', nameEn: 'Espeon', slug: 'espeon', type: 'psychic', baseHp: 55, baseAtk: 13 },
          { nameFr: 'Qulbutoké', nameEn: 'Wobbuffet', slug: 'wobbuffet', type: 'psychic', baseHp: 120, baseAtk: 3 },
        ],
        boss: {
          nameFr: 'Clément',
          nameEn: 'Will',
          slug: 'will',
          team: [
            { nameFr: 'Xatu', nameEn: 'Xatu', slug: 'xatu', level: 40 },
            { nameFr: 'Lippoutou', nameEn: 'Jynx', slug: 'jynx', level: 41 },
            { nameFr: 'Mentali', nameEn: 'Espeon', slug: 'espeon', level: 41 },
            { nameFr: 'Flagadoss', nameEn: 'Slowbro', slug: 'slowbro', level: 41 },
            { nameFr: 'Xatu', nameEn: 'Xatu', slug: 'xatu', level: 42 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 10,
        nameFr: 'Ligue — Koga',
        nameEn: 'League — Koga',
        types: ['poison'],
        wild: [
          { nameFr: 'Arbok', nameEn: 'Arbok', slug: 'arbok', type: 'poison', baseHp: 60, baseAtk: 9 },
          { nameFr: 'Scorplane', nameEn: 'Gligar', slug: 'gligar', type: 'ground', baseHp: 55, baseAtk: 8 },
          { nameFr: 'Smogogo', nameEn: 'Weezing', slug: 'weezing', type: 'poison', baseHp: 55, baseAtk: 9 },
          { nameFr: 'Grotadmorv', nameEn: 'Muk', slug: 'muk', type: 'poison', baseHp: 80, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Koga',
          nameEn: 'Koga',
          slug: 'koga',
          team: [
            { nameFr: 'Arbok', nameEn: 'Arbok', slug: 'arbok', level: 42 },
            { nameFr: 'Nostenfer', nameEn: 'Crobat', slug: 'crobat', level: 44 },
            { nameFr: 'Smogogo', nameEn: 'Weezing', slug: 'weezing', level: 43 },
            { nameFr: 'Grotadmorv', nameEn: 'Muk', slug: 'muk', level: 43 },
            { nameFr: 'Abo', nameEn: 'Ekans', slug: 'ekans', level: 44 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 11,
        nameFr: 'Ligue — Aldo',
        nameEn: 'League — Bruno',
        types: ['fighting'],
        wild: [
          { nameFr: 'Kapoera', nameEn: 'Hitmontop', slug: 'hitmontop', type: 'fighting', baseHp: 50, baseAtk: 10 },
          { nameFr: 'Mackogneur', nameEn: 'Machamp', slug: 'machamp', type: 'fighting', baseHp: 80, baseAtk: 13 },
          { nameFr: 'Kicklee', nameEn: 'Hitmonlee', slug: 'hitmonlee', type: 'fighting', baseHp: 50, baseAtk: 12 },
          { nameFr: 'Tygnon', nameEn: 'Hitmonchan', slug: 'hitmonchan', type: 'fighting', baseHp: 50, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Aldo',
          nameEn: 'Bruno',
          slug: 'bruno',
          team: [
            { nameFr: 'Kapoera', nameEn: 'Hitmontop', slug: 'hitmontop', level: 42 },
            { nameFr: 'Kicklee', nameEn: 'Hitmonlee', slug: 'hitmonlee', level: 43 },
            { nameFr: 'Tygnon', nameEn: 'Hitmonchan', slug: 'hitmonchan', level: 43 },
            { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', level: 44 },
            { nameFr: 'Mackogneur', nameEn: 'Machamp', slug: 'machamp', level: 46 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 12,
        nameFr: 'Ligue — Marion',
        nameEn: 'League — Karen',
        types: ['dark'],
        wild: [
          { nameFr: 'Noctali', nameEn: 'Umbreon', slug: 'umbreon', type: 'dark', baseHp: 70, baseAtk: 7 },
          { nameFr: 'Démolosse', nameEn: 'Houndoom', slug: 'houndoom', type: 'dark', baseHp: 60, baseAtk: 11 },
          { nameFr: 'Cornèbre', nameEn: 'Murkrow', slug: 'murkrow', type: 'dark', baseHp: 40, baseAtk: 8 },
          { nameFr: 'Ténéfix', nameEn: 'Sneasel', slug: 'sneasel', type: 'dark', baseHp: 45, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Marion',
          nameEn: 'Karen',
          slug: 'karen',
          team: [
            { nameFr: 'Noctali', nameEn: 'Umbreon', slug: 'umbreon', level: 42 },
            { nameFr: 'Démolosse', nameEn: 'Houndoom', slug: 'houndoom', level: 47 },
            { nameFr: 'Farfuret', nameEn: 'Sneasel', slug: 'sneasel', level: 44 },
            { nameFr: 'Ténéfix', nameEn: 'Murkrow', slug: 'murkrow', level: 44 },
            { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', level: 46 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 13,
        nameFr: 'Maître — Peter',
        nameEn: 'Champion — Lance',
        types: ['dragon', 'flying'],
        wild: [
          { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', type: 'dragon', baseHp: 90, baseAtk: 14 },
          { nameFr: 'Ptéra', nameEn: 'Aerodactyl', slug: 'aerodactyl', type: 'rock', baseHp: 70, baseAtk: 10 },
          { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', type: 'water', baseHp: 80, baseAtk: 12 },
          { nameFr: 'Dracaufeu', nameEn: 'Charizard', slug: 'charizard', type: 'fire', baseHp: 70, baseAtk: 11 },
        ],
        boss: {
          nameFr: 'Peter',
          nameEn: 'Lance',
          slug: 'lance',
          team: [
            { nameFr: 'Léviator', nameEn: 'Gyarados', slug: 'gyarados', level: 44 },
            { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', level: 49 },
            { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', level: 49 },
            { nameFr: 'Ptéra', nameEn: 'Aerodactyl', slug: 'aerodactyl', level: 48 },
            { nameFr: 'Dracaufeu', nameEn: 'Charizard', slug: 'charizard', level: 48 },
            { nameFr: 'Dracolosse', nameEn: 'Dragonite', slug: 'dragonite', level: 50 },
          ],
          timerSeconds: 60,
        },
      },
    ],
  },
  {
    id: 3,
    nameFr: 'Génération III',
    nameEn: 'Generation III',
    regionFr: 'Hoenn',
    regionEn: 'Hoenn',
    zones: [
      {
        id: 1,
        nameFr: 'Route 101',
        nameEn: 'Route 101',
        types: ['normal', 'grass'],
        wild: [
          { nameFr: 'Zigzaton', nameEn: 'Zigzagoon', slug: 'zigzagoon', type: 'normal', baseHp: 30, baseAtk: 4 },
          { nameFr: 'Medhyèna', nameEn: 'Poochyena', slug: 'poochyena', type: 'dark', baseHp: 30, baseAtk: 5 },
          { nameFr: 'Tarsal', nameEn: 'Ralts', slug: 'ralts', type: 'psychic', baseHp: 20, baseAtk: 5 },
          { nameFr: 'Chétiflor', nameEn: 'Wurmple', slug: 'wurmple', type: 'bug', baseHp: 25, baseAtk: 3 },
        ],
        boss: {
          nameFr: 'Roxanne',
          nameEn: 'Roxanne',
          slug: 'roxanne',
          team: [
            { nameFr: 'Racaillou', nameEn: 'Geodude', slug: 'geodude', level: 12 },
            { nameFr: 'Racaillou', nameEn: 'Geodude', slug: 'geodude', level: 12 },
            { nameFr: 'Tarinor', nameEn: 'Nosepass', slug: 'nosepass', level: 15 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 2,
        nameFr: 'Île de Myokara',
        nameEn: 'Dewford Town',
        types: ['fighting', 'dark'],
        wild: [
          { nameFr: 'Machoc', nameEn: 'Machop', slug: 'machop', type: 'fighting', baseHp: 50, baseAtk: 7 },
          { nameFr: 'Makuhita', nameEn: 'Makuhita', slug: 'makuhita', type: 'fighting', baseHp: 55, baseAtk: 7 },
          { nameFr: 'Ténéfix', nameEn: 'Sableye', slug: 'sableye', type: 'dark', baseHp: 40, baseAtk: 7 },
          { nameFr: 'Mysdibule', nameEn: 'Mawile', slug: 'mawile', type: 'steel', baseHp: 40, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Bastien',
          nameEn: 'Brawly',
          slug: 'brawly',
          team: [
            { nameFr: 'Machoc', nameEn: 'Machop', slug: 'machop', level: 16 },
            { nameFr: 'Méditikka', nameEn: 'Meditite', slug: 'meditite', level: 16 },
            { nameFr: 'Makuhita', nameEn: 'Makuhita', slug: 'makuhita', level: 19 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 3,
        nameFr: 'Lavandia',
        nameEn: 'Mauville City',
        types: ['electric'],
        wild: [
          { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', type: 'electric', baseHp: 25, baseAtk: 10 },
          { nameFr: 'Voltorbe', nameEn: 'Voltorb', slug: 'voltorb', type: 'electric', baseHp: 30, baseAtk: 7 },
          { nameFr: 'Dynavolt', nameEn: 'Electrike', slug: 'electrike', type: 'electric', baseHp: 30, baseAtk: 7 },
          { nameFr: 'Posipi', nameEn: 'Plusle', slug: 'plusle', type: 'electric', baseHp: 40, baseAtk: 6 },
        ],
        boss: {
          nameFr: 'Voltère',
          nameEn: 'Wattson',
          slug: 'wattson',
          team: [
            { nameFr: 'Voltorbe', nameEn: 'Voltorb', slug: 'voltorb', level: 20 },
            { nameFr: 'Dynavolt', nameEn: 'Electrike', slug: 'electrike', level: 20 },
            { nameFr: 'Magnéton', nameEn: 'Magneton', slug: 'magneton', level: 22 },
            { nameFr: 'Élecsprint', nameEn: 'Manectric', slug: 'manectric', level: 24 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 4,
        nameFr: 'Vermilava',
        nameEn: 'Lavaridge Town',
        types: ['fire', 'ground'],
        wild: [
          { nameFr: 'Chamallot', nameEn: 'Numel', slug: 'numel', type: 'fire', baseHp: 50, baseAtk: 6 },
          { nameFr: 'Chartor', nameEn: 'Torkoal', slug: 'torkoal', type: 'fire', baseHp: 55, baseAtk: 8 },
          { nameFr: 'Kraknoix', nameEn: 'Trapinch', slug: 'trapinch', type: 'ground', baseHp: 35, baseAtk: 10 },
          { nameFr: 'Limagma', nameEn: 'Slugma', slug: 'slugma', type: 'fire', baseHp: 30, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Adriane',
          nameEn: 'Flannery',
          slug: 'flannery',
          team: [
            { nameFr: 'Chamallot', nameEn: 'Numel', slug: 'numel', level: 24 },
            { nameFr: 'Limagma', nameEn: 'Slugma', slug: 'slugma', level: 24 },
            { nameFr: 'Camérupt', nameEn: 'Camerupt', slug: 'camerupt', level: 26 },
            { nameFr: 'Chartor', nameEn: 'Torkoal', slug: 'torkoal', level: 29 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 5,
        nameFr: 'Clémenti-Ville',
        nameEn: 'Petalburg City',
        types: ['normal'],
        wild: [
          { nameFr: 'Parecool', nameEn: 'Slakoth', slug: 'slakoth', type: 'normal', baseHp: 50, baseAtk: 6 },
          { nameFr: 'Vigoroth', nameEn: 'Vigoroth', slug: 'vigoroth', type: 'normal', baseHp: 60, baseAtk: 8 },
          { nameFr: 'Spinda', nameEn: 'Spinda', slug: 'spinda', type: 'normal', baseHp: 50, baseAtk: 6 },
          { nameFr: 'Chuchmur', nameEn: 'Whismur', slug: 'whismur', type: 'normal', baseHp: 45, baseAtk: 5 },
        ],
        boss: {
          nameFr: 'Norman',
          nameEn: 'Norman',
          slug: 'norman',
          team: [
            { nameFr: 'Spinda', nameEn: 'Spinda', slug: 'spinda', level: 27 },
            { nameFr: 'Vigoroth', nameEn: 'Vigoroth', slug: 'vigoroth', level: 27 },
            { nameFr: 'Monaflèmit', nameEn: 'Slaking', slug: 'slaking', level: 31 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 6,
        nameFr: 'Cimetronelle',
        nameEn: 'Fortree City',
        types: ['flying', 'grass'],
        wild: [
          { nameFr: 'Nirondelle', nameEn: 'Taillow', slug: 'taillow', type: 'flying', baseHp: 30, baseAtk: 6 },
          { nameFr: 'Hélédelle', nameEn: 'Swellow', slug: 'swellow', type: 'flying', baseHp: 50, baseAtk: 8 },
          { nameFr: 'Tropius', nameEn: 'Tropius', slug: 'tropius', type: 'grass', baseHp: 80, baseAtk: 7 },
          { nameFr: 'Altaria', nameEn: 'Altaria', slug: 'altaria', type: 'dragon', baseHp: 60, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Alizée',
          nameEn: 'Winona',
          slug: 'winona',
          team: [
            { nameFr: 'Hélédelle', nameEn: 'Swellow', slug: 'swellow', level: 31 },
            { nameFr: 'Beautifly', nameEn: 'Beautifly', slug: 'beautifly', level: 31 },
            { nameFr: 'Altaria', nameEn: 'Altaria', slug: 'altaria', level: 33 },
            { nameFr: 'Airmure', nameEn: 'Skarmory', slug: 'skarmory', level: 33 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 7,
        nameFr: 'Algatia',
        nameEn: 'Mossdeep City',
        types: ['psychic'],
        wild: [
          { nameFr: 'Spoink', nameEn: 'Spoink', slug: 'spoink', type: 'psychic', baseHp: 40, baseAtk: 5 },
          { nameFr: 'Groret', nameEn: 'Grumpig', slug: 'grumpig', type: 'psychic', baseHp: 70, baseAtk: 7 },
          { nameFr: 'Kecleon', nameEn: 'Kecleon', slug: 'kecleon', type: 'normal', baseHp: 50, baseAtk: 9 },
          { nameFr: 'Balbuto', nameEn: 'Baltoy', slug: 'baltoy', type: 'psychic', baseHp: 30, baseAtk: 5 },
        ],
        boss: {
          nameFr: 'Lévy & Tatia',
          nameEn: 'Tate & Liza',
          slug: 'liza',
          team: [
            { nameFr: 'Solaroc', nameEn: 'Solrock', slug: 'solrock', level: 42 },
            { nameFr: 'Séléroc', nameEn: 'Lunatone', slug: 'lunatone', level: 42 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 8,
        nameFr: 'Atalanopolis',
        nameEn: 'Sootopolis City',
        types: ['water'],
        wild: [
          { nameFr: 'Wailmer', nameEn: 'Wailmer', slug: 'wailmer', type: 'water', baseHp: 90, baseAtk: 5 },
          { nameFr: 'Carvanha', nameEn: 'Carvanha', slug: 'carvanha', type: 'water', baseHp: 35, baseAtk: 9 },
          { nameFr: 'Lovdisc', nameEn: 'Luvdisc', slug: 'luvdisc', type: 'water', baseHp: 35, baseAtk: 3 },
          { nameFr: 'Coquiperl', nameEn: 'Clamperl', slug: 'clamperl', type: 'water', baseHp: 30, baseAtk: 6 },
        ],
        boss: {
          nameFr: 'Marc',
          nameEn: 'Wallace',
          slug: 'wallace',
          team: [
            { nameFr: 'Lovdisc', nameEn: 'Luvdisc', slug: 'luvdisc', level: 41 },
            { nameFr: 'Barpau', nameEn: 'Feebas', slug: 'feebas', level: 41 },
            { nameFr: 'Hyporoi', nameEn: 'Kingdra', slug: 'kingdra', level: 43 },
            { nameFr: 'Wailord', nameEn: 'Wailord', slug: 'wailord', level: 43 },
            { nameFr: 'Milobellus', nameEn: 'Milotic', slug: 'milotic', level: 46 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 9,
        nameFr: 'Ligue — Damien',
        nameEn: 'League — Sidney',
        types: ['dark'],
        wild: [
          { nameFr: 'Grahyèna', nameEn: 'Mightyena', slug: 'mightyena', type: 'dark', baseHp: 55, baseAtk: 9 },
          { nameFr: 'Ténéfix', nameEn: 'Sableye', slug: 'sableye', type: 'dark', baseHp: 40, baseAtk: 7 },
          { nameFr: 'Cacturne', nameEn: 'Cacturne', slug: 'cacturne', type: 'dark', baseHp: 55, baseAtk: 11 },
          { nameFr: 'Absol', nameEn: 'Absol', slug: 'absol', type: 'dark', baseHp: 55, baseAtk: 13 },
        ],
        boss: {
          nameFr: 'Damien',
          nameEn: 'Sidney',
          slug: 'sidney',
          team: [
            { nameFr: 'Grahyèna', nameEn: 'Mightyena', slug: 'mightyena', level: 46 },
            { nameFr: 'Ténéfix', nameEn: 'Sableye', slug: 'sableye', level: 48 },
            { nameFr: 'Cacturne', nameEn: 'Cacturne', slug: 'cacturne', level: 48 },
            { nameFr: 'Migalos', nameEn: 'Shiftry', slug: 'shiftry', level: 48 },
            { nameFr: 'Absol', nameEn: 'Absol', slug: 'absol', level: 49 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 10,
        nameFr: 'Ligue — Spectra',
        nameEn: 'League — Phoebe',
        types: ['ghost'],
        wild: [
          { nameFr: 'Polichombr', nameEn: 'Shuppet', slug: 'shuppet', type: 'ghost', baseHp: 35, baseAtk: 8 },
          { nameFr: 'Branette', nameEn: 'Banette', slug: 'banette', type: 'ghost', baseHp: 50, baseAtk: 11 },
          { nameFr: 'Skelénox', nameEn: 'Duskull', slug: 'duskull', type: 'ghost', baseHp: 20, baseAtk: 4 },
          { nameFr: 'Téraclope', nameEn: 'Dusclops', slug: 'dusclops', type: 'ghost', baseHp: 40, baseAtk: 7 },
        ],
        boss: {
          nameFr: 'Spectra',
          nameEn: 'Phoebe',
          slug: 'phoebe-gen3',
          team: [
            { nameFr: 'Téraclope', nameEn: 'Dusclops', slug: 'dusclops', level: 48 },
            { nameFr: 'Branette', nameEn: 'Banette', slug: 'banette', level: 49 },
            { nameFr: 'Branette', nameEn: 'Banette', slug: 'banette', level: 49 },
            { nameFr: 'Téraclope', nameEn: 'Dusclops', slug: 'dusclops', level: 51 },
            { nameFr: 'Ténéfix', nameEn: 'Sableye', slug: 'sableye', level: 50 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 11,
        nameFr: 'Ligue — Glacia',
        nameEn: 'League — Glacia',
        types: ['ice'],
        wild: [
          { nameFr: 'Obalie', nameEn: 'Spheal', slug: 'spheal', type: 'ice', baseHp: 55, baseAtk: 4 },
          { nameFr: 'Phogleur', nameEn: 'Sealeo', slug: 'sealeo', type: 'ice', baseHp: 80, baseAtk: 6 },
          { nameFr: 'Kaimorse', nameEn: 'Walrein', slug: 'walrein', type: 'ice', baseHp: 100, baseAtk: 8 },
          { nameFr: 'Lippoutou', nameEn: 'Jynx', slug: 'jynx', type: 'ice', baseHp: 55, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Glacia',
          nameEn: 'Glacia',
          slug: 'glacia',
          team: [
            { nameFr: 'Phogleur', nameEn: 'Sealeo', slug: 'sealeo', level: 50 },
            { nameFr: 'Kaimorse', nameEn: 'Walrein', slug: 'walrein', level: 53 },
            { nameFr: 'Phogleur', nameEn: 'Sealeo', slug: 'sealeo', level: 50 },
            { nameFr: 'Oniglali', nameEn: 'Glalie', slug: 'glalie', level: 52 },
            { nameFr: 'Oniglali', nameEn: 'Glalie', slug: 'glalie', level: 52 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 12,
        nameFr: 'Ligue — Aragon',
        nameEn: 'League — Drake',
        types: ['dragon'],
        wild: [
          { nameFr: 'Draby', nameEn: 'Bagon', slug: 'bagon', type: 'dragon', baseHp: 35, baseAtk: 8 },
          { nameFr: 'Drackhaus', nameEn: 'Shelgon', slug: 'shelgon', type: 'dragon', baseHp: 55, baseAtk: 10 },
          { nameFr: 'Drattak', nameEn: 'Salamence', slug: 'salamence', type: 'dragon', baseHp: 80, baseAtk: 14 },
          { nameFr: 'Libégon', nameEn: 'Flygon', slug: 'flygon', type: 'dragon', baseHp: 65, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Aragon',
          nameEn: 'Drake',
          slug: 'drake-gen3',
          team: [
            { nameFr: 'Drackhaus', nameEn: 'Shelgon', slug: 'shelgon', level: 52 },
            { nameFr: 'Altaria', nameEn: 'Altaria', slug: 'altaria', level: 54 },
            { nameFr: 'Libégon', nameEn: 'Flygon', slug: 'flygon', level: 53 },
            { nameFr: 'Libégon', nameEn: 'Flygon', slug: 'flygon', level: 53 },
            { nameFr: 'Drattak', nameEn: 'Salamence', slug: 'salamence', level: 55 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 13,
        nameFr: 'Maître — Pierre',
        nameEn: 'Champion — Steven',
        types: ['steel', 'rock'],
        wild: [
          { nameFr: 'Métalosse', nameEn: 'Metagross', slug: 'metagross', type: 'steel', baseHp: 70, baseAtk: 14 },
          { nameFr: 'Armaldo', nameEn: 'Armaldo', slug: 'armaldo', type: 'rock', baseHp: 60, baseAtk: 12 },
          { nameFr: 'Mysdibule', nameEn: 'Mawile', slug: 'mawile', type: 'steel', baseHp: 40, baseAtk: 8 },
          { nameFr: 'Galéking', nameEn: 'Aggron', slug: 'aggron', type: 'steel', baseHp: 60, baseAtk: 11 },
        ],
        boss: {
          nameFr: 'Pierre Rochard',
          nameEn: 'Steven Stone',
          slug: 'steven',
          team: [
            { nameFr: 'Airmure', nameEn: 'Skarmory', slug: 'skarmory', level: 57 },
            { nameFr: 'Galéking', nameEn: 'Aggron', slug: 'aggron', level: 56 },
            { nameFr: 'Armaldo', nameEn: 'Armaldo', slug: 'armaldo', level: 56 },
            { nameFr: 'Léliana', nameEn: 'Cradily', slug: 'cradily', level: 56 },
            { nameFr: 'Branette', nameEn: 'Claydol', slug: 'claydol', level: 55 },
            { nameFr: 'Métalosse', nameEn: 'Metagross', slug: 'metagross', level: 58 },
          ],
          timerSeconds: 60,
        },
      },
    ],
  },
  {
    id: 4,
    nameFr: 'Génération IV',
    nameEn: 'Generation IV',
    regionFr: 'Sinnoh',
    regionEn: 'Sinnoh',
    zones: [
      {
        id: 1,
        nameFr: 'Champion — Pierrick',
        nameEn: 'Gym Leader — Roark',
        types: ['rock'],
        wild: [
          { nameFr: 'Kranidos', nameEn: 'Cranidos', slug: 'cranidos', type: 'rock', baseHp: 50, baseAtk: 10 },
          { nameFr: 'Dinoclier', nameEn: 'Shieldon', slug: 'shieldon', type: 'rock', baseHp: 45, baseAtk: 9 },
          { nameFr: 'Manzaï', nameEn: 'Bonsly', slug: 'bonsly', type: 'rock', baseHp: 40, baseAtk: 8 },
          { nameFr: 'Archéomire', nameEn: 'Bronzor', slug: 'bronzor', type: 'steel', baseHp: 42, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Pierrick',
          nameEn: 'Roark',
          slug: 'roark',
          team: [
            { nameFr: 'Archéomire', nameEn: 'Bronzor', slug: 'bronzor', level: 60 },
            { nameFr: 'Dinoclier', nameEn: 'Shieldon', slug: 'shieldon', level: 61 },
            { nameFr: 'Charkos', nameEn: 'Rampardos', slug: 'rampardos', level: 63 },
          ],
          timerSeconds: 30,
        },
      },
      {
        id: 2,
        nameFr: 'Championne — Flo',
        nameEn: 'Gym Leader — Gardenia',
        types: ['grass'],
        wild: [
          { nameFr: 'Rozbouton', nameEn: 'Budew', slug: 'budew', type: 'grass', baseHp: 45, baseAtk: 8 },
          { nameFr: 'Ceribou', nameEn: 'Cherubi', slug: 'cherubi', type: 'grass', baseHp: 48, baseAtk: 9 },
          { nameFr: 'Cheniti', nameEn: 'Burmy', slug: 'burmy', type: 'bug', baseHp: 42, baseAtk: 7 },
          { nameFr: 'Vortente', nameEn: 'Carnivine', slug: 'carnivine', type: 'grass', baseHp: 50, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Flo',
          nameEn: 'Gardenia',
          slug: 'gardenia',
          team: [
            { nameFr: 'Ceriflor', nameEn: 'Cherrim', slug: 'cherrim', level: 62 },
            { nameFr: 'Tortera', nameEn: 'Torterra', slug: 'torterra', level: 64 },
            { nameFr: 'Roserade', nameEn: 'Roserade', slug: 'roserade', level: 63 },
          ],
          timerSeconds: 35,
        },
      },
      {
        id: 3,
        nameFr: 'Championne — Mélina',
        nameEn: 'Gym Leader — Maylene',
        types: ['fighting'],
        wild: [
          { nameFr: 'Riolu', nameEn: 'Riolu', slug: 'riolu', type: 'fighting', baseHp: 52, baseAtk: 11 },
          { nameFr: 'Cradopaud', nameEn: 'Croagunk', slug: 'croagunk', type: 'poison', baseHp: 48, baseAtk: 10 },
          { nameFr: 'Méditikka', nameEn: 'Meditite', slug: 'meditite', type: 'fighting', baseHp: 44, baseAtk: 9 },
          { nameFr: 'Machopeur', nameEn: 'Machoke', slug: 'machoke', type: 'fighting', baseHp: 54, baseAtk: 12 },
        ],
        boss: {
          nameFr: 'Mélina',
          nameEn: 'Maylene',
          slug: 'maylene',
          team: [
            { nameFr: 'Charmina', nameEn: 'Medicham', slug: 'medicham', level: 64 },
            { nameFr: 'Lucario', nameEn: 'Lucario', slug: 'lucario', level: 66 },
            { nameFr: 'Mackogneur', nameEn: 'Machamp', slug: 'machamp', level: 65 },
          ],
          timerSeconds: 35,
        },
      },
      {
        id: 4,
        nameFr: 'Champion — Lovis',
        nameEn: 'Gym Leader — Wake',
        types: ['water'],
        wild: [
          { nameFr: 'Mustébouée', nameEn: 'Buizel', slug: 'buizel', type: 'water', baseHp: 50, baseAtk: 10 },
          { nameFr: 'Sancoki', nameEn: 'Shellos', slug: 'shellos', type: 'water', baseHp: 48, baseAtk: 9 },
          { nameFr: 'Écayon', nameEn: 'Finneon', slug: 'finneon', type: 'water', baseHp: 46, baseAtk: 9 },
          { nameFr: 'Azurill', nameEn: 'Azurill', slug: 'azurill', type: 'normal', baseHp: 42, baseAtk: 8 },
        ],
        boss: {
          nameFr: 'Lovis',
          nameEn: 'Wake',
          slug: 'wake',
          team: [
            { nameFr: 'Luminéon', nameEn: 'Lumineon', slug: 'lumineon', level: 65 },
            { nameFr: 'Mustéflott', nameEn: 'Floatzel', slug: 'floatzel', level: 67 },
            { nameFr: 'Tritosor', nameEn: 'Gastrodon', slug: 'gastrodon', level: 66 },
          ],
          timerSeconds: 35,
        },
      },
      {
        id: 5,
        nameFr: 'Championne — Kiméra',
        nameEn: 'Gym Leader — Fantina',
        types: ['ghost'],
        wild: [
          { nameFr: 'Baudrive', nameEn: 'Drifloon', slug: 'drifloon', type: 'ghost', baseHp: 52, baseAtk: 10 },
          { nameFr: 'Feuforêve', nameEn: 'Misdreavus', slug: 'misdreavus', type: 'ghost', baseHp: 50, baseAtk: 11 },
          { nameFr: 'Spiritomb', nameEn: 'Spiritomb', slug: 'spiritomb', type: 'ghost', baseHp: 56, baseAtk: 12 },
          { nameFr: 'Spectrum', nameEn: 'Haunter', slug: 'haunter', type: 'ghost', baseHp: 48, baseAtk: 10 },
        ],
        boss: {
          nameFr: 'Kiméra',
          nameEn: 'Fantina',
          slug: 'fantina',
          team: [
            { nameFr: 'Grodrive', nameEn: 'Drifblim', slug: 'drifblim', level: 66 },
            { nameFr: 'Magirêve', nameEn: 'Mismagius', slug: 'mismagius', level: 68 },
            { nameFr: 'Ectoplasma', nameEn: 'Gengar', slug: 'gengar', level: 67 },
          ],
          timerSeconds: 40,
        },
      },
      {
        id: 6,
        nameFr: 'Champion — Charles',
        nameEn: 'Gym Leader — Byron',
        types: ['steel'],
        wild: [
          { nameFr: 'Archéomire', nameEn: 'Bronzor', slug: 'bronzor', type: 'steel', baseHp: 54, baseAtk: 11 },
          { nameFr: 'Dinoclier', nameEn: 'Shieldon', slug: 'shieldon', type: 'rock', baseHp: 52, baseAtk: 10 },
          { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', type: 'electric', baseHp: 48, baseAtk: 10 },
          { nameFr: 'Steelix', nameEn: 'Steelix', slug: 'steelix', type: 'steel', baseHp: 60, baseAtk: 13 },
        ],
        boss: {
          nameFr: 'Charles',
          nameEn: 'Byron',
          slug: 'byron',
          team: [
            { nameFr: 'Archéodong', nameEn: 'Bronzong', slug: 'bronzong', level: 67 },
            { nameFr: 'Bastiodon', nameEn: 'Bastiodon', slug: 'bastiodon', level: 68 },
            { nameFr: 'Steelix', nameEn: 'Steelix', slug: 'steelix', level: 69 },
          ],
          timerSeconds: 40,
        },
      },
      {
        id: 7,
        nameFr: 'Championne — Gladys',
        nameEn: 'Gym Leader — Candice',
        types: ['ice'],
        wild: [
          { nameFr: 'Blizzi', nameEn: 'Snover', slug: 'snover', type: 'grass', baseHp: 54, baseAtk: 11 },
          { nameFr: 'Stalgamin', nameEn: 'Snorunt', slug: 'snorunt', type: 'ice', baseHp: 50, baseAtk: 10 },
          { nameFr: 'Marcacrin', nameEn: 'Swinub', slug: 'swinub', type: 'ice', baseHp: 52, baseAtk: 11 },
          { nameFr: 'Cadoizo', nameEn: 'Delibird', slug: 'delibird', type: 'ice', baseHp: 48, baseAtk: 9 },
        ],
        boss: {
          nameFr: 'Gladys',
          nameEn: 'Candice',
          slug: 'candice',
          team: [
            { nameFr: 'Blizzaroi', nameEn: 'Abomasnow', slug: 'abomasnow', level: 68 },
            { nameFr: 'Momartik', nameEn: 'Froslass', slug: 'froslass', level: 69 },
            { nameFr: 'Lokhlass', nameEn: 'Lapras', slug: 'lapras', level: 70 },
          ],
          timerSeconds: 40,
        },
      },
      {
        id: 8,
        nameFr: 'Champion — Tanguy',
        nameEn: 'Gym Leader — Volkner',
        types: ['electric'],
        wild: [
          { nameFr: 'Lixy', nameEn: 'Shinx', slug: 'shinx', type: 'electric', baseHp: 52, baseAtk: 11 },
          { nameFr: 'Pachirisu', nameEn: 'Pachirisu', slug: 'pachirisu', type: 'electric', baseHp: 50, baseAtk: 10 },
          { nameFr: 'Motisma', nameEn: 'Rotom', slug: 'rotom', type: 'electric', baseHp: 56, baseAtk: 12 },
          { nameFr: 'Voltali', nameEn: 'Jolteon', slug: 'jolteon', type: 'electric', baseHp: 54, baseAtk: 11 },
        ],
        boss: {
          nameFr: 'Tanguy',
          nameEn: 'Volkner',
          slug: 'volkner',
          team: [
            { nameFr: 'Luxray', nameEn: 'Luxray', slug: 'luxray', level: 69 },
            { nameFr: 'Motisma', nameEn: 'Rotom', slug: 'rotom', level: 70 },
            { nameFr: 'Élekable', nameEn: 'Electivire', slug: 'electivire', level: 71 },
          ],
          timerSeconds: 45,
        },
      },
      {
        id: 9,
        nameFr: 'Conseil 4 — Aaron',
        nameEn: 'Elite Four — Aaron',
        types: ['bug'],
        wild: [
          { nameFr: 'Crikzik', nameEn: 'Kricketot', slug: 'kricketot', type: 'bug', baseHp: 54, baseAtk: 11 },
          { nameFr: 'Apitrini', nameEn: 'Combee', slug: 'combee', type: 'bug', baseHp: 52, baseAtk: 10 },
          { nameFr: 'Rapion', nameEn: 'Skorupi', slug: 'skorupi', type: 'poison', baseHp: 56, baseAtk: 12 },
          { nameFr: 'Yanma', nameEn: 'Yanma', slug: 'yanma', type: 'bug', baseHp: 54, baseAtk: 11 },
        ],
        boss: {
          nameFr: 'Aaron',
          nameEn: 'Aaron',
          slug: 'aaron',
          team: [
            { nameFr: 'Apireine', nameEn: 'Vespiquen', slug: 'vespiquen', level: 71 },
            { nameFr: 'Drascore', nameEn: 'Drapion', slug: 'drapion', level: 72 },
            { nameFr: 'Papilord', nameEn: 'Mothim', slug: 'mothim', level: 71 },
            { nameFr: 'Yanméga', nameEn: 'Yanmega', slug: 'yanmega', level: 72 },
            { nameFr: 'Scarhino', nameEn: 'Heracross', slug: 'heracross', level: 73 },
          ],
          timerSeconds: 50,
        },
      },
      {
        id: 10,
        nameFr: 'Conseil 4 — Terry',
        nameEn: 'Elite Four — Bertha',
        types: ['ground'],
        wild: [
          { nameFr: 'Hippopotas', nameEn: 'Hippopotas', slug: 'hippopotas', type: 'ground', baseHp: 58, baseAtk: 12 },
          { nameFr: 'Griknot', nameEn: 'Gible', slug: 'gible', type: 'dragon', baseHp: 56, baseAtk: 11 },
          { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', type: 'rock', baseHp: 54, baseAtk: 10 },
          { nameFr: 'Rhinocorne', nameEn: 'Rhyhorn', slug: 'rhyhorn', type: 'ground', baseHp: 60, baseAtk: 13 },
        ],
        boss: {
          nameFr: 'Terry',
          nameEn: 'Bertha',
          slug: 'bertha',
          team: [
            { nameFr: 'Hippodocus', nameEn: 'Hippowdon', slug: 'hippowdon', level: 72 },
            { nameFr: 'Tritosor', nameEn: 'Gastrodon', slug: 'gastrodon', level: 71 },
            { nameFr: 'Rhinastoc', nameEn: 'Rhyperior', slug: 'rhyperior', level: 73 },
            { nameFr: 'Nidoqueen', nameEn: 'Nidoqueen', slug: 'nidoqueen', level: 71 },
            { nameFr: 'Scorvol', nameEn: 'Gliscor', slug: 'gliscor', level: 74 },
          ],
          timerSeconds: 50,
        },
      },
      {
        id: 11,
        nameFr: 'Conseil 4 — Adrien',
        nameEn: 'Elite Four — Flint',
        types: ['fire'],
        wild: [
          { nameFr: 'Ouisticram', nameEn: 'Chimchar', slug: 'chimchar', type: 'fire', baseHp: 54, baseAtk: 11 },
          { nameFr: 'Caninos', nameEn: 'Growlithe', slug: 'growlithe', type: 'fire', baseHp: 56, baseAtk: 12 },
          { nameFr: 'Magmar', nameEn: 'Magmar', slug: 'magmar', type: 'fire', baseHp: 58, baseAtk: 13 },
          { nameFr: 'Heatran', nameEn: 'Heatran', slug: 'heatran', type: 'fire', baseHp: 64, baseAtk: 15 },
        ],
        boss: {
          nameFr: 'Adrien',
          nameEn: 'Flint',
          slug: 'flint',
          team: [
            { nameFr: 'Heatran', nameEn: 'Heatran', slug: 'heatran', level: 73 },
            { nameFr: 'Simiabraz', nameEn: 'Infernape', slug: 'infernape', level: 74 },
            { nameFr: 'Maganon', nameEn: 'Magmortar', slug: 'magmortar', level: 74 },
            { nameFr: 'Arcanin', nameEn: 'Arcanine', slug: 'arcanine', level: 72 },
            { nameFr: 'Dracaufeu', nameEn: 'Charizard', slug: 'charizard', level: 73 },
          ],
          timerSeconds: 50,
        },
      },
      {
        id: 12,
        nameFr: 'Conseil 4 — Lucio',
        nameEn: 'Elite Four — Lucian',
        types: ['psychic'],
        wild: [
          { nameFr: 'Korillon', nameEn: 'Chingling', slug: 'chingling', type: 'psychic', baseHp: 54, baseAtk: 11 },
          { nameFr: 'Mime Jr.', nameEn: 'Mime Jr.', slug: 'mimejr', type: 'psychic', baseHp: 52, baseAtk: 10 },
          { nameFr: 'Créhelf', nameEn: 'Uxie', slug: 'uxie', type: 'psychic', baseHp: 60, baseAtk: 14 },
          { nameFr: 'Créfollet', nameEn: 'Mesprit', slug: 'mesprit', type: 'psychic', baseHp: 60, baseAtk: 14 },
        ],
        boss: {
          nameFr: 'Lucio',
          nameEn: 'Lucian',
          slug: 'lucian',
          team: [
            { nameFr: 'Créhelf', nameEn: 'Uxie', slug: 'uxie', level: 73 },
            { nameFr: 'Créfollet', nameEn: 'Mesprit', slug: 'mesprit', level: 73 },
            { nameFr: 'Créfadet', nameEn: 'Azelf', slug: 'azelf', level: 73 },
            { nameFr: 'Gallame', nameEn: 'Gallade', slug: 'gallade', level: 74 },
            { nameFr: 'Archéodong', nameEn: 'Bronzong', slug: 'bronzong', level: 72 },
          ],
          timerSeconds: 50,
        },
      },
      {
        id: 13,
        nameFr: 'Maître — Cynthia',
        nameEn: 'Champion — Cynthia',
        types: ['dragon', 'dark', 'water'],
        wild: [
          { nameFr: 'Carmache', nameEn: 'Gabite', slug: 'gabite', type: 'dragon', baseHp: 62, baseAtk: 14 },
          { nameFr: 'Lucario', nameEn: 'Lucario', slug: 'lucario', type: 'fighting', baseHp: 60, baseAtk: 13 },
          { nameFr: 'Spiritomb', nameEn: 'Spiritomb', slug: 'spiritomb', type: 'ghost', baseHp: 58, baseAtk: 12 },
          { nameFr: 'Pingoléon', nameEn: 'Empoleon', slug: 'empoleon', type: 'water', baseHp: 62, baseAtk: 14 },
        ],
        boss: {
          nameFr: 'Cynthia',
          nameEn: 'Cynthia',
          slug: 'cynthia',
          team: [
            { nameFr: 'Spiritomb', nameEn: 'Spiritomb', slug: 'spiritomb', level: 75 },
            { nameFr: 'Lockpin', nameEn: 'Lopunny', slug: 'lopunny', level: 74 },
            { nameFr: 'Lucario', nameEn: 'Lucario', slug: 'lucario', level: 75 },
            { nameFr: 'Blizzaroi', nameEn: 'Abomasnow', slug: 'abomasnow', level: 74 },
            { nameFr: 'Tritosor', nameEn: 'Gastrodon', slug: 'gastrodon', level: 75 },
            { nameFr: 'Carchacrok', nameEn: 'Garchomp', slug: 'garchomp', level: 78 },
          ],
          timerSeconds: 60,
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
