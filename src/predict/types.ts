// Data model for the DR Predict module. Everything a new event needs is
// expressed as data (see config/events.json) — no component changes required.

export type CategoryId = 'sport' | 'samfund' | 'tv' | 'kultur'

export type QuestionType = 'choice' | 'yesno' | 'score'

export type Platform = 'DR Nyheder' | 'DRTV' | 'DR Lyd'

export interface ContentLink {
  platform: Platform
  headline: string
  description: string
  url: string
}

export interface Option {
  id: string
  label: string
  /** Share of all players who picked this option (synthetic, 0–100). */
  community: number
}

export interface ScoreValue {
  home: number
  away: number
}

export type GuessValue = string | ScoreValue

export interface Prediction {
  id: string
  category: CategoryId
  /** Interest tags used for personalisation. */
  tags: string[]
  type: QuestionType
  title: string
  description: string
  /** Key for the generated illustration. */
  visual: string
  /** Hours from demo start until the prediction closes (negative = already closed). */
  closesInHours: number
  /** Present when the prediction was already resolved at demo start. */
  resolvedHoursAgo?: number
  options: Option[]
  /** Only for type 'score'. */
  teams?: { home: string; away: string }
  /** Typical community score guess for type 'score'. */
  communityScore?: ScoreValue
  /**
   * Official result. A string option id, a score, or "@userChoice" (demo only:
   * resolves in the player's favour so the next-day recap is predictable on stage).
   */
  result: GuessValue | '@userChoice'
  fallbackResult?: GuessValue
  participants: number
  resolution: string
  source: string
  related: ContentLink[]
  /** Eligible as "Dagens forudsigelse". Higher = preferred. */
  daily?: number
}

export interface Guess {
  value: GuessValue
  at: number
  updatedAt?: number
}

export interface Resolution {
  result: GuessValue
  day: number
}

export interface DemoUser {
  name: string
  initials: string
  ageGroup: string
  postcode: string
  region: string
  demo: true
}

export interface LeagueMember {
  id: string
  name: string
  /** Points at demo day 0. */
  base: number
  /** Points earned on the day before demo start (used for day-0 movement arrows). */
  prevDelta: number
  /** Points earned per demo day (cycled). */
  daily: number[]
  role?: string
}

export interface League {
  id: string
  name: string
  kind: 'public' | 'expert' | 'private'
  color: string
  code?: string
  members: LeagueMember[]
  /** For the public league: number of players. */
  size?: number
  createdByUser?: boolean
}

export interface Challenge {
  friend: string
  friendGuess: GuessValue
  at: number
}

export interface Profile {
  interests: string[]
  notifications: boolean
  personalization: boolean
  popupEnabled: boolean
  onboarded: boolean
}

export interface PredictState {
  version: 1
  seedTime: number
  dayOffset: number
  user: DemoUser | null
  profile: Profile
  guesses: Record<string, Guess>
  resolutions: Record<string, Resolution>
  seenStories: string[]
  lastPopupDate: string | null
  lastRecapDay: number
  joinedLeagues: string[]
  customLeagues: League[]
  reactions: Record<string, string>
  /** ISO week key → prediction boosted that week ("Ugens boost"). */
  boosts: Record<string, string>
  challenges: Record<string, Challenge>
}

export type PredictionStatus = 'open' | 'closed' | 'resolved'
