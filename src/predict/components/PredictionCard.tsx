import { Clock, Users, ChevronRight, Sparkles, Zap } from 'lucide-react'
import { usePredict } from '../store'
import type { ContentLink, Prediction } from '../types'
import { closesAt, guessOptionId, isBoosted, participantsOf, resultOf, scoreFor, statusOf } from '../logic/selectors'
import { formatCountdown, formatShortDateTime, fmtInt } from '../logic/time'
import { formatGuess } from '../config/meta'
import { Illustration } from '../../shared/Illustration'
import { CategoryTag, StatusPill, PctBar } from '../ui'
import { DrEye } from '../../shared/brand'

export function Countdown({ p, className = '' }: { p: Prediction; className?: string }) {
  const { state, now } = usePredict()
  const status = statusOf(state, p, now)
  const at = closesAt(state, p)
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {status === 'open' ? `Lukker om ${formatCountdown(at - now)}` : status === 'closed' ? 'Lukket – afventer resultat' : `Afgjort`}
      <span className="sr-only">, {formatShortDateTime(at)}</span>
    </span>
  )
}

const platformTone: Record<ContentLink['platform'], string> = {
  'DR Nyheder': 'bg-black text-white',
  DRTV: 'bg-[#3D1B6E] text-white',
  'DR Lyd': 'bg-[#0E6B5F] text-white',
}

export function RelatedCard({ link }: { link: ContentLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-[64px] items-center gap-3 rounded-[10px] bg-white p-3 ring-1 ring-neutral-200 hover:ring-black"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-[10px] font-extrabold ${platformTone[link.platform]}`}>
        {link.platform === 'DR Nyheder' ? <DrEye className="h-6 w-6" /> : link.platform}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-bold text-dr-red">
          {link.platform} <span className="font-normal text-neutral-500">· Demo-link</span>
        </span>
        <span className="block text-[15px] font-bold leading-snug">{link.headline}</span>
        <span className="block text-[13px] leading-snug text-neutral-600">{link.description}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden="true" />
    </a>
  )
}

export function PredictionCard({ p, reason }: { p: Prediction; reason?: string | null }) {
  const { state, now, push } = usePredict()
  const status = statusOf(state, p, now)
  const g = state.guesses[p.id]
  const mine = guessOptionId(p, g?.value)
  const result = resultOf(state, p)
  const sc = scoreFor(state, p)

  return (
    <article className="overflow-hidden rounded-[14px] bg-white ring-1 ring-neutral-200">
      <button type="button" onClick={() => push({ name: 'detail', id: p.id })} className="block w-full text-left" aria-label={`Åbn: ${p.title}`}>
        <div className="relative aspect-[16/7] w-full">
          <Illustration kind={p.visual} />
          <span className="absolute left-3 top-3 rounded bg-white/95 px-2 py-0.5 text-[11px] font-bold">Illustrativt eksempel</span>
          <span className="absolute right-3 top-3">
            <StatusPill status={status} />
          </span>
          {isBoosted(state, p.id) && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-black px-2 py-0.5 text-[11px] font-bold text-[#FFD56B]">
              <Zap className="h-3 w-3 fill-current" /> Ugens boost
            </span>
          )}
        </div>
        <div className="p-4 pb-3">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-neutral-500">
            <CategoryTag id={p.category} />
            <Countdown p={p} />
          </div>
          <h3 className="text-[19px] font-extrabold leading-[1.2]">{p.title}</h3>
          <p className="mt-1 text-[14px] leading-snug text-neutral-600">{p.description}</p>
        </div>
      </button>

      <div className="px-4 pb-3">
        <ul className="space-y-2" aria-label="Fordeling af brugernes gæt">
          {p.options.slice(0, 4).map((o) => (
            <li key={o.id}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className={mine === o.id ? 'font-bold' : ''}>
                  {o.label}
                  {mine === o.id && <span className="ml-1 text-dr-red">· dit gæt</span>}
                  {result !== undefined && guessOptionId(p, result) === o.id && <span className="ml-1 font-bold text-[#0E8A5F]">✓ resultat</span>}
                </span>
                <span className="tabular-nums text-neutral-600">{o.community}%</span>
              </div>
              <PctBar pct={o.community} highlight={mine === o.id} />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden="true" /> {fmtInt(participantsOf(state, p))} har gættet
          </span>
          {g && <span className="font-semibold text-black">Dit gæt: {formatGuess(g.value, p.options)}{sc ? ` · ${sc.points}p` : ''}</span>}
        </div>
        {reason && (
          <p className="mt-2 flex items-center gap-1 text-[12px] text-neutral-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {reason}
          </p>
        )}
      </div>
      {p.related[0] && (
        <a href={p.related[0].url} target="_blank" rel="noreferrer" className="flex min-h-[44px] items-center justify-between border-t border-neutral-200 px-4 text-[13px] font-semibold hover:bg-neutral-50">
          <span>
            <span className="text-dr-red">{p.related[0].platform}:</span> {p.related[0].headline}
          </span>
          <ChevronRight className="h-4 w-4 text-neutral-400" aria-hidden="true" />
        </a>
      )}
    </article>
  )
}
