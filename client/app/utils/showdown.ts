const SHOWDOWN_BASE = 'https://play.pokemonshowdown.com/sprites'

const SPECIAL_SLUGS: Record<string, string> = {
  "Nidoran♀": 'nidoranf',
  "Nidoran♂": 'nidoranm',
  "Mr. Mime": 'mr-mime',
  "Mr. Rime": 'mr-rime',
  "Farfetch'd": 'farfetchd',
  "Sirfetch'd": 'sirfetchd',
  "Ho-Oh": 'ho-oh',
  "Mime Jr.": 'mime-jr',
  "Porygon-Z": 'porygon-z',
  "Flabébé": 'flabebe',
}

const SLUG_FIXES: Record<string, string> = {
  'nidoran-f': 'nidoranf',
  'nidoran-m': 'nidoranm',
  'mr-mime': 'mrmime',
  'mime-jr': 'mimejr',
  'mr-rime': 'mrrime',
}

function fixSlug(slug: string): string {
  return SLUG_FIXES[slug] ?? slug
}

export function toShowdownSlug(nameEn: string): string {
  if (SPECIAL_SLUGS[nameEn]) {
    return SPECIAL_SLUGS[nameEn]
  }
  return nameEn
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getSpriteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/ani/${fixSlug(slug)}.gif`
}

export function getStaticSpriteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/dex/${fixSlug(slug)}.png`
}

export function getShinySpriteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/ani-shiny/${fixSlug(slug)}.gif`
}

export function getStaticShinySpriteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/dex-shiny/${fixSlug(slug)}.png`
}

export function getPokeApiSpriteUrl(id: number, shiny = false): string {
  const path = shiny ? 'shiny/' : ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${path}${id}.png`
}

export function getTrainerSpriteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/trainers/${slug}.png`
}
