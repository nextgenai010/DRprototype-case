import eventsJson from '../config/events.json'
import { DEMO_LEAGUES } from '../config/leagues'
import type { GuessValue, League, Prediction, PredictionStatus, PredictState } from '../types'
import { scoreGuess, type ScoreBreakdown } from './scoring'
import { DAY, HOUR, weekKey } from './time'
import { rng } from './random'

export const PREDICTIONS = eventsJson as unknown as Prediction[]

export const getPrediction = (id: string) => PREDICTIONS.find((p) => p.id === id)

export const virtualNow = (s: PredictState, real = Date.now()) => real + s.dayOffset * DAY

export const closesAt = (s: PredictState, p: Prediction) => s.seedTime + p.closesInHours * HOUR

export function statusOf(s: PredictState, p: Prediction, now: number): PredictionStatus {
  if (p.resolvedHoursAgo !== undefined || s.resolutions[p.id]) return 'resolved'
  return now >= closesAt(s, p) ? 'closed' : 'open'
}

export function resultOf(s: PredictState, p: Prediction): GuessValue | undefined {
  if (s.resolutions[p.id]) return s.resolutions[p.id].result
  if (p.resolvedHoursAgo !== undefined && p.result !== '@userChoice') return p.result
  return undefined
}

/** Demo day the prediction was resolved on (seed data resolved before the demo gets day ≤ 0). */
export function resolvedDayOf(s: PredictState, p: Prediction): number | undefined {
  if (s.resolutions[p.id]) return s.resolutions[p.id].day
  if (p.resolvedHoursAgo !== undefined) return -Math.floor(p.resolvedHoursAgo / 24)
  return undefined
}

/** Value used when a prediction gets resolved by the demo clock. */
export function officialResult(s: PredictState, p: Prediction): GuessValue {
  if (p.result === '@userChoice') return s.guesses[p.id]?.value ?? p.fallbackResult ?? p.options[0].id
  return p.result
}

export const isBoosted = (s: PredictState, id: string) => Object.values(s.boosts).includes(id)

export const currentWeek = (s: PredictState) => weekKey(virtualNow(s))

export function scoreFor(s: PredictState, p: Prediction): ScoreBreakdown | null {
  const g = s.guesses[p.id]
  const r = resultOf(s, p)
  if (!g || r === undefined) return null
  return scoreGuess(p, g.value, r, isBoosted(s, p.id))
}

export function userPointsAt(s: PredictState, day = Number.POSITIVE_INFINITY): number {
  if (!s.user) return 0
  let total = 0
  for (const p of PREDICTIONS) {
    const d = resolvedDayOf(s, p)
    if (d === undefined || d > day) continue
    total += scoreFor(s, p)?.points ?? 0
  }
  return total
}

export const allLeagues = (s: PredictState): League[] => [...DEMO_LEAGUES, ...s.customLeagues]

export const userLeagues = (s: PredictState): League[] =>
  s.user ? allLeagues(s).filter((l) => s.joinedLeagues.includes(l.id)) : []

export function memberPointsAt(m: League['members'][number], day: number): number {
  if (day < 0) return m.base - m.prevDelta
  let pts = m.base
  for (let i = 0; i < day; i++) pts += m.daily[i % m.daily.length] ?? 0
  return pts
}

export interface StandingRow {
  id: string
  name: string
  role?: string
  points: number
  rank: number
  move: number
  isUser: boolean
}

function rankRows(rows: { id: string; name: string; role?: string; points: number; isUser: boolean }[]) {
  return [...rows]
    .sort((a, b) => b.points - a.points || (a.isUser ? -1 : b.isUser ? 1 : 0))
    .map((r, i) => ({ ...r, rank: i + 1 }))
}

export function standings(s: PredictState, league: League): StandingRow[] {
  const day = s.dayOffset
  const build = (d: number) =>
    rankRows([
      ...league.members.map((m) => ({ id: m.id, name: m.name, role: m.role, points: memberPointsAt(m, d), isUser: false })),
      ...(s.user ? [{ id: 'me', name: s.user.name, points: userPointsAt(s, d), isUser: true }] : []),
    ])
  const now = build(day)
  const before = build(day - 1)
  return now.map((r) => {
    const prev = before.find((b) => b.id === r.id)
    return { ...r, move: prev ? prev.rank - r.rank : 0 }
  })
}

/** Synthetic rank in the 4.520-player public league. */
export function publicRank(points: number, size = 4520) {
  return Math.max(6, Math.min(size, Math.round(size * Math.exp(-points / 170))))
}

export function leagueSummary(s: PredictState, league: League): { rank: number; of: number; move: number } {
  if (league.kind === 'public') {
    const size = league.size ?? 4520
    const now = publicRank(userPointsAt(s, s.dayOffset), size)
    const prev = publicRank(userPointsAt(s, s.dayOffset - 1), size)
    return { rank: now, of: size, move: prev - now }
  }
  const rows = standings(s, league)
  const me = rows.find((r) => r.isUser)
  return { rank: me?.rank ?? rows.length, of: rows.length, move: me?.move ?? 0 }
}

/** Deterministic "friend" guess, weighted by the community distribution. */
export function friendGuess(p: Prediction, friendId: string): GuessValue {
  const r = rng(`${p.id}:${friendId}`)
  if (p.type === 'score') {
    const base = p.communityScore ?? { home: 1, away: 1 }
    return { home: Math.max(0, base.home + Math.round(r() * 2 - 1)), away: Math.max(0, base.away + Math.round(r() * 2 - 1)) }
  }
  let x = r() * 100
  for (const o of p.options) {
    x -= o.community
    if (x <= 0) return o.id
  }
  return p.options[0].id
}

export function participantsOf(s: PredictState, p: Prediction) {
  return p.participants + (s.guesses[p.id] ? 1 : 0)
}

/** Option id the user's guess maps to (score guesses map to home/draw/away). */
export function guessOptionId(_p: Prediction, v: GuessValue | undefined): string | undefined {
  if (v === undefined) return undefined
  if (typeof v === 'string') return v
  return v.home > v.away ? 'home' : v.home < v.away ? 'away' : 'draw'
}

export interface RecapItem {
  prediction: Prediction
  score: ScoreBreakdown
  guess: GuessValue
  result: GuessValue
}

/** Resolved guesses with resolvedDay in (fromDay, toDay]. */
export function recapItems(s: PredictState, fromDay: number, toDay: number): RecapItem[] {
  const items: RecapItem[] = []
  for (const p of PREDICTIONS) {
    const d = resolvedDayOf(s, p)
    if (d === undefined || d <= fromDay || d > toDay) continue
    const g = s.guesses[p.id]
    const r = resultOf(s, p)
    const sc = scoreFor(s, p)
    if (g && r !== undefined && sc) items.push({ prediction: p, score: sc, guess: g.value, result: r })
  }
  return items
}
