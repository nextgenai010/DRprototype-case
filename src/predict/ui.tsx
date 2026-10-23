import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { categoryLabel } from './config/meta'
import type { CategoryId, PredictionStatus } from './types'

/** Close on Escape and move focus into the dialog on open. */
function useDialogA11y(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
      }
    }
    const node = ref.current
    node?.addEventListener('keydown', onKey)
    return () => {
      node?.removeEventListener('keydown', onKey)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])
  return ref
}

/** Bottom sheet over the app with dimmed backdrop and swipe-down to dismiss. */
export function Sheet({ label, onClose, children, tall = false }: { label: string; onClose: () => void; children: ReactNode; tall?: boolean }) {
  const ref = useDialogA11y(onClose)
  const [drag, setDrag] = useState(0)
  const start = useRef<number | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (start.current === null) return
    setDrag(Math.max(0, e.clientY - start.current))
  }
  const onPointerUp = () => {
    if (start.current === null) return
    start.current = null
    if (drag > 110) onClose()
    setDrag(0)
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/45 animate-fadeIn" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative flex flex-col rounded-t-[14px] bg-white shadow-2xl outline-none animate-sheetUp ${tall ? 'max-h-[94%]' : 'max-h-[88%]'}`}
        style={{ transform: drag ? `translateY(${drag}px)` : undefined, transition: start.current === null ? 'transform .2s' : 'none' }}
      >
        <div
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden="true"
        >
          <span className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain no-scrollbar">{children}</div>
      </div>
    </div>
  )
}

/** Full-screen layer that slides up (used for login, stories, rules). */
export function FullModal({ label, onClose, children, dark = false }: { label: string; onClose: () => void; children: ReactNode; dark?: boolean }) {
  const ref = useDialogA11y(onClose)
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className={`pointer-events-auto absolute inset-0 z-50 flex flex-col outline-none animate-rise ${dark ? 'bg-black text-white' : 'bg-white'}`}
    >
      {children}
    </div>
  )
}

export function IconButton({ label, onClick, children, className = '' }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5 ${className}`}>
      {children}
    </button>
  )
}

export const CloseButton = ({ onClick, className = '', label = 'Luk' }: { onClick: () => void; className?: string; label?: string }) => (
  <IconButton label={label} onClick={onClick} className={className}>
    <X className="h-6 w-6" strokeWidth={2} />
  </IconButton>
)

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton label="Tilbage" onClick={onClick}>
    <ChevronLeft className="h-7 w-7" strokeWidth={2} />
  </IconButton>
)

export function Avatar({ name, size = 36, color = '#111', ring = false }: { name: string; size?: number; color?: string; ring?: boolean }) {
  const words = name.split(/\s|_|&/).filter(Boolean)
  const initials = (words.length > 1 ? words.map((w) => w[0]).join('') : name).slice(0, 2).toUpperCase()
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-bold ${ring ? 'border-2' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.36, borderColor: color, color }}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}

/** Horizontal percentage bar with grow animation. */
export function PctBar({ pct, highlight = false, dark = false }: { pct: number; highlight?: boolean; dark?: boolean }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = requestAnimationFrame(() => setW(pct))
    return () => cancelAnimationFrame(t)
  }, [pct])
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-black/[.07]'}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${highlight ? 'bg-dr-red' : dark ? 'bg-white/60' : 'bg-neutral-400'}`}
        style={{ width: `${w}%` }}
      />
    </div>
  )
}

export function CategoryTag({ id, className = '' }: { id: CategoryId; className?: string }) {
  return <span className={`text-[13px] font-bold text-dr-red ${className}`}>{categoryLabel(id)}</span>
}

export function StatusPill({ status }: { status: PredictionStatus }) {
  const map = {
    open: ['Åben', 'bg-[#E6F4EC] text-[#0E6B3F]'],
    closed: ['Lukket', 'bg-neutral-200 text-neutral-700'],
    resolved: ['Afgjort', 'bg-black text-white'],
  } as const
  const [label, cls] = map[status]
  return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-bold ${cls}`}>{label}</span>
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'red'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const styles = {
    primary: 'bg-black text-white hover:bg-neutral-800',
    red: 'bg-dr-red text-white hover:bg-dr-redDark',
    secondary: 'bg-dr-beige text-black hover:bg-dr-beigeDark',
    ghost: 'bg-transparent text-black underline-offset-2 hover:underline',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 text-[16px] font-bold transition-colors disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function DemoNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[12px] leading-snug text-neutral-500 ${className}`}>{children}</p>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-4">
      <h2 className="text-[20px] font-extrabold leading-tight">{children}</h2>
      {action}
    </div>
  )
}
