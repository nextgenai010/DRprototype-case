import { useState } from 'react'
import { usePredict } from '../store'
import { PREDICTIONS, closesAt, resolvedDayOf, scoreFor, statusOf, userPointsAt } from '../logic/selectors'
import { formatCountdown, fmtInt } from '../logic/time'
import { formatGuess } from '../config/meta'
import { BackButton, Btn, CategoryTag } from '../ui'

export function Mine() {
  const { state, now, back, push, requireLogin } = usePredict()
  const [tab, setTab] = useState<'open' | 'done'>('open')
  const guessed = PREDICTIONS.filter((p) => state.guesses[p.id])
  const open = guessed.filter((p) => statusOf(state, p, now) !== 'resolved').sort((a, b) => closesAt(state, a) - closesAt(state, b))
  const done = guessed.filter((p) => statusOf(state, p, now) === 'resolved').sort((a, b) => (resolvedDayOf(state, b) ?? 0) - (resolvedDayOf(state, a) ?? 0))
  const list = tab === 'open' ? open : done

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-1 backdrop-blur">
        <BackButton onClick={back} />
        <span className="text-[15px] font-bold">Mine gæt</span>
        <span className="w-11" />
      </div>
      {!state.user ? (
        <div className="p-4">
          <p className="text-[15px]">Log ind for at se dine gæt.</p>
          <Btn className="mt-3 w-full" onClick={() => requireLogin(() => undefined)}>
            Log ind med DR
          </Btn>
        </div>
      ) : (
        <>
          <div className="px-4 pt-4">
            <p className="text-[13px] text-neutral-500">Samlet</p>
            <p className="text-[32px] font-extrabold leading-none">{fmtInt(userPointsAt(state))} point</p>
          </div>
          <div className="mt-4 flex border-b border-neutral-200 px-4" role="tablist">
            {(
              [
                ['open', `Åbne (${open.length})`],
                ['done', `Afsluttede (${done.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`-mb-px min-h-[48px] border-b-[3px] px-3 text-[15px] ${tab === id ? 'border-black font-bold' : 'border-transparent text-neutral-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-neutral-200" role="tabpanel">
            {list.map((p) => {
              const sc = scoreFor(state, p)
              const st = statusOf(state, p, now)
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => push({ name: 'detail', id: p.id })} className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50">
                    <span className="min-w-0 flex-1">
                      <CategoryTag id={p.category} className="!text-[12px]" />
                      <span className="block text-[15px] font-bold leading-snug">{p.title}</span>
                      <span className="block text-[13px] text-neutral-500">
                        Dit gæt: <strong className="text-black">{formatGuess(state.guesses[p.id].value, p.options)}</strong>
                        {st === 'open' && ` · lukker om ${formatCountdown(closesAt(state, p) - now)} · kan rettes`}
                        {st === 'closed' && ' · afventer resultat'}
                      </span>
                    </span>
                    {sc ? (
                      <span className={`shrink-0 rounded-[6px] px-2 py-1 text-[15px] font-extrabold ${sc.points ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                        {sc.points}p
                      </span>
                    ) : (
                      <span className="shrink-0 text-[13px] font-bold text-dr-red">{st === 'open' ? 'Ret' : '…'}</span>
                    )}
                  </button>
                </li>
              )
            })}
            {list.length === 0 && <li className="p-6 text-center text-[15px] text-neutral-600">Ingen gæt her endnu.</li>}
          </ul>
        </>
      )}
    </div>
  )
}
