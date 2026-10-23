import type { GuessValue, Prediction, ScoreValue } from '../types'

// One transparent model. Guessing is free, wrong guesses give 0, never negative.
export const POINTS = {
  correct: 100,
  exact: 150,
  goalDiff: 50,
  winner: 15,
  underdog: 50,
  underdogThreshold: 25,
  boostMultiplier: 2,
} as const

export type ScoreKind = 'exact' | 'diff' | 'winner' | 'correct' | 'wrong'

export interface ScoreBreakdown {
  points: number
  base: number
  underdog: number
  boosted: boolean
  kind: ScoreKind
}

const outcome = (s: ScoreValue) => (s.home > s.away ? 'home' : s.home < s.away ? 'away' : 'draw')

export function scoreGuess(p: Prediction, guess: GuessValue, result: GuessValue, boosted = false): ScoreBreakdown {
  let base = 0
  let kind: ScoreKind = 'wrong'
  let pickedOptionId: string | null = null

  if (p.type === 'score' && typeof guess === 'object' && typeof result === 'object') {
    if (guess.home === result.home && guess.away === result.away) {
      base = POINTS.exact
      kind = 'exact'
    } else if (guess.home - guess.away === result.home - result.away) {
      base = POINTS.goalDiff
      kind = 'diff'
    } else if (outcome(guess) === outcome(result)) {
      base = POINTS.winner
      kind = 'winner'
    }
    pickedOptionId = outcome(guess)
  } else if (typeof guess === 'string' && guess === result) {
    base = POINTS.correct
    kind = 'correct'
    pickedOptionId = guess
  }

  let underdog = 0
  if (base > 0 && pickedOptionId) {
    const share = p.options.find((o) => o.id === pickedOptionId)?.community ?? 100
    if (share < POINTS.underdogThreshold) underdog = POINTS.underdog
  }
  const mult = boosted ? POINTS.boostMultiplier : 1
  return { points: (base + underdog) * mult, base, underdog, boosted, kind }
}

/** VM-spillet-style story headline for a result. */
export function resultHeadline(b: ScoreBreakdown): { title: string; sub: string } {
  if (b.kind === 'exact') return { title: 'STÆRKT!', sub: 'Rigtigt resultat' }
  if (b.kind === 'correct') return { title: b.underdog ? 'MODIGT GÆT!' : 'STÆRKT!', sub: b.underdog ? 'Rigtigt – og du var i mindretal' : 'Rigtigt gæt' }
  if (b.kind === 'diff') return { title: 'GODT GÆT!', sub: 'Rigtig målforskel' }
  if (b.kind === 'winner') return { title: 'TÆT PÅ!', sub: 'Rigtig vinder' }
  return { title: 'DET VAR ÆRGERLIGT', sub: 'Ikke denne gang' }
}
