import { useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import { usePredict } from '../store'
import { PREDICTIONS, getPrediction, statusOf } from '../logic/selectors'
import { byAge, byFriends, byRegion, type GroupRow } from '../logic/aggregates'
import { AGE_PLAYERS, REGION_AVG, REGION_PLAYERS } from '../config/meta'
import { dailyPick } from '../logic/personalize'
import { fmtInt } from '../logic/time'
import { BackButton, Btn, DemoNote } from '../ui'
import type { Prediction } from '../types'

const SERIES = ['#111111', '#D6001C', '#9A9A9A', '#E0A12B']

function Legend({ p }: { p: Prediction }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
      {p.options.map((o, i) => (
        <li key={o.id} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: SERIES[i] }} aria-hidden="true" />
          {o.label}
        </li>
      ))}
    </ul>
  )
}

function StackedRow({ label, shares, p, mark }: { label: string; shares: number[]; p: Prediction; mark?: boolean }) {
  return (
    <li>
      <div className="mb-1 flex justify-between text-[14px]">
        <span className={mark ? 'font-bold' : ''}>
          {label}
          {mark && <span className="text-dr-red"> · dig</span>}
        </span>
        <span className="text-neutral-500">{p.options[0].label.split(' ')[0]} {shares[0]}%</span>
      </div>
      <div className="flex h-5 w-full overflow-hidden rounded-[4px]" role="img" aria-label={`${label}: ${p.options.map((o, i) => `${o.label} ${shares[i]}%`).join(', ')}`}>
        {shares.map((s, i) => (
          <span key={p.options[i].id} style={{ width: `${s}%`, background: SERIES[i] }} className="h-full transition-[width] duration-700 motion-reduce:transition-none" />
        ))}
      </div>
    </li>
  )
}

export function Danmark({ id }: { id?: string }) {
  const { state, now, back, showToast, openOverlay, requireLogin } = usePredict()
  const initial = (id && getPrediction(id)) || dailyPick(state, now) || PREDICTIONS[0]
  const [pid, setPid] = useState(initial.id)
  const [tab, setTab] = useState<'alder' | 'landsdel' | 'venner'>('landsdel')
  const p = getPrediction(pid)!
  const choices = PREDICTIONS.filter((x) => statusOf(state, x, now) === 'open')
  const rows: GroupRow[] = tab === 'alder' ? byAge(p) : tab === 'landsdel' ? byRegion(p) : []
  const friends = byFriends(state, p)
  const all = p.options.map((o) => o.community)
  const best = Object.entries(REGION_AVG).sort((a, b) => b[1] - a[1])
  const maxPlayers = Math.max(...Object.values(REGION_PLAYERS))
  const maxAge = Math.max(...Object.values(AGE_PLAYERS))

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-1 backdrop-blur">
        <BackButton onClick={back} />
        <span className="text-[15px] font-bold">Hele Danmark gætter</span>
        <span className="w-11" />
      </div>
      <header className="bg-dr-beige px-4 pb-5 pt-5">
        <h1 className="text-[28px] font-extrabold leading-tight">Forskellige steder. Samme spørgsmål.</h1>
        <p className="mt-1 text-[15px] text-neutral-700">Se hvordan aldersgrupper og landsdele gætter – og hvor I er enige.</p>
        <p className="mt-2 inline-block rounded bg-[#FFF2B3] px-2 py-0.5 text-[12px] font-bold">Demodata – ikke rigtige danskeres holdninger</p>
      </header>

      <section className="px-4 pt-5" aria-label="Fordeling">
        <label className="block text-[14px] font-semibold" htmlFor="dk-pick">
          Forudsigelse
        </label>
        <select id="dk-pick" value={pid} onChange={(e) => setPid(e.target.value)} className="mt-1 h-12 w-full border-2 border-black bg-white px-2 text-[15px]">
          {[p, ...choices.filter((c) => c.id !== p.id)].map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <div className="mt-4 flex gap-1 rounded-full bg-neutral-100 p-1" role="tablist">
          {(
            [
              ['landsdel', 'Landsdele'],
              ['alder', 'Alder'],
              ['venner', 'Venner vs. Danmark'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`min-h-[40px] flex-1 rounded-full text-[13px] font-semibold ${tab === k ? 'bg-black text-white' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Legend p={p} />
        </div>
        <ul className="mt-3 space-y-3" role="tabpanel">
          {tab === 'venner' ? (
            <>
              <StackedRow label="Hele Danmark" shares={all} p={p} />
              {state.user && friends.count > 0 ? (
                <StackedRow label={`Dine venner (${friends.count})`} shares={friends.shares} p={p} />
              ) : (
                <li className="rounded-[12px] bg-dr-beige p-3 text-[14px]">
                  Log ind og deltag i en liga for at sammenligne med dine venner.
                  <Btn className="mt-2 w-full" onClick={() => requireLogin(() => undefined)}>
                    Log ind med DR
                  </Btn>
                </li>
              )}
            </>
          ) : (
            rows.map((r) => (
              <StackedRow
                key={r.group}
                label={r.group}
                shares={r.shares}
                p={p}
                mark={!!state.user && (tab === 'alder' ? state.user.ageGroup : state.user.region) === r.group}
              />
            ))
          )}
        </ul>
        <p className="mt-3 text-[13px] text-neutral-500">Fordelingen viser hvad spillerne tror – ikke en sandsynlighed. Der vises aldrig partipolitiske opdelinger.</p>
      </section>

      <section className="mt-8 px-4" aria-label="Bedste landsdel">
        <h2 className="text-[20px] font-extrabold">Bedste landsdel</h2>
        <p className="text-[13px] text-neutral-500">Gennemsnitlige point pr. gæt denne sæson</p>
        <ol className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
          {best.map(([r, v], i) => (
            <li key={r} className={`flex min-h-[48px] items-center gap-3 text-[15px] ${state.user?.region === r ? 'bg-dr-beige font-bold' : ''}`}>
              <span className="w-6 pl-1 font-bold tabular-nums">{i + 1}.</span>
              <span className="flex-1">{r}</span>
              <span className="pr-1 font-extrabold tabular-nums">{v.toString().replace('.', ',')}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 px-4" aria-label="Hvem spiller med">
        <h2 className="text-[20px] font-extrabold">Hvem spiller med?</h2>
        <p className="text-[13px] text-neutral-500">Spillere pr. landsdel i denne uge</p>
        <ul className="mt-3 space-y-2">
          {Object.entries(REGION_PLAYERS).map(([r, n]) => (
            <li key={r} className="text-[14px]">
              <div className="flex justify-between">
                <span className={r === 'Bornholm' || r === 'Syd- og Sønderjylland' ? 'font-bold' : ''}>{r}</span>
                <span className="tabular-nums">{fmtInt(n)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-neutral-100">
                <div className={`h-2 rounded-full ${r === 'Bornholm' || r === 'Syd- og Sønderjylland' ? 'bg-dr-red' : 'bg-neutral-400'}`} style={{ width: `${Math.max(1.5, (n / maxPlayers) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-[14px] bg-black p-4 text-white">
          <MapPin className="h-6 w-6 text-dr-red" />
          <p className="mt-2 text-[20px] font-extrabold leading-tight">Hvor er Bornholm?</p>
          <p className="mt-1 text-[15px] text-white/80">
            Bornholm har kun {REGION_PLAYERS.Bornholm} spillere i denne uge – men de gætter godt (61 point pr. gæt). Kender du en bornholmer? Udfordr dem!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn className="!bg-white !text-black" onClick={() => requireLogin(() => openOverlay({ kind: 'createLeague' }), 'for at oprette en liga')}>
              Udfordr en bornholmer
            </Btn>
            <Btn variant="ghost" className="!text-white" onClick={() => showToast('Tak! Syd- og Sønderjylland er også velkomne 🙌')}>
              Hils Sønderjylland
            </Btn>
          </div>
        </div>
      </section>

      <section className="mt-8 px-4" aria-label="Alder">
        <h2 className="text-[20px] font-extrabold">Spillere pr. aldersgruppe</h2>
        <div className="mt-3 flex h-40 items-end gap-1.5" role="img" aria-label="Søjlediagram over spillere pr. aldersgruppe">
          {Object.entries(AGE_PLAYERS).map(([a, n]) => (
            <div key={a} className="flex flex-1 flex-col items-center gap-1">
              <div className={`w-full rounded-t-[3px] ${state.user?.ageGroup === a ? 'bg-dr-red' : 'bg-black'}`} style={{ height: `${(n / maxAge) * 120}px` }} />
              <span className="text-[10px] text-neutral-600">{a}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[13px] text-neutral-500">
          <Users className="h-3.5 w-3.5" /> Flest spillere er 30–59 år. Alle aldre er velkomne.
        </p>
      </section>
      <DemoNote className="px-4 pt-5">Alle tal på denne side er syntetiske demodata – ikke rigtige danskeres holdninger.</DemoNote>
    </div>
  )
}
