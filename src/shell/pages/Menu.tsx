import { ChevronRight, Building2, Banknote, Leaf, Volleyball, Lightbulb, Globe, MessagesSquare, MapPin, Drama, CloudSun, Radio, Settings, FlaskConical } from 'lucide-react'
import type { ComponentType } from 'react'
import { PredictMark } from '../../shared/brand'
import { usePredictHost } from '../../predict'

const TOPICS = ['Finansloven 2027', 'Håndbold-VM', 'Grøn omstilling af landbruget', 'Dansk Melodi Grand Prix', 'Vejret i efterårsferien']

type IconC = ComponentType<{ className?: string; strokeWidth?: number | string }>

const SECTIONS: { label: string; icon: IconC; spil?: boolean }[] = [
  { label: 'Indland', icon: Building2 },
  { label: 'Penge', icon: Banknote },
  { label: 'Klima', icon: Leaf },
  { label: 'Spil', icon: ({ className }) => <PredictMark className={className} />, spil: true },
  { label: 'Sport', icon: Volleyball },
  { label: 'Teknologi', icon: Lightbulb },
  { label: 'Udland', icon: Globe },
  { label: 'Politik', icon: MessagesSquare },
  { label: 'Regionalt', icon: MapPin },
  { label: 'Kultur', icon: Drama },
  { label: 'Vejret', icon: CloudSun },
  { label: 'DR Trafik', icon: Radio },
]

export function Menu({ onToast }: { onToast: (m: string) => void }) {
  const { openTab, openDemo } = usePredictHost()
  return (
    <div className="pb-10">
      <section className="px-5 pt-6" aria-label="Aktuelle emner">
        <h2 className="text-[21px] font-bold">Aktuelle emner</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {TOPICS.map((t) => (
            <button key={t} type="button" onClick={() => onToast('Emnesider er ikke en del af prototypen')} className="min-h-[44px] border-2 border-black px-4 text-[16px] hover:bg-black hover:text-white">
              {t}
            </button>
          ))}
          <button type="button" className="flex min-h-[44px] items-center gap-2 px-3 text-[16px] font-bold text-dr-red" onClick={() => onToast('Flere emner er ikke en del af prototypen')}>
            Se flere <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <section className="pt-8" aria-label="Sektioner">
        <h2 className="px-5 text-[21px] font-bold">Sektioner</h2>
        <div className="no-scrollbar mt-4 overflow-x-auto px-5">
          <ul className="grid w-max grid-cols-6 gap-x-3 gap-y-4">
            {SECTIONS.map((s) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() => (s.spil ? openTab() : onToast(`${s.label} er ikke en del af prototypen`))}
                  className="flex w-[76px] flex-col items-center gap-1.5 text-[15px]"
                >
                  <span className={`relative flex h-[76px] w-[76px] items-center justify-center ${s.spil ? 'bg-black text-white' : 'bg-dr-beige'}`}>
                    <s.icon className="h-9 w-9" strokeWidth={2.2} />
                    {s.spil && <span className="absolute right-1.5 top-1.5 bg-dr-red px-1 text-[10px] font-bold text-white">NY</span>}
                  </span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ul className="mt-8 px-5">
        <li>
          <button type="button" onClick={openTab} className="flex min-h-[60px] w-full items-center gap-4 text-left text-[18px]">
            <PredictMark className="h-8 w-8" />
            <span className="flex-1">
              DR Predict
              <span className="block text-[13px] text-neutral-500">Dagens forudsigelse, ligaer og point</span>
            </span>
            <span className="bg-dr-red px-1.5 text-[11px] font-bold text-white">NY</span>
          </button>
        </li>
        <li>
          <button type="button" onClick={() => onToast('DR Trafik er ikke en del af prototypen')} className="flex min-h-[60px] w-full items-center gap-4 text-left text-[18px]">
            <Radio className="h-8 w-8" /> DR Trafik
          </button>
        </li>
        <li>
          <button type="button" onClick={() => onToast('Indstillinger for DR Predict findes under Spil → din profil')} className="flex min-h-[60px] w-full items-center gap-4 text-left text-[18px]">
            <Settings className="h-8 w-8" /> Dine indstillinger
          </button>
        </li>
        <li>
          <button type="button" onClick={openDemo} className="flex min-h-[60px] w-full items-center gap-4 text-left text-[18px]">
            <FlaskConical className="h-8 w-8" /> Demo
            <span className="text-[13px] text-neutral-500">(til præsentationen)</span>
          </button>
        </li>
      </ul>

      <div className="mt-8 bg-dr-beige px-5 py-8 text-center">
        <svg viewBox="0 0 300 110" className="mx-auto h-[110px] w-full max-w-[300px]" aria-hidden="true">
          <ellipse cx="150" cy="98" rx="120" ry="10" fill="#E2D9C8" />
          <circle cx="70" cy="40" r="16" fill="#F2B8A0" />
          <rect x="54" y="56" width="32" height="40" rx="10" fill="#9A9A9A" />
          <circle cx="125" cy="38" r="15" fill="#6B3E26" />
          <rect x="110" y="54" width="30" height="42" rx="10" fill="#F5E9DA" />
          <circle cx="180" cy="40" r="16" fill="#FFD56B" />
          <rect x="164" y="56" width="32" height="40" rx="10" fill="#D6001C" />
          <circle cx="235" cy="36" r="15" fill="#B0332A" />
          <rect x="220" y="52" width="30" height="44" rx="10" fill="#8C9EF0" />
        </svg>
        <p className="mt-3 text-[13px] text-neutral-600">Prototype – ikke et officielt DR-produkt</p>
      </div>
    </div>
  )
}
