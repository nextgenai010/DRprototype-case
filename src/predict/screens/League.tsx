import { useState } from 'react'
import { ArrowDown, ArrowUp, Minus, Plus, SmilePlus, Share2, UserPlus, Flame, Target } from 'lucide-react'
import { usePredict } from '../store'
import { PREDICTIONS, allLeagues, leagueSummary, memberPointsAt, scoreFor, standings, type StandingRow } from '../logic/selectors'
import { fmtInt } from '../logic/time'
import { Avatar, BackButton, Btn, DemoNote } from '../ui'

function Move({ move }: { move: number }) {
  if (move > 0)
    return (
      <span className="flex items-center justify-end font-bold text-[#0E8A5F]" aria-label={`${move} op`}>
        <ArrowUp className="h-4 w-4" />
        {move}
      </span>
    )
  if (move < 0)
    return (
      <span className="flex items-center justify-end font-bold text-dr-red" aria-label={`${-move} ned`}>
        <ArrowDown className="h-4 w-4" />
        {-move}
      </span>
    )
  return (
    <span className="flex justify-end text-neutral-400" aria-label="uændret">
      <Minus className="h-4 w-4" />
    </span>
  )
}

function Row({ r, reaction }: { r: StandingRow; reaction?: string }) {
  return (
    <li className={`flex min-h-[60px] items-center gap-3 px-4 py-2 ${r.isUser ? 'bg-dr-beige' : ''}`}>
      <span className="w-8 text-[15px] font-bold tabular-nums">{fmtInt(r.rank)}</span>
      <Avatar name={r.name} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">
          {r.name}
          {r.isUser && ' (dig)'} {reaction && <span aria-label={`reaktion ${reaction}`}>{reaction}</span>}
        </span>
        {r.role && <span className="block text-[12px] text-neutral-500">{r.role}</span>}
      </span>
      <span className="text-right">
        <span className="block text-[11px] text-neutral-500">Total</span>
        <span className="block text-[15px] font-extrabold tabular-nums">{fmtInt(r.points)}</span>
      </span>
      <span className="w-9 text-[14px]">
        <Move move={r.move} />
      </span>
    </li>
  )
}

export function LeagueScreen({ id }: { id: string }) {
  const { state, back, openOverlay } = usePredict()
  const [all, setAll] = useState(false)
  const league = allLeagues(state).find((l) => l.id === id)
  if (!league) return <p className="p-4">Ligaen findes ikke.</p>

  const rows = standings(state, league)
  const summary = leagueSummary(state, league)
  const isPublic = league.kind === 'public'
  const me = rows.find((r) => r.isUser)
  const meRow: StandingRow | undefined = isPublic && me ? { ...me, rank: summary.rank, move: summary.move } : me
  const visible = isPublic ? rows.filter((r) => !r.isUser).slice(0, all ? 5 : 3) : all ? rows : rows.slice(0, 5)

  const streak = [...league.members].sort((a, b) => memberPointsAt(b, state.dayOffset) - memberPointsAt(a, state.dayOffset))[0]
  const underdog = PREDICTIONS.map((p) => ({ p, sc: scoreFor(state, p) }))
    .filter((x) => x.sc && x.sc.underdog > 0)
    .sort((a, b) => b.sc!.points - a.sc!.points)[0]

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-1 backdrop-blur">
        <BackButton onClick={back} />
        <span className="text-[15px] font-bold">{league.name}</span>
        {league.code ? (
          <button type="button" aria-label="Inviter venner" onClick={() => openOverlay({ kind: 'invite', leagueId: league.id })} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5">
            <UserPlus className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-11" />
        )}
      </div>

      <header className="px-4 pb-4 pt-5 text-white" style={{ background: league.color }}>
        <p className="text-[13px] font-semibold opacity-80">
          {isPublic ? 'Alle spillere' : league.kind === 'expert' ? 'DR-eksperter (fiktive demo-spillere)' : `Privat liga · kode ${league.code}`}
        </p>
        <h1 className="text-[30px] font-extrabold leading-tight">{league.name}</h1>
        <p className="mt-1 text-[15px]">
          Du er nr. <strong>{fmtInt(summary.rank)}</strong> af {fmtInt(summary.of)}
          {summary.move !== 0 && <span className="ml-1 font-bold">{summary.move > 0 ? `▲${summary.move}` : `▼${-summary.move}`} siden i går</span>}
        </p>
      </header>

      <ol className="divide-y divide-neutral-200 border-b border-neutral-200" aria-label="Stilling">
        {visible.map((r) => (
          <Row key={r.id} r={r} reaction={r.isUser ? state.reactions[league.id] : undefined} />
        ))}
        {isPublic && meRow && (
          <>
            <li className="px-4 py-1 text-center text-neutral-400" aria-hidden="true">
              ⋯
            </li>
            <Row r={meRow} reaction={state.reactions[league.id]} />
          </>
        )}
      </ol>
      {(isPublic || rows.length > 5) && (
        <button type="button" onClick={() => setAll(!all)} className="flex min-h-[48px] w-full items-center justify-center gap-1 text-[14px] font-bold" aria-expanded={all}>
          {all ? 'Vis færre' : 'Se hele stillingen'} <Plus className={`h-4 w-4 transition-transform ${all ? 'rotate-45' : ''}`} />
        </button>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2 px-4">
        <Btn variant="secondary" className="whitespace-nowrap !px-3 !text-[15px]" onClick={() => openOverlay({ kind: 'emoji', leagueId: league.id })}>
          <SmilePlus className="h-5 w-5" /> Tilføj reaktion
        </Btn>
        <Btn
          variant="secondary"
          className="whitespace-nowrap !px-3 !text-[15px]"
          onClick={() =>
            openOverlay({
              kind: 'share',
              title: `Stillingen i ${league.name}`,
              lines: (isPublic ? (meRow ? [meRow] : []) : rows.slice(0, 5)).map((r) => `${fmtInt(r.rank)}. ${r.name}${r.isUser ? ' (mig)' : ''} – ${r.points}p`),
              footer: me ? `Jeg er nr. ${fmtInt(summary.rank)}` : undefined,
              text: `Jeg er nr. ${fmtInt(summary.rank)} i ${league.name} på DR Predict!`,
            })
          }
        >
          <Share2 className="h-5 w-5" /> Del stilling
        </Btn>
      </div>

      <section aria-label="Sjove ligastats" className="mt-7">
        <h2 className="px-4 text-[20px] font-extrabold">Sjove ligastats</h2>
        <div className="no-scrollbar mt-3 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4">
          <div className="w-[220px] shrink-0 snap-start rounded-[14px] bg-dr-beige p-4">
            <Flame className="h-6 w-6 text-dr-red" />
            <p className="mt-6 text-[13px] text-neutral-600">Længste pointstreak</p>
            <p className="text-[22px] font-extrabold leading-tight">{streak?.name ?? state.user?.name}</p>
            <p className="text-[13px]">Point i 6 gæt i streg</p>
          </div>
          <div className="w-[220px] shrink-0 snap-start rounded-[14px] bg-dr-beige p-4">
            <Target className="h-6 w-6 text-dr-red" />
            <p className="mt-6 text-[13px] text-neutral-600">Bedste underdog-gæt</p>
            <p className="text-[22px] font-extrabold leading-tight">{underdog ? state.user?.name : rows[0]?.name}</p>
            <p className="text-[13px] leading-snug">{underdog ? `${underdog.p.title.replace(/\?$/, '')} (+${underdog.sc!.points}p)` : 'Ramte et gæt kun 18% troede på'}</p>
          </div>
        </div>
      </section>
      <DemoNote className="px-4 pt-4">Andre spilleres navne og point er demodata. {league.kind === 'expert' && 'Eksperterne er fiktive.'}</DemoNote>
    </div>
  )
}
