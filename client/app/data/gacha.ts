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
  { nameFr: 'Porygon2', nameEn: 'Porygon2', slug: 'porygon2', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Steelix', nameEn: 'Steelix', slug: 'steelix', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Scorplane', nameEn: 'Gligar', slug: 'gligar', rarity: 'rare', shinyRate: 0.02 },
  { nameFr: 'Embrylex', nameEn: 'Larvitar', slug: 'larvitar', rarity: 'epic', shinyRate: 0.03 },
  // EPIC STARTERS GEN 2
  { nameFr: 'Germignon', nameEn: 'Chikorita', slug: 'chikorita', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Héricendre', nameEn: 'Cyndaquil', slug: 'cyndaquil', rarity: 'epic', shinyRate: 0.03 },
  { nameFr: 'Kaiminus', nameEn: 'Totodile', slug: 'totodile', rarity: 'epic', shinyRate: 0.03 },
  // LEGENDARY
  { nameFr: 'Évoli', nameEn: 'Eevee', slug: 'eevee', rarity: 'epic', shinyRate: 0.03 },
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
  {
    id: 'johto',
    nameFr: 'Bannière Johto',
    nameEn: 'Johto Banner',
    generation: 2,
    costGold: 150,
    costGems: 1,
    pool: JOHTO_POOL,
  },
  {
    id: 'hoenn',
    nameFr: 'Bannière Hoenn',
    nameEn: 'Hoenn Banner',
    generation: 3,
    costGold: 200,
    costGems: 2,
    pool: HOENN_POOL,
  },
  {
    id: 'sinnoh',
    nameFr: 'Bannière Sinnoh',
    nameEn: 'Sinnoh Banner',
    generation: 4,
    costGold: 250,
    costGems: 3,
    pool: SINNOH_POOL,
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
