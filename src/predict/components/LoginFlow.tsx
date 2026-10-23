import { useState } from 'react'
import { Lock, Check, Save, Trophy, Users, UserCircle2 } from 'lucide-react'
import { usePredict } from '../store'
import { AGE_GROUPS, INTERESTS, regionFromPostcode } from '../config/meta'
import { Sheet, FullModal, CloseButton, Btn, BackButton } from '../ui'
import { DrLogo } from '../../shared/brand'

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && <span className="block text-[13px] leading-snug text-neutral-500">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-7 w-12 rounded-full bg-neutral-300 transition-colors peer-checked:bg-black peer-focus-visible:ring-2 peer-focus-visible:ring-dr-red peer-focus-visible:ring-offset-2" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export function InterestChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Interesser">
      {INTERESTS.map((i) => {
        const on = value.includes(i.id)
        return (
          <button
            key={i.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== i.id) : [...value, i.id])}
            className={`flex min-h-[44px] items-center gap-1.5 border-2 px-3.5 text-[15px] font-semibold ${on ? 'border-black bg-black text-white' : 'border-black bg-white'}`}
          >
            {on && <Check className="h-4 w-4" strokeWidth={3} />}
            {i.label}
          </button>
        )
      })}
    </div>
  )
}

type Step = 'intro' | 'dr' | 'profile' | 'interests'

export function LoginFlow({ reason }: { reason?: string }) {
  const { completeLogin, finishOnboarding, cancelLogin, state } = usePredict()
  const [step, setStep] = useState<Step>('intro')
  const [name, setName] = useState('Alex')
  const [age, setAge] = useState('25–29')
  const [pc, setPc] = useState('2400')
  const [terms, setTerms] = useState(false)
  const [interests, setInterests] = useState<string[]>(state.profile.interests)
  const [notif, setNotif] = useState(false)
  const [pers, setPers] = useState(false)
  const [loading, setLoading] = useState(false)

  if (step === 'intro') {
    return (
      <Sheet label="Log ind med DR" onClose={cancelLogin}>
        <div className="px-5 pb-6">
          <div className="flex items-start justify-between">
            <DrLogo className="h-7" />
            <CloseButton onClick={cancelLogin} className="-mr-2 -mt-2" />
          </div>
          <h2 className="mt-4 text-[26px] font-extrabold leading-tight">Log ind med DR {reason ? reason : ''}</h2>
          <p className="mt-1 text-[15px] text-neutral-600">Du bruger det samme DR-login, som du kender fra DRTV og DR Lyd.</p>
          <ul className="mt-4 space-y-3 text-[15px]">
            {[
              [Save, 'Gem dine gæt'],
              [Trophy, 'Følg dine resultater og point'],
              [Users, 'Dyst i ligaer med venner og familie'],
              [UserCircle2, 'Samme profil på tværs af DR'],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Save
              return (
                <li key={text as string} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dr-beige">
                    <I className="h-5 w-5" />
                  </span>
                  {text as string}
                </li>
              )
            })}
          </ul>
          <Btn className="mt-6 w-full" onClick={() => setStep('dr')}>
            Log ind med DR
          </Btn>
          <Btn variant="ghost" className="mt-1 w-full" onClick={cancelLogin}>
            Ikke nu
          </Btn>
        </div>
      </Sheet>
    )
  }

  if (step === 'dr') {
    return (
      <FullModal label="login.dr.dk" onClose={cancelLogin}>
        <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2">
          <Lock className="h-3.5 w-3.5 text-neutral-500" />
          <span className="flex-1 truncate rounded-full bg-white px-3 py-1 text-center text-[13px] text-neutral-700">login.dr.dk</span>
          <CloseButton onClick={cancelLogin} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 pt-10">
          <DrLogo className="h-9" />
          <h2 className="mt-8 text-[28px] font-extrabold">Log ind</h2>
          <p className="mt-1 text-[15px] text-neutral-600">med din DR-konto</p>
          <span className="mt-3 inline-block rounded bg-[#FFF2B3] px-2 py-0.5 text-[12px] font-bold">Demo-konto – simuleret login</span>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              setLoading(true)
              window.setTimeout(() => {
                setLoading(false)
                setStep('profile')
              }, 650)
            }}
          >
            <label className="block">
              <span className="text-[14px] font-semibold">E-mail</span>
              <input readOnly value="alex@demo-konto.dk" className="mt-1 h-12 w-full border-2 border-neutral-300 px-3 text-[16px]" />
            </label>
            <label className="block">
              <span className="text-[14px] font-semibold">Adgangskode</span>
              <input readOnly type="password" value="demodemo" className="mt-1 h-12 w-full border-2 border-neutral-300 px-3 text-[16px]" />
            </label>
            <Btn type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logger ind…' : 'Log ind'}
            </Btn>
          </form>
          <p className="mt-4 text-center text-[13px] text-neutral-500">Ingen rigtig konto bruges. Alt gemmes kun i din browser.</p>
        </div>
      </FullModal>
    )
  }

  if (step === 'profile') {
    return (
      <FullModal label="Opret spilprofil" onClose={cancelLogin}>
        <div className="flex items-center justify-between px-2 py-1">
          <BackButton onClick={() => setStep('dr')} />
          <span className="text-[15px] font-bold">Opret spilprofil</span>
          <CloseButton onClick={cancelLogin} />
        </div>
        <form
          className="flex flex-1 flex-col overflow-y-auto px-5 pb-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!terms) return
            completeLogin({ name, ageGroup: age, postcode: pc })
            setStep('interests')
          }}
        >
          <h2 className="mt-2 text-[26px] font-extrabold leading-tight">Velkommen, Alex</h2>
          <p className="mt-1 text-[15px] text-neutral-600">Lav din spilprofil til DR Predict. Det tager 10 sekunder.</p>

          <label className="mt-5 block">
            <span className="text-[14px] font-semibold">Spilnavn</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} required className="mt-1 h-12 w-full border-2 border-black px-3 text-[16px]" />
            <span className="mt-1 block text-[13px] text-neutral-500">Unikt og vises på ranglister.</span>
          </label>

          <label className="mt-4 block">
            <span className="text-[14px] font-semibold">Aldersgruppe</span>
            <select value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 h-12 w-full border-2 border-black bg-white px-3 text-[16px]">
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a} år
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[13px] text-neutral-500">Vises ikke. Bruges kun til fællesstatistik.</span>
          </label>

          <label className="mt-4 block">
            <span className="text-[14px] font-semibold">Postnummer</span>
            <input value={pc} onChange={(e) => setPc(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" required className="mt-1 h-12 w-full border-2 border-black px-3 text-[16px]" />
            <span className="mt-1 block text-[13px] text-neutral-500">
              Vises ikke. Bruges kun til "Hele Danmark gætter" ({regionFromPostcode(pc)}).
            </span>
          </label>

          <label className="mt-5 flex min-h-[44px] cursor-pointer items-start gap-3">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-5 w-5 accent-black" />
            <span className="text-[14px] leading-snug">
              Jeg accepterer vilkårene for DR Predict. Der spilles kun om point og ære – aldrig om penge.
            </span>
          </label>

          <div className="mt-auto pt-6">
            <Btn type="submit" className="w-full" disabled={!terms || !name.trim() || pc.length !== 4}>
              Opret spilprofil
            </Btn>
            <p className="mt-2 text-center text-[12px] text-neutral-500">Demo-konto: Alex, 25–29 år, 2400 København NV</p>
          </div>
        </form>
      </FullModal>
    )
  }

  return (
    <FullModal label="Vælg interesser" onClose={() => finishOnboarding({})}>
      <div className="flex items-center justify-end px-2 py-1">
        <button type="button" onClick={() => finishOnboarding({})} className="min-h-[44px] px-3 text-[15px] font-semibold underline">
          Spring over
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
        <h2 className="text-[26px] font-extrabold leading-tight">Hvad interesserer dig?</h2>
        <p className="mt-1 text-[15px] text-neutral-600">Valgfrit. Vi viser forudsigelser om dine interesser først. Du kan altid ændre det under Profil.</p>
        <div className="mt-5">
          <InterestChips value={interests} onChange={setInterests} />
        </div>
        <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
          <Toggle checked={notif} onChange={setNotif} label="Påmind mig når en ny forudsigelse åbner" hint="Højst én påmindelse om dagen. Ingen nedtællinger." />
          <Toggle checked={pers} onChange={setPers} label="Tilpas ud fra mine tidligere gæt" hint="Bruger kun hvilke kategorier du har gættet på." />
        </div>
        <p className="mt-3 text-[13px] text-neutral-500">Alt er slået fra som udgangspunkt. Spillet virker fuldt ud uden samtykke.</p>
        <div className="mt-auto pt-6">
          <Btn className="w-full" onClick={() => finishOnboarding({ interests, notifications: notif, personalization: pers })}>
            Gem og fortsæt
          </Btn>
        </div>
      </div>
    </FullModal>
  )
}
