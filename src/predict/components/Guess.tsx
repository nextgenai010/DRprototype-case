import { useState } from 'react'
import { Check, Minus, Plus, Zap, Pencil } from 'lucide-react'
import { usePredict } from '../store'
import type { GuessValue, Prediction, ScoreValue } from '../types'
import { currentWeek, guessOptionId, isBoosted, resultOf, scoreFor, statusOf } from '../logic/selectors'
import { formatGuess } from '../config/meta'
import { PctBar, Btn } from '../ui'
import { resultHeadline } from '../logic/scoring'

/** Option buttons; once revealed they turn into community-distribution bars. */
export function OptionList({
  p,
  selected,
  correct,
  reveal,
  disabled,
  onPick,
  dark = false,
  compact = false,
}: {
  p: Prediction
  selected?: string
  correct?: string
  reveal: boolean
  disabled?: boolean
  onPick?: (id: string) => void
  dark?: boolean
  compact?: boolean
}) {
  return (
    <ul className={`flex ${p.type === 'yesno' && !reveal ? 'flex-row' : 'flex-col'} gap-2`}>
      {p.options.map((o) => {
        const isSel = selected === o.id
        const isCorrect = correct === o.id
        const base = dark
          ? isSel
            ? 'border-white bg-white text-black'
            : 'border-white/25 bg-white/5 text-white hover:bg-white/10'
          : isSel
            ? 'border-black bg-black text-white'
            : 'border-neutral-300 bg-white text-black hover:border-black'
        return (
          <li key={o.id} className="flex-1">
            {reveal ? (
              <div
                className={`rounded-[10px] border px-3 py-2.5 ${isSel ? (dark ? 'border-white' : 'border-black') : dark ? 'border-white/20' : 'border-neutral-200'} ${isCorrect ? 'ring-2 ring-[#0E8A5F]' : ''}`}
                aria-label={`${o.label}: ${o.community} procent${isSel ? ', dit gæt' : ''}${isCorrect ? ', rigtigt svar' : ''}`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[15px]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {isSel && <Check className="h-4 w-4 text-dr-red" strokeWidth={3} aria-hidden="true" />}
                    {o.label}
                    {isCorrect && <span className="rounded bg-[#0E8A5F] px-1.5 text-[11px] font-bold text-white">Resultat</span>}
                  </span>
                  <span className="font-bold tabular-nums">{o.community}%</span>
                </div>
                <PctBar pct={o.community} highlight={isSel} dark={dark} />
              </div>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick?.(o.id)}
                aria-pressed={isSel}
                className={`flex w-full items-center justify-center rounded-[10px] border-2 px-3 text-center font-bold transition-colors disabled:opacity-50 ${compact ? 'min-h-[48px] text-[15px]' : 'min-h-[56px] text-[17px]'} ${base}`}
              >
                {o.label}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="line-clamp-1 text-center text-[14px] font-semibold">{label}</span>
      <button type="button" aria-label={`Flere mål til ${label}`} onClick={() => onChange(Math.min(15, value + 1))} className="flex h-11 w-11 items-center justify-center rounded-full bg-dr-beige hover:bg-dr-beigeDark">
        <Plus className="h-5 w-5" />
      </button>
      <span className="text-[44px] font-extrabold leading-none tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label={`Færre mål til ${label}`} onClick={() => onChange(Math.max(0, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-full bg-dr-beige hover:bg-dr-beigeDark">
        <Minus className="h-5 w-5" />
      </button>
    </div>
  )
}

export function ScorePicker({ p, initial, onSave, saveLabel = 'Gem mit gæt' }: { p: Prediction; initial?: ScoreValue; onSave: (v: ScoreValue) => void; saveLabel?: string }) {
  const [v, setV] = useState<ScoreValue>(initial ?? { home: 0, away: 0 })
  return (
    <div className="rounded-[12px] bg-white p-4 ring-1 ring-neutral-200">
      <div className="flex items-center gap-2">
        <Stepper label={p.teams?.home ?? 'Hjemme'} value={v.home} onChange={(home) => setV({ ...v, home })} />
        <span className="pt-6 text-[32px] font-bold text-neutral-400">–</span>
        <Stepper label={p.teams?.away ?? 'Ude'} value={v.away} onChange={(away) => setV({ ...v, away })} />
      </div>
      <p className="mt-3 text-center text-[14px] text-neutral-600">
        Mit gæt: <strong className="text-black">{v.home}–{v.away}</strong>
      </p>
      <Btn className="mt-3 w-full" onClick={() => onSave(v)}>
        {saveLabel}
      </Btn>
    </div>
  )
}

/** Full guessing module used on the detail page. Handles login, edit until close, and Ugens boost. */
export function GuessModule({ p }: { p: Prediction }) {
  const { state, now, guess, requireLogin, toggleBoost, showToast } = usePredict()
  const g = state.guesses[p.id]
  const status = statusOf(state, p, now)
  const [editing, setEditing] = useState(false)
  const result = resultOf(state, p)
  const sc = scoreFor(state, p)
  const boosted = isBoosted(state, p.id)
  const weekBoost = state.boosts[currentWeek(state)]

  const save = (value: GuessValue) => {
    const wasEdit = !!g
    requireLogin(() => {
      guess(p.id, value)
      setEditing(false)
      showToast(wasEdit ? 'Dit gæt er rettet' : 'Dit gæt er gemt')
    }, 'for at gemme dit gæt')
  }

  const showPicker = status === 'open' && (!g || editing)

  return (
    <section aria-label="Dit gæt" className="rounded-[14px] bg-dr-beige p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-extrabold">{showPicker ? (g ? 'Ret mit gæt' : 'Hvad tror du?') : 'Dit gæt'}</h2>
        {g && status === 'open' && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="flex min-h-[44px] items-center gap-1.5 text-[14px] font-bold text-dr-red">
            <Pencil className="h-4 w-4" /> Ret mit gæt
          </button>
        )}
      </div>

      {p.type === 'score' ? (
        showPicker ? (
          <ScorePicker p={p} initial={typeof g?.value === 'object' ? g.value : p.communityScore} onSave={save} saveLabel={g ? 'Gem rettelse' : 'Gem mit gæt'} />
        ) : (
          <div className="rounded-[12px] bg-white p-4 text-center ring-1 ring-neutral-200">
            <p className="text-[13px] text-neutral-500">Mit gæt</p>
            <p className="text-[36px] font-extrabold tabular-nums">{g ? formatGuess(g.value, p.options) : '–'}</p>
            {result !== undefined && <p className="text-[14px]">Resultat: <strong>{formatGuess(result, p.options)}</strong></p>}
            <div className="mt-3 text-left">
              <OptionList p={p} reveal selected={guessOptionId(p, g?.value)} correct={guessOptionId(p, result)} />
            </div>
          </div>
        )
      ) : (
        <OptionList
          p={p}
          reveal={!showPicker}
          selected={typeof g?.value === 'string' ? g.value : undefined}
          correct={typeof result === 'string' ? result : undefined}
          disabled={status !== 'open'}
          onPick={(id) => save(id)}
        />
      )}

      {editing && (
        <button type="button" onClick={() => setEditing(false)} className="mt-2 min-h-[44px] w-full text-[14px] font-semibold underline">
          Fortryd
        </button>
      )}

      {status === 'closed' && <p className="mt-3 text-[14px] text-neutral-700">Lukket for gæt – afventer officielt resultat.</p>}

      {sc && (
        <div className="mt-3 flex items-center justify-between rounded-[10px] bg-white px-3 py-2.5 ring-1 ring-neutral-200">
          <span className="text-[15px] font-bold">{resultHeadline(sc).title}</span>
          <span className="text-[18px] font-extrabold">
            {sc.points}p{sc.boosted && <span className="ml-1 text-[12px] text-dr-red">2× boost</span>}
          </span>
        </div>
      )}

      {g && status === 'open' && state.user && (
        <button
          type="button"
          onClick={() => toggleBoost(p.id)}
          aria-pressed={boosted}
          className={`mt-3 flex min-h-[48px] w-full items-center justify-between rounded-[10px] px-3 text-left text-[14px] ring-1 ${boosted ? 'bg-black text-white ring-black' : 'bg-white ring-neutral-200'}`}
        >
          <span className="flex items-center gap-2 font-bold">
            <Zap className={`h-5 w-5 ${boosted ? 'fill-[#FFD56B] text-[#FFD56B]' : ''}`} />
            {boosted ? 'Ugens boost er sat her – 2× point' : 'Brug ugens boost her (2× point)'}
          </span>
          {!boosted && weekBoost && <span className="text-[12px] text-neutral-500">Flytter boost</span>}
        </button>
      )}
    </section>
  )
}
