import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEMO_ACCOUNT_LEAGUES, DEMO_LEAGUES } from './config/leagues'
import { regionFromPostcode } from './config/meta'
import { dailyPick } from './logic/personalize'
import { PREDICTIONS, closesAt, currentWeek, getPrediction, officialResult, recapItems, statusOf, virtualNow } from './logic/selectors'
import { DAY, dateKey } from './logic/time'
import type { DemoUser, GuessValue, League, PredictState, Profile } from './types'

export const STORAGE_KEY = 'drpredict:state:v2'

/**
 * Demo mode: every page refresh starts the demo from scratch (nothing answered,
 * not logged in). Set to true to keep state across refreshes instead.
 */
export const PERSIST_ACROSS_REFRESH = false

export function initialState(): PredictState {
  return {
    version: 1,
    seedTime: Date.now(),
    dayOffset: 0,
    user: null,
    profile: { interests: [], notifications: false, personalization: false, popupEnabled: true, onboarded: false },
    guesses: {},
    resolutions: {},
    seenStories: [],
    lastPopupDate: null,
    lastRecapDay: 0,
    joinedLeagues: [],
    customLeagues: [],
    reactions: {},
    boosts: {},
    challenges: {},
  }
}

function load(): PredictState {
  try {
    // v1 stored the demo account with pre-filled answers on open questions; start fresh.
    localStorage.removeItem('drpredict:state:v1')
    if (!PERSIST_ACROSS_REFRESH) {
      localStorage.removeItem(STORAGE_KEY)
      return initialState()
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PredictState
      if (parsed.version === 1) return { ...initialState(), ...parsed }
    }
  } catch {
    /* ignore corrupt or blocked storage */
  }
  return initialState()
}

/** Resolved guesses the demo account "Alex" made before the demo (applied at login). Open questions start unanswered. */
function demoAccountGuesses(now: number): PredictState['guesses'] {
  const at = now - 3 * DAY
  const g: Record<string, GuessValue> = {
    'broendby-agf': { home: 1, away: 0 },
    'fodbold-sverige': 'dk',
    'september-varme': 'no',
    'bagedyst-sidste': 'yasmin',
    bogforum: 'yes',
  }
  return Object.fromEntries(Object.entries(g).map(([k, v]) => [k, { value: v, at }]))
}

// ---------- navigation & overlays ----------

export type Route =
  | { name: 'home' }
  | { name: 'detail'; id: string }
  | { name: 'league'; id: string }
  | { name: 'mine' }
  | { name: 'danmark'; id?: string }
  | { name: 'profile' }

export type Overlay =
  | { kind: 'daily'; recap: boolean }
  | { kind: 'login'; reason?: string }
  | { kind: 'result'; ids: string[] }
  | { kind: 'recap'; fromDay: number; toDay: number }
  | { kind: 'rules' }
  | { kind: 'demo' }
  | { kind: 'emoji'; leagueId: string }
  | { kind: 'createLeague' }
  | { kind: 'joinLeague' }
  | { kind: 'invite'; leagueId: string }
  | { kind: 'share'; title: string; lines: string[]; footer?: string; text: string }
  | { kind: 'challenge'; predictionId: string }

export type HostTab = 'forside' | 'seneste' | 'video' | 'spil' | 'menu'

export interface HostBridge {
  tab: HostTab
  setTab: (t: HostTab) => void
}

interface Ctx {
  state: PredictState
  now: number
  host: HostBridge
  routes: Route[]
  route: Route
  push: (r: Route) => void
  back: () => void
  resetRoutes: () => void
  overlays: Overlay[]
  openOverlay: (o: Overlay) => void
  closeOverlay: (kind?: Overlay['kind']) => void
  toast: string | null
  showToast: (msg: string) => void
  requireLogin: (then: () => void, reason?: string) => void
  completeLogin: (p: { name: string; ageGroup: string; postcode: string }) => void
  cancelLogin: () => void
  finishOnboarding: (patch: Partial<Profile>) => void
  logout: () => void
  guess: (id: string, value: GuessValue) => void
  toggleBoost: (id: string) => void
  setProfile: (patch: Partial<Profile>) => void
  maybeShowDaily: () => void
  markStoriesSeen: (ids: string[]) => void
  setRecapSeen: () => void
  joinLeague: (code: string) => League | null
  createLeague: (name: string, color: string) => League
  react: (leagueId: string, emoji: string) => void
  challenge: (predictionId: string, friend: string, friendGuess: GuessValue) => void
  openPrediction: (id: string) => void
  openTab: () => void
  demo: {
    showPopupAgain: () => void
    nextDay: () => void
    resolveAll: () => void
    reset: () => void
  }
}

const PredictContext = createContext<Ctx | null>(null)

export function usePredict() {
  const ctx = useContext(PredictContext)
  if (!ctx) throw new Error('usePredict must be used inside <PredictProvider>')
  return ctx
}

export function PredictProvider({ host, children }: { host: HostBridge; children: ReactNode }) {
  const [state, setState] = useState<PredictState>(load)
  const [real, setReal] = useState(() => Date.now())
  const [routes, setRoutes] = useState<Route[]>([{ name: 'home' }])
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const pending = useRef<(() => void) | null>(null)
  const toastTimer = useRef<number>()
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const t = window.setInterval(() => setReal(Date.now()), 15_000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (!PERSIST_ACROSS_REFRESH) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable – demo still works in memory */
    }
  }, [state])

  const now = virtualNow(state, real)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const openOverlay = useCallback((o: Overlay) => setOverlays((list) => [...list.filter((x) => x.kind !== o.kind), o]), [])
  const closeOverlay = useCallback(
    (kind?: Overlay['kind']) => setOverlays((list) => (kind ? list.filter((x) => x.kind !== kind) : list.slice(0, -1))),
    [],
  )

  const push = useCallback((r: Route) => setRoutes((rs) => [...rs, r]), [])
  const back = useCallback(() => setRoutes((rs) => (rs.length > 1 ? rs.slice(0, -1) : rs)), [])
  const resetRoutes = useCallback(() => setRoutes([{ name: 'home' }]), [])

  const requireLogin = useCallback(
    (then: () => void, reason?: string) => {
      if (stateRef.current.user) return then()
      pending.current = then
      openOverlay({ kind: 'login', reason })
    },
    [openOverlay],
  )

  const completeLogin = useCallback((p: { name: string; ageGroup: string; postcode: string }) => {
    const user: DemoUser = {
      name: p.name.trim() || 'Alex',
      initials: (p.name.trim() || 'Alex').slice(0, 2).toUpperCase(),
      ageGroup: p.ageGroup,
      postcode: p.postcode,
      region: regionFromPostcode(p.postcode),
      demo: true,
    }
    setState((s) => ({
      ...s,
      user,
      guesses: { ...demoAccountGuesses(virtualNow(s)), ...s.guesses },
      joinedLeagues: Array.from(new Set([...s.joinedLeagues, ...DEMO_ACCOUNT_LEAGUES])),
    }))
  }, [])

  const finishOnboarding = useCallback(
    (patch: Partial<Profile>) => {
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch, onboarded: true } }))
      closeOverlay('login')
      const fn = pending.current
      pending.current = null
      // Run after state commit so the action sees the logged-in user.
      if (fn) window.setTimeout(fn, 0)
    },
    [closeOverlay],
  )

  const cancelLogin = useCallback(() => {
    pending.current = null
    closeOverlay('login')
  }, [closeOverlay])

  const logout = useCallback(() => {
    setState((s) => ({ ...s, user: null, guesses: {}, joinedLeagues: [], boosts: {}, challenges: {}, reactions: {} }))
    setRoutes([{ name: 'home' }])
  }, [])

  const guess = useCallback((id: string, value: GuessValue) => {
    setState((s) => {
      const p = getPrediction(id)
      if (!p || statusOf(s, p, virtualNow(s)) !== 'open') return s
      const prev = s.guesses[id]
      const at = virtualNow(s)
      return { ...s, guesses: { ...s.guesses, [id]: prev ? { ...prev, value, updatedAt: at } : { value, at } } }
    })
  }, [])

  const toggleBoost = useCallback(
    (id: string) => {
      const s = stateRef.current
      const wk = currentWeek(s)
      if (s.boosts[wk] === id) {
        setState({ ...s, boosts: { ...s.boosts, [wk]: '' } })
        showToast('Ugens boost er fjernet')
        return
      }
      const current = s.boosts[wk] ? getPrediction(s.boosts[wk]) : undefined
      if (current && statusOf(s, current, virtualNow(s)) !== 'open') {
        showToast('Ugens boost er allerede brugt på en lukket forudsigelse')
        return
      }
      setState({ ...s, boosts: { ...s.boosts, [wk]: id } })
      showToast(s.boosts[wk] ? 'Ugens boost er flyttet hertil (2× point)' : 'Ugens boost er sat (2× point)')
    },
    [showToast],
  )

  const setProfile = useCallback((patch: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })), [])

  const maybeShowDaily = useCallback(() => {
    const s = stateRef.current
    const n = virtualNow(s)
    if (!s.profile.popupEnabled || s.lastPopupDate === dateKey(n)) return
    const recap = !!s.user && s.lastRecapDay < s.dayOffset && recapItems(s, s.lastRecapDay, s.dayOffset).length > 0
    if (!dailyPick(s, n) && !recap) return
    setState((x) => ({ ...x, lastPopupDate: dateKey(n) }))
    openOverlay({ kind: 'daily', recap })
  }, [openOverlay])

  const markStoriesSeen = useCallback(
    (ids: string[]) => setState((s) => ({ ...s, seenStories: Array.from(new Set([...s.seenStories, ...ids])) })),
    [],
  )
  const setRecapSeen = useCallback(() => setState((s) => ({ ...s, lastRecapDay: s.dayOffset })), [])

  const joinLeague = useCallback((code: string) => {
    const s = stateRef.current
    const league = [...DEMO_LEAGUES, ...s.customLeagues].find((l) => l.code && l.code.toUpperCase() === code.trim().toUpperCase())
    if (!league) return null
    setState((x) => ({ ...x, joinedLeagues: Array.from(new Set([...x.joinedLeagues, league.id])) }))
    return league
  }, [])

  const createLeague = useCallback((name: string, color: string) => {
    const code = `DR${Math.floor(1000 + Math.random() * 9000)}`
    const league: League = { id: `custom-${Date.now()}`, name: name.trim() || 'Min liga', kind: 'private', color, code, members: [], createdByUser: true }
    setState((s) => ({ ...s, customLeagues: [...s.customLeagues, league], joinedLeagues: [...s.joinedLeagues, league.id] }))
    return league
  }, [])

  const react = useCallback((leagueId: string, emoji: string) => setState((s) => ({ ...s, reactions: { ...s.reactions, [leagueId]: emoji } })), [])

  const challenge = useCallback(
    (predictionId: string, friend: string, friendGuess: GuessValue) =>
      setState((s) => ({ ...s, challenges: { ...s.challenges, [predictionId]: { friend, friendGuess, at: virtualNow(s) } } })),
    [],
  )

  const openPrediction = useCallback(
    (id: string) => {
      host.setTab('spil')
      setRoutes([{ name: 'home' }, { name: 'detail', id }])
    },
    [host],
  )
  const openTab = useCallback(() => {
    host.setTab('spil')
    setRoutes([{ name: 'home' }])
  }, [host])

  const resolveWhere = useCallback((pred: (closeAt: number, s: PredictState) => boolean, advanceDays: number) => {
    setState((s) => {
      const day = s.dayOffset + advanceDays
      const next: PredictState = { ...s, dayOffset: day }
      const n = virtualNow(next)
      const resolutions = { ...s.resolutions }
      for (const p of PREDICTIONS) {
        if (statusOf(s, p, n) === 'resolved') continue
        if (pred(closesAt(s, p), { ...next, resolutions })) resolutions[p.id] = { result: officialResult(s, p), day }
      }
      return { ...next, resolutions }
    })
  }, [])

  const demo = useMemo(
    () => ({
      showPopupAgain: () => {
        setState((s) => ({ ...s, lastPopupDate: null, profile: { ...s.profile, popupEnabled: true } }))
        setOverlays([])
        host.setTab('forside')
        window.setTimeout(() => {
          const s = stateRef.current
          const recap = !!s.user && s.lastRecapDay < s.dayOffset && recapItems(s, s.lastRecapDay, s.dayOffset).length > 0
          setState((x) => ({ ...x, lastPopupDate: dateKey(virtualNow(x)) }))
          setOverlays([{ kind: 'daily', recap }])
        }, 700)
      },
      nextDay: () => {
        resolveWhere((closeAt, s) => closeAt <= virtualNow(s), 1)
        setOverlays([])
        setRoutes([{ name: 'home' }])
        showToast('Det er nu i morgen. Åbn Forside for dagens forudsigelse.')
      },
      resolveAll: () => {
        const before = stateRef.current
        resolveWhere(() => true, 0)
        setOverlays([])
        const ids = PREDICTIONS.filter((p) => statusOf(before, p, virtualNow(before)) !== 'resolved' && before.guesses[p.id]).map((p) => p.id)
        if (ids.length) window.setTimeout(() => setOverlays([{ kind: 'result', ids }]), 50)
        else showToast('Alle forudsigelser er afgjort')
      },
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        setState(initialState())
        setOverlays([])
        setRoutes([{ name: 'home' }])
        host.setTab('forside')
        showToast('Demoen er nulstillet')
      },
    }),
    [host, resolveWhere, showToast],
  )

  const value: Ctx = {
    state,
    now,
    host,
    routes,
    route: routes[routes.length - 1],
    push,
    back,
    resetRoutes,
    overlays,
    openOverlay,
    closeOverlay,
    toast,
    showToast,
    requireLogin,
    completeLogin,
    cancelLogin,
    finishOnboarding,
    logout,
    guess,
    toggleBoost,
    setProfile,
    maybeShowDaily,
    markStoriesSeen,
    setRecapSeen,
    joinLeague,
    createLeague,
    react,
    challenge,
    openPrediction,
    openTab,
    demo,
  }

  return <PredictContext.Provider value={value}>{children}</PredictContext.Provider>
}
