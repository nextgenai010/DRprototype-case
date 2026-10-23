// Public surface of the DR Predict module.
// The news-app shell only imports from this file — mirroring how DR would mount
// the game as a self-contained micro-frontend/webview in several placements.

import { useEffect, useRef } from 'react'
import { ChevronRight, Trophy } from 'lucide-react'
import { PERSIST_ACROSS_REFRESH, PredictProvider, usePredict, type HostBridge, type HostTab } from './store'
import { PredictOverlays } from './components/Overlays'
import { OptionList } from './components/Guess'
import { Countdown } from './components/PredictionCard'
import { dailyPick, rankedFeed } from './logic/personalize'
import { getPrediction, guessOptionId, statusOf } from './logic/selectors'
import { Home } from './screens/Home'
import { Detail } from './screens/Detail'
import { LeagueScreen } from './screens/League'
import { Mine } from './screens/Mine'
import { Danmark } from './screens/Danmark'
import { Profile } from './screens/Profile'
import { CategoryTag } from './ui'

export { PERSIST_ACROSS_REFRESH, PredictProvider, PredictOverlays, type HostBridge, type HostTab }

/** Hooks the shell may use (daily pop-up trigger, demo panel, deep links). */
export function usePredictHost() {
  const { maybeShowDaily, openOverlay, openPrediction, openTab, state, showToast } = usePredict()
  return {
    maybeShowDaily,
    toast: showToast,
    openDemo: () => openOverlay({ kind: 'demo' }),
    openPrediction,
    openTab,
    /** Changes whenever the demo clock jumps or the demo resets. */
    clockKey: `${state.seedTime}:${state.dayOffset}`,
  }
}

/** The "Spil" tab. */
export function PredictTab() {
  const { route } = usePredict()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.closest('[data-scroll]')?.scrollTo({ top: 0 })
  }, [route])
  return (
    <div ref={ref}>
      {route.name === 'home' && <Home />}
      {route.name === 'detail' && <Detail key={route.id} id={route.id} />}
      {route.name === 'league' && <LeagueScreen id={route.id} />}
      {route.name === 'mine' && <Mine />}
      {route.name === 'danmark' && <Danmark id={route.id} />}
      {route.name === 'profile' && <Profile />}
    </div>
  )
}

/** Fixed banner at the top of the Forside feed (like VM-spillets banner). */
export function PredictBanner() {
  const { openTab } = usePredict()
  return (
    <button type="button" onClick={openTab} className="flex w-full items-center gap-3 bg-black px-4 py-3.5 text-left text-white hover:bg-neutral-900">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dr-red">
        <Trophy className="h-6 w-6" />
      </span>
      <span className="flex-1">
        <span className="block text-[12px] font-extrabold uppercase tracking-[.08em]">DR Predict – Dagens forudsigelse</span>
        <span className="block text-[16px] font-bold">Gæt med og dyst mod dine venner →</span>
      </span>
    </button>
  )
}

/** Inline "Hvad tror du?" widget between articles. */
export function PredictWidget() {
  const { state, now, requireLogin, guess, push, openTab } = usePredict()
  const daily = dailyPick(state, now)
  const p =
    rankedFeed(state, now).find((r) => r.prediction.id !== daily?.id && r.prediction.type !== 'score' && statusOf(state, r.prediction, now) === 'open')?.prediction ?? null
  if (!p) return null
  const g = state.guesses[p.id]
  return (
    <section aria-label="Hvad tror du?" className="border-y-4 border-black bg-dr-beige px-4 py-5">
      <p className="text-[13px] font-extrabold uppercase tracking-[.08em]">Hvad tror du?</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-neutral-500">
        <CategoryTag id={p.category} />
        <Countdown p={p} />
      </div>
      <h3 className="mt-1 text-[21px] font-extrabold leading-[1.15]">{p.title}</h3>
      <div className="mt-3">
        <OptionList p={p} compact reveal={!!g} selected={guessOptionId(p, g?.value)} onPick={(id) => requireLogin(() => guess(p.id, id), 'for at gemme dit gæt')} />
      </div>
      <button
        type="button"
        onClick={() => {
          openTab()
          window.setTimeout(() => push({ name: 'detail', id: p.id }), 0)
        }}
        className="mt-3 flex min-h-[44px] items-center gap-1 text-[14px] font-bold text-dr-red"
      >
        {g ? 'Se fordeling og flere forudsigelser' : 'Læs mere om forudsigelsen'} <ChevronRight className="h-4 w-4" />
      </button>
      <p className="text-[11px] text-neutral-500">DR Predict · Ingen penge – kun point og ære</p>
    </section>
  )
}

/** "Gæt med" module shown below related articles. */
export function ArticleCta({ predictionId }: { predictionId: string }) {
  const { openPrediction, state } = usePredict()
  const p = getPrediction(predictionId)
  if (!p) return null
  const g = state.guesses[p.id]
  return (
    <button type="button" onClick={() => openPrediction(p.id)} className="mt-4 flex w-full items-center gap-3 border-2 border-black bg-white p-3 text-left hover:bg-neutral-50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-black text-white">
        <Trophy className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-extrabold uppercase tracking-[.06em] text-dr-red">Gæt med · DR Predict</span>
        <span className="block text-[15px] font-bold leading-snug">{p.title}</span>
        {g && <span className="block text-[12px] text-neutral-500">Du har gættet – se fordelingen</span>}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0" />
    </button>
  )
}

/** Small overlay chip on relevant videos. */
export function VideoChip({ predictionId, label }: { predictionId: string; label: string }) {
  const { openPrediction } = usePredict()
  return (
    <button
      type="button"
      onClick={() => openPrediction(predictionId)}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white/95 px-3.5 text-[14px] font-bold text-black shadow-lg hover:bg-white"
    >
      <Trophy className="h-4 w-4 text-dr-red" /> {label} →
    </button>
  )
}
