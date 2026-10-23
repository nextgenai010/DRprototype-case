import { useEffect, useState, type ReactNode } from 'react'
import { ArrowUp, ArrowDown, Minus, Zap } from 'lucide-react'
import { usePredict } from '../store'
import { getPrediction, recapItems, scoreFor, resultOf, standings, userLeagues, type StandingRow } from '../logic/selectors'
import { resultHeadline } from '../logic/scoring'
import { formatGuess } from '../config/meta'
import { FullModal, CloseButton, Btn, Avatar } from '../ui'
import { PredictMark } from '../../shared/brand'

interface Slide {
  key: string
  bg: string
  body: ReactNode
}

function StoryViewer({ label, slides, onClose, footer }: { label: string; slides: Slide[]; onClose: () => void; footer: (i: number, last: boolean) => ReactNode }) {
  const [i, setI] = useState(0)
  const last = i === slides.length - 1
  const next = () => setI((x) => Math.min(slides.length - 1, x + 1))
  const prev = () => setI((x) => Math.max(0, x - 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const s = slides[i]
  return (
    <FullModal label={label} onClose={onClose} dark>
      <div className="absolute inset-0 transition-colors duration-500" style={{ background: s.bg }} aria-hidden="true" />
      <div className="relative flex h-full flex-col">
        <div className="flex gap-1 px-3 pt-3" aria-hidden="true">
          {slides.map((sl, idx) => (
            <span key={sl.key} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span className={`block h-full bg-white transition-[width] duration-300 ${idx <= i ? 'w-full' : 'w-0'}`} />
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between px-3 pt-1">
          <span className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[.08em]">
            <PredictMark className="h-4 w-4" /> {label}
          </span>
          <CloseButton onClick={onClose} className="text-white hover:bg-white/10" />
        </div>
        <div className="relative min-h-0 flex-1">
          <button type="button" className="absolute inset-y-0 left-0 z-10 w-1/4" aria-label="Forrige" onClick={prev} />
          <button type="button" className="absolute inset-y-0 right-0 z-10 w-1/4" aria-label="Næste" onClick={next} />
          <div key={s.key} className="h-full overflow-y-auto px-6 pb-4 animate-rise" aria-live="polite">
            {s.body}
          </div>
        </div>
        <div className="relative z-20 flex gap-2 px-5 pb-6 pt-2">{footer(i, last)}</div>
      </div>
    </FullModal>
  )
}

const BG = {
  great: 'linear-gradient(160deg,#D6001C 0%,#7a0010 100%)',
  good: 'linear-gradient(160deg,#1F3A8A 0%,#0b1636 100%)',
  bad: 'linear-gradient(160deg,#2b2b2b 0%,#0d0d0d 100%)',
  neutral: 'linear-gradient(160deg,#111 0%,#2a2a2a 100%)',
}

function MoveIcon({ move }: { move: number }) {
  if (move > 0)
    return (
      <span className="flex items-center text-[#7CE0A8]" aria-label={`Op ${move}`}>
        <ArrowUp className="h-4 w-4" />
        {move}
      </span>
    )
  if (move < 0)
    return (
      <span className="flex items-center text-[#FF8A8A]" aria-label={`Ned ${-move}`}>
        <ArrowDown className="h-4 w-4" />
        {-move}
      </span>
    )
  return <Minus className="h-4 w-4 text-white/40" aria-label="Uændret" />
}

function StandingsMini({ rows }: { rows: StandingRow[] }) {
  const top = rows.slice(0, 6)
  return (
    <ul className="divide-y divide-white/10 rounded-[12px] bg-white/10">
      {top.map((r) => (
        <li key={r.id} className={`flex items-center gap-3 px-3 py-2.5 ${r.isUser ? 'bg-white/15 font-bold' : ''}`}>
          <span className="w-5 tabular-nums">{r.rank}</span>
          <Avatar name={r.name} size={30} color="#fff" />
          <span className="flex-1 truncate">{r.isUser ? `${r.name} (dig)` : r.name}</span>
          <span className="tabular-nums">{r.points}</span>
          <span className="w-9">
            <MoveIcon move={r.move} />
          </span>
        </li>
      ))}
    </ul>
  )
}

export function ResultStory({ ids }: { ids: string[] }) {
  const { state, closeOverlay, markStoriesSeen, openOverlay, openTab, push } = usePredict()
  const preds = ids.map(getPrediction).filter((p): p is NonNullable<typeof p> => !!p && !!scoreFor(state, p))
  useEffect(() => {
    markStoriesSeen(ids)
  }, [ids, markStoriesSeen])

  const total = preds.reduce((a, p) => a + (scoreFor(state, p)?.points ?? 0), 0)
  const close = () => closeOverlay('result')

  const slides: Slide[] = preds.map((p) => {
    const sc = scoreFor(state, p)!
    const h = resultHeadline(sc)
    return {
      key: p.id,
      bg: sc.kind === 'wrong' ? BG.bad : sc.kind === 'correct' || sc.kind === 'exact' ? BG.great : BG.good,
      body: (
        <div className="flex h-full flex-col justify-center text-center">
          <p className="text-[14px] font-semibold text-white/70">{p.title}</p>
          <p className="mt-6 text-[40px] font-extrabold leading-none tracking-tight">{h.title}</p>
          <p className="mt-3 text-[72px] font-extrabold leading-none tabular-nums">{sc.points}p</p>
          <p className="mt-2 text-[18px] font-semibold">{h.sub}</p>
          <div className="mx-auto mt-6 grid w-full max-w-[300px] grid-cols-2 gap-2 text-left text-[14px]">
            <div className="rounded-[10px] bg-white/10 p-3">
              <p className="text-white/60">Dit gæt</p>
              <p className="font-bold">{formatGuess(state.guesses[p.id]?.value, p.options)}</p>
            </div>
            <div className="rounded-[10px] bg-white/10 p-3">
              <p className="text-white/60">Resultat</p>
              <p className="font-bold">{formatGuess(resultOf(state, p), p.options)}</p>
            </div>
          </div>
          {(sc.underdog > 0 || sc.boosted) && (
            <p className="mt-3 flex items-center justify-center gap-2 text-[14px]">
              {sc.underdog > 0 && <span className="rounded-full bg-white/15 px-3 py-1">+{sc.underdog} underdog-bonus</span>}
              {sc.boosted && (
                <span className="flex items-center gap-1 rounded-full bg-[#FFD56B] px-3 py-1 font-bold text-black">
                  <Zap className="h-3.5 w-3.5" /> 2× boost
                </span>
              )}
            </p>
          )}
        </div>
      ),
    }
  })

  slides.push({
    key: 'sum',
    bg: BG.neutral,
    body: (
      <div className="flex h-full flex-col justify-center text-center">
        <p className="text-[16px] font-semibold text-white/70">Samlet for {preds.length} afgjorte gæt</p>
        <p className="mt-3 text-[80px] font-extrabold leading-none">+{total}p</p>
        <p className="mt-4 text-[15px] text-white/70">Ingen penge – kun point og ære.</p>
      </div>
    ),
  })

  if (preds.length === 0) return null

  return (
    <StoryViewer
      label="Resultater"
      slides={slides}
      onClose={close}
      footer={() => (
        <>
          <Btn
            variant="secondary"
            className="flex-1 !bg-white/15 !text-white"
            onClick={() =>
              openOverlay({
                kind: 'share',
                title: `${total} point i DR Predict`,
                lines: preds.map((p) => `${p.title} – ${scoreFor(state, p)!.points}p`),
                footer: resultHeadline(scoreFor(state, preds[0])!).title,
                text: `Jeg fik ${total} point i DR Predict! Kan du slå mig?`,
              })
            }
          >
            Del resultat
          </Btn>
          <Btn
            className="flex-1 !bg-white !text-black"
            onClick={() => {
              close()
              openTab()
              window.setTimeout(() => push({ name: 'mine' }), 0)
            }}
          >
            Se oversigt
          </Btn>
        </>
      )}
    />
  )
}

export function RecapStory({ fromDay, toDay }: { fromDay: number; toDay: number }) {
  const { state, closeOverlay, openOverlay, openTab, push } = usePredict()
  const items = recapItems(state, fromDay, toDay)
  const points = items.reduce((a, i) => a + i.score.points, 0)
  const leagues = userLeagues(state).filter((l) => l.kind !== 'public')
  const close = () => closeOverlay('recap')

  const slides: Slide[] = [
    {
      key: 'stats',
      bg: BG.great,
      body: (
        <div className="flex h-full flex-col justify-center">
          <h2 className="text-center text-[32px] font-extrabold">Nyt siden sidst</h2>
          <dl className="mt-6 divide-y divide-white/15 rounded-[12px] bg-white/10 text-[18px]">
            {[
              ['Afgjorte gæt', items.length],
              ['Point', points],
              ['Gns. pr. gæt', items.length ? (points / items.length).toFixed(1).replace('.', ',') : '0'],
              ['Rigtige', items.filter((i) => i.score.points > 0).length],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3.5">
                <dt>{k}</dt>
                <dd className="font-extrabold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ),
    },
    {
      key: 'results',
      bg: BG.good,
      body: (
        <div className="py-4">
          <h2 className="text-center text-[28px] font-extrabold">Resultater</h2>
          {items.length === 0 && <p className="mt-6 text-center text-white/70">Ingen afgjorte gæt i perioden.</p>}
          <ul className="mt-4 space-y-2">
            {items.map((i) => (
              <li key={i.prediction.id} className="rounded-[10px] bg-white/10 p-3">
                <p className="text-[14px] font-semibold leading-snug">{i.prediction.title}</p>
                <div className="mt-1 flex items-center justify-between text-[13px] text-white/75">
                  <span>
                    Dit gæt: {formatGuess(i.guess, i.prediction.options)} · Resultat: {formatGuess(i.result, i.prediction.options)}
                  </span>
                  <span className={`text-[16px] font-extrabold ${i.score.points ? 'text-white' : 'text-white/50'}`}>{i.score.points}p</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    ...leagues.map((l) => ({
      key: l.id,
      bg: `linear-gradient(160deg, ${l.color} 0%, #0d0d0d 120%)`,
      body: (
        <div className="py-4">
          <h2 className="text-center text-[28px] font-extrabold">{l.name}</h2>
          {l.kind === 'expert' && <p className="text-center text-[13px] text-white/70">Fiktive DR-eksperter (demo)</p>}
          <div className="mt-4">
            <StandingsMini rows={standings(state, l)} />
          </div>
        </div>
      ),
    })),
  ]

  return (
    <StoryViewer
      label="Sket siden sidst"
      slides={slides}
      onClose={close}
      footer={(i) => {
        const league = leagues[i - 2]
        return (
          <>
            <Btn
              variant="secondary"
              className="flex-1 !bg-white/15 !text-white"
              onClick={() =>
                openOverlay({
                  kind: 'share',
                  title: league ? `Stillingen i ${league.name}` : `${points} point siden sidst`,
                  lines: league
                    ? standings(state, league).slice(0, 5).map((r) => `${r.rank}. ${r.name} – ${r.points}p`)
                    : items.map((it) => `${it.prediction.title} – ${it.score.points}p`),
                  text: league ? `Stillingen i ${league.name} på DR Predict` : `Jeg fik ${points} point i DR Predict`,
                })
              }
            >
              Del
            </Btn>
            <Btn
              className="flex-1 !bg-white !text-black"
              onClick={() => {
                close()
                closeOverlay('daily')
                openTab()
                window.setTimeout(() => push(league ? { name: 'league', id: league.id } : { name: 'mine' }), 0)
              }}
            >
              {league ? 'Gå til liga' : 'Se mine gæt'}
            </Btn>
          </>
        )
      }}
    />
  )
}
