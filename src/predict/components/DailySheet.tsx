import { useEffect, useMemo, useState } from 'react'
import { Users, ChevronRight, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react'
import { usePredict } from '../store'
import { dailyPick } from '../logic/personalize'
import { guessOptionId, leagueSummary, participantsOf, recapItems, userLeagues } from '../logic/selectors'
import { formatLongDate, fmtInt } from '../logic/time'
import { formatGuess } from '../config/meta'
import { sameAsYou } from '../logic/aggregates'
import { Sheet, CloseButton, CategoryTag, Btn, PctBar } from '../ui'
import { OptionList, ScorePicker } from './Guess'
import { Countdown } from './PredictionCard'
import { PredictMark } from '../../shared/brand'
import type { GuessValue } from '../types'

function useRecap(enabled: boolean) {
  const { state, setRecapSeen } = usePredict()
  // Freeze the recap at open time so it doesn't disappear when marked as seen.
  const [snap] = useState(() => {
    if (!enabled) return null
    const items = recapItems(state, state.lastRecapDay, state.dayOffset)
    const points = items.reduce((a, i) => a + i.score.points, 0)
    const moves = userLeagues(state)
      .filter((l) => l.kind !== 'public')
      .map((l) => ({ league: l, ...leagueSummary(state, l) }))
      .sort((a, b) => b.move - a.move)
    return { items, points, move: moves[0] ?? null, fromDay: state.lastRecapDay, toDay: state.dayOffset }
  })
  useEffect(() => {
    if (snap) setRecapSeen()
  }, [snap, setRecapSeen])
  return snap
}

export function DailySheet({ recap }: { recap: boolean }) {
  const p = usePredict()
  const { state, now, closeOverlay, requireLogin, guess, setProfile, openTab, openOverlay, showToast } = p
  const [prediction] = useState(() => dailyPick(state, now))
  const recapSnap = useRecap(recap)
  const [picked, setPicked] = useState<string | undefined>()

  const g = prediction ? state.guesses[prediction.id] : undefined
  const answered = !!g
  const mineId = prediction ? guessOptionId(prediction, g?.value) : undefined
  const same = prediction && mineId ? sameAsYou(prediction, mineId) : 0
  const close = () => closeOverlay('daily')

  const submit = (value: GuessValue) => {
    if (!prediction) return
    if (typeof value === 'string') setPicked(value)
    requireLogin(() => guess(prediction.id, value), 'for at gemme dit gæt')
  }

  const disable = () => {
    setProfile({ popupEnabled: false })
    close()
    showToast('Dagens forudsigelse vises ikke længere. Slå den til igen under Profil.')
  }

  const dateLabel = useMemo(() => formatLongDate(now), [now])

  return (
    <Sheet label="Dagens forudsigelse" onClose={close} tall>
      <div className="px-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[.08em]">
              <PredictMark className="h-4 w-4 text-dr-red" /> DR Predict
            </p>
            <p className="text-[14px] text-neutral-500">{dateLabel}</p>
          </div>
          <CloseButton onClick={close} className="-mr-2 -mt-1" />
        </div>

        {recapSnap && recapSnap.items.length > 0 && (
          <section aria-label="Sket siden sidst" className="mt-3 overflow-hidden rounded-[14px] bg-black p-4 text-white animate-rise">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-white/60">Sket siden sidst</p>
            <p className="mt-1 text-[26px] font-extrabold leading-tight">
              Du fik {recapSnap.points} point
            </p>
            <ul className="mt-2 space-y-1.5 text-[14px]">
              {recapSnap.items.map((i) => (
                <li key={i.prediction.id} className="flex items-start justify-between gap-3">
                  <span className="text-white/85">
                    {i.prediction.title.replace(/\?$/, '')}: <strong className="text-white">{formatGuess(i.result, i.prediction.options)}</strong>
                  </span>
                  <span className={`shrink-0 font-bold tabular-nums ${i.score.points ? 'text-[#7CE0A8]' : 'text-white/50'}`}>+{i.score.points}p</span>
                </li>
              ))}
            </ul>
            {recapSnap.move && recapSnap.move.move !== 0 && (
              <p className="mt-3 flex items-center gap-1.5 rounded-[8px] bg-white/10 px-3 py-2 text-[14px] font-semibold">
                {recapSnap.move.move > 0 ? <ArrowUp className="h-4 w-4 text-[#7CE0A8]" /> : <ArrowDown className="h-4 w-4 text-[#FF8A8A]" />}
                Du rykkede {Math.abs(recapSnap.move.move)} {Math.abs(recapSnap.move.move) === 1 ? 'plads' : 'pladser'} {recapSnap.move.move > 0 ? 'op' : 'ned'} i {recapSnap.move.league.name}
              </p>
            )}
            <button
              type="button"
              className="mt-3 flex min-h-[44px] items-center gap-1 text-[14px] font-bold underline-offset-2 hover:underline"
              onClick={() => openOverlay({ kind: 'recap', fromDay: recapSnap.fromDay, toDay: recapSnap.toDay })}
            >
              Se hele historien <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        )}

        {prediction ? (
          <section aria-label="Dagens spørgsmål" className="mt-4">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-neutral-500">Dagens forudsigelse</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-neutral-500">
              <CategoryTag id={prediction.category} />
              <Countdown p={prediction} />
            </div>
            <h2 className="mt-1 text-[24px] font-extrabold leading-[1.15]">{prediction.title}</h2>
            <p className="mt-1 text-[15px] leading-snug text-neutral-600">{prediction.description}</p>

            <div className="mt-4">
              {prediction.type === 'score' && !answered ? (
                <ScorePicker p={prediction} initial={prediction.communityScore} onSave={submit} />
              ) : (
                <OptionList
                  p={prediction}
                  reveal={answered}
                  selected={answered ? mineId : picked}
                  onPick={(id) => submit(id)}
                />
              )}
            </div>

            {answered && (
              <div className="mt-4 animate-rise" aria-live="polite">
                <p className="flex items-center gap-2 text-[15px] font-bold text-[#0E6B3F]">
                  <CheckCircle2 className="h-5 w-5" /> Dit gæt er gemt: {formatGuess(g!.value, prediction.options)}
                </p>
                <div className="mt-3 rounded-[12px] bg-dr-beige p-4">
                  <p className="text-[30px] font-extrabold leading-none">{same}%</p>
                  <p className="mt-1 text-[15px]">af danskerne gætter det samme som dig</p>
                  <div className="mt-3">
                    <PctBar pct={same} highlight />
                  </div>
                  <p className="mt-2 text-[12px] text-neutral-500">Fordeling af brugernes gæt – ikke en beregnet sandsynlighed.</p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Btn
                    onClick={() => {
                      close()
                      openTab()
                    }}
                  >
                    Se flere forudsigelser
                  </Btn>
                  <Btn variant="secondary" onClick={close}>
                    Tilbage til nyhederne
                  </Btn>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-[13px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden="true" /> {fmtInt(participantsOf(state, prediction))} har gættet
              </span>
              {!state.user && !answered && <span>Gratis · ingen penge</span>}
            </div>

            {prediction.related[0] && (
              <a
                href={prediction.related[0].url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex min-h-[48px] items-center justify-between rounded-[10px] border border-neutral-200 px-3 text-[14px] font-bold hover:border-black"
              >
                <span>
                  {prediction.related[0].headline} <span className="font-normal text-neutral-500">· {prediction.related[0].platform}</span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </section>
        ) : (
          <p className="mt-4 text-[15px]">Du har gættet på alle dagens forudsigelser. Godt gået!</p>
        )}

        {!answered && (
          <div className="mt-5 flex flex-col items-center gap-1">
            <Btn variant="secondary" className="w-full" onClick={close}>
              Ikke nu
            </Btn>
            <button type="button" onClick={disable} className="min-h-[44px] text-[13px] text-neutral-500 underline">
              Vis ikke dagens forudsigelse
            </button>
          </div>
        )}
        <p className="mt-1 text-center text-[11px] text-neutral-400">Prototype – ikke et officielt DR-produkt</p>
      </div>
    </Sheet>
  )
}
