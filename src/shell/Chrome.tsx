import { useEffect, useRef, useState } from 'react'
import { Clock3, Menu as MenuIcon } from 'lucide-react'
import { DrLogo, PredictMark } from '../shared/brand'
import type { HostTab } from '../predict'

export function Header({ onLongPress }: { onLongPress: () => void }) {
  const timer = useRef<number>()
  const start = () => {
    timer.current = window.setTimeout(onLongPress, 650)
  }
  const stop = () => window.clearTimeout(timer.current)
  return (
    <header className="flex h-[56px] shrink-0 items-center justify-center border-b-2 border-[#E6E6E6] bg-white">
      <button
        type="button"
        aria-label="DR – forside. Langt tryk åbner demo-panelet"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        className="touch-none"
      >
        <DrLogo className="h-[29px]" />
      </button>
    </header>
  )
}

function ForsideIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 21V4h14v17" />
      <path d="M8 8h8M8 11.5h8M8 15h3M14 15h2v4h-2zM8 18h3" />
      <path d="M3 21h18" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" />
      <path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" />
    </svg>
  )
}

const TABS: { id: HostTab; label: string; icon: (p: { className?: string }) => JSX.Element }[] = [
  { id: 'forside', label: 'Forside', icon: ForsideIcon },
  { id: 'seneste', label: 'Seneste nyt', icon: ({ className }) => <Clock3 className={className} strokeWidth={1.9} /> },
  { id: 'video', label: 'Video', icon: VideoIcon },
  { id: 'spil', label: 'Spil', icon: ({ className }) => <PredictMark className={className} /> },
  { id: 'menu', label: 'Menu', icon: ({ className }) => <MenuIcon className={className} strokeWidth={1.9} /> },
]

export function BottomNav({ tab, onChange, dark }: { tab: HostTab; onChange: (t: HostTab) => void; dark: boolean }) {
  return (
    <nav aria-label="Hovedmenu" className={`shrink-0 border-t pb-[max(env(safe-area-inset-bottom),6px)] ${dark ? 'border-neutral-800 bg-black' : 'border-[#E6E6E6] bg-white'}`}>
      <ul className="flex">
        {TABS.map((t) => {
          const active = t.id === tab
          const Icon = t.icon
          return (
            <li key={t.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-[58px] w-full flex-col items-center justify-center gap-0.5 pt-1.5 text-[12.5px] ${
                  active ? (dark ? 'font-bold text-white' : 'font-bold text-black') : dark ? 'text-neutral-400' : 'text-[#7A7A7A]'
                }`}
              >
                {active && <span className={`absolute left-1/2 top-0 h-[3px] w-[64%] -translate-x-1/2 ${dark ? 'bg-white' : 'bg-black'}`} aria-hidden="true" />}
                <Icon className="h-[25px] w-[25px]" />
                {t.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const i = window.setInterval(() => setT(new Date()), 20_000)
    return () => window.clearInterval(i)
  }, [])
  return `${String(t.getHours()).padStart(2, '0')}.${String(t.getMinutes()).padStart(2, '0')}`
}

/** Fake iOS status bar shown only inside the desktop phone frame. */
export function StatusBar({ dark }: { dark: boolean }) {
  const time = useClock()
  return (
    <div className={`hidden h-[46px] shrink-0 items-center justify-between px-8 pt-1 text-[16px] font-semibold md:flex ${dark ? 'bg-black text-white' : 'bg-white text-black'}`} aria-hidden="true">
      <span>{time}</span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx=".5" />
          <rect x="5" y="5.5" width="3" height="6.5" rx=".5" />
          <rect x="10" y="3" width="3" height="9" rx=".5" />
          <rect x="15" y="0" width="3" height="12" rx=".5" />
        </svg>
        <span className="text-[14px]">5G</span>
        <span className={`ml-0.5 rounded-[4px] px-1 text-[11px] font-bold ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>68</span>
      </span>
    </div>
  )
}
