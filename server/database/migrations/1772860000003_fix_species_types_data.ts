import { BaseSchema } from '@adonisjs/lucid/schema'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default class FixSpeciesTypesData extends BaseSchema {
  async up() {
    // Read from the single source of truth: shared/pokemon-types.json
    const currentFile = fileURLToPath(import.meta.url)
    const currentDir = dirname(currentFile)
    const jsonPath = resolve(currentDir, '../../../shared/pokemon-types.json')
    const raw: Record<string, string | [string, string]> = JSON.parse(
      readFileSync(jsonPath, 'utf-8')
    )

    // Capitalize first letter to match DB convention (e.g. 'fire' → 'Fire')
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    for (const [slug, types] of Object.entries(raw)) {
      const type1 = cap(Array.isArray(types) ? types[0] : types)
      const type2 = Array.isArray(types) ? cap(types[1]) : null

      await this.db.from('species').where('slug', slug).update({
        type_1: type1,
        type_2: type2,
      })
    }
  }

  async down() {
    // No rollback — original data was inconsistent
  }
}
