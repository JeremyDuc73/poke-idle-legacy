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

// All Gen 1 base (non-evolved) Pokemon
const KANTO_POOL: GachaPokemon[] = [
  // --- COMMON (basic Pokemon found everywhere) ---
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

  // --- RARE (starters, popular, useful) ---
  { nameFr: 'Bulbizarre', nameEn: 'Bulbasaur', slug: 'bulbasaur', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Salamèche', nameEn: 'Charmander', slug: 'charmander', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Carapuce', nameEn: 'Squirtle', slug: 'squirtle', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Pikachu', nameEn: 'Pikachu', slug: 'pikachu', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Abo', nameEn: 'Ekans', slug: 'ekans', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Sabelette', nameEn: 'Sandshrew', slug: 'sandshrew', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Nidoran♀', nameEn: 'Nidoran♀', slug: 'nidoran-f', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Nidoran♂', nameEn: 'Nidoran♂', slug: 'nidoran-m', rarity: 'rare', shinyRate: 0.02 },
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

  // --- EPIC (strong, desirable) ---
  { nameFr: 'Abra', nameEn: 'Abra', slug: 'abra', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Fantominus', nameEn: 'Gastly', slug: 'gastly', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Évoli', nameEn: 'Eevee', slug: 'eevee', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Minidraco', nameEn: 'Dratini', slug: 'dratini', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Lokhlass', nameEn: 'Lapras', slug: 'lapras', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Ronflex', nameEn: 'Snorlax', slug: 'snorlax', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Insécateur', nameEn: 'Scyther', slug: 'scyther', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Scarabrute', nameEn: 'Pinsir', slug: 'pinsir', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Tauros', nameEn: 'Tauros', slug: 'tauros', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kangourex', nameEn: 'Kangaskhan', slug: 'kangaskhan', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Leveinard', nameEn: 'Chansey', slug: 'chansey', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kicklee', nameEn: 'Hitmonlee', slug: 'hitmonlee', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Tygnon', nameEn: 'Hitmonchan', slug: 'hitmonchan', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Excelangue', nameEn: 'Lickitung', slug: 'lickitung', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Saquedeneu', nameEn: 'Tangela', slug: 'tangela', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Canarticho', nameEn: "Farfetch'd", slug: 'farfetchd', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Métamorph', nameEn: 'Ditto', slug: 'ditto', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'M. Mime', nameEn: 'Mr. Mime', slug: 'mr-mime', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Lippoutou', nameEn: 'Jynx', slug: 'jynx', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Élektek', nameEn: 'Electabuzz', slug: 'electabuzz', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Magmar', nameEn: 'Magmar', slug: 'magmar', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Porygon', nameEn: 'Porygon', slug: 'porygon', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Amonita', nameEn: 'Omanyte', slug: 'omanyte', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kabuto', nameEn: 'Kabuto', slug: 'kabuto', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Ptéra', nameEn: 'Aerodactyl', slug: 'aerodactyl', rarity: 'epic', shinyRate: 0.03 },

  // --- LEGENDARY ---
  { nameFr: 'Artikodin', nameEn: 'Articuno', slug: 'articuno', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Électhor', nameEn: 'Zapdos', slug: 'zapdos', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Sulfura', nameEn: 'Moltres', slug: 'moltres', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Mewtwo', nameEn: 'Mewtwo', slug: 'mewtwo', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Mew', nameEn: 'Mew', slug: 'mew', rarity: 'legendary', shinyRate: 0.05 },
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
  const isShiny = Math.random() < pokemon.shinyRate

  return { pokemon, isShiny }
}
