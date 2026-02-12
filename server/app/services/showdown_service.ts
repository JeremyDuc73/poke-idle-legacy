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
  "Jangmo-o": 'jangmo-o',
  "Hakamo-o": 'hakamo-o',
  "Kommo-o": 'kommo-o',
  "Tapu Koko": 'tapu-koko',
  "Tapu Lele": 'tapu-lele',
  "Tapu Bulu": 'tapu-bulu',
  "Tapu Fini": 'tapu-fini',
  "Type: Null": 'type-null',
  "Flabébé": 'flabebe',
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
  return `${SHOWDOWN_BASE}/ani/${slug}.gif`
}

export function getShinySpiteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/ani-shiny/${slug}.gif`
}

export function getTrainerSpriteUrl(slug: string): string {
  return `${SHOWDOWN_BASE}/trainers/${slug}.png`
}
