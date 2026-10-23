// DR brand marks, recreated as simple SVG for the prototype.

export function DrLogo({ className = 'h-[30px]', inverted = false }: { className?: string; inverted?: boolean }) {
  const bg = inverted ? '#fff' : '#000'
  const fg = inverted ? '#000' : '#fff'
  return (
    <svg viewBox="0 0 168 50" className={className} role="img" aria-label="DR">
      <rect width="168" height="50" fill={bg} />
      <path
        fillRule="evenodd"
        fill={fg}
        d="M26 11 H62 Q80 11 80 25 Q80 39 62 39 H26 Z M39 19.5 H60 Q66.5 19.5 66.5 25 Q66.5 30.5 60 30.5 H39 Z"
      />
      <path
        fillRule="evenodd"
        fill={fg}
        d="M88 11 H126 Q142 11 142 21.5 Q142 28.5 134 31 L144 39 H128.5 L120.5 32 H101 V39 H88 Z M101 19 H124 Q129 19 129 22.2 Q129 25.4 124 25.4 H101 Z"
      />
    </svg>
  )
}

export function DrEye({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="3" fill="#D6001C" />
      <path d="M4 16 Q16 5 28 16 Q16 27 4 16Z" fill="#fff" />
      <circle cx="16" cy="16" r="5.2" fill="#D6001C" />
      <circle cx="16" cy="16" r="2.2" fill="#fff" />
    </svg>
  )
}

/** Trophy-in-target mark used for the "Spil" tab and DR Predict. */
export function PredictMark({ className = 'h-6 w-6', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.4M17 6h2.5a2.5 2.5 0 0 1-2.6 3.4" />
      <path d="M12 13v3.5M8.5 20h7M10 16.5h4l.6 3.5H9.4l.6-3.5Z" />
    </svg>
  )
}
