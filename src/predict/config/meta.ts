import type { CategoryId, GuessValue } from '../types'

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'sport', label: 'Sport' },
  { id: 'samfund', label: 'Nyheder & samfund' },
  { id: 'tv', label: 'TV & underholdning' },
  { id: 'kultur', label: 'Kultur & musik' },
]

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id

/** Interests offered after login, mapped to prediction tags. */
export const INTERESTS: { id: string; label: string; tags: string[]; reason: string }[] = [
  { id: 'sport', label: 'Sport', tags: ['sport'], reason: 'du følger sport' },
  { id: 'nyheder', label: 'Nyheder', tags: ['nyheder', 'vejr', 'klima', 'penge'], reason: 'du følger nyheder' },
  { id: 'politik', label: 'Politik og samfund', tags: ['politik', 'penge'], reason: 'du følger politik og samfund' },
  { id: 'kultur', label: 'Kultur', tags: ['kultur'], reason: 'du følger kultur' },
  { id: 'musik', label: 'Musik', tags: ['musik'], reason: 'du følger musik' },
  { id: 'underholdning', label: 'Underholdning', tags: ['underholdning'], reason: 'du følger underholdning' },
]

export const AGE_GROUPS = ['15–19', '20–24', '25–29', '30–39', '40–49', '50–59', '60–69', '70+']

export const REGIONS = [
  'Hovedstadsområdet',
  'Sjælland',
  'Fyn',
  'Bornholm',
  'Syd- og Sønderjylland',
  'Trekantsområdet',
  'Østjylland',
  'Midt- og Vestjylland',
  'Nordjylland',
] as const

/** Very rough postcode → DR region mapping (demo only). */
export function regionFromPostcode(pc: string): string {
  const n = parseInt(pc, 10)
  if (!Number.isFinite(n) || n < 3700) return 'Hovedstadsområdet'
  if (n < 3800) return 'Bornholm'
  if (n < 5000) return 'Sjælland'
  if (n < 6000) return 'Fyn'
  if (n < 6100 || (n >= 7000 && n < 7200)) return 'Trekantsområdet'
  if (n < 7000) return 'Syd- og Sønderjylland'
  if (n < 8000) return 'Midt- og Vestjylland'
  if (n < 9000) return 'Østjylland'
  return 'Nordjylland'
}

/** Synthetic players per region this week (demo data). */
export const REGION_PLAYERS: Record<string, number> = {
  Hovedstadsområdet: 21480,
  Sjælland: 7310,
  Fyn: 5120,
  Bornholm: 40,
  'Syd- og Sønderjylland': 2880,
  Trekantsområdet: 3950,
  Østjylland: 8740,
  'Midt- og Vestjylland': 4410,
  Nordjylland: 4630,
}

/** Synthetic average points per guess per region (demo data). */
export const REGION_AVG: Record<string, number> = {
  Hovedstadsområdet: 52.1,
  Sjælland: 54.8,
  Fyn: 65.2,
  Bornholm: 61.0,
  'Syd- og Sønderjylland': 62.1,
  Trekantsområdet: 55.3,
  Østjylland: 57.9,
  'Midt- og Vestjylland': 56.8,
  Nordjylland: 58.4,
}

export const AGE_PLAYERS: Record<string, number> = {
  '15–19': 4425,
  '20–24': 6262,
  '25–29': 8308,
  '30–39': 10912,
  '40–49': 9963,
  '50–59': 10761,
  '60–69': 6520,
  '70+': 2516,
}

export function formatGuess(value: GuessValue | undefined, options: { id: string; label: string }[]): string {
  if (value === undefined) return '–'
  if (typeof value === 'string') return options.find((o) => o.id === value)?.label ?? value
  return `${value.home}–${value.away}`
}
