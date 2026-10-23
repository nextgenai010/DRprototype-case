import { Share2, Swords, Users, Info, ShieldCheck, Flag, BarChart3 } from 'lucide-react'
import { usePredict } from '../store'
import { closesAt, getPrediction, guessOptionId, participantsOf, statusOf } from '../logic/selectors'
import { formatShortDateTime, fmtInt } from '../logic/time'
import { formatGuess } from '../config/meta'
import { byFriends } from '../logic/aggregates'
import { Illustration } from '../../shared/Illustration'
import { BackButton, Btn, CategoryTag, PctBar, StatusPill, Avatar, DemoNote } from '../ui'
import { GuessModule } from '../components/Guess'
import { Countdown, RelatedCard } from '../components/PredictionCard'
import { rank } from '../logic/personalize'

export function Detail({ id }: { id: string }) {
  const { state, now, back, openOverlay, requireLogin, push } = usePredict()
  const p = getPrediction(id)
  if (!p) return <p className="p-4">Forudsigelsen findes ikke.</p>
  const status = statusOf(state, p, now)
  const mine = guessOptionId(p, state.guesses[p.id]?.value)
  const friends = state.user ? byFriends(state, p) : null
  const ch = state.challenges[p.id]
  const reason = rank(state, p).reason

  return (
    <article className="pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-1 backdrop-blur">
        <BackButton onClick={back} />
        <span className="text-[15px] font-bold">Forudsigelse</span>
        <button
          type="button"
          aria-label="Del forudsigelse"
          onClick={() =>
            openOverlay({
              kind: 'share',
              title: p.title,
              lines: p.options.map((o) => `${o.label}: ${o.community}%`),
              footer: 'Hvad tror du?',
              text: `${p.title} Gæt med i DR Predict!`,
            })
          }
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <div className="relative aspect-[16/8]">
        <Illustration kind={p.visual} label={`Illustration: ${p.title}`} />
        <span className="absolute left-3 top-3 rounded bg-white/95 px-2 py-0.5 text-[11px] font-bold">Illustrativt eksempel</span>
      </div>

      <div className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-neutral-500">
          <CategoryTag id={p.category} />
          <StatusPill status={status} />
          <Countdown p={p} />
        </div>
        <h1 className="mt-2 text-[28px] font-extrabold leading-[1.1] tracking-[-.01em]">{p.title}</h1>
        <p className="mt-2 text-[17px] leading-relaxed text-neutral-700">{p.description}</p>
        <p className="mt-2 text-[13px] text-neutral-500">
          {status === 'open' ? 'Lukker' : 'Lukkede'} {formatShortDateTime(closesAt(state, p))} · <Users className="inline h-3.5 w-3.5" /> {fmtInt(participantsOf(state, p))} deltagere
        </p>
        {reason && <p className="mt-1 text-[13px] text-neutral-500">{reason}</p>}
      </div>

      <div className="mt-5 px-4">
        <GuessModule p={p} />
      </div>

      <section aria-label="Fordeling af brugernes gæt" className="mt-6 px-4">
        <h2 className="flex items-center gap-2 text-[20px] font-extrabold">
          <BarChart3 className="h-5 w-5" /> Fordeling af gæt
        </h2>
        {status === 'open' && !mine ? (
          <p className="mt-3 rounded-[12px] bg-dr-beige p-4 text-[15px]">Svar først – så ser du, hvad andre har gættet.</p>
        ) : (
        <ul className="mt-3 space-y-3">
          {p.options.map((o) => (
            <li key={o.id}>
              <div className="mb-1 flex justify-between text-[15px]">
                <span className={mine === o.id ? 'font-bold' : ''}>
                  {o.label}
                  {mine === o.id && <span className="text-dr-red"> · dit gæt</span>}
                </span>
                <span className="font-bold tabular-nums">{o.community}%</span>
              </div>
              <PctBar pct={o.community} highlight={mine === o.id} />
            </li>
          ))}
        </ul>
        )}
        {friends && friends.count > 0 && mine && (
          <div className="mt-4 rounded-[12px] bg-dr-beige p-3 text-[14px]">
            <p className="font-bold">Dine venner ({friends.count})</p>
            <ul className="mt-1 space-y-1">
              {p.options.map((o, i) => (
                <li key={o.id} className="flex justify-between">
                  <span>{o.label}</span>
                  <span className="tabular-nums">{friends.shares[i]}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 flex gap-2 rounded-[12px] border border-neutral-200 p-3 text-[14px] leading-snug">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Fordeling af brugernes gæt</strong> er hvad andre spillere tror – ikke en beregnet sandsynlighed.
          </p>
        </div>
        <button type="button" onClick={() => push({ name: 'danmark', id: p.id })} className="mt-2 min-h-[44px] text-[14px] font-bold text-dr-red">
          Se hvordan hele Danmark gætter →
        </button>
      </section>

      <section aria-label="Udfordr en ven" className="mt-4 px-4">
        {ch ? (
          <div className="rounded-[12px] bg-black p-4 text-white">
            <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.06em] text-white/60">
              <Swords className="h-4 w-4" /> Udfordring
            </p>
            <div className="mt-3 flex items-center justify-around text-center">
              <div>
                <Avatar name={state.user?.name ?? 'Du'} color="#fff" />
                <p className="mt-1 text-[13px]">Dig</p>
                <p className="text-[18px] font-extrabold">{formatGuess(state.guesses[p.id]?.value, p.options)}</p>
              </div>
              <span className="text-[13px] text-white/50">mod</span>
              <div>
                <Avatar name={ch.friend} color="#fff" />
                <p className="mt-1 text-[13px]">{ch.friend}</p>
                <p className="text-[18px] font-extrabold">{status === 'open' ? '🔒' : formatGuess(ch.friendGuess, p.options)}</p>
              </div>
            </div>
            {status === 'open' && <p className="mt-2 text-center text-[13px] text-white/60">{ch.friend}s gæt vises, når forudsigelsen lukker.</p>}
          </div>
        ) : (
          status === 'open' && (
            <Btn variant="secondary" className="w-full" onClick={() => requireLogin(() => openOverlay({ kind: 'challenge', predictionId: p.id }), 'for at udfordre en ven')}>
              <Swords className="h-5 w-5" /> Udfordr en ven
            </Btn>
          )
        )}
      </section>

      <section aria-label="Relateret indhold fra DR" className="mt-7 px-4">
        <h2 className="text-[20px] font-extrabold">Bliv klogere hos DR</h2>
        <div className="mt-3 space-y-2">
          {p.related.map((r) => (
            <RelatedCard key={r.headline} link={r} />
          ))}
        </div>
      </section>

      <section aria-label="Sådan afgøres den" className="mt-7 px-4">
        <div className="space-y-3 rounded-[12px] bg-dr-beige p-4 text-[14px] leading-snug">
          <p className="flex gap-2">
            <Flag className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Afgørelse:</strong> {p.resolution}
            </span>
          </p>
          <p className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Kilde:</strong> {p.source}
            </span>
          </p>
        </div>
        <DemoNote className="mt-2">Illustrativt eksempel. Spørgsmål, tal og resultater er demodata.</DemoNote>
      </section>
    </article>
  )
}
