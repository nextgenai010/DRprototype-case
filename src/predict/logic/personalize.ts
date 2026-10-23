import { INTERESTS, categoryLabel } from '../config/meta'
import type { Prediction, PredictState } from '../types'
import { PREDICTIONS, closesAt, statusOf } from './selectors'
import { startOfDay as startOfDayV } from './time'

// Simple, transparent scoring: interest match (+3) and categories the user
// has guessed in before (+1 per guess, max +2, only when personalisation is on).

export interface Ranked {
  prediction: Prediction
  score: number
  reason: string | null
}

export function rank(s: PredictState, p: Prediction): Ranked {
  let score = 0
  let reason: string | null = null
  const interest = INTERESTS.find((i) => s.profile.interests.includes(i.id) && i.tags.some((t) => p.tags.includes(t)))
  if (interest) {
    score += 3
    reason = `Vises fordi ${interest.reason}`
  }
  if (s.profile.personalization) {
    const prior = Object.keys(s.guesses).filter((id) => {
      const q = PREDICTIONS.find((x) => x.id === id)
      return q && q.id !== p.id && q.category === p.category
    }).length
    if (prior > 0) {
      score += Math.min(2, prior)
      if (!reason) reason = `Vises fordi du har gættet på ${categoryLabel(p.category).toLowerCase()}`
    }
  }
  return { prediction: p, score, reason }
}

const statusOrder = { open: 0, closed: 1, resolved: 2 } as const

/** Feed order: open first (personal score, then soonest closing), then closed, then resolved. */
export function rankedFeed(s: PredictState, now: number, list = PREDICTIONS): Ranked[] {
  return list
    .map((p) => rank(s, p))
    .sort((a, b) => {
      const sa = statusOrder[statusOf(s, a.prediction, now)]
      const sb = statusOrder[statusOf(s, b.prediction, now)]
      if (sa !== sb) return sa - sb
      if (b.score !== a.score) return b.score - a.score
      return closesAt(s, a.prediction) - closesAt(s, b.prediction)
    })
}

/**
 * Today's prediction: an open, daily-eligible question that closes at least an
 * hour from now and that the user did not already answer on an earlier day.
 */
export function dailyPick(s: PredictState, now: number): Prediction | null {
  const dayStart = startOfDayV(now)
  const candidates = PREDICTIONS.filter((p) => {
    if (!p.daily || statusOf(s, p, now) !== 'open') return false
    if (closesAt(s, p) - now < 3_600_000 * 0.75) return false
    const g = s.guesses[p.id]
    return !g || g.at >= dayStart
  })
  candidates.sort((a, b) => {
    const ra = rank(s, a).score * 10 + (a.daily ?? 0)
    const rb = rank(s, b).score * 10 + (b.daily ?? 0)
    return rb - ra
  })
  return candidates[0] ?? null
}
