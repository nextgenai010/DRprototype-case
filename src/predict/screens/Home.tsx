import { useMemo, useState } from 'react'
import { ChevronRight, Plus, Search, BookOpen, Sparkles, KeyRound, MapPin, X } from 'lucide-react'
import { usePredict } from '../store'
import { dailyPick, rankedFeed } from '../logic/personalize'
import {
  PREDICTIONS,
  closesAt,
  guessOptionId,
  leagueSummary,
  resolvedDayOf,
  statusOf,
  userLeagues,
  userPointsAt,
} from '../logic/selectors'
import { CATEGORIES, REGION_AVG, REGION_PLAYERS, formatGuess } from '../config/meta'
import { formatCountdown, fmtInt } from '../logic/time'
import type { CategoryId, League } from '../types'
import { Avatar, Btn, CategoryTag, DemoNote, SectionTitle } from '../ui'
import { OptionList } from '../components/Guess'
import { Countdown, PredictionCard } from '../components/PredictionCard'
import { PredictMark } from '../../shared/brand'

function TopBar() {
  const { state, openOverlay, requireLogin, push } = usePredict()
  const pts = userPointsAt(state)
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
      {state.user ? (
        <button type="button" onClick={() => push({ name: 'profile' })} className="flex min-h-[44px] items-center gap-2.5 text-left" aria-label="Åbn din profil">
          <Avatar name={state.user.name} size={40} />
          <span>
            <span className="block text-[13px] text-neutral-500">{state.user.name}</span>
            <span className="block text-[17px] font-extrabold leading-tight">{fmtInt(pts)} point</span>
          </span>
        </button>
      ) : (
        <button type="button" onClick={() => requireLogin(() => undefined)} className="flex min-h-[44px] items-center gap-2.5 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-neutral-400 text-neutral-400">?</span>
          <span>
            <span className="block text-[13px] text-neutral-500">Ikke logget ind</span>
            <span className="block text-[16px] font-extrabold leading-tight underline">Log ind med DR</span>
          </span>
        </button>
      )}
      <button type="button" onClick={() => openOverlay({ kind: 'rules' })} className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-dr-beige px-4 text-[14px] font-bold hover:bg-dr-beigeDark">
        <BookOpen className="h-4 w-4" /> Spilleregler
      </button>
    </div>
  )
}

function DailyHero() {
  const { state, now, push, requireLogin, guess } = usePredict()
  const p = dailyPick(state, now)
  if (!p) return null
  const g = state.guesses[p.id]
  return (
    <section aria-label="Dagens forudsigelse" className="mx-4 overflow-hidden rounded-[14px] bg-black text-white">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[.08em]">
            <PredictMark className="h-4 w-4 text-dr-red" /> Dagens forudsigelse
          </p>
          <Countdown p={p} className="text-[12px] text-white/70" />
        </div>
        <button type="button" onClick={() => push({ name: 'detail', id: p.id })} className="mt-2 block text-left">
          <CategoryTag id={p.category} className="!text-[#FF6B7D]" />
          <h2 className="text-[22px] font-extrabold leading-[1.15]">{p.title}</h2>
        </button>
        <div className="mt-3">
          {p.type === 'score' ? (
            <Btn className="w-full !bg-white !text-black" onClick={() => push({ name: 'detail', id: p.id })}>
              {g ? `Dit gæt: ${formatGuess(g.value, p.options)}` : 'Gæt resultatet'}
            </Btn>
          ) : (
            <OptionList
              p={p}
              dark
              compact
              reveal={!!g}
              selected={guessOptionId(p, g?.value)}
              onPick={(id) => requireLogin(() => guess(p.id, id), 'for at gemme dit gæt')}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function MyGuesses() {
  const { state, now, push, requireLogin } = usePredict()
  if (!state.user) {
    return (
      <div className="mx-4 rounded-[14px] bg-dr-beige p-4">
        <p className="text-[15px]">Log ind med dit DR-login for at gemme dine gæt, få point og dyste i ligaer.</p>
        <Btn className="mt-3 w-full" onClick={() => requireLogin(() => undefined)}>
          Log ind med DR
        </Btn>
      </div>
    )
  }
  const open = PREDICTIONS.filter((p) => state.guesses[p.id] && statusOf(state, p, now) !== 'resolved').sort((a, b) => closesAt(state, a) - closesAt(state, b))
  return (
    <div className="mx-4 overflow-hidden rounded-[14px] ring-1 ring-neutral-200">
      {open.length === 0 && <p className="p-4 text-[15px] text-neutral-600">Ingen åbne gæt lige nu.</p>}
      <ul className="divide-y divide-neutral-200">
        {open.slice(0, 4).map((p) => {
          const status = statusOf(state, p, now)
          return (
            <li key={p.id}>
              <button type="button" onClick={() => push({ name: 'detail', id: p.id })} className="flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{p.title}</span>
                  <span className="block text-[13px] text-neutral-500">
                    {status === 'open' ? `Åben · lukker om ${formatCountdown(closesAt(state, p) - now)}` : 'Lukket · afventer resultat'}
                  </span>
                </span>
                <span className="shrink-0 rounded-[6px] bg-dr-beige px-2 py-1 text-[14px] font-extrabold">{formatGuess(state.guesses[p.id].value, p.options)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => push({ name: 'mine' })} className="flex min-h-[48px] w-full items-center justify-center border-t border-neutral-200 text-[14px] font-bold hover:bg-neutral-50">
        Se alle mine gæt
      </button>
    </div>
  )
}

function SinceLast() {
  const { state, openOverlay } = usePredict()
  if (!state.user) return null
  const unseen = PREDICTIONS.filter((p) => state.resolutions[p.id] && state.guesses[p.id] && !state.seenStories.includes(p.id)).map((p) => p.id)
  const count = PREDICTIONS.filter((p) => {
    const d = resolvedDayOf(state, p)
    return d !== undefined && d > state.dayOffset - 7 && state.guesses[p.id]
  }).length
  return (
    <div className="mx-4 space-y-2">
      {unseen.length > 0 && (
        <button type="button" onClick={() => openOverlay({ kind: 'result', ids: unseen })} className="flex min-h-[60px] w-full items-center gap-3 rounded-[14px] bg-dr-red px-4 text-left text-white">
          <Sparkles className="h-6 w-6" />
          <span className="flex-1">
            <span className="block text-[16px] font-extrabold">{unseen.length} nye resultater</span>
            <span className="block text-[13px] opacity-85">Se hvor mange point du fik</span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => openOverlay({ kind: 'recap', fromDay: state.dayOffset - 7, toDay: state.dayOffset })}
        className="flex min-h-[60px] w-full items-center gap-3 rounded-[14px] bg-dr-beige px-4 text-left hover:bg-dr-beigeDark"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
          <PredictMark className="h-5 w-5" />
          <span className="absolute inset-[-3px] rounded-full border-2 border-dr-red" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-[16px] font-bold">Sket siden sidst</span>
          <span className="block text-[13px] text-neutral-600">{count} afgjorte gæt de sidste 7 dage</span>
        </span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function LeagueCard({ league }: { league: League }) {
  const { state, push } = usePredict()
  const s = leagueSummary(state, league)
  return (
    <button
      type="button"
      onClick={() => push({ name: 'league', id: league.id })}
      className="flex h-[132px] w-[150px] shrink-0 snap-start flex-col justify-between rounded-[14px] bg-dr-beige p-3 text-left hover:bg-dr-beigeDark"
    >
      <span>
        <span className="mb-2 block h-1.5 w-8 rounded-full" style={{ background: league.color }} />
        <span className="block text-[16px] font-extrabold leading-tight">{league.name}</span>
        {league.kind === 'expert' && <span className="block text-[11px] text-neutral-500">Fiktive eksperter</span>}
      </span>
      <span className="text-[13px]">
        Nr. <strong className="text-[16px]">{fmtInt(s.rank)}</strong> af {fmtInt(s.of)}
        {s.move !== 0 && <span className={`ml-1 font-bold ${s.move > 0 ? 'text-[#0E8A5F]' : 'text-dr-red'}`}>{s.move > 0 ? `▲${s.move}` : `▼${-s.move}`}</span>}
      </span>
    </button>
  )
}

function MyLeagues() {
  const { state, openOverlay, requireLogin } = usePredict()
  const leagues = userLeagues(state)
  return (
    <section aria-label="Mine ligaer">
      <SectionTitle
        action={
          <button
            type="button"
            aria-label="Opret liga"
            onClick={() => requireLogin(() => openOverlay({ kind: 'createLeague' }), 'for at oprette en liga')}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black hover:bg-black hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      >
        Mine ligaer
      </SectionTitle>
      {leagues.length === 0 ? (
        <p className="px-4 text-[15px] text-neutral-600">Log ind for at se dine ligaer og dyste mod venner.</p>
      ) : (
        <div className="no-scrollbar flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1">
          {leagues.map((l) => (
            <LeagueCard key={l.id} league={l} />
          ))}
        </div>
      )}
      <div className="px-4 pt-2">
        <button
          type="button"
          onClick={() => requireLogin(() => openOverlay({ kind: 'joinLeague' }), 'for at deltage i en liga')}
          className="flex min-h-[44px] items-center gap-2 text-[14px] font-bold text-dr-red"
        >
          <KeyRound className="h-4 w-4" /> Deltag med kode
        </button>
      </div>
    </section>
  )
}

function DanmarkBlock() {
  const { push, state, now } = usePredict()
  const best = Object.entries(REGION_AVG)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  const p = dailyPick(state, now) ?? PREDICTIONS[0]
  const top = [...p.options].sort((a, b) => b.community - a.community)[0]
  return (
    <section aria-label="Hele Danmark gætter">
      <SectionTitle
        action={
          <button type="button" onClick={() => push({ name: 'danmark' })} className="flex min-h-[44px] items-center text-[14px] font-bold text-dr-red">
            Se mere <ChevronRight className="h-4 w-4" />
          </button>
        }
      >
        Hele Danmark gætter
      </SectionTitle>
      <div className="no-scrollbar flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4">
        <div className="w-[240px] shrink-0 snap-start rounded-[14px] bg-dr-beige p-4">
          <p className="text-[15px] font-extrabold">Bedste landsdel</p>
          <p className="text-[12px] text-neutral-500">Gns. point pr. gæt</p>
          <ol className="mt-2 space-y-1.5 text-[14px]">
            {best.map(([r, v], i) => (
              <li key={r} className="flex justify-between border-b border-black/10 pb-1.5 last:border-0">
                <span>
                  {i + 1}. {r}
                </span>
                <strong className="tabular-nums">{v.toString().replace('.', ',')}</strong>
              </li>
            ))}
          </ol>
        </div>
        <button type="button" onClick={() => push({ name: 'danmark', id: p.id })} className="w-[220px] shrink-0 snap-start rounded-[14px] bg-dr-beige p-4 text-left hover:bg-dr-beigeDark">
          <p className="text-[15px] font-extrabold leading-tight">{p.title}</p>
          <p className="mt-3 text-[40px] font-extrabold leading-none">{top.community}%</p>
          <p className="mt-1 text-[13px]">af danskerne gætter "{top.label}"</p>
        </button>
        <button type="button" onClick={() => push({ name: 'danmark' })} className="w-[220px] shrink-0 snap-start rounded-[14px] bg-black p-4 text-left text-white">
          <MapPin className="h-6 w-6 text-dr-red" />
          <p className="mt-2 text-[16px] font-extrabold leading-tight">Hvor er Bornholm?</p>
          <p className="mt-1 text-[13px] text-white/75">Bornholm har kun {REGION_PLAYERS.Bornholm} spillere i denne uge – udfordr en bornholmer!</p>
        </button>
      </div>
      <DemoNote className="px-4 pt-2">Demodata – ikke rigtige danskeres holdninger.</DemoNote>
    </section>
  )
}

function Feed() {
  const { state, now } = usePredict()
  const [cat, setCat] = useState<CategoryId | 'alle'>('alle')
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const ranked = useMemo(() => rankedFeed(state, now), [state, now])
  const list = ranked.filter((r) => (cat === 'alle' || r.prediction.category === cat) && (!q || `${r.prediction.title} ${r.prediction.description}`.toLowerCase().includes(q.toLowerCase())))

  return (
    <section aria-label="Alle forudsigelser">
      <SectionTitle
        action={
          <button
            type="button"
            aria-label={searchOpen ? 'Luk søgning' : 'Søg i forudsigelser'}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen(!searchOpen)
              setQ('')
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        }
      >
        Forudsigelser
      </SectionTitle>
      {searchOpen && (
        <div className="px-4 pb-3">
          <label className="sr-only" htmlFor="predict-search">
            Søg
          </label>
          <input
            id="predict-search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søg fx håndbold, MGP, inflation"
            className="h-12 w-full border-2 border-black px-3 text-[16px]"
          />
        </div>
      )}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3" role="group" aria-label="Filtrer kategori">
        {[{ id: 'alle' as const, label: 'Alle' }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`min-h-[40px] shrink-0 border-2 border-black px-3.5 text-[14px] font-semibold ${cat === c.id ? 'bg-black text-white' : 'bg-white'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 px-4">
        {list.map((r) => (
          <PredictionCard key={r.prediction.id} p={r.prediction} reason={r.reason} />
        ))}
        {list.length === 0 && <p className="py-6 text-center text-[15px] text-neutral-600">Ingen forudsigelser matcher.</p>}
      </div>
    </section>
  )
}

export function Home() {
  return (
    <div className="pb-8">
      <TopBar />
      <p className="px-4 pt-2 text-[11px] text-neutral-400">Prototype – ikke et officielt DR-produkt · Ingen penge – kun point og ære</p>
      <div className="space-y-7 pt-3">
        <DailyHero />
        <section aria-label="Mine gæt">
          <SectionTitle>Mine gæt</SectionTitle>
          <MyGuesses />
        </section>
        <SinceLast />
        <MyLeagues />
        <DanmarkBlock />
        <Feed />
      </div>
    </div>
  )
}
