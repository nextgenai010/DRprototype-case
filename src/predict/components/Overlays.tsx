import { useRef, useState } from 'react'
import { Copy, Share2, CalendarPlus, RefreshCcw, Gavel, Eye, Target, Coins, Zap, Heart, Check } from 'lucide-react'
import { usePredict, type Overlay } from '../store'
import { allLeagues, friendGuess, getPrediction, standings } from '../logic/selectors'
import { formatLongDate } from '../logic/time'
import { LEAGUE_COLORS } from '../config/leagues'
import { POINTS } from '../logic/scoring'
import { Sheet, CloseButton, Btn, Avatar, DemoNote } from '../ui'
import { DrLogo, PredictMark } from '../../shared/brand'
import { DailySheet } from './DailySheet'
import { LoginFlow } from './LoginFlow'
import { RecapStory, ResultStory } from './Stories'

async function shareOrCopy(text: string, url: string, onDone: (msg: string) => void) {
  try {
    if (navigator.share) {
      await navigator.share({ title: 'DR Predict', text, url })
      return
    }
  } catch {
    /* user cancelled or share failed – fall back to clipboard */
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`)
    onDone('Kopieret til udklipsholderen')
  } catch {
    onDone('Kunne ikke kopiere – link: ' + url)
  }
}

const RULES = [
  {
    icon: Target,
    title: 'Sådan gætter du',
    body: 'Vælg en forudsigelse og tryk på dit svar. Du kan rette dit gæt, indtil forudsigelsen lukker. Hver dag får du én "Dagens forudsigelse" på forsiden.',
  },
  {
    icon: Coins,
    title: 'Pointsystem',
    body: `Rigtigt svar: ${POINTS.correct} point. Præcist resultat: ${POINTS.exact} · rigtig målforskel: ${POINTS.goalDiff} · rigtig vinder: ${POINTS.winner}. Underdog-bonus: +${POINTS.underdog}, hvis du har ret, og under ${POINTS.underdogThreshold}% gættede det samme. Forkert gæt giver 0 – aldrig minus.`,
  },
  {
    icon: Zap,
    title: 'Boost',
    body: 'Én gang om ugen kan du sætte "Ugens boost" på en forudsigelse. Så tæller dine point dobbelt. Du kan flytte boostet, indtil forudsigelsen lukker.',
  },
  {
    icon: Heart,
    title: 'Ingen penge, kun ære',
    body: 'DR Predict er gratis. Du kan ikke satse noget, og der er ingen odds eller pengepræmier. Procenterne viser, hvad andre spillere tror – ikke en beregnet sandsynlighed.',
  },
]

function Rules() {
  const { closeOverlay } = usePredict()
  const [i, setI] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const go = (n: number) => {
    setI(n)
    scroller.current?.scrollTo({ left: n * (scroller.current?.clientWidth ?? 0), behavior: 'smooth' })
  }
  return (
    <Sheet label="Spilleregler" onClose={() => closeOverlay('rules')}>
      <div className="flex items-center justify-between px-5">
        <h2 className="text-[22px] font-extrabold">Spilleregler</h2>
        <CloseButton onClick={() => closeOverlay('rules')} className="-mr-2" />
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget
          setI(Math.round(el.scrollLeft / el.clientWidth))
        }}
      >
        {RULES.map((r, idx) => (
          <section key={r.title} className="w-full shrink-0 snap-center px-5 pb-2 pt-3" aria-label={`Trin ${idx + 1} af ${RULES.length}: ${r.title}`}>
            <div className="flex aspect-[16/9] items-center justify-center rounded-[14px] bg-dr-beige">
              <r.icon className="h-16 w-16" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[13px] font-bold text-dr-red">
              {idx + 1} / {RULES.length}
            </p>
            <h3 className="text-[22px] font-extrabold">{r.title}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-neutral-700">{r.body}</p>
          </section>
        ))}
      </div>
      <div className="flex items-center justify-between px-5 pb-6 pt-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {RULES.map((r, idx) => (
            <span key={r.title} className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-black' : 'w-2 bg-neutral-300'}`} />
          ))}
        </div>
        <Btn onClick={() => (i < RULES.length - 1 ? go(i + 1) : closeOverlay('rules'))}>{i < RULES.length - 1 ? 'Næste' : 'Forstået'}</Btn>
      </div>
    </Sheet>
  )
}

function DemoPanel() {
  const { closeOverlay, demo, state, now } = usePredict()
  const actions = [
    { icon: Eye, label: 'Vis dagens pop-up igen', run: demo.showPopupAgain },
    { icon: CalendarPlus, label: 'Spring til næste dag', run: demo.nextDay },
    { icon: Gavel, label: 'Afgør alle åbne forudsigelser', run: demo.resolveAll },
    { icon: RefreshCcw, label: 'Nulstil demo', run: demo.reset },
  ]
  return (
    <Sheet label="Demo-panel" onClose={() => closeOverlay('demo')}>
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold">Demo-panel</h2>
          <CloseButton onClick={() => closeOverlay('demo')} className="-mr-2" />
        </div>
        <p className="text-[14px] text-neutral-600">
          Demodato: <strong>{formatLongDate(now)}</strong> (dag {state.dayOffset + 1}) · {state.user ? `logget ind som ${state.user.name}` : 'ikke logget ind'}
        </p>
        <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {actions.map((a) => (
            <li key={a.label}>
              <button type="button" onClick={a.run} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[16px] font-semibold hover:bg-neutral-50">
                <a.icon className="h-5 w-5" /> {a.label}
              </button>
            </li>
          ))}
        </ul>
        <DemoNote className="mt-3">Skjult panel til præsentationen. Åbnes med langt tryk på DR-logoet eller "Demo" i Menu.</DemoNote>
      </div>
    </Sheet>
  )
}

const EMOJIS = ['😂', '👍', '😄', '😅', '🤑', '🫡', '🤩', '🫶', '❤️', '🤔', '😇', '🏆', '😌', '🔥', '🥲', '🤯']

function EmojiPicker({ leagueId }: { leagueId: string }) {
  const { closeOverlay, react, showToast } = usePredict()
  return (
    <Sheet label="Tilføj reaktion" onClose={() => closeOverlay('emoji')}>
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold">Tilføj reaktion</h2>
          <CloseButton onClick={() => closeOverlay('emoji')} className="-mr-2" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Reager med ${e}`}
              onClick={() => {
                react(leagueId, e)
                closeOverlay('emoji')
                showToast(`Reaktion ${e} tilføjet`)
              }}
              className="flex h-16 items-center justify-center rounded-[12px] bg-dr-beige text-[30px] hover:bg-dr-beigeDark"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

function CreateLeague() {
  const { closeOverlay, createLeague, openOverlay } = usePredict()
  const [name, setName] = useState('')
  const [color, setColor] = useState(LEAGUE_COLORS[0])
  return (
    <Sheet label="Opret liga" onClose={() => closeOverlay('createLeague')}>
      <form
        className="px-5 pb-6"
        onSubmit={(e) => {
          e.preventDefault()
          const l = createLeague(name, color)
          closeOverlay('createLeague')
          openOverlay({ kind: 'invite', leagueId: l.id })
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold">Opret liga</h2>
          <CloseButton onClick={() => closeOverlay('createLeague')} className="-mr-2" />
        </div>
        <label className="mt-3 block">
          <span className="text-[14px] font-semibold">Navn på ligaen</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={28} placeholder="Fx Kollegiet 3. sal" className="mt-1 h-12 w-full border-2 border-black px-3 text-[16px]" />
        </label>
        <fieldset className="mt-4">
          <legend className="text-[14px] font-semibold">Farve</legend>
          <div className="mt-2 flex gap-3">
            {LEAGUE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Vælg farve ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`flex h-11 w-11 items-center justify-center rounded-full ${color === c ? 'ring-2 ring-black ring-offset-2' : ''}`}
                style={{ background: c }}
              >
                {color === c && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </fieldset>
        <Btn type="submit" className="mt-6 w-full" disabled={!name.trim()}>
          Opret og inviter
        </Btn>
      </form>
    </Sheet>
  )
}

function Invite({ leagueId }: { leagueId: string }) {
  const { state, closeOverlay, showToast, push, openTab } = usePredict()
  const league = allLeagues(state).find((l) => l.id === leagueId)
  if (!league) return null
  const url = `https://www.dr.dk/predict/liga/${league.code}`
  return (
    <Sheet label="Inviter til liga" onClose={() => closeOverlay('invite')}>
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold">Inviter til {league.name}</h2>
          <CloseButton onClick={() => closeOverlay('invite')} className="-mr-2" />
        </div>
        <div className="mt-3 rounded-[14px] p-5 text-white" style={{ background: league.color }}>
          <p className="text-[13px] font-semibold opacity-80">Invitationskode</p>
          <p className="text-[40px] font-extrabold tracking-[.1em]">{league.code}</p>
          <p className="mt-1 break-all text-[13px] opacity-80">{url}</p>
        </div>
        <DemoNote className="mt-2">Demo-link – virker kun i prototypen.</DemoNote>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Btn
            variant="secondary"
            onClick={() =>
              navigator.clipboard?.writeText(url).then(
                () => showToast('Link kopieret'),
                () => showToast('Kunne ikke kopiere'),
              )
            }
          >
            <Copy className="h-4 w-4" /> Kopier link
          </Btn>
          <Btn onClick={() => shareOrCopy(`Kom med i min liga "${league.name}" på DR Predict. Kode: ${league.code}`, url, showToast)}>
            <Share2 className="h-4 w-4" /> Del
          </Btn>
        </div>
        <Btn
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => {
            closeOverlay('invite')
            openTab()
            window.setTimeout(() => push({ name: 'league', id: league.id }), 0)
          }}
        >
          Gå til ligaen
        </Btn>
      </div>
    </Sheet>
  )
}

function JoinLeague() {
  const { closeOverlay, joinLeague, showToast, push, openTab, state } = usePredict()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  return (
    <Sheet label="Deltag med kode" onClose={() => closeOverlay('joinLeague')}>
      <form
        className="px-5 pb-6"
        onSubmit={(e) => {
          e.preventDefault()
          const already = state.joinedLeagues
          const l = joinLeague(code)
          if (!l) {
            setError('Koden findes ikke. Prøv DR2026.')
            return
          }
          closeOverlay('joinLeague')
          showToast(already.includes(l.id) ? `Du er allerede med i ${l.name}` : `Du er nu med i ${l.name}`)
          openTab()
          window.setTimeout(() => push({ name: 'league', id: l.id }), 0)
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold">Deltag med kode</h2>
          <CloseButton onClick={() => closeOverlay('joinLeague')} className="-mr-2" />
        </div>
        <label className="mt-3 block">
          <span className="text-[14px] font-semibold">Invitationskode</span>
          <input
            autoFocus
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="DR2026"
            aria-invalid={!!error}
            aria-describedby="join-err"
            className="mt-1 h-14 w-full border-2 border-black px-3 text-[22px] font-bold tracking-[.12em]"
          />
        </label>
        <p id="join-err" className="mt-1 min-h-[20px] text-[14px] text-dr-red" role="alert">
          {error}
        </p>
        <DemoNote>Demokoder: DR2026 (Studiegruppen), HAND26 (Håndboldholdet)</DemoNote>
        <Btn type="submit" className="mt-4 w-full" disabled={code.length < 4}>
          Deltag
        </Btn>
      </form>
    </Sheet>
  )
}

function ShareCard({ o }: { o: Extract<Overlay, { kind: 'share' }> }) {
  const { closeOverlay, showToast } = usePredict()
  return (
    <Sheet label="Del" onClose={() => closeOverlay('share')}>
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold">Del</h2>
          <CloseButton onClick={() => closeOverlay('share')} className="-mr-2" />
        </div>
        <figure className="mt-2 overflow-hidden rounded-[14px] bg-black text-white shadow-lg" aria-label="Delekort">
          <div className="flex items-center justify-between px-4 pt-4">
            <DrLogo className="h-6" inverted />
            <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[.1em]">
              <PredictMark className="h-4 w-4 text-dr-red" /> Predict
            </span>
          </div>
          <div className="px-4 pb-4 pt-5">
            {o.footer && <p className="text-[13px] font-bold text-dr-red">{o.footer}</p>}
            <p className="text-[26px] font-extrabold leading-tight">{o.title}</p>
            <ul className="mt-3 space-y-1 text-[14px] text-white/80">
              {o.lines.slice(0, 5).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div className="bg-dr-red px-4 py-2.5 text-[13px] font-bold">Gæt med i DR Nyheder-appen</div>
        </figure>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Btn
            variant="secondary"
            onClick={() =>
              navigator.clipboard?.writeText(`${o.text} https://www.dr.dk/nyheder`).then(
                () => showToast('Kopieret'),
                () => showToast('Kunne ikke kopiere'),
              )
            }
          >
            <Copy className="h-4 w-4" /> Kopier
          </Btn>
          <Btn onClick={() => shareOrCopy(o.text, 'https://www.dr.dk/nyheder', showToast)}>
            <Share2 className="h-4 w-4" /> Del
          </Btn>
        </div>
      </div>
    </Sheet>
  )
}

function ChallengeSheet({ predictionId }: { predictionId: string }) {
  const { state, closeOverlay, challenge, showToast } = usePredict()
  const p = getPrediction(predictionId)
  const friends = allLeagues(state)
    .filter((l) => l.kind === 'private' && state.joinedLeagues.includes(l.id))
    .flatMap((l) => standings(state, l).filter((r) => !r.isUser))
  const unique = friends.filter((f, i) => friends.findIndex((x) => x.name === f.name) === i)
  if (!p) return null
  return (
    <Sheet label="Udfordr en ven" onClose={() => closeOverlay('challenge')}>
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold">Udfordr en ven</h2>
          <CloseButton onClick={() => closeOverlay('challenge')} className="-mr-2" />
        </div>
        <p className="text-[14px] text-neutral-600">Vælg en ven fra dine ligaer. Jeres gæt vises side om side, når forudsigelsen lukker.</p>
        <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
          {unique.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center gap-3 text-left hover:bg-neutral-50"
                onClick={() => {
                  challenge(p.id, f.name, friendGuess(p, f.id))
                  closeOverlay('challenge')
                  showToast(`${f.name} er udfordret!`)
                }}
              >
                <Avatar name={f.name} size={36} />
                <span className="flex-1 text-[16px] font-semibold">{f.name}</span>
                <span className="text-[13px] font-bold text-dr-red">Udfordr</span>
              </button>
            </li>
          ))}
        </ul>
        {unique.length === 0 && <p className="mt-3 text-[14px]">Du er ikke med i nogen private ligaer endnu.</p>}
        <DemoNote className="mt-3">Vennernes gæt er demodata.</DemoNote>
      </div>
    </Sheet>
  )
}

export function PredictOverlays() {
  const { overlays, toast } = usePredict()
  return (
    <>
      {overlays.map((o) => {
        switch (o.kind) {
          case 'daily':
            return <DailySheet key="daily" recap={o.recap} />
          case 'login':
            return <LoginFlow key="login" reason={o.reason} />
          case 'result':
            return <ResultStory key="result" ids={o.ids} />
          case 'recap':
            return <RecapStory key="recap" fromDay={o.fromDay} toDay={o.toDay} />
          case 'rules':
            return <Rules key="rules" />
          case 'demo':
            return <DemoPanel key="demo" />
          case 'emoji':
            return <EmojiPicker key="emoji" leagueId={o.leagueId} />
          case 'createLeague':
            return <CreateLeague key="create" />
          case 'joinLeague':
            return <JoinLeague key="join" />
          case 'invite':
            return <Invite key="invite" leagueId={o.leagueId} />
          case 'share':
            return <ShareCard key="share" o={o} />
          case 'challenge':
            return <ChallengeSheet key="challenge" predictionId={o.predictionId} />
          default:
            return null
        }
      })}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-[86px] z-[60] flex justify-center px-4">
        {toast && <div className="rounded-full bg-black px-4 py-2.5 text-center text-[14px] font-semibold text-white shadow-lg animate-pop">{toast}</div>}
      </div>
    </>
  )
}

