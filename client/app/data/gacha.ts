export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface GachaPokemon {
  nameFr: string
  nameEn: string
  slug: string
  rarity: Rarity
  shinyRate: number
}

export interface Banner {
  id: string
  nameFr: string
  nameEn: string
  generation: number
  costGold: number
  costGems: number
  pool: GachaPokemon[]
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
}

// === Gen 1 Kanto Pool ===
// COMMON: early-game wild Pokémon you encounter constantly
// RARE: mid-game Pokémon, useful but not exceptional
// EPIC: pseudo-legendaries (Dratini line), starters, iconic strong Pokémon
// LEGENDARY: legendary + mythical Pokémon
const KANTO_POOL: GachaPokemon[] = [
  // --- COMMON (early routes, caves, water — the Pokémon you see everywhere) ---
  { nameFr: 'Rattata', nameEn: 'Rattata', slug: 'rattata', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Roucool', nameEn: 'Pidgey', slug: 'pidgey', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chenipan', nameEn: 'Caterpie', slug: 'caterpie', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Aspicot', nameEn: 'Weedle', slug: 'weedle', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Nosferapti', nameEn: 'Zubat', slug: 'zubat', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mystherbe', nameEn: 'Oddish', slug: 'oddish', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Paras', nameEn: 'Paras', slug: 'paras', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mimitoss', nameEn: 'Venonat', slug: 'venonat', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Taupiqueur', nameEn: 'Diglett', slug: 'diglett', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Miaouss', nameEn: 'Meowth', slug: 'meowth', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tentacool', nameEn: 'Tentacool', slug: 'tentacool', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Racaillou', nameEn: 'Geodude', slug: 'geodude', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Doduo', nameEn: 'Doduo', slug: 'doduo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Kokiyas', nameEn: 'Shellder', slug: 'shellder', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Soporifik', nameEn: 'Drowzee', slug: 'drowzee', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Krabby', nameEn: 'Krabby', slug: 'krabby', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Voltorbe', nameEn: 'Voltorb', slug: 'voltorb', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Noeunoeuf', nameEn: 'Exeggcute', slug: 'exeggcute', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Osselait', nameEn: 'Cubone', slug: 'cubone', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Smogo', nameEn: 'Koffing', slug: 'koffing', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Poissirène', nameEn: 'Goldeen', slug: 'goldeen', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Stari', nameEn: 'Staryu', slug: 'staryu', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Magicarpe', nameEn: 'Magikarp', slug: 'magikarp', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Piafabec', nameEn: 'Spearow', slug: 'spearow', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chétiflor', nameEn: 'Bellsprout', slug: 'bellsprout', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Pikachu', nameEn: 'Pikachu', slug: 'pikachu', rarity: 'common', shinyRate: 0.01 },

  // --- RARE (mid-game: useful battlers, trade evolutions pre-evos, less common wild) ---
  { nameFr: 'Abo', nameEn: 'Ekans', slug: 'ekans', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Sabelette', nameEn: 'Sandshrew', slug: 'sandshrew', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Nidoran♀', nameEn: 'Nidoran♀', slug: 'nidoranf', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Nidoran♂', nameEn: 'Nidoran♂', slug: 'nidoranm', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Goupix', nameEn: 'Vulpix', slug: 'vulpix', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Rondoudou', nameEn: 'Jigglypuff', slug: 'jigglypuff', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Mélofée', nameEn: 'Clefairy', slug: 'clefairy', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Psykokwak', nameEn: 'Psyduck', slug: 'psyduck', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Férosinge', nameEn: 'Mankey', slug: 'mankey', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Caninos', nameEn: 'Growlithe', slug: 'growlithe', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Ptitard', nameEn: 'Poliwag', slug: 'poliwag', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Machoc', nameEn: 'Machop', slug: 'machop', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Ponyta', nameEn: 'Ponyta', slug: 'ponyta', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Ramoloss', nameEn: 'Slowpoke', slug: 'slowpoke', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Magnéti', nameEn: 'Magnemite', slug: 'magnemite', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Otaria', nameEn: 'Seel', slug: 'seel', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Tadmorv', nameEn: 'Grimer', slug: 'grimer', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Rhinocorne', nameEn: 'Rhyhorn', slug: 'rhyhorn', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Hypotrempe', nameEn: 'Horsea', slug: 'horsea', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Abra', nameEn: 'Abra', slug: 'abra', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Fantominus', nameEn: 'Gastly', slug: 'gastly', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'M. Mime', nameEn: 'Mr. Mime', slug: 'mrmime', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Lippoutou', nameEn: 'Jynx', slug: 'jynx', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Élektek', nameEn: 'Electabuzz', slug: 'electabuzz', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Magmar', nameEn: 'Magmar', slug: 'magmar', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Porygon', nameEn: 'Porygon', slug: 'porygon', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Amonita', nameEn: 'Omanyte', slug: 'omanyte', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Kabuto', nameEn: 'Kabuto', slug: 'kabuto', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Onix', nameEn: 'Onix', slug: 'onix', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Kicklee', nameEn: 'Hitmonlee', slug: 'hitmonlee', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Tygnon', nameEn: 'Hitmonchan', slug: 'hitmonchan', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Excelangue', nameEn: 'Lickitung', slug: 'lickitung', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Saquedeneu', nameEn: 'Tangela', slug: 'tangela', rarity: 'rare', shinyRate: 0.02 },

  // --- EPIC (starters, pseudo-legendary Dratini, iconic strong Pokémon) ---
  { nameFr: 'Bulbizarre', nameEn: 'Bulbasaur', slug: 'bulbasaur', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Salamèche', nameEn: 'Charmander', slug: 'charmander', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Carapuce', nameEn: 'Squirtle', slug: 'squirtle', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Minidraco', nameEn: 'Dratini', slug: 'dratini', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Évoli', nameEn: 'Eevee', slug: 'eevee', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Lokhlass', nameEn: 'Lapras', slug: 'lapras', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Ronflex', nameEn: 'Snorlax', slug: 'snorlax', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Insécateur', nameEn: 'Scyther', slug: 'scyther', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Scarabrute', nameEn: 'Pinsir', slug: 'pinsir', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Tauros', nameEn: 'Tauros', slug: 'tauros', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kangourex', nameEn: 'Kangaskhan', slug: 'kangaskhan', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Leveinard', nameEn: 'Chansey', slug: 'chansey', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Ptéra', nameEn: 'Aerodactyl', slug: 'aerodactyl', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Canarticho', nameEn: "Farfetch'd", slug: 'farfetchd', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Métamorph', nameEn: 'Ditto', slug: 'ditto', rarity: 'epic', shinyRate: 0.03 },

  // --- LEGENDARY (legendary + mythical + Mega Evolutions) ---
  { nameFr: 'Artikodin', nameEn: 'Articuno', slug: 'articuno', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Électhor', nameEn: 'Zapdos', slug: 'zapdos', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Sulfura', nameEn: 'Moltres', slug: 'moltres', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Mewtwo', nameEn: 'Mewtwo', slug: 'mewtwo', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Mew', nameEn: 'Mew', slug: 'mew', rarity: 'legendary', shinyRate: 0.05 },
  // Mega Evolutions (Kanto base Pokémon)
  { nameFr: 'Méga-Florizarre', nameEn: 'Mega Venusaur', slug: 'venusaur-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Dracaufeu X', nameEn: 'Mega Charizard X', slug: 'charizard-megax', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Dracaufeu Y', nameEn: 'Mega Charizard Y', slug: 'charizard-megay', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Tortank', nameEn: 'Mega Blastoise', slug: 'blastoise-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Dardargnan', nameEn: 'Mega Beedrill', slug: 'beedrill-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Roucarnage', nameEn: 'Mega Pidgeot', slug: 'pidgeot-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Alakazam', nameEn: 'Mega Alakazam', slug: 'alakazam-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Flagadoss', nameEn: 'Mega Slowbro', slug: 'slowbro-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Ectoplasma', nameEn: 'Mega Gengar', slug: 'gengar-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Kangourex', nameEn: 'Mega Kangaskhan', slug: 'kangaskhan-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Scarabrute', nameEn: 'Mega Pinsir', slug: 'pinsir-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Léviator', nameEn: 'Mega Gyarados', slug: 'gyarados-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Ptéra', nameEn: 'Mega Aerodactyl', slug: 'aerodactyl-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Mewtwo X', nameEn: 'Mega Mewtwo X', slug: 'mewtwo-megax', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Mewtwo Y', nameEn: 'Mega Mewtwo Y', slug: 'mewtwo-megay', rarity: 'legendary', shinyRate: 0.05 },
]

export const BANNERS: Banner[] = [
  {
    id: 'kanto',
    nameFr: 'Bannière Kanto',
    nameEn: 'Kanto Banner',
    generation: 1,
    costGold: 100,
    costGems: 1,
    pool: KANTO_POOL,
  },
]

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export const RARITY_LABELS_FR: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
}

export const RARITY_LABELS_EN: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

// Rarity DPS multiplier: higher rarity = more base damage
export const RARITY_DPS_MULT: Record<Rarity, number> = {
  common: 1.0,
  rare: 1.1,
  epic: 1.5,
  legendary: 4.0,
}

// Star-based DPS multiplier (index = stars count: 1★=x1, 2★=x1.1, etc.)
export const STAR_DPS_MULT: number[] = [1, 1, 1.1, 1.2, 1.3, 1.5]
export const STAR_DPS_MULT_SHINY: number[] = [1, 1, 1.5, 2, 3, 5]

export function getStarDpsMult(stars: number, isShiny: boolean): number {
  const table = isShiny ? STAR_DPS_MULT_SHINY : STAR_DPS_MULT
  return table[Math.min(stars, table.length - 1)] ?? 1
}

// Build a slug → rarity lookup from all banners
const _slugRarity = new Map<string, Rarity>()
for (const b of BANNERS) {
  for (const p of b.pool) {
    _slugRarity.set(p.slug, p.rarity)
  }
}

export function getRarity(slug: string): Rarity {
  return _slugRarity.get(slug) ?? 'common'
}

export function getRarityDpsMult(slug: string): number {
  return RARITY_DPS_MULT[getRarity(slug)]
}

export function pullFromBanner(banner: Banner): { pokemon: GachaPokemon; isShiny: boolean } {
  const byRarity = new Map<Rarity, GachaPokemon[]>()
  for (const p of banner.pool) {
    const arr = byRarity.get(p.rarity) ?? []
    arr.push(p)
    byRarity.set(p.rarity, arr)
  }

  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = Math.random() * totalWeight
  let selectedRarity: Rarity = 'common'

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [Rarity, number][]) {
    roll -= weight
    if (roll <= 0) {
      selectedRarity = rarity
      break
    }
  }

  const candidates = byRarity.get(selectedRarity) ?? byRarity.get('common') ?? banner.pool
  const pokemon = candidates[Math.floor(Math.random() * candidates.length)]!
  const isShiny = Math.random() < 1 / 1000

  return { pokemon, isShiny }
}
