#!/usr/bin/env node
/**
 * Reads client/app/data/pokedex.ts and client/app/data/types.ts
 * to generate SQL INSERT statements for the species table.
 * Usage: node scripts/seed_local.mjs | docker exec -i poke-idle-postgres psql -U postgres -d poke_idle_legacy
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// --- Parse pokedex.ts ---
const pokedexSrc = readFileSync(resolve(root, 'client/app/data/pokedex.ts'), 'utf-8')
const pokedexEntries = []
const pokedexRegex = /\{\s*id:\s*(\d+),\s*slug:\s*'([^']+)',\s*nameEn:\s*(?:'([^']*)'|"([^"]*)"),\s*nameFr:\s*(?:'([^']*)'|"([^"]*)"),\s*gen:\s*(\d+)\s*\}/g
let m
while ((m = pokedexRegex.exec(pokedexSrc)) !== null) {
  pokedexEntries.push({
    id: parseInt(m[1]),
    slug: m[2],
    nameEn: m[3] ?? m[4],
    nameFr: m[5] ?? m[6],
    gen: parseInt(m[7]),
  })
}

// --- Parse types.ts ---
const typesSrc = readFileSync(resolve(root, 'client/app/data/types.ts'), 'utf-8')
const typeMap = {}
// Match patterns like: bulbasaur: 'grass',
const typeRegex = /(\w[\w-]*?):\s*'([a-z]+)'/g
while ((m = typeRegex.exec(typesSrc)) !== null) {
  typeMap[m[1]] = m[2]
}

// --- Sprite URLs ---
const SHOWDOWN_BASE = 'https://play.pokemonshowdown.com/sprites'

function esc(s) {
  return s.replace(/'/g, "''")
}

// --- Generate SQL ---
console.log('-- Auto-generated species seed from client data')
console.log('BEGIN;')
console.log('DELETE FROM species;')

for (const p of pokedexEntries) {
  const type1 = (typeMap[p.slug] || 'normal')
  // Capitalize first letter to match Tyradex format
  const type1Cap = type1.charAt(0).toUpperCase() + type1.slice(1)
  const spriteReg = `${SHOWDOWN_BASE}/ani/${p.slug}.gif`
  const spriteShiny = `${SHOWDOWN_BASE}/ani-shiny/${p.slug}.gif`
  const now = new Date().toISOString()

  console.log(
    `INSERT INTO species (tyradex_id, name_fr, name_en, slug, type_1, type_2, generation, base_stats, evolution_family, sprite_regular, sprite_shiny, created_at, updated_at) VALUES (${p.id}, '${esc(p.nameFr)}', '${esc(p.nameEn)}', '${esc(p.slug)}', '${type1Cap}', NULL, ${p.gen}, '{}', NULL, '${spriteReg}', '${spriteShiny}', '${now}', '${now}');`
  )
}

console.log('COMMIT;')
console.error(`✅ Generated ${pokedexEntries.length} species INSERT statements`)
