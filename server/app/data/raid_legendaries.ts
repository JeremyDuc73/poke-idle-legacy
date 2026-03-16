/**
 * Raid boss legendary pools per generation.
 * Reads slug lists from shared/raid-legendaries.json (single source of truth).
 * Resolves names & types from the Species DB table at runtime.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Species from '#models/species'
import type { PokemonType } from './type_chart.js'

export interface RaidLegendary {
  slug: string
  nameFr: string
  nameEn: string
  types: PokemonType[]
}

// Load slug arrays from shared JSON (no duplication — same file could be read by client)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const jsonPath = join(__dirname, '..', '..', '..', 'shared', 'raid-legendaries.json')
const SLUG_POOLS: Record<string, string[]> = JSON.parse(readFileSync(jsonPath, 'utf-8'))

/**
 * Pick a random legendary for a raid of the given generation.
 * Queries the Species DB to resolve names & types (zero hardcoded data).
 */
export async function pickRaidBoss(gen: number): Promise<RaidLegendary | null> {
  const slugs = SLUG_POOLS[String(gen)]
  if (!slugs || slugs.length === 0) return null

  const slug = slugs[Math.floor(Math.random() * slugs.length)]

  // Resolve from DB
  const species = await Species.findBy('slug', slug)
  if (species) {
    const types: PokemonType[] = [species.type1 as PokemonType]
    if (species.type2) types.push(species.type2 as PokemonType)
    return { slug: species.slug, nameFr: species.nameFr, nameEn: species.nameEn, types }
  }

  // Fallback if species not in DB yet (shouldn't happen if gacha seeded)
  return { slug, nameFr: slug, nameEn: slug, types: ['normal'] }
}
