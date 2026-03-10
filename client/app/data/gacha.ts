import { POKEDEX } from './pokedex'

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
  pool: GachaPokemon[]
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 70,
  rare: 25,
  epic: 4.8,
  legendary: 0.2,
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

// === Gen 2 Johto Pool ===
const JOHTO_POOL: GachaPokemon[] = [
  // COMMON
  { nameFr: 'Fouinette', nameEn: 'Sentret', slug: 'sentret', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Hoothoot', nameEn: 'Hoothoot', slug: 'hoothoot', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Coxy', nameEn: 'Ledyba', slug: 'ledyba', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mimigal', nameEn: 'Spinarak', slug: 'spinarak', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Granivol', nameEn: 'Hoppip', slug: 'hoppip', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tournegrin', nameEn: 'Sunkern', slug: 'sunkern', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Natu', nameEn: 'Natu', slug: 'natu', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Wattouat', nameEn: 'Mareep', slug: 'mareep', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Marill', nameEn: 'Marill', slug: 'marill', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Axoloto', nameEn: 'Wooper', slug: 'wooper', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Simularbre', nameEn: 'Sudowoodo', slug: 'sudowoodo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Qwilfish', nameEn: 'Qwilfish', slug: 'qwilfish', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Snubbull', nameEn: 'Snubbull', slug: 'snubbull', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Marcacrin', nameEn: 'Swinub', slug: 'swinub', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Corayon', nameEn: 'Corsola', slug: 'corsola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Rémoraid', nameEn: 'Remoraid', slug: 'remoraid', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Cadoizo', nameEn: 'Delibird', slug: 'delibird', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Teddiursa', nameEn: 'Teddiursa', slug: 'teddiursa', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Insolourdo', nameEn: 'Dunsparce', slug: 'dunsparce', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Loupio', nameEn: 'Chinchou', slug: 'chinchou', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Capumain', nameEn: 'Aipom', slug: 'aipom', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Yanma', nameEn: 'Yanma', slug: 'yanma', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Zarbi', nameEn: 'Unown', slug: 'unown', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Girafarig', nameEn: 'Girafarig', slug: 'girafarig', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Pomdepik', nameEn: 'Pineco', slug: 'pineco', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Cerfrousse', nameEn: 'Stantler', slug: 'stantler', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Phanpy', nameEn: 'Phanpy', slug: 'phanpy', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Pichu', nameEn: 'Pichu', slug: 'pichu', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mélo', nameEn: 'Cleffa', slug: 'cleffa', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Toudoudou', nameEn: 'Igglybuff', slug: 'igglybuff', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Togepi', nameEn: 'Togepi', slug: 'togepi', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Démanta', nameEn: 'Mantine', slug: 'mantine', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Limagma', nameEn: 'Slugma', slug: 'slugma', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Caratroc', nameEn: 'Shuckle', slug: 'shuckle', rarity: 'common', shinyRate: 0.01 },
  // RARE
  { nameFr: 'Feuforêve', nameEn: 'Misdreavus', slug: 'misdreavus', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Cornèbre', nameEn: 'Murkrow', slug: 'murkrow', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Farfuret', nameEn: 'Sneasel', slug: 'sneasel', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Magby', nameEn: 'Magby', slug: 'magby', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Élekid', nameEn: 'Elekid', slug: 'elekid', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Lippouti', nameEn: 'Smoochum', slug: 'smoochum', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Debugant', nameEn: 'Tyrogue', slug: 'tyrogue', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Airmure', nameEn: 'Skarmory', slug: 'skarmory', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Corniaud', nameEn: 'Houndour', slug: 'houndour', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Scorplane', nameEn: 'Gligar', slug: 'gligar', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Embrylex', nameEn: 'Larvitar', slug: 'larvitar', rarity: 'epic', shinyRate: 0.03 },
  // EPIC STARTERS GEN 2
  { nameFr: 'Germignon', nameEn: 'Chikorita', slug: 'chikorita', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Héricendre', nameEn: 'Cyndaquil', slug: 'cyndaquil', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kaiminus', nameEn: 'Totodile', slug: 'totodile', rarity: 'epic', shinyRate: 0.03 },
  // EPIC
  { nameFr: 'Écremeuh', nameEn: 'Miltank', slug: 'miltank', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Leuphorie', nameEn: 'Blissey', slug: 'blissey', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Scarhino', nameEn: 'Heracross', slug: 'heracross', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Queulorior', nameEn: 'Smeargle', slug: 'smeargle', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Qulbutoké', nameEn: 'Wobbuffet', slug: 'wobbuffet', rarity: 'epic', shinyRate: 0.03 },
  // LEGENDARY
  { nameFr: 'Raikou', nameEn: 'Raikou', slug: 'raikou', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Entei', nameEn: 'Entei', slug: 'entei', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Suicune', nameEn: 'Suicune', slug: 'suicune', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Lugia', nameEn: 'Lugia', slug: 'lugia', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Ho-Oh', nameEn: 'Ho-Oh', slug: 'hooh', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Celebi', nameEn: 'Celebi', slug: 'celebi', rarity: 'legendary', shinyRate: 0.05 },
  // Mega Evolutions (Johto base Pokémon)
  { nameFr: 'Méga-Pharamp', nameEn: 'Mega Ampharos', slug: 'ampharos-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Steelix', nameEn: 'Mega Steelix', slug: 'steelix-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Cizayox', nameEn: 'Mega Scizor', slug: 'scizor-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Scarhino', nameEn: 'Mega Heracross', slug: 'heracross-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Démolosse', nameEn: 'Mega Houndoom', slug: 'houndoom-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Tyranocif', nameEn: 'Mega Tyranitar', slug: 'tyranitar-mega', rarity: 'legendary', shinyRate: 0.05 },
]

// === Gen 3 Hoenn Pool ===
const HOENN_POOL: GachaPokemon[] = [
  // COMMON
  { nameFr: 'Zigzaton', nameEn: 'Zigzagoon', slug: 'zigzagoon', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Medhyèna', nameEn: 'Poochyena', slug: 'poochyena', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Nirondelle', nameEn: 'Taillow', slug: 'taillow', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chuchmur', nameEn: 'Whismur', slug: 'whismur', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Makuhita', nameEn: 'Makuhita', slug: 'makuhita', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Skitty', nameEn: 'Skitty', slug: 'skitty', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Dynavolt', nameEn: 'Electrike', slug: 'electrike', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chamallot', nameEn: 'Numel', slug: 'numel', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Spoink', nameEn: 'Spoink', slug: 'spoink', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Spinda', nameEn: 'Spinda', slug: 'spinda', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Kraknoix', nameEn: 'Trapinch', slug: 'trapinch', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Cacnea', nameEn: 'Cacnea', slug: 'cacnea', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Wailmer', nameEn: 'Wailmer', slug: 'wailmer', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Carvanha', nameEn: 'Carvanha', slug: 'carvanha', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Balbuto', nameEn: 'Baltoy', slug: 'baltoy', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Obalie', nameEn: 'Spheal', slug: 'spheal', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Posipi', nameEn: 'Plusle', slug: 'plusle', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Négapi', nameEn: 'Minun', slug: 'minun', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chenipotte', nameEn: 'Wurmple', slug: 'wurmple', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Ningale', nameEn: 'Nincada', slug: 'nincada', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Nénupiot', nameEn: 'Lotad', slug: 'lotad', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Grainipiot', nameEn: 'Seedot', slug: 'seedot', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Goélise', nameEn: 'Wingull', slug: 'wingull', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Azurill', nameEn: 'Azurill', slug: 'azurill', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Gloupti', nameEn: 'Gulpin', slug: 'gulpin', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Morphéo', nameEn: 'Castform', slug: 'castform', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Balignon', nameEn: 'Shroomish', slug: 'shroomish', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tarinor', nameEn: 'Nosepass', slug: 'nosepass', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Meditikka', nameEn: 'Meditite', slug: 'meditite', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Muciole', nameEn: 'Volbeat', slug: 'volbeat', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Lumivole', nameEn: 'Illumise', slug: 'illumise', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tylton', nameEn: 'Swablu', slug: 'swablu', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mangriff', nameEn: 'Zangoose', slug: 'zangoose', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Seviper', nameEn: 'Seviper', slug: 'seviper', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Séléroc', nameEn: 'Lunatone', slug: 'lunatone', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Solaroc', nameEn: 'Solrock', slug: 'solrock', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Barloche', nameEn: 'Barboach', slug: 'barboach', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Écrapince', nameEn: 'Corphish', slug: 'corphish', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Okéoké', nameEn: 'Wynaut', slug: 'wynaut', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Stalgamin', nameEn: 'Snorunt', slug: 'snorunt', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Galekid', nameEn: 'Aron', slug: 'aron', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Arakdo', nameEn: 'Surskit', slug: 'surskit', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Rosélia', nameEn: 'Roselia', slug: 'roselia', rarity: 'common', shinyRate: 0.01 },
  // RARE
  { nameFr: 'Tarsal', nameEn: 'Ralts', slug: 'ralts', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Parecool', nameEn: 'Slakoth', slug: 'slakoth', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Ténéfix', nameEn: 'Sableye', slug: 'sableye', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Mysdibule', nameEn: 'Mawile', slug: 'mawile', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Chartor', nameEn: 'Torkoal', slug: 'torkoal', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Skelénox', nameEn: 'Duskull', slug: 'duskull', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Polichombr', nameEn: 'Shuppet', slug: 'shuppet', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Tropius', nameEn: 'Tropius', slug: 'tropius', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Absol', nameEn: 'Absol', slug: 'absol', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Draby', nameEn: 'Bagon', slug: 'bagon', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Terhal', nameEn: 'Beldum', slug: 'beldum', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Barpau', nameEn: 'Feebas', slug: 'feebas', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Lilia', nameEn: 'Lileep', slug: 'lileep', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Anorith', nameEn: 'Anorith', slug: 'anorith', rarity: 'rare', shinyRate: 0.02 },
  // EPIC
  { nameFr: 'Kecleon', nameEn: 'Kecleon', slug: 'kecleon', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Relicanth', nameEn: 'Relicanth', slug: 'relicanth', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Coquiperl', nameEn: 'Clamperl', slug: 'clamperl', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Éoko', nameEn: 'Chimecho', slug: 'chimecho', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Lovdisc', nameEn: 'Luvdisc', slug: 'luvdisc', rarity: 'epic', shinyRate: 0.03 },
  // EPIC STARTERS GEN 3
  { nameFr: 'Gobou', nameEn: 'Mudkip', slug: 'mudkip', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Poussifeu', nameEn: 'Torchic', slug: 'torchic', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Arcko', nameEn: 'Treecko', slug: 'treecko', rarity: 'epic', shinyRate: 0.03 },
  // LEGENDARY
  { nameFr: 'Regirock', nameEn: 'Regirock', slug: 'regirock', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Regice', nameEn: 'Regice', slug: 'regice', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Registeel', nameEn: 'Registeel', slug: 'registeel', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Latias', nameEn: 'Latias', slug: 'latias', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Latios', nameEn: 'Latios', slug: 'latios', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Kyogre', nameEn: 'Kyogre', slug: 'kyogre', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Groudon', nameEn: 'Groudon', slug: 'groudon', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Rayquaza', nameEn: 'Rayquaza', slug: 'rayquaza', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Jirachi', nameEn: 'Jirachi', slug: 'jirachi', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Deoxys', nameEn: 'Deoxys', slug: 'deoxys', rarity: 'legendary', shinyRate: 0.05 },
  // Mega Evolutions (Hoenn base Pokémon)
  { nameFr: 'Méga-Jungko', nameEn: 'Mega Sceptile', slug: 'sceptile-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Braségali', nameEn: 'Mega Blaziken', slug: 'blaziken-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Laggron', nameEn: 'Mega Swampert', slug: 'swampert-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Gardevoir', nameEn: 'Mega Gardevoir', slug: 'gardevoir-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Ténéfix', nameEn: 'Mega Sableye', slug: 'sableye-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Mysdibule', nameEn: 'Mega Mawile', slug: 'mawile-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Galeking', nameEn: 'Mega Aggron', slug: 'aggron-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Charmina', nameEn: 'Mega Medicham', slug: 'medicham-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Élecsprint', nameEn: 'Mega Manectric', slug: 'manectric-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Sharpedo', nameEn: 'Mega Sharpedo', slug: 'sharpedo-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Camérupt', nameEn: 'Mega Camerupt', slug: 'camerupt-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Altaria', nameEn: 'Mega Altaria', slug: 'altaria-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Branette', nameEn: 'Mega Banette', slug: 'banette-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Absol', nameEn: 'Mega Absol', slug: 'absol-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Oniglali', nameEn: 'Mega Glalie', slug: 'glalie-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Drattak', nameEn: 'Mega Salamence', slug: 'salamence-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Métalosse', nameEn: 'Mega Metagross', slug: 'metagross-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Latias', nameEn: 'Mega Latias', slug: 'latias-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Latios', nameEn: 'Mega Latios', slug: 'latios-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Rayquaza', nameEn: 'Mega Rayquaza', slug: 'rayquaza-mega', rarity: 'legendary', shinyRate: 0.05 },
]

// === Gen 4 Sinnoh Pool ===
const SINNOH_POOL: GachaPokemon[] = [
  // COMMON
  { nameFr: 'Étourmi', nameEn: 'Starly', slug: 'starly', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Keunotor', nameEn: 'Bidoof', slug: 'bidoof', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Crikzik', nameEn: 'Kricketot', slug: 'kricketot', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Rozbouton', nameEn: 'Budew', slug: 'budew', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Cheniti', nameEn: 'Burmy', slug: 'burmy', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Apitrini', nameEn: 'Combee', slug: 'combee', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Ceribou', nameEn: 'Cherubi', slug: 'cherubi', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Sancoki', nameEn: 'Shellos', slug: 'shellos', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Baudrive', nameEn: 'Drifloon', slug: 'drifloon', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Laporeille', nameEn: 'Buneary', slug: 'buneary', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chaglam', nameEn: 'Glameow', slug: 'glameow', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Korillon', nameEn: 'Chingling', slug: 'chingling', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Moufouette', nameEn: 'Stunky', slug: 'stunky', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Archéomire', nameEn: 'Bronzor', slug: 'bronzor', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Manzaï', nameEn: 'Bonsly', slug: 'bonsly', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mime Jr.', nameEn: 'Mime Jr.', slug: 'mimejr', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Hippopotas', nameEn: 'Hippopotas', slug: 'hippopotas', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Rapion', nameEn: 'Skorupi', slug: 'skorupi', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Cradopaud', nameEn: 'Croagunk', slug: 'croagunk', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Écayon', nameEn: 'Finneon', slug: 'finneon', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Babimanta', nameEn: 'Mantyke', slug: 'mantyke', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Blizzi', nameEn: 'Snover', slug: 'snover', rarity: 'common', shinyRate: 0.01 },
  // RARE
  { nameFr: 'Lixy', nameEn: 'Shinx', slug: 'shinx', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Pachirisu', nameEn: 'Pachirisu', slug: 'pachirisu', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Mustébouée', nameEn: 'Buizel', slug: 'buizel', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Pijako', nameEn: 'Chatot', slug: 'chatot', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Vortente', nameEn: 'Carnivine', slug: 'carnivine', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Motisma', nameEn: 'Rotom', slug: 'rotom', rarity: 'rare', shinyRate: 0.02 },
  // EPIC
  { nameFr: 'Kranidos', nameEn: 'Cranidos', slug: 'cranidos', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Dinoclier', nameEn: 'Shieldon', slug: 'shieldon', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Ptiravi', nameEn: 'Happiny', slug: 'happiny', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Goinfrex', nameEn: 'Munchlax', slug: 'munchlax', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Riolu', nameEn: 'Riolu', slug: 'riolu', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Spiritomb', nameEn: 'Spiritomb', slug: 'spiritomb', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Griknot', nameEn: 'Gible', slug: 'gible', rarity: 'epic', shinyRate: 0.03 },
  // EPIC STARTERS GEN 4
  { nameFr: 'Tortipouss', nameEn: 'Turtwig', slug: 'turtwig', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Ouisticram', nameEn: 'Chimchar', slug: 'chimchar', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Tiplouf', nameEn: 'Piplup', slug: 'piplup', rarity: 'epic', shinyRate: 0.03 },
  // LEGENDARY
  { nameFr: 'Créhelf', nameEn: 'Uxie', slug: 'uxie', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Créfollet', nameEn: 'Mesprit', slug: 'mesprit', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Créfadet', nameEn: 'Azelf', slug: 'azelf', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Dialga', nameEn: 'Dialga', slug: 'dialga', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Palkia', nameEn: 'Palkia', slug: 'palkia', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Heatran', nameEn: 'Heatran', slug: 'heatran', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Regigigas', nameEn: 'Regigigas', slug: 'regigigas', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Giratina', nameEn: 'Giratina', slug: 'giratina', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Cresselia', nameEn: 'Cresselia', slug: 'cresselia', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Phione', nameEn: 'Phione', slug: 'phione', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Manaphy', nameEn: 'Manaphy', slug: 'manaphy', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Darkrai', nameEn: 'Darkrai', slug: 'darkrai', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Shaymin', nameEn: 'Shaymin', slug: 'shaymin', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Arceus', nameEn: 'Arceus', slug: 'arceus', rarity: 'legendary', shinyRate: 0.05 },
  // Mega Evolutions Gen 4
  { nameFr: 'Méga-Lucario', nameEn: 'Mega Lucario', slug: 'lucario-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Carchacrok', nameEn: 'Mega Garchomp', slug: 'garchomp-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Lockpin', nameEn: 'Mega Lopunny', slug: 'lopunny-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Blizzaroi', nameEn: 'Mega Abomasnow', slug: 'abomasnow-mega', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Méga-Gallame', nameEn: 'Mega Gallade', slug: 'gallade-mega', rarity: 'legendary', shinyRate: 0.05 },
]

// === Gen 5 Unova Pool ===
const UNOVA_POOL: GachaPokemon[] = [
  // --- COMMON (early routes, common encounters) ---
  { nameFr: 'Ratentif', nameEn: 'Patrat', slug: 'patrat', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Ponchiot', nameEn: 'Lillipup', slug: 'lillipup', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chacripan', nameEn: 'Purrloin', slug: 'purrloin', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Feuillajou', nameEn: 'Pansage', slug: 'pansage', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Flamajou', nameEn: 'Pansear', slug: 'pansear', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Flotajou', nameEn: 'Panpour', slug: 'panpour', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Munna', nameEn: 'Munna', slug: 'munna', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Poichigeon', nameEn: 'Pidove', slug: 'pidove', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Zébibron', nameEn: 'Blitzle', slug: 'blitzle', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Nodulithe', nameEn: 'Roggenrola', slug: 'roggenrola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chovsourir', nameEn: 'Woobat', slug: 'woobat', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Nanméouïe', nameEn: 'Audino', slug: 'audino', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tritonde', nameEn: 'Tympole', slug: 'tympole', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Larveyette', nameEn: 'Sewaddle', slug: 'sewaddle', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Venipatte', nameEn: 'Venipede', slug: 'venipede', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Doudouvet', nameEn: 'Cottonee', slug: 'cottonee', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Chlorobule', nameEn: 'Petilil', slug: 'petilil', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Vivaldaim', nameEn: 'Deerling', slug: 'deerling', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Trompignon', nameEn: 'Foongus', slug: 'foongus', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Miamiasme', nameEn: 'Trubbish', slug: 'trubbish', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Crabicoque', nameEn: 'Dwebble', slug: 'dwebble', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Sorbébé', nameEn: 'Vanillite', slug: 'vanillite', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Polarhume', nameEn: 'Cubchoo', slug: 'cubchoo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Escargaume', nameEn: 'Shelmet', slug: 'shelmet', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Carabing', nameEn: 'Karrablast', slug: 'karrablast', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Limonde', nameEn: 'Stunfisk', slug: 'stunfisk', rarity: 'common', shinyRate: 0.01 },
  // --- RARE (mid-game, useful) ---
  { nameFr: 'Rototaupe', nameEn: 'Drilbur', slug: 'drilbur', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Mascaïman', nameEn: 'Sandile', slug: 'sandile', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Darumarond', nameEn: 'Darumaka', slug: 'darumaka', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Chinchidou', nameEn: 'Minccino', slug: 'minccino', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Scrutella', nameEn: 'Gothita', slug: 'gothita', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Nucléos', nameEn: 'Solosis', slug: 'solosis', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Couaneton', nameEn: 'Ducklett', slug: 'ducklett', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Emolga', nameEn: 'Emolga', slug: 'emolga', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Statitik', nameEn: 'Joltik', slug: 'joltik', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Grindur', nameEn: 'Ferroseed', slug: 'ferroseed', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Tic', nameEn: 'Klink', slug: 'klink', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Anchwatt', nameEn: 'Tynamo', slug: 'tynamo', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Lewsor', nameEn: 'Elgyem', slug: 'elgyem', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Tutafeh', nameEn: 'Yamask', slug: 'yamask', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Viskuse', nameEn: 'Frillish', slug: 'frillish', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Maracachi', nameEn: 'Maractus', slug: 'maractus', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Mamanbo', nameEn: 'Alomomola', slug: 'alomomola', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Bargantua', nameEn: 'Basculin', slug: 'basculin', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Frison', nameEn: 'Bouffalant', slug: 'bouffalant', rarity: 'rare', shinyRate: 0.02 },
  // --- EPIC (starters, pseudo-legendaries, strong Pokémon) ---
  { nameFr: 'Vipélierre', nameEn: 'Snivy', slug: 'snivy', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Gruikui', nameEn: 'Tepig', slug: 'tepig', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Moustillon', nameEn: 'Oshawott', slug: 'oshawott', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Charpenti', nameEn: 'Timburr', slug: 'timburr', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Baggiguane', nameEn: 'Scraggy', slug: 'scraggy', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Zorua', nameEn: 'Zorua', slug: 'zorua', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Carapagos', nameEn: 'Tirtouga', slug: 'tirtouga', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Arkéapti', nameEn: 'Archen', slug: 'archen', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Funécire', nameEn: 'Litwick', slug: 'litwick', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Coupenotte', nameEn: 'Axew', slug: 'axew', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kungfouine', nameEn: 'Mienfoo', slug: 'mienfoo', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Scalpion', nameEn: 'Pawniard', slug: 'pawniard', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Furaiglon', nameEn: 'Rufflet', slug: 'rufflet', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Vostourno', nameEn: 'Vullaby', slug: 'vullaby', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Gringolem', nameEn: 'Golett', slug: 'golett', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Pyronille', nameEn: 'Larvesta', slug: 'larvesta', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Solochi', nameEn: 'Deino', slug: 'deino', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Judokrak', nameEn: 'Throh', slug: 'throh', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Karaclée', nameEn: 'Sawk', slug: 'sawk', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Cryptéro', nameEn: 'Sigilyph', slug: 'sigilyph', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Drakkarmin', nameEn: 'Druddigon', slug: 'druddigon', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Aflamanoir', nameEn: 'Heatmor', slug: 'heatmor', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Fermite', nameEn: 'Durant', slug: 'durant', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Hexagel', nameEn: 'Cryogonal', slug: 'cryogonal', rarity: 'epic', shinyRate: 0.03 },
  // --- LEGENDARY ---
  { nameFr: 'Victini', nameEn: 'Victini', slug: 'victini', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Cobaltium', nameEn: 'Cobalion', slug: 'cobalion', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Terrakium', nameEn: 'Terrakion', slug: 'terrakion', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Viridium', nameEn: 'Virizion', slug: 'virizion', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Boréas', nameEn: 'Tornadus', slug: 'tornadus', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Fulguris', nameEn: 'Thundurus', slug: 'thundurus', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Reshiram', nameEn: 'Reshiram', slug: 'reshiram', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Zekrom', nameEn: 'Zekrom', slug: 'zekrom', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Démétéros', nameEn: 'Landorus', slug: 'landorus', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Kyurem', nameEn: 'Kyurem', slug: 'kyurem', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Keldeo', nameEn: 'Keldeo', slug: 'keldeo', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Meloetta', nameEn: 'Meloetta', slug: 'meloetta', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Genesect', nameEn: 'Genesect', slug: 'genesect', rarity: 'legendary', shinyRate: 0.05 },
  // Mega Evolution Gen 5
  { nameFr: 'Méga-Nanméouïe', nameEn: 'Mega Audino', slug: 'audino-mega', rarity: 'legendary', shinyRate: 0.05 },
]

// === Gen 6 Kalos Pool ===
// Sylveon EXCLUDED (cross-gen Eevee evolution)
const KALOS_POOL: GachaPokemon[] = [
  // --- COMMON (early routes, common encounters) ---
  { nameFr: 'Sapereau', nameEn: 'Bunnelby', slug: 'bunnelby', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Passerouge', nameEn: 'Fletchling', slug: 'fletchling', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Lépidonille', nameEn: 'Scatterbug', slug: 'scatterbug', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Hélionceau', nameEn: 'Litleo', slug: 'litleo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Flabébé', nameEn: 'Flabébé', slug: 'flabebe', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Cabriolaine', nameEn: 'Skiddo', slug: 'skiddo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Couafarel', nameEn: 'Furfrou', slug: 'furfrou', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Psystigri', nameEn: 'Espurr', slug: 'espurr', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Fluvetin', nameEn: 'Spritzee', slug: 'spritzee', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Sucroquin', nameEn: 'Swirlix', slug: 'swirlix', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Sepiatop', nameEn: 'Inkay', slug: 'inkay', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Opermine', nameEn: 'Binacle', slug: 'binacle', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Venalgue', nameEn: 'Skrelp', slug: 'skrelp', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Flingouste', nameEn: 'Clauncher', slug: 'clauncher', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Galvaran', nameEn: 'Helioptile', slug: 'helioptile', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Grelaçon', nameEn: 'Bergmite', slug: 'bergmite', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Pitrouille', nameEn: 'Pumpkaboo', slug: 'pumpkaboo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Brocélôme', nameEn: 'Phantump', slug: 'phantump', rarity: 'common', shinyRate: 0.01 },
  // --- RARE (mid-game, useful) ---
  { nameFr: 'Pandespiègle', nameEn: 'Pancham', slug: 'pancham', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Monorpale', nameEn: 'Honedge', slug: 'honedge', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Ptyranidur', nameEn: 'Tyrunt', slug: 'tyrunt', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Amagara', nameEn: 'Amaura', slug: 'amaura', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Dedenne', nameEn: 'Dedenne', slug: 'dedenne', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Strassie', nameEn: 'Carbink', slug: 'carbink', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Trousselin', nameEn: 'Klefki', slug: 'klefki', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Brutalibré', nameEn: 'Hawlucha', slug: 'hawlucha', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Sonistrelle', nameEn: 'Noibat', slug: 'noibat', rarity: 'rare', shinyRate: 0.02 },
  // --- EPIC (starters, pseudo-legendaries, strong Pokémon) ---
  { nameFr: 'Marisson', nameEn: 'Chespin', slug: 'chespin', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Feunnec', nameEn: 'Fennekin', slug: 'fennekin', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Grenousse', nameEn: 'Froakie', slug: 'froakie', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Mucuscule', nameEn: 'Goomy', slug: 'goomy', rarity: 'epic', shinyRate: 0.03 },
  // --- LEGENDARY ---
  { nameFr: 'Xerneas', nameEn: 'Xerneas', slug: 'xerneas', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Yveltal', nameEn: 'Yveltal', slug: 'yveltal', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Zygarde', nameEn: 'Zygarde', slug: 'zygarde', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Diancie', nameEn: 'Diancie', slug: 'diancie', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Hoopa', nameEn: 'Hoopa', slug: 'hoopa', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Volcanion', nameEn: 'Volcanion', slug: 'volcanion', rarity: 'legendary', shinyRate: 0.05 },
  // Mega Evolution Gen 6
  { nameFr: 'Méga-Diancie', nameEn: 'Mega Diancie', slug: 'diancie-mega', rarity: 'legendary', shinyRate: 0.05 },
]

// === Gen 7 Alola Pool ===
// Cross-gen Alolan evos (Raichu-Alola, Exeggutor-Alola, Marowak-Alola) EXCLUDED
const ALOLA_POOL: GachaPokemon[] = [
  // --- COMMON (early routes, common encounters) ---
  { nameFr: 'Picassaut', nameEn: 'Pikipek', slug: 'pikipek', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Manglouton', nameEn: 'Yungoos', slug: 'yungoos', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Larvibule', nameEn: 'Grubbin', slug: 'grubbin', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Plumeline', nameEn: 'Oricorio', slug: 'oricorio', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Bombydou', nameEn: 'Cutiefly', slug: 'cutiefly', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Rocabot', nameEn: 'Rockruff', slug: 'rockruff', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Froussardine', nameEn: 'Wishiwashi', slug: 'wishiwashi', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tiboudet', nameEn: 'Mudbray', slug: 'mudbray', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Mimantis', nameEn: 'Fomantis', slug: 'fomantis', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Spododo', nameEn: 'Morelull', slug: 'morelull', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Nounourson', nameEn: 'Stufful', slug: 'stufful', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Croquine', nameEn: 'Bounsweet', slug: 'bounsweet', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Bacabouh', nameEn: 'Sandygast', slug: 'sandygast', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Concombaffe', nameEn: 'Pyukumuku', slug: 'pyukumuku', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Dodoala', nameEn: 'Komala', slug: 'komala', rarity: 'common', shinyRate: 0.01 },
  // Alolan base forms
  { nameFr: 'Rattata (Alola)', nameEn: 'Rattata (Alola)', slug: 'rattata-alola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Sabelette (Alola)', nameEn: 'Sandshrew (Alola)', slug: 'sandshrew-alola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Goupix (Alola)', nameEn: 'Vulpix (Alola)', slug: 'vulpix-alola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Taupiqueur (Alola)', nameEn: 'Diglett (Alola)', slug: 'diglett-alola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Miaouss (Alola)', nameEn: 'Meowth (Alola)', slug: 'meowth-alola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Racaillou (Alola)', nameEn: 'Geodude (Alola)', slug: 'geodude-alola', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tadmorv (Alola)', nameEn: 'Grimer (Alola)', slug: 'grimer-alola', rarity: 'common', shinyRate: 0.01 },
  // --- RARE (mid-game, useful) ---
  { nameFr: 'Crabagarre', nameEn: 'Crabrawler', slug: 'crabrawler', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Vorastérie', nameEn: 'Mareanie', slug: 'mareanie', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Araqua', nameEn: 'Dewpider', slug: 'dewpider', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Tritox', nameEn: 'Salandit', slug: 'salandit', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Guérilande', nameEn: 'Comfey', slug: 'comfey', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Gouroutan', nameEn: 'Oranguru', slug: 'oranguru', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Quartermac', nameEn: 'Passimian', slug: 'passimian', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Sovkipou', nameEn: 'Wimpod', slug: 'wimpod', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Boumata', nameEn: 'Turtonator', slug: 'turtonator', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Togedemaru', nameEn: 'Togedemaru', slug: 'togedemaru', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Mimiqui', nameEn: 'Mimikyu', slug: 'mimikyu', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Denticrisse', nameEn: 'Bruxish', slug: 'bruxish', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Draïeul', nameEn: 'Drampa', slug: 'drampa', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Sinistrail', nameEn: 'Dhelmise', slug: 'dhelmise', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Météno', nameEn: 'Minior', slug: 'minior', rarity: 'rare', shinyRate: 0.02 },
  // --- EPIC (starters, pseudo-legendaries, strong) ---
  { nameFr: 'Brindibou', nameEn: 'Rowlet', slug: 'rowlet', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Flamiaou', nameEn: 'Litten', slug: 'litten', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Otaquin', nameEn: 'Popplio', slug: 'popplio', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Bébécaille', nameEn: 'Jangmo-o', slug: 'jangmoo', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Type:0', nameEn: 'Type: Null', slug: 'typenull', rarity: 'epic', shinyRate: 0.03 },
  // --- LEGENDARY ---
  { nameFr: 'Tokorico', nameEn: 'Tapu Koko', slug: 'tapukoko', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Tokopiyon', nameEn: 'Tapu Lele', slug: 'tapulele', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Tokotoro', nameEn: 'Tapu Bulu', slug: 'tapubulu', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Tokopisco', nameEn: 'Tapu Fini', slug: 'tapufini', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Cosmog', nameEn: 'Cosmog', slug: 'cosmog', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Solgaleo', nameEn: 'Solgaleo', slug: 'solgaleo', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Lunala', nameEn: 'Lunala', slug: 'lunala', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Necrozma', nameEn: 'Necrozma', slug: 'necrozma', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Magearna', nameEn: 'Magearna', slug: 'magearna', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Marshadow', nameEn: 'Marshadow', slug: 'marshadow', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Zeraora', nameEn: 'Zeraora', slug: 'zeraora', rarity: 'legendary', shinyRate: 0.05 },
  // Ultra Beasts
  { nameFr: 'Zéroïd', nameEn: 'Nihilego', slug: 'nihilego', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Mouscoto', nameEn: 'Buzzwole', slug: 'buzzwole', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Cancrelove', nameEn: 'Pheromosa', slug: 'pheromosa', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Câblifère', nameEn: 'Xurkitree', slug: 'xurkitree', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Bamboiselle', nameEn: 'Celesteela', slug: 'celesteela', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Katagami', nameEn: 'Kartana', slug: 'kartana', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Engloutyran', nameEn: 'Guzzlord', slug: 'guzzlord', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Vémini', nameEn: 'Poipole', slug: 'poipole', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Ama-Ama', nameEn: 'Stakataka', slug: 'stakataka', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Pierroteknik', nameEn: 'Blacephalon', slug: 'blacephalon', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Meltan', nameEn: 'Meltan', slug: 'meltan', rarity: 'legendary', shinyRate: 0.05 },
]

// === Gen 8 Galar Pool ===
// Cross-gen Galarian/Hisuian evos EXCLUDED (use galar-stone/hisui-stone)
const GALAR_POOL: GachaPokemon[] = [
  // --- COMMON (early routes, common encounters) ---
  { nameFr: 'Rongourmand', nameEn: 'Skwovet', slug: 'skwovet', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Minisange', nameEn: 'Rookidee', slug: 'rookidee', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Larvadar', nameEn: 'Blipbug', slug: 'blipbug', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Goupilou', nameEn: 'Nickit', slug: 'nickit', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tournicoton', nameEn: 'Gossifleur', slug: 'gossifleur', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Moumouton', nameEn: 'Wooloo', slug: 'wooloo', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Khélocrok', nameEn: 'Chewtle', slug: 'chewtle', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Voltoutou', nameEn: 'Yamper', slug: 'yamper', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Charbi', nameEn: 'Rolycoly', slug: 'rolycoly', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Dunaja', nameEn: 'Silicobra', slug: 'silicobra', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Embrochet', nameEn: 'Arrokuda', slug: 'arrokuda', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Toxizap', nameEn: 'Toxel', slug: 'toxel', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Grillepattes', nameEn: 'Sizzlipede', slug: 'sizzlipede', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Poulpaf', nameEn: 'Clobbopus', slug: 'clobbopus', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Bibichut', nameEn: 'Hatenna', slug: 'hatenna', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Grimalin', nameEn: 'Impidimp', slug: 'impidimp', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Crèmy', nameEn: 'Milcery', slug: 'milcery', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Frissonille', nameEn: 'Snom', slug: 'snom', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Charibari', nameEn: 'Cufant', slug: 'cufant', rarity: 'common', shinyRate: 0.01 },
  // Galarian base forms
  { nameFr: 'Miaouss (Galar)', nameEn: 'Meowth (Galar)', slug: 'meowth-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Ponyta (Galar)', nameEn: 'Ponyta (Galar)', slug: 'ponyta-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Ramoloss (Galar)', nameEn: 'Slowpoke (Galar)', slug: 'slowpoke-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Canarticho (Galar)', nameEn: "Farfetch'd (Galar)", slug: 'farfetchd-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Corayon (Galar)', nameEn: 'Corsola (Galar)', slug: 'corsola-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Zigzaton (Galar)', nameEn: 'Zigzagoon (Galar)', slug: 'zigzagoon-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Darumarond (Galar)', nameEn: 'Darumaka (Galar)', slug: 'darumaka-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Tutafeh (Galar)', nameEn: 'Yamask (Galar)', slug: 'yamask-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Limonde (Galar)', nameEn: 'Stunfisk (Galar)', slug: 'stunfisk-galar', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'M. Mime (Galar)', nameEn: 'Mr. Mime (Galar)', slug: 'mrmime-galar', rarity: 'common', shinyRate: 0.01 },
  // Hisuian base forms
  { nameFr: 'Caninos (Hisui)', nameEn: 'Growlithe (Hisui)', slug: 'growlithe-hisui', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Voltorbe (Hisui)', nameEn: 'Voltorb (Hisui)', slug: 'voltorb-hisui', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Qwilfish (Hisui)', nameEn: 'Qwilfish (Hisui)', slug: 'qwilfish-hisui', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Farfuret (Hisui)', nameEn: 'Sneasel (Hisui)', slug: 'sneasel-hisui', rarity: 'common', shinyRate: 0.01 },
  { nameFr: 'Zorua (Hisui)', nameEn: 'Zorua (Hisui)', slug: 'zorua-hisui', rarity: 'common', shinyRate: 0.01 },
  // --- RARE (mid-game, useful) ---
  { nameFr: 'Verpom', nameEn: 'Applin', slug: 'applin', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Nigosier', nameEn: 'Cramorant', slug: 'cramorant', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Théffroi', nameEn: 'Sinistea', slug: 'sinistea', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Hexadron', nameEn: 'Falinks', slug: 'falinks', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Wattapik', nameEn: 'Pincurchin', slug: 'pincurchin', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Dolman', nameEn: 'Stonjourner', slug: 'stonjourner', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Bekaglaçon', nameEn: 'Eiscue', slug: 'eiscue', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Wimessir', nameEn: 'Indeedee', slug: 'indeedee', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Morpeko', nameEn: 'Morpeko', slug: 'morpeko', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Duralugon', nameEn: 'Duraludon', slug: 'duraludon', rarity: 'rare', shinyRate: 0.02 },
  // Fossils
  { nameFr: 'Galvagon', nameEn: 'Dracozolt', slug: 'dracozolt', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Galvagla', nameEn: 'Arctozolt', slug: 'arctozolt', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Hydragon', nameEn: 'Dracovish', slug: 'dracovish', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Hydragla', nameEn: 'Arctovish', slug: 'arctovish', rarity: 'rare', shinyRate: 0.02 },
  // --- EPIC (starters, pseudo-legendaries) ---
  { nameFr: 'Ouistempo', nameEn: 'Grookey', slug: 'grookey', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Flambino', nameEn: 'Scorbunny', slug: 'scorbunny', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Larméléon', nameEn: 'Sobble', slug: 'sobble', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Fantyrm', nameEn: 'Dreepy', slug: 'dreepy', rarity: 'epic', shinyRate: 0.03 },
  // --- LEGENDARY ---
  { nameFr: 'Zacian', nameEn: 'Zacian', slug: 'zacian', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Zamazenta', nameEn: 'Zamazenta', slug: 'zamazenta', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Éthernatos', nameEn: 'Eternatus', slug: 'eternatus', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Wushours', nameEn: 'Kubfu', slug: 'kubfu', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Zarude', nameEn: 'Zarude', slug: 'zarude', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Regieleki', nameEn: 'Regieleki', slug: 'regieleki', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Regidrago', nameEn: 'Regidrago', slug: 'regidrago', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Blizzeval', nameEn: 'Glastrier', slug: 'glastrier', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Spectreval', nameEn: 'Spectrier', slug: 'spectrier', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Sylveroy', nameEn: 'Calyrex', slug: 'calyrex', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Amovénus', nameEn: 'Enamorus', slug: 'enamorus', rarity: 'legendary', shinyRate: 0.05 },
  // Galarian legendary birds
  { nameFr: 'Artikodin (Galar)', nameEn: 'Articuno (Galar)', slug: 'articuno-galar', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Électhor (Galar)', nameEn: 'Zapdos (Galar)', slug: 'zapdos-galar', rarity: 'legendary', shinyRate: 0.05 },
  { nameFr: 'Sulfura (Galar)', nameEn: 'Moltres (Galar)', slug: 'moltres-galar', rarity: 'legendary', shinyRate: 0.05 },
]

export const BANNERS: Banner[] = [
  {
    id: 'kanto',
    nameFr: 'Bannière Kanto',
    nameEn: 'Kanto Banner',
    generation: 1,
    costGold: 500,
    pool: KANTO_POOL,
  },
  {
    id: 'johto',
    nameFr: 'Bannière Johto',
    nameEn: 'Johto Banner',
    generation: 2,
    costGold: 20000,
    pool: JOHTO_POOL,
  },
  {
    id: 'hoenn',
    nameFr: 'Bannière Hoenn',
    nameEn: 'Hoenn Banner',
    generation: 3,
    costGold: 50000,
    pool: HOENN_POOL,
  },
  {
    id: 'sinnoh',
    nameFr: 'Bannière Sinnoh',
    nameEn: 'Sinnoh Banner',
    generation: 4,
    costGold: 100000,
    pool: SINNOH_POOL,
  },
  {
    id: 'unova',
    nameFr: 'Bannière Unys',
    nameEn: 'Unova Banner',
    generation: 5,
    costGold: 200000,
    pool: UNOVA_POOL,
  },
  {
    id: 'kalos',
    nameFr: 'Bannière Kalos',
    nameEn: 'Kalos Banner',
    generation: 6,
    // Pricing formula: ~8000 × gen² (start gen ≈ 5 pulls/100 kills, end gen ≈ 10 pulls/100 kills)
    costGold: 290000,
    pool: KALOS_POOL,
  },
  {
    id: 'alola',
    nameFr: 'Bannière Alola',
    nameEn: 'Alola Banner',
    generation: 7,
    // Pricing formula: ~8000 × gen² = 8000 × 49 = 392k → 390k
    costGold: 390000,
    pool: ALOLA_POOL,
  },
  {
    id: 'galar',
    nameFr: 'Bannière Galar',
    nameEn: 'Galar Banner',
    generation: 8,
    // Pricing formula: ~8000 × gen² = 8000 × 64 = 512k → 510k
    costGold: 510000,
    pool: GALAR_POOL,
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

// Build a slug → generation lookup from POKEDEX
const _slugGen = new Map<string, number>()
for (const entry of POKEDEX) {
  _slugGen.set(entry.slug, entry.gen)
}
// Also map banner-only slugs (megas, etc.) to their banner generation
for (const b of BANNERS) {
  for (const p of b.pool) {
    if (!_slugGen.has(p.slug)) {
      _slugGen.set(p.slug, b.generation)
    }
  }
}

export function getSlugGeneration(slug: string): number {
  return _slugGen.get(slug) ?? 1
}

// Build a slug → rarity lookup from all banners
const _slugRarity = new Map<string, Rarity>()
for (const b of BANNERS) {
  for (const p of b.pool) {
    _slugRarity.set(p.slug, p.rarity)
  }
}

export function hasKnownRarity(slug: string): boolean {
  return _slugRarity.has(slug)
}

export function getRarity(slug: string): Rarity {
  return _slugRarity.get(slug) ?? 'common'
}

export function getRarityDpsMult(slug: string): number {
  return RARITY_DPS_MULT[getRarity(slug)]
}

// Base shiny rate: 1/8192 (like the original games)
export const BASE_SHINY_RATE = 1 / 8192

// Each shiny charm adds +1/8192 to the shiny chance
export function getShinyRate(shinyCharms: number): number {
  return BASE_SHINY_RATE * (1 + shinyCharms)
}

export function pullFromBanner(banner: Banner, shinyCharms: number = 0): { pokemon: GachaPokemon; isShiny: boolean } {
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
  const isShiny = Math.random() < getShinyRate(shinyCharms)

  return { pokemon, isShiny }
}
