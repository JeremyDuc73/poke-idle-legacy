import Species from '#models/species'
import UserPokemon from '#models/user_pokemon'
import type { PvpTeamSnapshot } from '#models/pvp_match'

// ── Type effectiveness chart (same as client) ──
type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

const CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

const RARITY_DPS_MULT: Record<string, number> = {
  common: 1.0,
  rare: 1.1,
  epic: 1.5,
  legendary: 4.0,
}

const STAR_DPS_MULT = [1, 1, 1.1, 1.2, 1.3, 1.5]
const STAR_DPS_MULT_SHINY = [1, 1, 1.5, 2, 3, 5]

const PVP_DURATION_SECONDS = 60

function getEffectiveness(attacker: PokemonType, defender: PokemonType): number {
  return CHART[attacker]?.[defender] ?? 1
}

function getTypeEffectiveness(attackerType: PokemonType, defenderTypes: PokemonType[]): number {
  return defenderTypes.reduce(
    (mult, defType) => mult * getEffectiveness(attackerType, defType),
    1.0
  )
}

function normalizeType(t: string | null): PokemonType | null {
  if (!t) return null
  return t.toLowerCase().trim() as PokemonType
}

function getStarDpsMult(stars: number, isShiny: boolean): number {
  const table = isShiny ? STAR_DPS_MULT_SHINY : STAR_DPS_MULT
  return table[Math.min(stars, table.length - 1)] ?? 1
}

function computePokemonDps(
  poke: { level: number; stars: number; isShiny: boolean; rarity: string },
  attackerTypes: PokemonType[],
  bossTypes: PokemonType[]
): { baseDps: number; typeMult: number; effectiveDps: number } {
  const baseDmg = poke.level * 2
  const rarityMult = RARITY_DPS_MULT[poke.rarity] ?? 1.0
  const shinyMult = poke.isShiny ? 4.0 : 1.0
  const starMult = getStarDpsMult(poke.stars, poke.isShiny)
  const baseDps = Math.floor(baseDmg * rarityMult * shinyMult * starMult)

  // Best offensive type multiplier
  const typeMult =
    attackerTypes.length > 0
      ? Math.max(...attackerTypes.map((t) => getTypeEffectiveness(t, bossTypes)))
      : 1

  return { baseDps, typeMult, effectiveDps: Math.round(baseDps * typeMult) }
}

export interface PvpResolution {
  bossSlug: string
  bossNameFr: string
  bossNameEn: string
  bossTypes: string[]
  bossGeneration: number
  durationSeconds: number
  player1Damage: number
  player2Damage: number
  player1TeamSnapshot: PvpTeamSnapshot[]
  player2TeamSnapshot: PvpTeamSnapshot[]
  winnerId: number | null
}

export async function pickBoss(commonGenerations: number[]): Promise<Species | null> {
  if (commonGenerations.length === 0) return null

  // Pick legendaries/epics from the species table for common generations
  const candidates = await Species.query()
    .whereIn('generation', commonGenerations)
    .where((q) => {
      // Match type1 in a case-insensitive way isn't needed since we check slug
      // We just need species that exist in these generations
      q.whereNotNull('type1')
    })
    .orderByRaw('RANDOM()')
    .limit(50)

  // Prefer legendaries, then epics by looking at slug patterns
  // Since rarity isn't on species, we'll use a known list approach
  const LEGENDARY_SLUGS = new Set([
    // Gen 1
    'articuno',
    'zapdos',
    'moltres',
    'mewtwo',
    'mew',
    // Gen 2
    'raikou',
    'entei',
    'suicune',
    'lugia',
    'hooh',
    'celebi',
    // Gen 3
    'regirock',
    'regice',
    'registeel',
    'latias',
    'latios',
    'kyogre',
    'groudon',
    'rayquaza',
    'jirachi',
    'deoxys',
    // Gen 4
    'uxie',
    'mesprit',
    'azelf',
    'dialga',
    'palkia',
    'heatran',
    'regigigas',
    'giratina',
    'cresselia',
    'darkrai',
    'shaymin',
    'arceus',
    // Gen 5
    'cobalion',
    'terrakion',
    'virizion',
    'tornadus',
    'thundurus',
    'landorus',
    'reshiram',
    'zekrom',
    'kyurem',
    'keldeo',
    'meloetta',
    'genesect',
    'victini',
    // Gen 6
    'xerneas',
    'yveltal',
    'zygarde',
    'diancie',
    'hoopa',
    'volcanion',
    // Gen 7
    'tapukoko',
    'tapulele',
    'tapubulu',
    'tapufini',
    'solgaleo',
    'lunala',
    'necrozma',
    'magearna',
    'marshadow',
    'zeraora',
    // Gen 8
    'zacian',
    'zamazenta',
    'eternatus',
    'calyrex',
    'regieleki',
    'regidrago',
    'glastrier',
    'spectrier',
    // Gen 9
    'koraidon',
    'miraidon',
    'terapagos',
  ])

  const EPIC_SLUGS = new Set([
    'dragonite',
    'tyranitar',
    'salamence',
    'metagross',
    'garchomp',
    'hydreigon',
    'goodra',
    'kommo-o',
    'dragapult',
    'baxcalibur',
    'charizard',
    'blastoise',
    'venusaur',
    'gengar',
    'alakazam',
    'machamp',
    'arcanine',
    'gyarados',
    'lapras',
    'snorlax',
    'typhlosion',
    'feraligatr',
    'meganium',
    'scizor',
    'heracross',
    'kingdra',
    'blaziken',
    'swampert',
    'sceptile',
    'gardevoir',
    'aggron',
    'milotic',
    'absol',
    'infernape',
    'empoleon',
    'torterra',
    'lucario',
    'togekiss',
    'garchomp',
    'volcarona',
    'haxorus',
    'chandelure',
    'zoroark',
    'greninja',
    'aegislash',
    'talonflame',
    'noivern',
    'decidueye',
    'incineroar',
    'primarina',
    'golisopod',
    'mimikyu',
    'cinderace',
    'rillaboom',
    'inteleon',
    'corviknight',
    'dragapult',
    'grimmsnarl',
    'meowscarada',
    'skeledirge',
    'quaquaval',
    'tinkaton',
    'kingambit',
    'gholdengo',
  ])

  // First try legendaries
  const legendary = candidates.find((s) => LEGENDARY_SLUGS.has(s.slug))
  if (legendary) return legendary

  // Then epics
  const epic = candidates.find((s) => EPIC_SLUGS.has(s.slug))
  if (epic) return epic

  // Fallback: any species from those gens
  return candidates[0] ?? null
}

export async function resolveMatch(
  player1Id: number,
  player2Id: number,
  player1PokemonIds: number[],
  player2PokemonIds: number[],
  commonGenerations: number[]
): Promise<PvpResolution | null> {
  // Load pokemon with species
  console.log(
    `[PVP] resolveMatch: p1=${player1Id} ids=${JSON.stringify(player1PokemonIds)}, p2=${player2Id} ids=${JSON.stringify(player2PokemonIds)}, gens=${JSON.stringify(commonGenerations)}`
  )

  const p1Pokemon = await UserPokemon.query()
    .whereIn('id', player1PokemonIds)
    .where('userId', player1Id)
    .preload('species')
  const p2Pokemon = await UserPokemon.query()
    .whereIn('id', player2PokemonIds)
    .where('userId', player2Id)
    .preload('species')

  console.log(`[PVP] p1Pokemon loaded: ${p1Pokemon.length}, p2Pokemon loaded: ${p2Pokemon.length}`)

  if (p1Pokemon.length === 0 || p2Pokemon.length === 0) {
    console.error(`[PVP] FAIL: empty team — p1=${p1Pokemon.length} p2=${p2Pokemon.length}`)
    return null
  }

  // Pick boss
  const boss = await pickBoss(commonGenerations)
  console.log(`[PVP] pickBoss result: ${boss ? boss.slug : 'NULL'}`)
  if (!boss) {
    console.error(
      `[PVP] FAIL: pickBoss returned null for gens=${JSON.stringify(commonGenerations)}`
    )
    return null
  }

  const bossType1 = normalizeType(boss.type1)
  const bossType2 = normalizeType(boss.type2)
  const bossTypes: PokemonType[] = [bossType1, bossType2].filter(Boolean) as PokemonType[]
  if (bossTypes.length === 0) bossTypes.push('normal')

  // Compute DPS for each team
  function buildSnapshot(pokemons: typeof p1Pokemon): {
    snapshot: PvpTeamSnapshot[]
    totalDamage: number
  } {
    let totalDps = 0
    const snapshot: PvpTeamSnapshot[] = []

    for (const p of pokemons) {
      const atkType1 = normalizeType(p.species?.type1 ?? null)
      const atkType2 = normalizeType(p.species?.type2 ?? null)
      const atkTypes = [atkType1, atkType2].filter(Boolean) as PokemonType[]

      const { baseDps, typeMult, effectiveDps } = computePokemonDps(
        { level: p.level, stars: p.stars, isShiny: p.isShiny, rarity: p.rarity },
        atkTypes,
        bossTypes
      )

      totalDps += effectiveDps
      snapshot.push({
        pokemonId: p.id,
        slug: p.species?.slug ?? 'unknown',
        nameFr: p.species?.nameFr ?? 'Inconnu',
        nameEn: p.species?.nameEn ?? 'Unknown',
        level: p.level,
        stars: p.stars,
        isShiny: p.isShiny,
        rarity: p.rarity,
        dps: baseDps,
        typeMult,
        effectiveDps,
      })
    }

    const totalDamage = totalDps * PVP_DURATION_SECONDS
    return { snapshot, totalDamage }
  }

  const p1Result = buildSnapshot(p1Pokemon)
  const p2Result = buildSnapshot(p2Pokemon)

  let winnerId: number | null = null
  if (p1Result.totalDamage > p2Result.totalDamage) winnerId = player1Id
  else if (p2Result.totalDamage > p1Result.totalDamage) winnerId = player2Id
  // else draw — winnerId stays null

  return {
    bossSlug: boss.slug,
    bossNameFr: boss.nameFr,
    bossNameEn: boss.nameEn,
    bossTypes: bossTypes as string[],
    bossGeneration: boss.generation,
    durationSeconds: PVP_DURATION_SECONDS,
    player1Damage: p1Result.totalDamage,
    player2Damage: p2Result.totalDamage,
    player1TeamSnapshot: p1Result.snapshot,
    player2TeamSnapshot: p2Result.snapshot,
    winnerId,
  }
}
