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
  { fromSlug: 'tyrogue', toSlug: 'hitmonlee', toNameFr: 'Kicklee', toNameEn: 'Hitmonlee', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'smoochum', toSlug: 'jynx', toNameFr: 'Lippoutou', toNameEn: 'Jynx', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'elekid', toSlug: 'electabuzz', toNameFr: 'Élektek', toNameEn: 'Electabuzz', method: 'happiness', itemRequired: 'soothe-bell' },
  { fromSlug: 'magby', toSlug: 'magmar', toNameFr: 'Magmar', toNameEn: 'Magmar', method: 'happiness', itemRequired: 'soothe-bell' },

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
    applicableTo: ['vulpix', 'growlithe', 'eevee'],
  },
  {
    id: 'water-stone',
    nameFr: 'Pierre Eau',
    nameEn: 'Water Stone',
    descFr: 'Fait évoluer certains Pokémon de type Eau',
    descEn: 'Evolves certain Water-type Pokémon',
    icon: '💧',
    applicableTo: ['poliwhirl', 'shellder', 'staryu', 'eevee'],
  },
  {
    id: 'thunder-stone',
    nameFr: 'Pierre Foudre',
    nameEn: 'Thunder Stone',
    descFr: 'Fait évoluer certains Pokémon de type Électrik',
    descEn: 'Evolves certain Electric-type Pokémon',
    icon: '⚡',
    applicableTo: ['pikachu', 'eevee'],
  },
  {
    id: 'leaf-stone',
    nameFr: 'Pierre Plante',
    nameEn: 'Leaf Stone',
    descFr: 'Fait évoluer certains Pokémon de type Plante',
    descEn: 'Evolves certain Grass-type Pokémon',
    icon: '🍃',
    applicableTo: ['gloom', 'weepinbell', 'exeggcute'],
  },
  {
    id: 'moon-stone',
    nameFr: 'Pierre Lune',
    nameEn: 'Moon Stone',
    descFr: 'Fait évoluer certains Pokémon mystérieux',
    descEn: 'Evolves certain mysterious Pokémon',
    icon: '🌙',
    applicableTo: ['nidorina', 'nidorino', 'clefairy', 'jigglypuff'],
  },
  {
    id: 'link-cable',
    nameFr: 'Câble Link',
    nameEn: 'Link Cable',
    descFr: 'Simule un échange pour faire évoluer un Pokémon',
    descEn: 'Simulates a trade to evolve a Pokémon',
    icon: '🔗',
    applicableTo: ['kadabra', 'machoke', 'graveler', 'haunter', 'porygon', 'onix', 'scyther', 'seadra'],
  },
  {
    id: 'soothe-bell',
    nameFr: 'Grelot Zen',
    nameEn: 'Soothe Bell',
    descFr: 'Fait évoluer un Pokémon lié par le bonheur',
    descEn: 'Evolves a Pokémon that evolves through happiness',
    icon: '🔔',
    applicableTo: ['pichu', 'cleffa', 'igglybuff', 'togepi', 'golbat', 'chansey', 'tyrogue', 'smoochum', 'elekid', 'magby', 'feebas'],
  },
  {
    id: 'sun-stone',
    nameFr: 'Pierre Soleil',
    nameEn: 'Sun Stone',
    descFr: 'Fait évoluer certains Pokémon avec la lumière du soleil',
    descEn: 'Evolves certain Pokémon with sunlight',
    icon: '☀️',
    applicableTo: ['sunkern', 'gloom', 'eevee'],
  },
  {
    id: 'dusk-stone',
    nameFr: 'Pierre Nuit',
    nameEn: 'Dusk Stone',
    descFr: 'Fait évoluer certains Pokémon liés aux ténèbres',
    descEn: 'Evolves certain Pokémon tied to darkness',
    icon: '🌑',
    applicableTo: ['murkrow', 'misdreavus'],
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

export function pokemonXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(20 * Math.pow(level, 1.6))
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

// Evolution multiplier: base=1.0, stage1=1.2, stage2=1.4
export const EVO_STAGE_MULT = [1.0, 1.2, 1.4] as const

export function getEvoStageMult(slug: string): number {
  const stage = getEvolutionStage(slug)
  return EVO_STAGE_MULT[Math.min(stage, 2)] ?? 1.0
}
