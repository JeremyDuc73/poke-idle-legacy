export type EvoMethod = 'level' | 'stone' | 'trade' | 'happiness'

export interface Evolution {
  fromSlug: string
  toSlug: string
  toNameFr: string
  toNameEn: string
  method: EvoMethod
  levelRequired?: number
  itemRequired?: string
}


export interface EvoItem {
  id: string
  nameFr: string
  nameEn: string
  descFr: string
  descEn: string
  icon: string
  applicableTo: string[]
}

// Gen 1 evolution chains
export const EVOLUTIONS: Evolution[] = [
  // Starters
  { fromSlug: 'bulbasaur', toSlug: 'ivysaur', toNameFr: 'Herbizarre', toNameEn: 'Ivysaur', method: 'level', levelRequired: 16 },
  { fromSlug: 'ivysaur', toSlug: 'venusaur', toNameFr: 'Florizarre', toNameEn: 'Venusaur', method: 'level', levelRequired: 32 },
  { fromSlug: 'charmander', toSlug: 'charmeleon', toNameFr: 'Reptincel', toNameEn: 'Charmeleon', method: 'level', levelRequired: 16 },
  { fromSlug: 'charmeleon', toSlug: 'charizard', toNameFr: 'Dracaufeu', toNameEn: 'Charizard', method: 'level', levelRequired: 36 },
  { fromSlug: 'squirtle', toSlug: 'wartortle', toNameFr: 'Carabaffe', toNameEn: 'Wartortle', method: 'level', levelRequired: 16 },
  { fromSlug: 'wartortle', toSlug: 'blastoise', toNameFr: 'Tortank', toNameEn: 'Blastoise', method: 'level', levelRequired: 36 },

  // Bugs
  { fromSlug: 'caterpie', toSlug: 'metapod', toNameFr: 'Chrysacier', toNameEn: 'Metapod', method: 'level', levelRequired: 7 },
  { fromSlug: 'metapod', toSlug: 'butterfree', toNameFr: 'Papilusion', toNameEn: 'Butterfree', method: 'level', levelRequired: 10 },
  { fromSlug: 'weedle', toSlug: 'kakuna', toNameFr: 'Coconfort', toNameEn: 'Kakuna', method: 'level', levelRequired: 7 },
  { fromSlug: 'kakuna', toSlug: 'beedrill', toNameFr: 'Dardargnan', toNameEn: 'Beedrill', method: 'level', levelRequired: 10 },

  // Birds
  { fromSlug: 'pidgey', toSlug: 'pidgeotto', toNameFr: 'Roucoups', toNameEn: 'Pidgeotto', method: 'level', levelRequired: 18 },
  { fromSlug: 'pidgeotto', toSlug: 'pidgeot', toNameFr: 'Roucarnage', toNameEn: 'Pidgeot', method: 'level', levelRequired: 36 },
  { fromSlug: 'spearow', toSlug: 'fearow', toNameFr: 'Rapasdepic', toNameEn: 'Fearow', method: 'level', levelRequired: 20 },

  // Rattata
  { fromSlug: 'rattata', toSlug: 'raticate', toNameFr: 'Rattatac', toNameEn: 'Raticate', method: 'level', levelRequired: 20 },

  // Ekans
  { fromSlug: 'ekans', toSlug: 'arbok', toNameFr: 'Arbok', toNameEn: 'Arbok', method: 'level', levelRequired: 22 },

  // Pikachu
  { fromSlug: 'pikachu', toSlug: 'raichu', toNameFr: 'Raichu', toNameEn: 'Raichu', method: 'stone', itemRequired: 'thunder-stone' },

  // Sandshrew
  { fromSlug: 'sandshrew', toSlug: 'sandslash', toNameFr: 'Sablaireau', toNameEn: 'Sandslash', method: 'level', levelRequired: 22 },

  // Nidoran
  { fromSlug: 'nidoranf', toSlug: 'nidorina', toNameFr: 'Nidorina', toNameEn: 'Nidorina', method: 'level', levelRequired: 16 },
  { fromSlug: 'nidorina', toSlug: 'nidoqueen', toNameFr: 'Nidoqueen', toNameEn: 'Nidoqueen', method: 'stone', itemRequired: 'moon-stone' },
  { fromSlug: 'nidoranm', toSlug: 'nidorino', toNameFr: 'Nidorino', toNameEn: 'Nidorino', method: 'level', levelRequired: 16 },
  { fromSlug: 'nidorino', toSlug: 'nidoking', toNameFr: 'Nidoking', toNameEn: 'Nidoking', method: 'stone', itemRequired: 'moon-stone' },

  // Vulpix
  { fromSlug: 'vulpix', toSlug: 'ninetales', toNameFr: 'Feunard', toNameEn: 'Ninetales', method: 'stone', itemRequired: 'fire-stone' },

  // Jigglypuff
  { fromSlug: 'jigglypuff', toSlug: 'wigglytuff', toNameFr: 'Grodoudou', toNameEn: 'Wigglytuff', method: 'stone', itemRequired: 'moon-stone' },

  // Zubat
  { fromSlug: 'zubat', toSlug: 'golbat', toNameFr: 'Nosféralto', toNameEn: 'Golbat', method: 'level', levelRequired: 22 },

  // Oddish
  { fromSlug: 'oddish', toSlug: 'gloom', toNameFr: 'Ortide', toNameEn: 'Gloom', method: 'level', levelRequired: 21 },
  { fromSlug: 'gloom', toSlug: 'vileplume', toNameFr: 'Rafflesia', toNameEn: 'Vileplume', method: 'stone', itemRequired: 'leaf-stone' },

  // Paras
  { fromSlug: 'paras', toSlug: 'parasect', toNameFr: 'Parasect', toNameEn: 'Parasect', method: 'level', levelRequired: 24 },

  // Venonat
  { fromSlug: 'venonat', toSlug: 'venomoth', toNameFr: 'Aéromite', toNameEn: 'Venomoth', method: 'level', levelRequired: 31 },

  // Diglett
  { fromSlug: 'diglett', toSlug: 'dugtrio', toNameFr: 'Triopikeur', toNameEn: 'Dugtrio', method: 'level', levelRequired: 26 },

  // Meowth
  { fromSlug: 'meowth', toSlug: 'persian', toNameFr: 'Persian', toNameEn: 'Persian', method: 'level', levelRequired: 28 },

  // Psyduck
  { fromSlug: 'psyduck', toSlug: 'golduck', toNameFr: 'Akwakwak', toNameEn: 'Golduck', method: 'level', levelRequired: 33 },

  // Mankey
  { fromSlug: 'mankey', toSlug: 'primeape', toNameFr: 'Colossinge', toNameEn: 'Primeape', method: 'level', levelRequired: 28 },

  // Growlithe
  { fromSlug: 'growlithe', toSlug: 'arcanine', toNameFr: 'Arcanin', toNameEn: 'Arcanine', method: 'stone', itemRequired: 'fire-stone' },

  // Poliwag
  { fromSlug: 'poliwag', toSlug: 'poliwhirl', toNameFr: 'Têtarte', toNameEn: 'Poliwhirl', method: 'level', levelRequired: 25 },
  { fromSlug: 'poliwhirl', toSlug: 'poliwrath', toNameFr: 'Tartard', toNameEn: 'Poliwrath', method: 'stone', itemRequired: 'water-stone' },
  { fromSlug: 'poliwhirl', toSlug: 'politoed', toNameFr: 'Tarpaud', toNameEn: 'Politoed', method: 'trade', itemRequired: 'kings-rock' },

  // Abra
  { fromSlug: 'abra', toSlug: 'kadabra', toNameFr: 'Kadabra', toNameEn: 'Kadabra', method: 'level', levelRequired: 16 },
  { fromSlug: 'kadabra', toSlug: 'alakazam', toNameFr: 'Alakazam', toNameEn: 'Alakazam', method: 'trade', itemRequired: 'link-cable' },

  // Machop
  { fromSlug: 'machop', toSlug: 'machoke', toNameFr: 'Machopeur', toNameEn: 'Machoke', method: 'level', levelRequired: 28 },
  { fromSlug: 'machoke', toSlug: 'machamp', toNameFr: 'Mackogneur', toNameEn: 'Machamp', method: 'trade', itemRequired: 'link-cable' },

  // Bellsprout
  { fromSlug: 'bellsprout', toSlug: 'weepinbell', toNameFr: 'Boustiflor', toNameEn: 'Weepinbell', method: 'level', levelRequired: 21 },
  { fromSlug: 'weepinbell', toSlug: 'victreebel', toNameFr: 'Empiflor', toNameEn: 'Victreebel', method: 'stone', itemRequired: 'leaf-stone' },

  // Tentacool
  { fromSlug: 'tentacool', toSlug: 'tentacruel', toNameFr: 'Tentacruel', toNameEn: 'Tentacruel', method: 'level', levelRequired: 30 },

  // Geodude
  { fromSlug: 'geodude', toSlug: 'graveler', toNameFr: 'Gravalanch', toNameEn: 'Graveler', method: 'level', levelRequired: 25 },
  { fromSlug: 'graveler', toSlug: 'golem', toNameFr: 'Grolem', toNameEn: 'Golem', method: 'trade', itemRequired: 'link-cable' },

  // Ponyta
  { fromSlug: 'ponyta', toSlug: 'rapidash', toNameFr: 'Galopa', toNameEn: 'Rapidash', method: 'level', levelRequired: 40 },

  // Slowpoke
  { fromSlug: 'slowpoke', toSlug: 'slowbro', toNameFr: 'Flagadoss', toNameEn: 'Slowbro', method: 'level', levelRequired: 37 },
  { fromSlug: 'slowpoke', toSlug: 'slowking', toNameFr: 'Roigada', toNameEn: 'Slowking', method: 'trade', itemRequired: 'kings-rock' },

  // Magnemite
  { fromSlug: 'magnemite', toSlug: 'magneton', toNameFr: 'Magnéton', toNameEn: 'Magneton', method: 'level', levelRequired: 30 },

  // Doduo
  { fromSlug: 'doduo', toSlug: 'dodrio', toNameFr: 'Dodrio', toNameEn: 'Dodrio', method: 'level', levelRequired: 31 },

  // Seel
  { fromSlug: 'seel', toSlug: 'dewgong', toNameFr: 'Lamantine', toNameEn: 'Dewgong', method: 'level', levelRequired: 34 },

  // Grimer
  { fromSlug: 'grimer', toSlug: 'muk', toNameFr: 'Grotadmorv', toNameEn: 'Muk', method: 'level', levelRequired: 38 },

  // Shellder
  { fromSlug: 'shellder', toSlug: 'cloyster', toNameFr: 'Crustabri', toNameEn: 'Cloyster', method: 'stone', itemRequired: 'water-stone' },

  // Gastly
  { fromSlug: 'gastly', toSlug: 'haunter', toNameFr: 'Spectrum', toNameEn: 'Haunter', method: 'level', levelRequired: 25 },
  { fromSlug: 'haunter', toSlug: 'gengar', toNameFr: 'Ectoplasma', toNameEn: 'Gengar', method: 'trade', itemRequired: 'link-cable' },

  // Drowzee
  { fromSlug: 'drowzee', toSlug: 'hypno', toNameFr: 'Hypnomade', toNameEn: 'Hypno', method: 'level', levelRequired: 26 },

  // Krabby
  { fromSlug: 'krabby', toSlug: 'kingler', toNameFr: 'Krabboss', toNameEn: 'Kingler', method: 'level', levelRequired: 28 },

  // Voltorb
  { fromSlug: 'voltorb', toSlug: 'electrode', toNameFr: 'Électrode', toNameEn: 'Electrode', method: 'level', levelRequired: 30 },

  // Exeggcute
  { fromSlug: 'exeggcute', toSlug: 'exeggutor', toNameFr: 'Noadkoko', toNameEn: 'Exeggutor', method: 'stone', itemRequired: 'leaf-stone' },

  // Cubone
  { fromSlug: 'cubone', toSlug: 'marowak', toNameFr: 'Ossatueur', toNameEn: 'Marowak', method: 'level', levelRequired: 28 },

  // Koffing
  { fromSlug: 'koffing', toSlug: 'weezing', toNameFr: 'Smogogo', toNameEn: 'Weezing', method: 'level', levelRequired: 35 },

  // Rhyhorn
  { fromSlug: 'rhyhorn', toSlug: 'rhydon', toNameFr: 'Rhinoféros', toNameEn: 'Rhydon', method: 'level', levelRequired: 42 },

  // Horsea
  { fromSlug: 'horsea', toSlug: 'seadra', toNameFr: 'Hypocéan', toNameEn: 'Seadra', method: 'level', levelRequired: 32 },

  // Goldeen
  { fromSlug: 'goldeen', toSlug: 'seaking', toNameFr: 'Poissoroy', toNameEn: 'Seaking', method: 'level', levelRequired: 33 },

  // Staryu
  { fromSlug: 'staryu', toSlug: 'starmie', toNameFr: 'Staross', toNameEn: 'Starmie', method: 'stone', itemRequired: 'water-stone' },

  // Magikarp
  { fromSlug: 'magikarp', toSlug: 'gyarados', toNameFr: 'Léviator', toNameEn: 'Gyarados', method: 'level', levelRequired: 20 },

  // Eevee
  { fromSlug: 'eevee', toSlug: 'vaporeon', toNameFr: 'Aquali', toNameEn: 'Vaporeon', method: 'stone', itemRequired: 'water-stone' },
  { fromSlug: 'eevee', toSlug: 'jolteon', toNameFr: 'Voltali', toNameEn: 'Jolteon', method: 'stone', itemRequired: 'thunder-stone' },
  { fromSlug: 'eevee', toSlug: 'flareon', toNameFr: 'Pyroli', toNameEn: 'Flareon', method: 'stone', itemRequired: 'fire-stone' },

  // Omanyte
  { fromSlug: 'omanyte', toSlug: 'omastar', toNameFr: 'Amonistar', toNameEn: 'Omastar', method: 'level', levelRequired: 40 },

  // Kabuto
  { fromSlug: 'kabuto', toSlug: 'kabutops', toNameFr: 'Kabutops', toNameEn: 'Kabutops', method: 'level', levelRequired: 40 },

  // Dratini
  { fromSlug: 'dratini', toSlug: 'dragonair', toNameFr: 'Draco', toNameEn: 'Dragonair', method: 'level', levelRequired: 30 },
  { fromSlug: 'dragonair', toSlug: 'dragonite', toNameFr: 'Dracolosse', toNameEn: 'Dragonite', method: 'level', levelRequired: 55 },

  // Porygon
  { fromSlug: 'porygon', toSlug: 'porygon2', toNameFr: 'Porygon2', toNameEn: 'Porygon2', method: 'trade', itemRequired: 'link-cable' },

  // Clefairy
  { fromSlug: 'clefairy', toSlug: 'clefable', toNameFr: 'Mélodelfe', toNameEn: 'Clefable', method: 'stone', itemRequired: 'moon-stone' },

  // ══════════════ Gen 2 Johto ══════════════
  // Starters
  { fromSlug: 'chikorita', toSlug: 'bayleef', toNameFr: 'Macronium', toNameEn: 'Bayleef', method: 'level', levelRequired: 16 },
  { fromSlug: 'bayleef', toSlug: 'meganium', toNameFr: 'Méganium', toNameEn: 'Meganium', method: 'level', levelRequired: 32 },
  { fromSlug: 'cyndaquil', toSlug: 'quilava', toNameFr: 'Feurisson', toNameEn: 'Quilava', method: 'level', levelRequired: 14 },
  { fromSlug: 'quilava', toSlug: 'typhlosion', toNameFr: 'Typhlosion', toNameEn: 'Typhlosion', method: 'level', levelRequired: 36 },
  { fromSlug: 'totodile', toSlug: 'croconaw', toNameFr: 'Crocrodil', toNameEn: 'Croconaw', method: 'level', levelRequired: 18 },
  { fromSlug: 'croconaw', toSlug: 'feraligatr', toNameFr: 'Aligatueur', toNameEn: 'Feraligatr', method: 'level', levelRequired: 30 },

  // Birds & bugs
  { fromSlug: 'sentret', toSlug: 'furret', toNameFr: 'Fouinar', toNameEn: 'Furret', method: 'level', levelRequired: 15 },
  { fromSlug: 'hoothoot', toSlug: 'noctowl', toNameFr: 'Noarfang', toNameEn: 'Noctowl', method: 'level', levelRequired: 20 },
  { fromSlug: 'ledyba', toSlug: 'ledian', toNameFr: 'Coxyclaque', toNameEn: 'Ledian', method: 'level', levelRequired: 18 },
  { fromSlug: 'spinarak', toSlug: 'ariados', toNameFr: 'Migalos', toNameEn: 'Ariados', method: 'level', levelRequired: 22 },

  // Happiness evolutions (use soothe-bell item)
  { fromSlug: 'pichu', toSlug: 'pikachu', toNameFr: 'Pikachu', toNameEn: 'Pikachu', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'cleffa', toSlug: 'clefairy', toNameFr: 'Mélofée', toNameEn: 'Clefairy', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'igglybuff', toSlug: 'jigglypuff', toNameFr: 'Rondoudou', toNameEn: 'Jigglypuff', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'togepi', toSlug: 'togetic', toNameFr: 'Togetic', toNameEn: 'Togetic', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'golbat', toSlug: 'crobat', toNameFr: 'Nostenfer', toNameEn: 'Crobat', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'chansey', toSlug: 'blissey', toNameFr: 'Leuphorie', toNameEn: 'Blissey', method: 'happiness', itemRequired: 'soothe-bell' },

  // Eevee Gen 2
  { fromSlug: 'eevee', toSlug: 'espeon', toNameFr: 'Mentali', toNameEn: 'Espeon', method: 'stone', itemRequired: 'sun-stone' },
  { fromSlug: 'eevee', toSlug: 'umbreon', toNameFr: 'Noctali', toNameEn: 'Umbreon', method: 'stone', itemRequired: 'moon-stone' },

  // Electric
  { fromSlug: 'mareep', toSlug: 'flaaffy', toNameFr: 'Lainergie', toNameEn: 'Flaaffy', method: 'level', levelRequired: 15 },
  { fromSlug: 'flaaffy', toSlug: 'ampharos', toNameFr: 'Pharamp', toNameEn: 'Ampharos', method: 'level', levelRequired: 30 },

  // Water
  { fromSlug: 'marill', toSlug: 'azumarill', toNameFr: 'Azumarill', toNameEn: 'Azumarill', method: 'level', levelRequired: 18 },
  { fromSlug: 'wooper', toSlug: 'quagsire', toNameFr: 'Maraiste', toNameEn: 'Quagsire', method: 'level', levelRequired: 20 },
  { fromSlug: 'remoraid', toSlug: 'octillery', toNameFr: 'Octillery', toNameEn: 'Octillery', method: 'level', levelRequired: 25 },

  // Grass
  { fromSlug: 'hoppip', toSlug: 'skiploom', toNameFr: 'Floravol', toNameEn: 'Skiploom', method: 'level', levelRequired: 18 },
  { fromSlug: 'skiploom', toSlug: 'jumpluff', toNameFr: 'Cotovol', toNameEn: 'Jumpluff', method: 'level', levelRequired: 27 },
  { fromSlug: 'sunkern', toSlug: 'sunflora', toNameFr: 'Héliatronc', toNameEn: 'Sunflora', method: 'stone', itemRequired: 'sun-stone' },
  { fromSlug: 'gloom', toSlug: 'bellossom', toNameFr: 'Joliflor', toNameEn: 'Bellossom', method: 'stone', itemRequired: 'sun-stone' },

  // Psychic
  { fromSlug: 'natu', toSlug: 'xatu', toNameFr: 'Xatu', toNameEn: 'Xatu', method: 'level', levelRequired: 25 },

  // Normal/misc
  { fromSlug: 'teddiursa', toSlug: 'ursaring', toNameFr: 'Ursaring', toNameEn: 'Ursaring', method: 'level', levelRequired: 30 },
  { fromSlug: 'snubbull', toSlug: 'granbull', toNameFr: 'Granbull', toNameEn: 'Granbull', method: 'level', levelRequired: 23 },
  { fromSlug: 'slugma', toSlug: 'magcargo', toNameFr: 'Volcaropod', toNameEn: 'Magcargo', method: 'level', levelRequired: 38 },
  { fromSlug: 'swinub', toSlug: 'piloswine', toNameFr: 'Cochignon', toNameEn: 'Piloswine', method: 'level', levelRequired: 33 },

  // Dark
  { fromSlug: 'houndour', toSlug: 'houndoom', toNameFr: 'Démolosse', toNameEn: 'Houndoom', method: 'level', levelRequired: 24 },
  { fromSlug: 'murkrow', toSlug: 'honchkrow', toNameFr: 'Corboss', toNameEn: 'Honchkrow', method: 'stone', itemRequired: 'dusk-stone' },

  // Pseudo-legendary
  { fromSlug: 'larvitar', toSlug: 'pupitar', toNameFr: 'Ymphect', toNameEn: 'Pupitar', method: 'level', levelRequired: 30 },
  { fromSlug: 'pupitar', toSlug: 'tyranitar', toNameFr: 'Tyranocif', toNameEn: 'Tyranitar', method: 'level', levelRequired: 55 },

  // Trade evos
  { fromSlug: 'onix', toSlug: 'steelix', toNameFr: 'Steelix', toNameEn: 'Steelix', method: 'trade', itemRequired: 'link-cable' },
  { fromSlug: 'scyther', toSlug: 'scizor', toNameFr: 'Cizayox', toNameEn: 'Scizor', method: 'trade', itemRequired: 'link-cable' },
  { fromSlug: 'seadra', toSlug: 'kingdra', toNameFr: 'Hyporoi', toNameEn: 'Kingdra', method: 'trade', itemRequired: 'link-cable' },

  // Baby → base (happiness)
  { fromSlug: 'tyrogue', toSlug: 'hitmontop', toNameFr: 'Kapoera', toNameEn: 'Hitmontop', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'smoochum', toSlug: 'jynx', toNameFr: 'Lippoutou', toNameEn: 'Jynx', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'elekid', toSlug: 'electabuzz', toNameFr: 'Élektek', toNameEn: 'Electabuzz', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'magby', toSlug: 'magmar', toNameFr: 'Magmar', toNameEn: 'Magmar', method: 'happiness', itemRequired: 'soothe-bell' },

  // Electric/Water
  { fromSlug: 'chinchou', toSlug: 'lanturn', toNameFr: 'Lanturn', toNameEn: 'Lanturn', method: 'level', levelRequired: 27 },

  // Bug
  { fromSlug: 'pineco', toSlug: 'forretress', toNameFr: 'Foretress', toNameEn: 'Forretress', method: 'level', levelRequired: 31 },

  // Ground
  { fromSlug: 'phanpy', toSlug: 'donphan', toNameFr: 'Donphan', toNameEn: 'Donphan', method: 'level', levelRequired: 25 },

  // ══════════════ Gen 3 Hoenn ══════════════
  // Starters
  { fromSlug: 'treecko', toSlug: 'grovyle', toNameFr: 'Massko', toNameEn: 'Grovyle', method: 'level', levelRequired: 16 },
  { fromSlug: 'grovyle', toSlug: 'sceptile', toNameFr: 'Jungko', toNameEn: 'Sceptile', method: 'level', levelRequired: 36 },
  { fromSlug: 'torchic', toSlug: 'combusken', toNameFr: 'Galifeu', toNameEn: 'Combusken', method: 'level', levelRequired: 16 },
  { fromSlug: 'combusken', toSlug: 'blaziken', toNameFr: 'Braségali', toNameEn: 'Blaziken', method: 'level', levelRequired: 36 },
  { fromSlug: 'mudkip', toSlug: 'marshtomp', toNameFr: 'Flobio', toNameEn: 'Marshtomp', method: 'level', levelRequired: 16 },
  { fromSlug: 'marshtomp', toSlug: 'swampert', toNameFr: 'Laggron', toNameEn: 'Swampert', method: 'level', levelRequired: 36 },

  // Normal
  { fromSlug: 'zigzagoon', toSlug: 'linoone', toNameFr: 'Linéon', toNameEn: 'Linoone', method: 'level', levelRequired: 20 },
  { fromSlug: 'poochyena', toSlug: 'mightyena', toNameFr: 'Grahyèna', toNameEn: 'Mightyena', method: 'level', levelRequired: 18 },
  { fromSlug: 'taillow', toSlug: 'swellow', toNameFr: 'Hélédelle', toNameEn: 'Swellow', method: 'level', levelRequired: 22 },
  { fromSlug: 'whismur', toSlug: 'loudred', toNameFr: 'Ramboum', toNameEn: 'Loudred', method: 'level', levelRequired: 20 },
  { fromSlug: 'loudred', toSlug: 'exploud', toNameFr: 'Brouhabam', toNameEn: 'Exploud', method: 'level', levelRequired: 40 },
  { fromSlug: 'slakoth', toSlug: 'vigoroth', toNameFr: 'Vigoroth', toNameEn: 'Vigoroth', method: 'level', levelRequired: 18 },
  { fromSlug: 'vigoroth', toSlug: 'slaking', toNameFr: 'Monaflèmit', toNameEn: 'Slaking', method: 'level', levelRequired: 36 },

  // Fighting
  { fromSlug: 'makuhita', toSlug: 'hariyama', toNameFr: 'Hariyama', toNameEn: 'Hariyama', method: 'level', levelRequired: 24 },

  // Psychic
  { fromSlug: 'ralts', toSlug: 'kirlia', toNameFr: 'Kirlia', toNameEn: 'Kirlia', method: 'level', levelRequired: 20 },
  { fromSlug: 'kirlia', toSlug: 'gardevoir', toNameFr: 'Gardevoir', toNameEn: 'Gardevoir', method: 'level', levelRequired: 30 },
  { fromSlug: 'spoink', toSlug: 'grumpig', toNameFr: 'Groret', toNameEn: 'Grumpig', method: 'level', levelRequired: 32 },
  { fromSlug: 'baltoy', toSlug: 'claydol', toNameFr: 'Kaorine', toNameEn: 'Claydol', method: 'level', levelRequired: 36 },

  // Electric
  { fromSlug: 'electrike', toSlug: 'manectric', toNameFr: 'Élecsprint', toNameEn: 'Manectric', method: 'level', levelRequired: 26 },

  // Fire/Ground
  { fromSlug: 'numel', toSlug: 'camerupt', toNameFr: 'Camérupt', toNameEn: 'Camerupt', method: 'level', levelRequired: 33 },

  // Dragon
  { fromSlug: 'trapinch', toSlug: 'vibrava', toNameFr: 'Vibraninf', toNameEn: 'Vibrava', method: 'level', levelRequired: 35 },
  { fromSlug: 'vibrava', toSlug: 'flygon', toNameFr: 'Libégon', toNameEn: 'Flygon', method: 'level', levelRequired: 45 },
  { fromSlug: 'bagon', toSlug: 'shelgon', toNameFr: 'Drackhaus', toNameEn: 'Shelgon', method: 'level', levelRequired: 30 },
  { fromSlug: 'shelgon', toSlug: 'salamence', toNameFr: 'Drattak', toNameEn: 'Salamence', method: 'level', levelRequired: 50 },

  // Steel
  { fromSlug: 'beldum', toSlug: 'metang', toNameFr: 'Métang', toNameEn: 'Metang', method: 'level', levelRequired: 20 },
  { fromSlug: 'metang', toSlug: 'metagross', toNameFr: 'Métalosse', toNameEn: 'Metagross', method: 'level', levelRequired: 45 },

  // Water
  { fromSlug: 'carvanha', toSlug: 'sharpedo', toNameFr: 'Sharpedo', toNameEn: 'Sharpedo', method: 'level', levelRequired: 30 },
  { fromSlug: 'wailmer', toSlug: 'wailord', toNameFr: 'Wailord', toNameEn: 'Wailord', method: 'level', levelRequired: 40 },
  { fromSlug: 'feebas', toSlug: 'milotic', toNameFr: 'Milobellus', toNameEn: 'Milotic', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'spheal', toSlug: 'sealeo', toNameFr: 'Phogleur', toNameEn: 'Sealeo', method: 'level', levelRequired: 32 },
  { fromSlug: 'sealeo', toSlug: 'walrein', toNameFr: 'Kaimorse', toNameEn: 'Walrein', method: 'level', levelRequired: 44 },

  // Dark
  { fromSlug: 'cacnea', toSlug: 'cacturne', toNameFr: 'Cacturne', toNameEn: 'Cacturne', method: 'level', levelRequired: 32 },

  // Ghost
  { fromSlug: 'shuppet', toSlug: 'banette', toNameFr: 'Branette', toNameEn: 'Banette', method: 'level', levelRequired: 37 },
  { fromSlug: 'duskull', toSlug: 'dusclops', toNameFr: 'Téraclope', toNameEn: 'Dusclops', method: 'level', levelRequired: 37 },

  // Fossils
  { fromSlug: 'lileep', toSlug: 'cradily', toNameFr: 'Vacilys', toNameEn: 'Cradily', method: 'level', levelRequired: 40 },
  { fromSlug: 'anorith', toSlug: 'armaldo', toNameFr: 'Armaldo', toNameEn: 'Armaldo', method: 'level', levelRequired: 40 },

  // Multi-evolutions (require specific items to choose path)
  { fromSlug: 'wurmple', toSlug: 'silcoon', toNameFr: 'Armulys', toNameEn: 'Silcoon', method: 'stone', itemRequired: 'prism-scale' },
  { fromSlug: 'wurmple', toSlug: 'cascoon', toNameFr: 'Blindalys', toNameEn: 'Cascoon', method: 'stone', itemRequired: 'razor-claw' },
  { fromSlug: 'silcoon', toSlug: 'beautifly', toNameFr: 'Charmillon', toNameEn: 'Beautifly', method: 'level', levelRequired: 10 },
  { fromSlug: 'cascoon', toSlug: 'dustox', toNameFr: 'Papinox', toNameEn: 'Dustox', method: 'level', levelRequired: 10 },
  { fromSlug: 'clamperl', toSlug: 'huntail', toNameFr: 'Serpang', toNameEn: 'Huntail', method: 'stone', itemRequired: 'deep-sea-tooth' },
  { fromSlug: 'clamperl', toSlug: 'gorebyss', toNameFr: 'Rosabyss', toNameEn: 'Gorebyss', method: 'stone', itemRequired: 'deep-sea-scale' },

  // Bugs & birds
  { fromSlug: 'surskit', toSlug: 'masquerain', toNameFr: 'Maskadra', toNameEn: 'Masquerain', method: 'level', levelRequired: 22 },
  { fromSlug: 'nincada', toSlug: 'ninjask', toNameFr: 'Ninjask', toNameEn: 'Ninjask', method: 'level', levelRequired: 20 },
  { fromSlug: 'nincada', toSlug: 'shedinja', toNameFr: 'Munja', toNameEn: 'Shedinja', method: 'stone', itemRequired: 'shed-shell' },
  { fromSlug: 'wingull', toSlug: 'pelipper', toNameFr: 'Bekipan', toNameEn: 'Pelipper', method: 'level', levelRequired: 25 },

  // Grass
  { fromSlug: 'lotad', toSlug: 'lombre', toNameFr: 'Lombre', toNameEn: 'Lombre', method: 'level', levelRequired: 14 },
  { fromSlug: 'lombre', toSlug: 'ludicolo', toNameFr: 'Ludicolo', toNameEn: 'Ludicolo', method: 'stone', itemRequired: 'water-stone' },
  { fromSlug: 'seedot', toSlug: 'nuzleaf', toNameFr: 'Pifeuil', toNameEn: 'Nuzleaf', method: 'level', levelRequired: 14 },
  { fromSlug: 'nuzleaf', toSlug: 'shiftry', toNameFr: 'Tengalice', toNameEn: 'Shiftry', method: 'stone', itemRequired: 'leaf-stone' },

  // Baby → base
  { fromSlug: 'azurill', toSlug: 'marill', toNameFr: 'Marill', toNameEn: 'Marill', method: 'happiness', itemRequired: 'soothe-bell' },

  // Poison
  { fromSlug: 'gulpin', toSlug: 'swalot', toNameFr: 'Avaltout', toNameEn: 'Swalot', method: 'level', levelRequired: 26 },

  // Grass
  { fromSlug: 'shroomish', toSlug: 'breloom', toNameFr: 'Chapignon', toNameEn: 'Breloom', method: 'level', levelRequired: 23 },

  // Fighting
  { fromSlug: 'meditite', toSlug: 'medicham', toNameFr: 'Charmina', toNameEn: 'Medicham', method: 'level', levelRequired: 37 },

  // Dragon/Flying
  { fromSlug: 'swablu', toSlug: 'altaria', toNameFr: 'Altaria', toNameEn: 'Altaria', method: 'level', levelRequired: 35 },

  // Water/Ground
  { fromSlug: 'barboach', toSlug: 'whiscash', toNameFr: 'Barbicha', toNameEn: 'Whiscash', method: 'level', levelRequired: 30 },
  { fromSlug: 'corphish', toSlug: 'crawdaunt', toNameFr: 'Colhomard', toNameEn: 'Crawdaunt', method: 'level', levelRequired: 30 },

  // Steel/Rock
  { fromSlug: 'aron', toSlug: 'lairon', toNameFr: 'Galegon', toNameEn: 'Lairon', method: 'level', levelRequired: 32 },
  { fromSlug: 'lairon', toSlug: 'aggron', toNameFr: 'Galeking', toNameEn: 'Aggron', method: 'level', levelRequired: 42 },

  // Ice
  { fromSlug: 'snorunt', toSlug: 'glalie', toNameFr: 'Oniglali', toNameEn: 'Glalie', method: 'level', levelRequired: 42 },

  // Baby → base
  { fromSlug: 'wynaut', toSlug: 'wobbuffet', toNameFr: 'Qulbutoké', toNameEn: 'Wobbuffet', method: 'level', levelRequired: 15 },

  // Fairy (requires item, will evolve in Gen 4+)
  { fromSlug: 'skitty', toSlug: 'delcatty', toNameFr: 'Delcatty', toNameEn: 'Delcatty', method: 'stone', itemRequired: 'moon-stone' },

  // NOTE: Gen 4+ evolutions (locked until player reaches Gen 4)
  // Baby → Gen 3 base form
  { fromSlug: 'budew', toSlug: 'roselia', toNameFr: 'Rosélia', toNameEn: 'Roselia', method: 'happiness', itemRequired: 'soothe-bell' },

  // Gen 1-3 Pokémon → Gen 4 evolutions (débloquées en Gen 4)
  { fromSlug: 'roselia', toSlug: 'roserade', toNameFr: 'Roserade', toNameEn: 'Roserade', method: 'stone', itemRequired: 'shiny-stone' },
  { fromSlug: 'aipom', toSlug: 'ambipom', toNameFr: 'Capidextre', toNameEn: 'Ambipom', method: 'level', levelRequired: 33 },
  { fromSlug: 'misdreavus', toSlug: 'mismagius', toNameFr: 'Magirêve', toNameEn: 'Mismagius', method: 'stone', itemRequired: 'dusk-stone' },
  { fromSlug: 'murkrow', toSlug: 'honchkrow', toNameFr: 'Corboss', toNameEn: 'Honchkrow', method: 'stone', itemRequired: 'dusk-stone' },
  { fromSlug: 'sneasel', toSlug: 'weavile', toNameFr: 'Dimoret', toNameEn: 'Weavile', method: 'level', levelRequired: 30 },
  { fromSlug: 'magneton', toSlug: 'magnezone', toNameFr: 'Magnézone', toNameEn: 'Magnezone', method: 'level', levelRequired: 30 },
  { fromSlug: 'lickitung', toSlug: 'lickilicky', toNameFr: 'Coudlangue', toNameEn: 'Lickilicky', method: 'level', levelRequired: 33 },
  { fromSlug: 'rhydon', toSlug: 'rhyperior', toNameFr: 'Rhinastoc', toNameEn: 'Rhyperior', method: 'stone', itemRequired: 'protector' },
  { fromSlug: 'tangela', toSlug: 'tangrowth', toNameFr: 'Bouldeneu', toNameEn: 'Tangrowth', method: 'level', levelRequired: 33 },
  { fromSlug: 'electabuzz', toSlug: 'electivire', toNameFr: 'Élekable', toNameEn: 'Electivire', method: 'stone', itemRequired: 'electirizer' },
  { fromSlug: 'magmar', toSlug: 'magmortar', toNameFr: 'Maganon', toNameEn: 'Magmortar', method: 'stone', itemRequired: 'magmarizer' },
  { fromSlug: 'togetic', toSlug: 'togekiss', toNameFr: 'Togekiss', toNameEn: 'Togekiss', method: 'stone', itemRequired: 'shiny-stone' },
  { fromSlug: 'yanma', toSlug: 'yanmega', toNameFr: 'Yanméga', toNameEn: 'Yanmega', method: 'level', levelRequired: 33 },
  { fromSlug: 'eevee', toSlug: 'leafeon', toNameFr: 'Phyllali', toNameEn: 'Leafeon', method: 'stone', itemRequired: 'leaf-stone' },
  { fromSlug: 'eevee', toSlug: 'glaceon', toNameFr: 'Givrali', toNameEn: 'Glaceon', method: 'stone', itemRequired: 'ice-stone' },
  { fromSlug: 'gligar', toSlug: 'gliscor', toNameFr: 'Scorvol', toNameEn: 'Gliscor', method: 'level', levelRequired: 30 },
  { fromSlug: 'swinub', toSlug: 'piloswine', toNameFr: 'Cochignon', toNameEn: 'Piloswine', method: 'level', levelRequired: 33 },
  { fromSlug: 'piloswine', toSlug: 'mamoswine', toNameFr: 'Mammochon', toNameEn: 'Mamoswine', method: 'level', levelRequired: 40 },
  { fromSlug: 'porygon2', toSlug: 'porygonz', toNameFr: 'Porygon-Z', toNameEn: 'Porygon-Z', method: 'stone', itemRequired: 'dubious-disc' },
  { fromSlug: 'kirlia', toSlug: 'gallade', toNameFr: 'Gallame', toNameEn: 'Gallade', method: 'stone', itemRequired: 'dawn-stone' },
  { fromSlug: 'nosepass', toSlug: 'probopass', toNameFr: 'Tarinorme', toNameEn: 'Probopass', method: 'level', levelRequired: 30 },
  { fromSlug: 'dusclops', toSlug: 'dusknoir', toNameFr: 'Noctunoir', toNameEn: 'Dusknoir', method: 'stone', itemRequired: 'reaper-cloth' },
  { fromSlug: 'snorunt', toSlug: 'froslass', toNameFr: 'Momartik', toNameEn: 'Froslass', method: 'stone', itemRequired: 'dawn-stone' },

  // ══════════════ Gen 4 Sinnoh ══════════════
  // Starters
  { fromSlug: 'turtwig', toSlug: 'grotle', toNameFr: 'Boskara', toNameEn: 'Grotle', method: 'level', levelRequired: 18 },
  { fromSlug: 'grotle', toSlug: 'torterra', toNameFr: 'Torterra', toNameEn: 'Torterra', method: 'level', levelRequired: 32 },
  { fromSlug: 'chimchar', toSlug: 'monferno', toNameFr: 'Chimpenfeu', toNameEn: 'Monferno', method: 'level', levelRequired: 14 },
  { fromSlug: 'monferno', toSlug: 'infernape', toNameFr: 'Simiabraz', toNameEn: 'Infernape', method: 'level', levelRequired: 36 },
  { fromSlug: 'piplup', toSlug: 'prinplup', toNameFr: 'Prinplouf', toNameEn: 'Prinplup', method: 'level', levelRequired: 16 },
  { fromSlug: 'prinplup', toSlug: 'empoleon', toNameFr: 'Pingoléon', toNameEn: 'Empoleon', method: 'level', levelRequired: 36 },
  
  // Normal/Flying
  { fromSlug: 'starly', toSlug: 'staravia', toNameFr: 'Étourvol', toNameEn: 'Staravia', method: 'level', levelRequired: 14 },
  { fromSlug: 'staravia', toSlug: 'staraptor', toNameFr: 'Étouraptor', toNameEn: 'Staraptor', method: 'level', levelRequired: 34 },
  { fromSlug: 'bidoof', toSlug: 'bibarel', toNameFr: 'Castorno', toNameEn: 'Bibarel', method: 'level', levelRequired: 15 },
  
  // Bug
  { fromSlug: 'kricketot', toSlug: 'kricketune', toNameFr: 'Mélokrik', toNameEn: 'Kricketune', method: 'level', levelRequired: 10 },
  { fromSlug: 'burmy', toSlug: 'wormadam', toNameFr: 'Cheniselle', toNameEn: 'Wormadam', method: 'level', levelRequired: 20 },
  { fromSlug: 'burmy', toSlug: 'mothim', toNameFr: 'Papilord', toNameEn: 'Mothim', method: 'stone', itemRequired: 'leaf-stone' },
  { fromSlug: 'combee', toSlug: 'vespiquen', toNameFr: 'Apireine', toNameEn: 'Vespiquen', method: 'level', levelRequired: 21 },
  
  // Electric
  { fromSlug: 'shinx', toSlug: 'luxio', toNameFr: 'Luxio', toNameEn: 'Luxio', method: 'level', levelRequired: 15 },
  { fromSlug: 'luxio', toSlug: 'luxray', toNameFr: 'Luxray', toNameEn: 'Luxray', method: 'level', levelRequired: 30 },
  
  // Rock/Steel
  { fromSlug: 'cranidos', toSlug: 'rampardos', toNameFr: 'Charkos', toNameEn: 'Rampardos', method: 'level', levelRequired: 30 },
  { fromSlug: 'shieldon', toSlug: 'bastiodon', toNameFr: 'Bastiodon', toNameEn: 'Bastiodon', method: 'level', levelRequired: 30 },
  
  // Water
  { fromSlug: 'buizel', toSlug: 'floatzel', toNameFr: 'Mustéflott', toNameEn: 'Floatzel', method: 'level', levelRequired: 26 },
  { fromSlug: 'shellos', toSlug: 'gastrodon', toNameFr: 'Tritosor', toNameEn: 'Gastrodon', method: 'level', levelRequired: 30 },
  { fromSlug: 'finneon', toSlug: 'lumineon', toNameFr: 'Luminéon', toNameEn: 'Lumineon', method: 'level', levelRequired: 31 },
  
  // Grass
  { fromSlug: 'cherubi', toSlug: 'cherrim', toNameFr: 'Ceriflor', toNameEn: 'Cherrim', method: 'level', levelRequired: 25 },
  
  // Ghost/Flying
  { fromSlug: 'drifloon', toSlug: 'drifblim', toNameFr: 'Grodrive', toNameEn: 'Drifblim', method: 'level', levelRequired: 28 },
  
  // Normal
  { fromSlug: 'buneary', toSlug: 'lopunny', toNameFr: 'Lockpin', toNameEn: 'Lopunny', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'glameow', toSlug: 'purugly', toNameFr: 'Chaffreux', toNameEn: 'Purugly', method: 'level', levelRequired: 38 },
  
  // Poison
  { fromSlug: 'stunky', toSlug: 'skuntank', toNameFr: 'Moufflair', toNameEn: 'Skuntank', method: 'level', levelRequired: 34 },
  { fromSlug: 'skorupi', toSlug: 'drapion', toNameFr: 'Drascore', toNameEn: 'Drapion', method: 'level', levelRequired: 40 },
  { fromSlug: 'croagunk', toSlug: 'toxicroak', toNameFr: 'Coatox', toNameEn: 'Toxicroak', method: 'level', levelRequired: 37 },
  
  // Steel/Psychic
  { fromSlug: 'bronzor', toSlug: 'bronzong', toNameFr: 'Archéodong', toNameEn: 'Bronzong', method: 'level', levelRequired: 33 },
  
  // Dragon/Ground
  { fromSlug: 'gible', toSlug: 'gabite', toNameFr: 'Carmache', toNameEn: 'Gabite', method: 'level', levelRequired: 24 },
  { fromSlug: 'gabite', toSlug: 'garchomp', toNameFr: 'Carchacrok', toNameEn: 'Garchomp', method: 'level', levelRequired: 48 },
  
  // Fighting/Steel
  { fromSlug: 'riolu', toSlug: 'lucario', toNameFr: 'Lucario', toNameEn: 'Lucario', method: 'happiness', itemRequired: 'soothe-bell' },
  
  // Ground
  { fromSlug: 'hippopotas', toSlug: 'hippowdon', toNameFr: 'Hippodocus', toNameEn: 'Hippowdon', method: 'level', levelRequired: 34 },
  
  // Grass/Ice
  { fromSlug: 'snover', toSlug: 'abomasnow', toNameFr: 'Blizzaroi', toNameEn: 'Abomasnow', method: 'level', levelRequired: 40 },
  
  // Baby evolutions
  { fromSlug: 'chingling', toSlug: 'chimecho', toNameFr: 'Éoko', toNameEn: 'Chimecho', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'bonsly', toSlug: 'sudowoodo', toNameFr: 'Simularbre', toNameEn: 'Sudowoodo', method: 'level', levelRequired: 17 },
  { fromSlug: 'mimejr', toSlug: 'mrmime', toNameFr: 'M. Mime', toNameEn: 'Mr. Mime', method: 'level', levelRequired: 18 },
  { fromSlug: 'happiny', toSlug: 'chansey', toNameFr: 'Leveinard', toNameEn: 'Chansey', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'munchlax', toSlug: 'snorlax', toNameFr: 'Ronflex', toNameEn: 'Snorlax', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'mantyke', toSlug: 'mantine', toNameFr: 'Démanta', toNameEn: 'Mantine', method: 'level', levelRequired: 20 },

  // ══════════════ Gen 5 Unova ══════════════
  // Starters
  { fromSlug: 'snivy', toSlug: 'servine', toNameFr: 'Lianaja', toNameEn: 'Servine', method: 'level', levelRequired: 17 },
  { fromSlug: 'servine', toSlug: 'serperior', toNameFr: 'Majaspic', toNameEn: 'Serperior', method: 'level', levelRequired: 36 },
  { fromSlug: 'tepig', toSlug: 'pignite', toNameFr: 'Grotichon', toNameEn: 'Pignite', method: 'level', levelRequired: 17 },
  { fromSlug: 'pignite', toSlug: 'emboar', toNameFr: 'Roitiflam', toNameEn: 'Emboar', method: 'level', levelRequired: 36 },
  { fromSlug: 'oshawott', toSlug: 'dewott', toNameFr: 'Mateloutre', toNameEn: 'Dewott', method: 'level', levelRequired: 17 },
  { fromSlug: 'dewott', toSlug: 'samurott', toNameFr: 'Clamiral', toNameEn: 'Samurott', method: 'level', levelRequired: 36 },

  // Normal
  { fromSlug: 'patrat', toSlug: 'watchog', toNameFr: 'Miradar', toNameEn: 'Watchog', method: 'level', levelRequired: 20 },
  { fromSlug: 'lillipup', toSlug: 'herdier', toNameFr: 'Ponchien', toNameEn: 'Herdier', method: 'level', levelRequired: 16 },
  { fromSlug: 'herdier', toSlug: 'stoutland', toNameFr: 'Mastouffe', toNameEn: 'Stoutland', method: 'level', levelRequired: 32 },
  { fromSlug: 'purrloin', toSlug: 'liepard', toNameFr: 'Léopardus', toNameEn: 'Liepard', method: 'level', levelRequired: 20 },

  // Elemental monkeys (stone)
  { fromSlug: 'pansage', toSlug: 'simisage', toNameFr: 'Feuiloutan', toNameEn: 'Simisage', method: 'stone', itemRequired: 'leaf-stone' },
  { fromSlug: 'pansear', toSlug: 'simisear', toNameFr: 'Flamoutan', toNameEn: 'Simisear', method: 'stone', itemRequired: 'fire-stone' },
  { fromSlug: 'panpour', toSlug: 'simipour', toNameFr: 'Flotoutan', toNameEn: 'Simipour', method: 'stone', itemRequired: 'water-stone' },

  // Psychic
  { fromSlug: 'munna', toSlug: 'musharna', toNameFr: 'Mushana', toNameEn: 'Musharna', method: 'stone', itemRequired: 'moon-stone' },

  // Flying
  { fromSlug: 'pidove', toSlug: 'tranquill', toNameFr: 'Colombeau', toNameEn: 'Tranquill', method: 'level', levelRequired: 21 },
  { fromSlug: 'tranquill', toSlug: 'unfezant', toNameFr: 'Déflaisan', toNameEn: 'Unfezant', method: 'level', levelRequired: 32 },

  // Electric
  { fromSlug: 'blitzle', toSlug: 'zebstrika', toNameFr: 'Zéblitz', toNameEn: 'Zebstrika', method: 'level', levelRequired: 27 },

  // Rock (trade evo)
  { fromSlug: 'roggenrola', toSlug: 'boldore', toNameFr: 'Géolithe', toNameEn: 'Boldore', method: 'level', levelRequired: 25 },
  { fromSlug: 'boldore', toSlug: 'gigalith', toNameFr: 'Gigalithe', toNameEn: 'Gigalith', method: 'trade', itemRequired: 'link-cable' },

  // Psychic/Flying (happiness)
  { fromSlug: 'woobat', toSlug: 'swoobat', toNameFr: 'Rhinolove', toNameEn: 'Swoobat', method: 'happiness', itemRequired: 'soothe-bell' },

  // Ground/Steel
  { fromSlug: 'drilbur', toSlug: 'excadrill', toNameFr: 'Minotaupe', toNameEn: 'Excadrill', method: 'level', levelRequired: 31 },

  // Fighting (trade evo)
  { fromSlug: 'timburr', toSlug: 'gurdurr', toNameFr: 'Ouvrifier', toNameEn: 'Gurdurr', method: 'level', levelRequired: 25 },
  { fromSlug: 'gurdurr', toSlug: 'conkeldurr', toNameFr: 'Bétochef', toNameEn: 'Conkeldurr', method: 'trade', itemRequired: 'link-cable' },

  // Water/Ground
  { fromSlug: 'tympole', toSlug: 'palpitoad', toNameFr: 'Batracné', toNameEn: 'Palpitoad', method: 'level', levelRequired: 25 },
  { fromSlug: 'palpitoad', toSlug: 'seismitoad', toNameFr: 'Crapustule', toNameEn: 'Seismitoad', method: 'level', levelRequired: 36 },

  // Bug/Grass (happiness for final)
  { fromSlug: 'sewaddle', toSlug: 'swadloon', toNameFr: 'Couverdure', toNameEn: 'Swadloon', method: 'level', levelRequired: 20 },
  { fromSlug: 'swadloon', toSlug: 'leavanny', toNameFr: 'Manternel', toNameEn: 'Leavanny', method: 'happiness', itemRequired: 'soothe-bell' },

  // Bug/Poison
  { fromSlug: 'venipede', toSlug: 'whirlipede', toNameFr: 'Scobolide', toNameEn: 'Whirlipede', method: 'level', levelRequired: 22 },
  { fromSlug: 'whirlipede', toSlug: 'scolipede', toNameFr: 'Brutapode', toNameEn: 'Scolipede', method: 'level', levelRequired: 30 },

  // Grass (sun stone)
  { fromSlug: 'cottonee', toSlug: 'whimsicott', toNameFr: 'Farfaduvet', toNameEn: 'Whimsicott', method: 'stone', itemRequired: 'sun-stone' },
  { fromSlug: 'petilil', toSlug: 'lilligant', toNameFr: 'Fragilady', toNameEn: 'Lilligant', method: 'stone', itemRequired: 'sun-stone' },

  // Ground/Dark
  { fromSlug: 'sandile', toSlug: 'krokorok', toNameFr: 'Escroco', toNameEn: 'Krokorok', method: 'level', levelRequired: 29 },
  { fromSlug: 'krokorok', toSlug: 'krookodile', toNameFr: 'Crocorible', toNameEn: 'Krookodile', method: 'level', levelRequired: 40 },

  // Fire
  { fromSlug: 'darumaka', toSlug: 'darmanitan', toNameFr: 'Darumacho', toNameEn: 'Darmanitan', method: 'level', levelRequired: 35 },

  // Bug/Rock
  { fromSlug: 'dwebble', toSlug: 'crustle', toNameFr: 'Crabaraque', toNameEn: 'Crustle', method: 'level', levelRequired: 34 },

  // Dark/Fighting
  { fromSlug: 'scraggy', toSlug: 'scrafty', toNameFr: 'Baggaïd', toNameEn: 'Scrafty', method: 'level', levelRequired: 39 },

  // Ghost
  { fromSlug: 'yamask', toSlug: 'cofagrigus', toNameFr: 'Tutankafer', toNameEn: 'Cofagrigus', method: 'level', levelRequired: 34 },

  // Fossils
  { fromSlug: 'tirtouga', toSlug: 'carracosta', toNameFr: 'Mégapagos', toNameEn: 'Carracosta', method: 'level', levelRequired: 37 },
  { fromSlug: 'archen', toSlug: 'archeops', toNameFr: 'Aéroptéryx', toNameEn: 'Archeops', method: 'level', levelRequired: 37 },

  // Poison
  { fromSlug: 'trubbish', toSlug: 'garbodor', toNameFr: 'Miasmax', toNameEn: 'Garbodor', method: 'level', levelRequired: 36 },

  // Dark
  { fromSlug: 'zorua', toSlug: 'zoroark', toNameFr: 'Zoroark', toNameEn: 'Zoroark', method: 'level', levelRequired: 30 },

  // Normal (shiny stone)
  { fromSlug: 'minccino', toSlug: 'cinccino', toNameFr: 'Pashmilla', toNameEn: 'Cinccino', method: 'stone', itemRequired: 'shiny-stone' },

  // Psychic lines
  { fromSlug: 'gothita', toSlug: 'gothorita', toNameFr: 'Mesmérella', toNameEn: 'Gothorita', method: 'level', levelRequired: 32 },
  { fromSlug: 'gothorita', toSlug: 'gothitelle', toNameFr: 'Sidérella', toNameEn: 'Gothitelle', method: 'level', levelRequired: 41 },
  { fromSlug: 'solosis', toSlug: 'duosion', toNameFr: 'Méios', toNameEn: 'Duosion', method: 'level', levelRequired: 32 },
  { fromSlug: 'duosion', toSlug: 'reuniclus', toNameFr: 'Symbios', toNameEn: 'Reuniclus', method: 'level', levelRequired: 41 },

  // Water/Flying
  { fromSlug: 'ducklett', toSlug: 'swanna', toNameFr: 'Lakmécygne', toNameEn: 'Swanna', method: 'level', levelRequired: 35 },

  // Ice
  { fromSlug: 'vanillite', toSlug: 'vanillish', toNameFr: 'Sorboul', toNameEn: 'Vanillish', method: 'level', levelRequired: 35 },
  { fromSlug: 'vanillish', toSlug: 'vanilluxe', toNameFr: 'Sorbouboul', toNameEn: 'Vanilluxe', method: 'level', levelRequired: 47 },

  // Normal/Grass
  { fromSlug: 'deerling', toSlug: 'sawsbuck', toNameFr: 'Haydaim', toNameEn: 'Sawsbuck', method: 'level', levelRequired: 34 },

  // Bug trade evos
  { fromSlug: 'karrablast', toSlug: 'escavalier', toNameFr: 'Lançargot', toNameEn: 'Escavalier', method: 'trade', itemRequired: 'link-cable' },
  { fromSlug: 'shelmet', toSlug: 'accelgor', toNameFr: 'Limaspeed', toNameEn: 'Accelgor', method: 'trade', itemRequired: 'link-cable' },

  // Grass/Poison
  { fromSlug: 'foongus', toSlug: 'amoonguss', toNameFr: 'Gaulet', toNameEn: 'Amoonguss', method: 'level', levelRequired: 39 },

  // Water/Ghost
  { fromSlug: 'frillish', toSlug: 'jellicent', toNameFr: 'Moyade', toNameEn: 'Jellicent', method: 'level', levelRequired: 40 },

  // Bug/Electric
  { fromSlug: 'joltik', toSlug: 'galvantula', toNameFr: 'Mygavolt', toNameEn: 'Galvantula', method: 'level', levelRequired: 36 },

  // Grass/Steel
  { fromSlug: 'ferroseed', toSlug: 'ferrothorn', toNameFr: 'Noacier', toNameEn: 'Ferrothorn', method: 'level', levelRequired: 40 },

  // Steel
  { fromSlug: 'klink', toSlug: 'klang', toNameFr: 'Clic', toNameEn: 'Klang', method: 'level', levelRequired: 38 },
  { fromSlug: 'klang', toSlug: 'klinklang', toNameFr: 'Cliticlic', toNameEn: 'Klinklang', method: 'level', levelRequired: 49 },

  // Electric (thunder stone for final)
  { fromSlug: 'tynamo', toSlug: 'eelektrik', toNameFr: 'Lampéroie', toNameEn: 'Eelektrik', method: 'level', levelRequired: 39 },
  { fromSlug: 'eelektrik', toSlug: 'eelektross', toNameFr: 'Ohmassacre', toNameEn: 'Eelektross', method: 'stone', itemRequired: 'thunder-stone' },

  // Psychic
  { fromSlug: 'elgyem', toSlug: 'beheeyem', toNameFr: 'Neitram', toNameEn: 'Beheeyem', method: 'level', levelRequired: 42 },

  // Ghost/Fire (dusk stone for final)
  { fromSlug: 'litwick', toSlug: 'lampent', toNameFr: 'Mélancolux', toNameEn: 'Lampent', method: 'level', levelRequired: 41 },
  { fromSlug: 'lampent', toSlug: 'chandelure', toNameFr: 'Lugulabre', toNameEn: 'Chandelure', method: 'stone', itemRequired: 'dusk-stone' },

  // Dragon
  { fromSlug: 'axew', toSlug: 'fraxure', toNameFr: 'Incisache', toNameEn: 'Fraxure', method: 'level', levelRequired: 38 },
  { fromSlug: 'fraxure', toSlug: 'haxorus', toNameFr: 'Tranchodon', toNameEn: 'Haxorus', method: 'level', levelRequired: 48 },

  // Ice
  { fromSlug: 'cubchoo', toSlug: 'beartic', toNameFr: 'Polagriffe', toNameEn: 'Beartic', method: 'level', levelRequired: 37 },

  // Fighting
  { fromSlug: 'mienfoo', toSlug: 'mienshao', toNameFr: 'Shaofouine', toNameEn: 'Mienshao', method: 'level', levelRequired: 50 },

  // Ground/Ghost
  { fromSlug: 'golett', toSlug: 'golurk', toNameFr: 'Golemastoc', toNameEn: 'Golurk', method: 'level', levelRequired: 43 },

  // Dark/Steel
  { fromSlug: 'pawniard', toSlug: 'bisharp', toNameFr: 'Scalproie', toNameEn: 'Bisharp', method: 'level', levelRequired: 52 },

  // Normal/Flying
  { fromSlug: 'rufflet', toSlug: 'braviary', toNameFr: 'Gueriaigle', toNameEn: 'Braviary', method: 'level', levelRequired: 54 },

  // Dark/Flying
  { fromSlug: 'vullaby', toSlug: 'mandibuzz', toNameFr: 'Vaututrice', toNameEn: 'Mandibuzz', method: 'level', levelRequired: 54 },

  // Dark/Dragon (pseudo-legendary)
  { fromSlug: 'deino', toSlug: 'zweilous', toNameFr: 'Diamat', toNameEn: 'Zweilous', method: 'level', levelRequired: 50 },
  { fromSlug: 'zweilous', toSlug: 'hydreigon', toNameFr: 'Trioxhydre', toNameEn: 'Hydreigon', method: 'level', levelRequired: 64 },

  // Bug/Fire
  { fromSlug: 'larvesta', toSlug: 'volcarona', toNameFr: 'Pyrax', toNameEn: 'Volcarona', method: 'level', levelRequired: 59 },
]

// Evolution items available for Gen 1
export const EVO_ITEMS: EvoItem[] = [
  {
    id: 'fire-stone',
    nameFr: 'Pierre Feu',
    nameEn: 'Fire Stone',
    descFr: 'Fait évoluer certains Pokémon de type Feu',
    descEn: 'Evolves certain Fire-type Pokémon',
    icon: '🔥',
    applicableTo: ['vulpix', 'growlithe', 'eevee', 'pansear'],
  },
  {
    id: 'water-stone',
    nameFr: 'Pierre Eau',
    nameEn: 'Water Stone',
    descFr: 'Fait évoluer certains Pokémon de type Eau',
    descEn: 'Evolves certain Water-type Pokémon',
    icon: '💧',
    applicableTo: ['poliwhirl', 'shellder', 'staryu', 'eevee', 'panpour'],
  },
  {
    id: 'thunder-stone',
    nameFr: 'Pierre Foudre',
    nameEn: 'Thunder Stone',
    descFr: 'Fait évoluer certains Pokémon de type Électrik',
    descEn: 'Evolves certain Electric-type Pokémon',
    icon: '⚡',
    applicableTo: ['pikachu', 'eevee', 'eelektrik'],
  },
  {
    id: 'leaf-stone',
    nameFr: 'Pierre Plante',
    nameEn: 'Leaf Stone',
    descFr: 'Fait évoluer certains Pokémon de type Plante',
    descEn: 'Evolves certain Grass-type Pokémon',
    icon: '🍃',
    applicableTo: ['gloom', 'weepinbell', 'exeggcute', 'burmy', 'eevee', 'pansage'],
  },
  {
    id: 'moon-stone',
    nameFr: 'Pierre Lune',
    nameEn: 'Moon Stone',
    descFr: 'Fait évoluer certains Pokémon mystérieux',
    descEn: 'Evolves certain mysterious Pokémon',
    icon: '🌙',
    applicableTo: ['nidorina', 'nidorino', 'clefairy', 'jigglypuff', 'munna'],
  },
  {
    id: 'link-cable',
    nameFr: 'Câble Link',
    nameEn: 'Link Cable',
    descFr: 'Simule un échange pour faire évoluer un Pokémon',
    descEn: 'Simulates a trade to evolve a Pokémon',
    icon: '🔗',
    applicableTo: ['kadabra', 'machoke', 'graveler', 'haunter', 'porygon', 'onix', 'scyther', 'seadra', 'boldore', 'gurdurr', 'karrablast', 'shelmet'],
  },
  {
    id: 'kings-rock',
    nameFr: 'Roche Royale',
    nameEn: 'King\'s Rock',
    descFr: 'Ramoloss → Roigada / Têtarte → Tarpaud (échange)',
    descEn: 'Slowpoke → Slowking / Poliwhirl → Politoed (trade)',
    icon: '👑',
    applicableTo: ['slowpoke', 'poliwhirl'],
  },
  {
    id: 'prism-scale',
    nameFr: 'Écaille Prisme',
    nameEn: 'Prism Scale',
    descFr: 'Chenipotte → Armulys (papillon de jour)',
    descEn: 'Wurmple → Silcoon (day butterfly)',
    icon: '🦋',
    applicableTo: ['wurmple'],
  },
  {
    id: 'razor-claw',
    nameFr: 'Griffe Rasoir',
    nameEn: 'Razor Claw',
    descFr: 'Chenipotte → Blindalys (papillon de nuit)',
    descEn: 'Wurmple → Cascoon (night moth)',
    icon: '🦗',
    applicableTo: ['wurmple'],
  },
  {
    id: 'deep-sea-tooth',
    nameFr: 'Dent Océan',
    nameEn: 'Deep Sea Tooth',
    descFr: 'Coquiperl → Serpang',
    descEn: 'Clamperl → Huntail',
    icon: '🦷',
    applicableTo: ['clamperl'],
  },
  {
    id: 'deep-sea-scale',
    nameFr: 'Écaille Océan',
    nameEn: 'Deep Sea Scale',
    descFr: 'Coquiperl → Rosabyss',
    descEn: 'Clamperl → Gorebyss',
    icon: '🐚',
    applicableTo: ['clamperl'],
  },
  {
    id: 'shed-shell',
    nameFr: 'Carapace Mue',
    nameEn: 'Shed Shell',
    descFr: 'Ningale → Munja (carapace vide)',
    descEn: 'Nincada → Shedinja (empty husk)',
    icon: '🪲',
    applicableTo: ['nincada'],
  },
  {
    id: 'soothe-bell',
    nameFr: 'Grelot Zen',
    nameEn: 'Soothe Bell',
    descFr: 'Fait évoluer un Pokémon lié par le bonheur',
    descEn: 'Evolves a Pokémon that evolves through happiness',
    icon: '🔔',
    applicableTo: ['pichu', 'cleffa', 'igglybuff', 'togepi', 'golbat', 'chansey', 'tyrogue', 'smoochum', 'elekid', 'magby', 'feebas', 'azurill', 'budew', 'woobat', 'swadloon'],
  },
  {
    id: 'sun-stone',
    nameFr: 'Pierre Soleil',
    nameEn: 'Sun Stone',
    descFr: 'Fait évoluer certains Pokémon avec la lumière du soleil',
    descEn: 'Evolves certain Pokémon with sunlight',
    icon: '☀️',
    applicableTo: ['sunkern', 'gloom', 'eevee', 'cottonee', 'petilil'],
  },
  {
    id: 'dusk-stone',
    nameFr: 'Pierre Nuit',
    nameEn: 'Dusk Stone',
    descFr: 'Fait évoluer certains Pokémon liés aux ténèbres',
    descEn: 'Evolves certain Pokémon tied to darkness',
    icon: '🌑',
    applicableTo: ['murkrow', 'misdreavus', 'lampent'],
  },
  {
    id: 'shiny-stone',
    nameFr: 'Pierre Éclat',
    nameEn: 'Shiny Stone',
    descFr: 'Fait évoluer Rosélia et Togetic',
    descEn: 'Evolves Roselia and Togetic',
    icon: '✨',
    applicableTo: ['roselia', 'togetic', 'minccino'],
  },
  {
    id: 'dawn-stone',
    nameFr: 'Pierre Aube',
    nameEn: 'Dawn Stone',
    descFr: 'Fait évoluer Kirlia mâle et Stalgamin femelle',
    descEn: 'Evolves male Kirlia and female Snorunt',
    icon: '🌅',
    applicableTo: ['kirlia', 'snorunt'],
  },
  {
    id: 'ice-stone',
    nameFr: 'Pierre Glace',
    nameEn: 'Ice Stone',
    descFr: 'Fait évoluer Évoli en Givrali',
    descEn: 'Evolves Eevee into Glaceon',
    icon: '❄️',
    applicableTo: ['eevee'],
  },
  {
    id: 'protector',
    nameFr: 'Protecteur',
    nameEn: 'Protector',
    descFr: 'Fait évoluer Rhinoféros en Rhinastoc',
    descEn: 'Evolves Rhydon into Rhyperior',
    icon: '🛡️',
    applicableTo: ['rhydon'],
  },
  {
    id: 'electirizer',
    nameFr: 'Électriseur',
    nameEn: 'Electirizer',
    descFr: 'Fait évoluer Élektek en Élekable',
    descEn: 'Evolves Electabuzz into Electivire',
    icon: '⚡',
    applicableTo: ['electabuzz'],
  },
  {
    id: 'magmarizer',
    nameFr: 'Magmariseur',
    nameEn: 'Magmarizer',
    descFr: 'Fait évoluer Magmar en Maganon',
    descEn: 'Evolves Magmar into Magmortar',
    icon: '🔥',
    applicableTo: ['magmar'],
  },
  {
    id: 'dubious-disc',
    nameFr: 'CD Douteux',
    nameEn: 'Dubious Disc',
    descFr: 'Fait évoluer Porygon2 en Porygon-Z',
    descEn: 'Evolves Porygon2 into Porygon-Z',
    icon: '💿',
    applicableTo: ['porygon2'],
  },
  {
    id: 'reaper-cloth',
    nameFr: 'Tissu Fauche',
    nameEn: 'Reaper Cloth',
    descFr: 'Fait évoluer Téraclope en Noctunoir',
    descEn: 'Evolves Dusclops into Dusknoir',
    icon: '👻',
    applicableTo: ['dusclops'],
  },
]

export function getEvolutionsFor(slug: string): Evolution[] {
  return EVOLUTIONS.filter((e) => e.fromSlug === slug)
}

export function canEvolveByLevel(slug: string, level: number): Evolution | null {
  return EVOLUTIONS.find((e) => e.fromSlug === slug && e.method === 'level' && level >= (e.levelRequired ?? 999)) ?? null
}

export function canEvolveByItem(slug: string, itemId: string): Evolution | null {
  return EVOLUTIONS.find(
    (e) => e.fromSlug === slug && (e.method === 'stone' || e.method === 'trade' || e.method === 'happiness') && e.itemRequired === itemId
  ) ?? null
}

export function pokemonXpForLevel(level: number, rarity?: string): number {
  if (level <= 1) return 0
  // Courbe de base augmentée: 20→35 (×1.75) + exposant 1.6→1.7
  let baseXp = Math.floor(35 * Math.pow(level, 1.7))
  
  // Réduction pour les premiers niveaux (1-20) pour faciliter le début
  if (level <= 20) {
    const reductionFactor = 0.5 + (level / 40) // 0.5 au niveau 1 → 1.0 au niveau 20
    baseXp = Math.floor(baseXp * reductionFactor)
  }
  
  // À partir du niveau 50, augmenter progressivement l'XP nécessaire
  if (level >= 50) {
    const excessLevels = level - 49
    const scalingFactor = 1 + (excessLevels * 0.05) // +5% par niveau au-dessus de 50 (était 3%)
    baseXp = Math.floor(baseXp * scalingFactor)
  }
  
  // Multiplicateur selon la rareté (Pokémon puissants = plus d'XP nécessaire)
  if (rarity) {
    const rarityMult = getRarityXpMult(rarity)
    baseXp = Math.floor(baseXp * rarityMult)
  }
  
  return baseXp
}

// Multiplicateur d'XP requis selon la rareté
function getRarityXpMult(rarity: string): number {
  switch (rarity) {
    case 'common': return 1.0      // XP normale
    case 'rare': return 1.2        // +20% XP
    case 'epic': return 1.5        // +50% XP
    case 'legendary': return 2.0   // +100% XP (2x plus lent)
    default: return 1.0
  }
}

// --- Evolution stage detection ---
// 0 = base form, 1 = first evolution, 2 = second evolution
const _evoStageCache = new Map<string, number>()

function _buildEvoStageCache() {
  // All slugs that appear as toSlug are evolved forms
  const evolvedFrom = new Map<string, string>()
  for (const e of EVOLUTIONS) {
    evolvedFrom.set(e.toSlug, e.fromSlug)
  }
  // Walk backwards to find stage
  function getStage(slug: string): number {
    if (_evoStageCache.has(slug)) return _evoStageCache.get(slug)!
    const parent = evolvedFrom.get(slug)
    if (!parent) {
      _evoStageCache.set(slug, 0)
      return 0
    }
    const stage = getStage(parent) + 1
    _evoStageCache.set(slug, stage)
    return stage
  }
  // Compute for all known slugs
  const allSlugs = new Set<string>()
  for (const e of EVOLUTIONS) {
    allSlugs.add(e.fromSlug)
    allSlugs.add(e.toSlug)
  }
  for (const slug of allSlugs) getStage(slug)
}
_buildEvoStageCache()

export function getEvolutionStage(slug: string): number {
  return _evoStageCache.get(slug) ?? 0
}

// Evolution multiplier: base=1.0, stage1=1.3, stage2=1.5
export const EVO_STAGE_MULT = [1.0, 1.3, 1.5] as const

export function getEvoStageMult(slug: string): number {
  const stage = getEvolutionStage(slug)
  return EVO_STAGE_MULT[Math.min(stage, 2)] ?? 1.0
}
