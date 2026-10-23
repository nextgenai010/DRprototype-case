import { useState } from 'react'
import { Pause, Play, Share, VolumeX, Volume2 } from 'lucide-react'
import { DrEye } from '../../shared/brand'
import { Illustration } from '../../shared/Illustration'
import { VideoChip } from '../../predict'
import { VIDEOS, type VideoItem } from '../news'

const TOP_TABS = ['TVA Live', 'Opdag', 'Nyheder', 'Sport']

function VideoCard({ v }: { v: VideoItem }) {
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [more, setMore] = useState(false)
  return (
    <article className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-black text-white" aria-label={v.title}>
      <div className="absolute inset-0 scale-110 opacity-80 blur-[1.5px]">
        <Illustration kind={v.visual} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
      <p className="absolute inset-x-6 top-[38%] text-center text-[40px] font-extrabold leading-[1.02] tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,.55)]" aria-hidden="true">
        {v.caption}
      </p>
      <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
        {v.chip && (
          <div className="mb-3">
            <VideoChip predictionId={v.chip.predictionId} label={v.chip.label} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[15px]">
            <DrEye className="h-6 w-6" />
            <span className="font-bold">{v.program}</span>
            <span className="text-white/60">{v.date}</span>
          </p>
          <button type="button" aria-label="Del video" className="flex h-11 w-11 items-center justify-center">
            <Share className="h-6 w-6" />
          </button>
        </div>
        <h2 className="mt-1 text-[17px] font-bold leading-snug">{v.title}</h2>
        <p className="mt-1 flex gap-1 text-[15px] leading-snug text-white/85">
          <span className={more ? '' : 'truncate'}>{v.desc}</span>
          {!more && (
            <button type="button" className="shrink-0 font-semibold text-white" onClick={() => setMore(true)}>
              vis mere
            </button>
          )}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" aria-label={playing ? 'Pause' : 'Afspil'} onClick={() => setPlaying(!playing)} className="flex h-11 w-11 items-center justify-center">
            {playing ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
          </button>
          <div className="relative h-[3px] flex-1 rounded-full bg-white/40" aria-hidden="true">
            <span className="absolute -top-[5px] left-[3%] h-[13px] w-[13px] rounded-full bg-dr-red" />
          </div>
          <button type="button" aria-label={muted ? 'Slå lyd til' : 'Slå lyd fra'} onClick={() => setMuted(!muted)} className="flex h-11 w-11 items-center justify-center">
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </article>
  )
}

export function Video() {
  const [tab, setTab] = useState('Opdag')
  return (
    <div className="relative h-full bg-black">
      <nav aria-label="Videokategorier" className="absolute inset-x-0 top-0 z-10 flex justify-center gap-6 pt-3 text-[17px] text-white">
        {TOP_TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`relative min-h-[44px] [text-shadow:0_1px_6px_rgba(0,0,0,.6)] ${tab === t ? 'font-bold' : ''}`}>
            {t}
            {tab === t && <span className="absolute -bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 bg-white" />}
          </button>
        ))}
      </nav>
      <div className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto" data-scroll>
        {VIDEOS.map((v) => (
          <div key={v.id} className="h-full">
            <VideoCard v={v} />
          </div>
        ))}
      </div>
      <p className="pointer-events-none absolute right-3 top-[60px] text-[10px] text-white/50">Stillbilleder – ikke rigtig video</p>
    </div>
  )
}
