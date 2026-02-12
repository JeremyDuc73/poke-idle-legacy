import { useApi } from '~/composables/useApi'

interface SpeciesEntry {
  id: number
  slug: string
  nameFr: string
  nameEn: string
}

const cache = ref<Map<string, SpeciesEntry>>(new Map())
const loaded = ref(false)

export function useSpeciesCache() {
  async function loadSpecies() {
    if (loaded.value) return
    try {
      const api = useApi()
      const species = await api.get<SpeciesEntry[]>('/pokedex')
      const map = new Map<string, SpeciesEntry>()
      for (const s of species) {
        map.set(s.slug, s)
      }
      cache.value = map
      loaded.value = true
    } catch (e) {
      console.error('Failed to load species cache:', e)
    }
  }

  function getSpeciesId(slug: string): number | null {
    return cache.value.get(slug)?.id ?? null
  }

  return {
    cache: readonly(cache),
    loaded: readonly(loaded),
    loadSpecies,
    getSpeciesId,
  }
}
