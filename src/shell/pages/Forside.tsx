import { Fragment, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { DrEye } from '../../shared/brand'
import { Illustration } from '../../shared/Illustration'
import { PredictBanner, PredictWidget, usePredictHost } from '../../predict'
import { ARTICLES, HERO, LIVEBLOG, TICKER, type Article } from '../news'

function Ticker({ onOpen }: { onOpen: () => void }) {
  return (
    <section aria-label="Seneste nyt" className="border-b border-[#E6E6E6] bg-white pb-3 pt-3">
      <button type="button" onClick={onOpen} className="mx-4 flex min-h-[36px] items-center gap-2 text-[19px] font-bold text-dr-red">
        <DrEye className="h-[26px] w-[26px]" /> Seneste nyt <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
      </button>
      <ul className="no-scrollbar mt-2 flex snap-x scroll-pl-4 overflow-x-auto px-4">
        {TICKER.map((t, i) => (
          <li key={t.text} className={`w-[300px] shrink-0 snap-start pr-4 ${i ? 'border-l border-[#DADADA] pl-4' : ''}`}>
            <button type="button" onClick={onOpen} className="text-left">
              <span className="flex items-center gap-1.5 text-[14px] text-[#6B6B6B]">
                {t.time} <span className="h-1 w-1 bg-[#9A9A9A]" aria-hidden="true" /> Kort nyt
              </span>
              <span className="mt-0.5 line-clamp-1 block text-[16px] font-semibold">{t.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Headline({ a, size }: { a: Pick<Article, 'bold' | 'rest'>; size: string }) {
  return (
    <h3 className={`${size} leading-[1.17] tracking-[-.01em]`}>
      <span className="font-bold">{a.bold}</span>
      {a.rest && <span className="font-normal">{a.rest}</span>}
    </h3>
  )
}

function ListArticle({ a }: { a: Article }) {
  return (
    <article className="mx-4 flex gap-4 border-b border-[#E2E2E2] py-4">
      <div className="aspect-[16/9] w-[44%] shrink-0 self-start overflow-hidden">
        <Illustration kind={a.visual} label={`Illustration til ${a.category}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-dr-red">{a.category}</p>
        <Headline a={a} size="text-[18px]" />
      </div>
    </article>
  )
}

export function Forside({ onOpenSeneste }: { onOpenSeneste: () => void }) {
  const { maybeShowDaily, clockKey } = usePredictHost()

  useEffect(() => {
    const t = window.setTimeout(maybeShowDaily, 1000)
    return () => window.clearTimeout(t)
  }, [maybeShowDaily, clockKey])

  return (
    <div className="pb-8">
      <Ticker onOpen={onOpenSeneste} />
      <PredictBanner />

      <section className="bg-dr-beige px-4 pb-5 pt-5">
        <article>
          <div className="aspect-[16/9] overflow-hidden">
            <Illustration kind={HERO.visual} label="Illustration: landbrug" />
          </div>
          <p className="mt-4 text-[14px] font-bold text-dr-red">{HERO.category}</p>
          <Headline a={HERO} size="text-[30px]" />
        </article>
        <div className="mt-5 border-t border-[#D9D2C4] pt-4">
          <p className="flex items-center gap-3 text-[14px] font-bold">
            <span className="bg-dr-red px-1.5 py-0.5 text-white">Liveblog</span>
            <span className="text-dr-red">{LIVEBLOG.topic}</span>
          </p>
          <h3 className="mt-2 text-[22px] leading-[1.2]">
            <span className="mr-1.5 inline-flex gap-[3px] align-middle" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dr-red" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dr-red [animation-delay:.2s]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dr-red [animation-delay:.4s]" />
            </span>
            <span className="font-bold">{LIVEBLOG.bold}</span>
            {LIVEBLOG.rest}
          </h3>
          <div className="mt-2 border-l border-black pl-3">
            <p className="flex items-center gap-2 text-[14px] font-bold text-dr-red">
              <span className="-ml-[17px] h-2 w-2 rounded-full bg-black" aria-hidden="true" />
              {LIVEBLOG.updateTime}
            </p>
            <p className="text-[16px]">{LIVEBLOG.update}</p>
          </div>
        </div>
      </section>

      {ARTICLES.map((a, i) => (
        <Fragment key={a.id}>
          <ListArticle a={a} />
          {i === 2 && <PredictWidget />}
        </Fragment>
      ))}
      <p className="px-4 pt-6 text-center text-[12px] text-neutral-500">Demo-artikler – opdigtet indhold til prototypen.</p>
    </div>
  )
}
