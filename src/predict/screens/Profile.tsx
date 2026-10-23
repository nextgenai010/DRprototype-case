import { usePredict } from '../store'
import { userPointsAt } from '../logic/selectors'
import { fmtInt } from '../logic/time'
import { Avatar, BackButton, Btn, DemoNote } from '../ui'
import { InterestChips, Toggle } from '../components/LoginFlow'

export function Profile() {
  const { state, back, setProfile, logout, openOverlay, showToast, requireLogin } = usePredict()
  const u = state.user
  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-1 backdrop-blur">
        <BackButton onClick={back} />
        <span className="text-[15px] font-bold">Profil og indstillinger</span>
        <span className="w-11" />
      </div>

      {u ? (
        <div className="flex items-center gap-3 px-4 pt-5">
          <Avatar name={u.name} size={56} />
          <div>
            <p className="text-[22px] font-extrabold leading-tight">{u.name}</p>
            <p className="text-[14px] text-neutral-600">{fmtInt(userPointsAt(state))} point · {u.region}</p>
            <span className="mt-1 inline-block rounded bg-[#FFF2B3] px-2 py-0.5 text-[11px] font-bold">Demo-konto</span>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-5">
          <Btn className="w-full" onClick={() => requireLogin(() => undefined)}>
            Log ind med DR
          </Btn>
        </div>
      )}
      {u && <DemoNote className="px-4 pt-2">Aldersgruppe ({u.ageGroup}) og postnummer ({u.postcode}) vises aldrig for andre – de bruges kun til fællesstatistik.</DemoNote>}

      <section className="mt-6 px-4" aria-label="Interesser">
        <h2 className="text-[18px] font-extrabold">Mine interesser</h2>
        <p className="mb-3 text-[14px] text-neutral-600">Bestemmer rækkefølgen i dit feed og hvilken forudsigelse du får som dagens.</p>
        <InterestChips
          value={state.profile.interests}
          onChange={(v) => {
            setProfile({ interests: v })
            showToast('Dit feed er opdateret')
          }}
        />
      </section>

      <section className="mt-6 px-4" aria-label="Indstillinger">
        <h2 className="text-[18px] font-extrabold">Indstillinger</h2>
        <div className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">
          <Toggle checked={state.profile.popupEnabled} onChange={(v) => setProfile({ popupEnabled: v })} label="Vis dagens forudsigelse på forsiden" hint="Højst én gang om dagen." />
          <Toggle checked={state.profile.notifications} onChange={(v) => setProfile({ notifications: v })} label="Påmind mig når en ny forudsigelse åbner" hint="Ingen nedtællinger eller streak-pres." />
          <Toggle checked={state.profile.personalization} onChange={(v) => setProfile({ personalization: v })} label="Tilpas ud fra mine tidligere gæt" hint="Bruger kun hvilke kategorier du har gættet på." />
        </div>
      </section>

      <div className="mt-6 space-y-2 px-4">
        <Btn variant="secondary" className="w-full" onClick={() => openOverlay({ kind: 'rules' })}>
          Spilleregler
        </Btn>
        {u && (
          <Btn variant="ghost" className="w-full" onClick={logout}>
            Log ud
          </Btn>
        )}
      </div>
      <DemoNote className="px-4 pt-4 text-center">Prototype – ikke et officielt DR-produkt. Alt gemmes kun lokalt i din browser.</DemoNote>
    </div>
  )
}
