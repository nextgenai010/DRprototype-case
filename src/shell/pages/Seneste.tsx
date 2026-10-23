import { List, Link2 } from 'lucide-react'
import { ArticleCta } from '../../predict'
import { SHORT_NEWS } from '../news'

function ReadAloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c.8-3.6 3.2-5.5 6-5.5s5.2 1.9 6 5.5" />
      <path d="M16 4.5c1.2 1 1.9 2.2 1.9 3.5s-.7 2.5-1.9 3.5M19 2.5c1.9 1.6 2.9 3.5 2.9 5.5S20.9 11.9 19 13.5" />
    </svg>
  )
}

function DictIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2.5 5h7a2.5 2.5 0 0 1 2.5 2.5V20a2 2 0 0 0-2-2H2.5zM21.5 5h-7A2.5 2.5 0 0 0 12 7.5V20a2 2 0 0 1 2-2h7.5z" />
      <path d="M5 9h4M5 12h4M15 9h4M15 12h4" />
    </svg>
  )
}

function TextIcon() {
  return (
    <span className="text-[18px] font-bold leading-none" aria-hidden="true">
      <sup className="text-[11px]">A</sup>A
    </span>
  )
}

export function Seneste({ onToast }: { onToast: (m: string) => void }) {
  return (
    <div className="pb-8">
      <div className="px-5 pt-6">
        <h1 className="text-[38px] font-extrabold tracking-[-.02em]">Seneste nyt</h1>
        <div className="flex justify-end">
          <button type="button" className="flex min-h-[44px] items-center gap-3 text-[16px] font-bold text-dr-red" onClick={() => onToast('Overblik er ikke en del af prototypen')}>
            <List className="h-6 w-6" /> SE OVERBLIKKET
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {SHORT_NEWS.map((n) => (
          <article key={n.id} className="bg-dr-beige px-5 pb-6 pt-6">
            <p className="flex items-center gap-2 text-[15px]">
              <span className="font-bold text-dr-red">Kort nyt</span>
              <span className="h-1 w-1 bg-[#9A9A9A]" aria-hidden="true" />
              <span className="text-[#6B6B6B]">{n.time}</span>
            </p>
            <h2 className="mt-1.5 text-[23px] font-bold leading-[1.25]">{n.title}</h2>
            <div className="mt-4 flex gap-7 text-[15px] font-bold text-dr-red">
              <button type="button" className="flex min-h-[44px] items-center gap-2" onClick={() => onToast('Oplæsning er ikke en del af prototypen')}>
                <ReadAloudIcon /> LÆS OP
              </button>
              <button type="button" className="flex min-h-[44px] items-center gap-2" onClick={() => onToast('Ordbog er ikke en del af prototypen')}>
                <DictIcon /> ORDBOG
              </button>
              <button type="button" className="flex min-h-[44px] items-center gap-2" onClick={() => onToast('Tekststørrelse er ikke en del af prototypen')}>
                <TextIcon /> TEKST
              </button>
            </div>
            <p className="mt-3 text-[13px] text-[#6B6B6B]">Af</p>
            <p className="text-[16px] font-bold">{n.author}</p>
            <div className="mt-3 space-y-5 text-[18px] leading-[1.65] text-[#2A2A2A]">
              {n.body.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </div>
            {n.predictionId && <ArticleCta predictionId={n.predictionId} />}
            <div className="mt-6 flex gap-8 text-[15px]">
              <button type="button" className="flex min-h-[44px] items-center gap-3" onClick={() => onToast('Deling er simuleret i prototypen')}>
                <span className="flex h-6 w-6 items-center justify-center bg-black text-[16px] font-extrabold text-white" aria-hidden="true">
                  f
                </span>
                FACEBOOK
              </button>
              <button
                type="button"
                className="flex min-h-[44px] items-center gap-3"
                onClick={() =>
                  navigator.clipboard?.writeText('https://www.dr.dk/nyheder').then(
                    () => onToast('Link kopieret (demo-link)'),
                    () => onToast('Kunne ikke kopiere'),
                  )
                }
              >
                <Link2 className="h-6 w-6 -rotate-45" /> KOPIER LINK
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
