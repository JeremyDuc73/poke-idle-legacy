/**
 * Server-side DPS calculation for raids.
 * Pure functions — no data dependencies. Caller provides types & evo stage.
 */

import { getTypeEffectiveness } from './type_chart.js'
import type { PokemonType } from './type_chart.js'

// Rarity DPS multiplier (same as client gacha.ts)
const RARITY_DPS_MULT: Record<string, number> = {
  common: 1.0,
  rare: 1.1,
  epic: 1.5,
  legendary: 4.0,
}

// Star DPS multiplier (same as client gacha.ts)
const STAR_DPS_MULT = [1, 1, 1.1, 1.2, 1.3, 1.5]
const STAR_DPS_MULT_SHINY = [1, 1, 1.5, 2, 3, 5]

function getStarDpsMult(stars: number, isShiny: boolean): number {
  const table = isShiny ? STAR_DPS_MULT_SHINY : STAR_DPS_MULT
  return table[Math.min(stars, table.length - 1)] ?? 1
}

function getEvoStageMult(evoStage: number): number {
  if (evoStage >= 3) return 1.4
  if (evoStage === 2) return 1.2
  return 1.0
}

export interface RaidPokemon {
  slug: string
  level: number
  stars: number
  isShiny: boolean
  rarity: string
  types: PokemonType[]
  evoStage: number
}

/**
 * Calculate DPS for a single Pokémon against raid boss types.
 * Caller must provide attacker types & evolution stage (from Species DB).
 */
export function getPokemonDps(poke: RaidPokemon, bossTypes: PokemonType[]): number {
  const baseDmg = poke.level * 2
  const evoMult = getEvoStageMult(poke.evoStage)
  const rarityMult = RARITY_DPS_MULT[poke.rarity] ?? 1.0
  const shinyMult = poke.isShiny ? 4.0 : 1.0
  const starMult = getStarDpsMult(poke.stars, poke.isShiny)

  const typeMult = poke.types.length > 0
    ? Math.max(...poke.types.map(atkType => getTypeEffectiveness(atkType, bossTypes)))
    : 1

  const permanentDps = Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult)
  return Math.round(permanentDps * typeMult)
}

/**
 * Calculate total DPS for a team of Pokémon against raid boss types.
 */
export function getTeamDps(team: RaidPokemon[], bossTypes: PokemonType[]): number {
  return team.reduce((sum, poke) => sum + getPokemonDps(poke, bossTypes), 0)
}
