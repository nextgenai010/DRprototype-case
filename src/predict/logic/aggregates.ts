import { AGE_GROUPS, REGIONS } from '../config/meta'
import type { Prediction, PredictState } from '../types'
import { normalize100, rng } from './random'
import { friendGuess, guessOptionId, userLeagues } from './selectors'

// Synthetic "Hele Danmark gætter" aggregates. Demodata – ikke rigtige danskeres holdninger.

export interface GroupRow {
  group: string
  shares: number[] // aligned with prediction.options
}

function perturb(p: Prediction, group: string, spread = 14): number[] {
  const r = rng(`${p.id}|${group}`)
  return normalize100(p.options.map((o) => Math.max(2, o.community + (r() * 2 - 1) * spread)))
}

export const byAge = (p: Prediction): GroupRow[] => AGE_GROUPS.map((g) => ({ group: g, shares: perturb(p, g) }))

export const byRegion = (p: Prediction): GroupRow[] =>
  REGIONS.map((g) => ({ group: g, shares: perturb(p, g, g === 'Bornholm' ? 22 : 12) }))

/** Distribution among everyone in the user's private leagues. */
export function byFriends(s: PredictState, p: Prediction): { shares: number[]; count: number } {
  const friends = userLeagues(s)
    .filter((l) => l.kind === 'private')
    .flatMap((l) => l.members)
  const counts = p.options.map(() => 0)
  for (const f of friends) {
    const id = guessOptionId(p, friendGuess(p, f.id))
    const i = p.options.findIndex((o) => o.id === id)
    if (i >= 0) counts[i]++
  }
  const mine = guessOptionId(p, s.guesses[p.id]?.value)
  const mi = p.options.findIndex((o) => o.id === mine)
  if (mi >= 0) counts[mi]++
  const count = counts.reduce((a, b) => a + b, 0)
  return { shares: count ? normalize100(counts) : p.options.map(() => 0), count }
}

/** Share of all players who picked the same as the user. */
export function sameAsYou(p: Prediction, optionId: string | undefined): number {
  return p.options.find((o) => o.id === optionId)?.community ?? 0
}
