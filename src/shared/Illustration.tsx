import type { ReactNode } from 'react'

// Flat, self-contained SVG illustrations used instead of photos (no external images).

type Scene = { bg: [string, string]; body: ReactNode }

const scenes: Record<string, Scene> = {
  handball: {
    bg: ['#1d3a6e', '#0f2147'],
    body: (
      <>
        <rect x="0" y="140" width="320" height="60" fill="#c96b3b" />
        <path d="M0 140 L320 140" stroke="#fff" strokeWidth="2" opacity=".6" />
        <path d="M60 200 Q160 110 260 200" stroke="#fff" strokeWidth="2" fill="none" opacity=".5" />
        <rect x="230" y="70" width="70" height="70" fill="none" stroke="#fff" strokeWidth="5" />
        <path d="M230 70 L300 70 L300 140" stroke="#d6001c" strokeWidth="5" strokeDasharray="10 10" fill="none" />
        <circle cx="128" cy="78" r="18" fill="#f2e6c9" />
        <path d="M118 74 Q128 62 138 74" stroke="#d6001c" strokeWidth="3" fill="none" />
        <path d="M86 40 Q90 30 100 34" stroke="#ffd56b" strokeWidth="3" fill="none" />
        <circle cx="178" cy="62" r="5" fill="#ffd56b" />
      </>
    ),
  },
  football: {
    bg: ['#2f8a4c', '#1f6b38'],
    body: (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 60 - 10} y="0" width="30" height="200" fill="#fff" opacity=".05" />
        ))}
        <circle cx="160" cy="110" r="46" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
        <path d="M160 0 V200" stroke="#fff" strokeWidth="3" opacity=".7" />
        <circle cx="160" cy="110" r="4" fill="#fff" />
        <g transform="translate(205 120)">
          <circle r="22" fill="#fff" />
          <path d="M0 -9 L9 -2 L6 9 L-6 9 L-9 -2 Z" fill="#111" />
          <path d="M0 -9 V-22 M9 -2 L20 -7 M6 9 L13 18 M-6 9 L-13 18 M-9 -2 L-20 -7" stroke="#111" strokeWidth="2" />
        </g>
      </>
    ),
  },
  swim: {
    bg: ['#3fa7d6', '#1b6fa8'],
    body: (
      <>
        {[40, 90, 140].map((y) => (
          <path key={y} d={`M0 ${y} Q40 ${y - 10} 80 ${y} T160 ${y} T240 ${y} T320 ${y}`} stroke="#fff" strokeWidth="3" fill="none" opacity=".45" />
        ))}
        {[60, 120, 180].map((y) => (
          <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#d6001c" strokeWidth="3" strokeDasharray="6 8" />
        ))}
        <circle cx="150" cy="96" r="12" fill="#ffd56b" />
        <path d="M162 96 Q200 80 230 100" stroke="#f2e6c9" strokeWidth="9" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  cycling: {
    bg: ['#f5d76e', '#e9b949'],
    body: (
      <>
        <path d="M0 150 Q80 90 160 120 T320 70 V200 H0Z" fill="#6aa86b" />
        <path d="M0 170 Q120 140 320 160 V200 H0Z" fill="#444" />
        <g transform="translate(150 120)" stroke="#111" strokeWidth="4" fill="none">
          <circle cx="-26" cy="20" r="18" />
          <circle cx="30" cy="20" r="18" />
          <path d="M-26 20 L0 -4 L30 20 M0 -4 L16 -6 M-6 -10 L4 -10" />
        </g>
        <circle cx="152" cy="92" r="9" fill="#d6001c" />
      </>
    ),
  },
  parliament: {
    bg: ['#e9e1d3', '#d8cdb9'],
    body: (
      <>
        <rect x="50" y="90" width="220" height="80" fill="#b9a98d" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={62 + i * 26} y="104" width="12" height="52" fill="#8d7b5d" />
        ))}
        <path d="M40 90 L160 40 L280 90 Z" fill="#9f8d6e" />
        <rect x="150" y="18" width="20" height="30" fill="#2f6b5a" />
        <path d="M150 18 L160 2 L170 18Z" fill="#2f6b5a" />
        <rect x="0" y="170" width="320" height="30" fill="#6d6455" />
      </>
    ),
  },
  money: {
    bg: ['#f1ece2', '#e2d8c6'],
    body: (
      <>
        <rect x="70" y="60" width="180" height="110" rx="4" fill="#fff" stroke="#111" strokeWidth="3" />
        <path d="M90 140 L130 110 L160 125 L200 85 L230 95" stroke="#d6001c" strokeWidth="5" fill="none" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={95 + i * 36} y={150 - (i + 1) * 9} width="18" height={(i + 1) * 9} fill="#111" opacity=".15" />
        ))}
        <circle cx="250" cy="60" r="20" fill="#ffd56b" stroke="#111" strokeWidth="3" />
        <text x="250" y="67" textAnchor="middle" fontSize="18" fontWeight="800" fill="#111">kr</text>
      </>
    ),
  },
  snow: {
    bg: ['#8fb3d9', '#5f84b5'],
    body: (
      <>
        <path d="M0 150 Q90 125 170 145 T320 135 V200 H0Z" fill="#fff" />
        <path d="M70 150 L95 100 L120 150Z" fill="#2f6b4a" />
        <path d="M230 145 L262 85 L294 145Z" fill="#2f6b4a" />
        <path d="M76 140 L95 112 L114 140" fill="#fff" opacity=".8" />
        {Array.from({ length: 26 }).map((_, i) => (
          <circle key={i} cx={(i * 47) % 320} cy={(i * 29) % 130} r={i % 3 === 0 ? 3 : 2} fill="#fff" opacity=".9" />
        ))}
      </>
    ),
  },
  sun: {
    bg: ['#ffd27a', '#f7a94b'],
    body: (
      <>
        <circle cx="160" cy="90" r="40" fill="#fff3c4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return <line key={i} x1={160 + Math.cos(a) * 52} y1={90 + Math.sin(a) * 52} x2={160 + Math.cos(a) * 68} y2={90 + Math.sin(a) * 68} stroke="#fff3c4" strokeWidth="5" strokeLinecap="round" />
        })}
        <path d="M0 165 Q160 140 320 165 V200 H0Z" fill="#7aa35a" />
      </>
    ),
  },
  wind: {
    bg: ['#a9d2ea', '#7ab4d8'],
    body: (
      <>
        <path d="M0 160 H320 V200 H0Z" fill="#3e7fa6" />
        {[
          [90, 40],
          [210, 60],
        ].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <rect x="-3" y="0" width="6" height={150 - y} fill="#fff" />
            <g fill="#fff">
              <path d="M0 0 L-4 -46 L4 -46Z" />
              <path d="M0 0 L40 22 L36 28Z" />
              <path d="M0 0 L-40 22 L-36 28Z" transform="rotate(10)" />
            </g>
            <circle r="5" fill="#d6001c" />
          </g>
        ))}
      </>
    ),
  },
  stage: {
    bg: ['#2b0f3a', '#120618'],
    body: (
      <>
        <path d="M60 0 L120 160 H20Z" fill="#ff5fa2" opacity=".25" />
        <path d="M260 0 L300 160 H200Z" fill="#6bd1ff" opacity=".25" />
        <path d="M160 0 L210 160 H110Z" fill="#ffd56b" opacity=".25" />
        <rect x="0" y="160" width="320" height="40" fill="#3b1a4d" />
        <circle cx="160" cy="118" r="12" fill="#f2e6c9" />
        <path d="M146 160 L152 132 H168 L174 160Z" fill="#d6001c" />
        <path d="M172 126 L188 112" stroke="#ccc" strokeWidth="3" />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={i * 24 + 6} cy={192} r="8" fill="#000" />
        ))}
      </>
    ),
  },
  bake: {
    bg: ['#f6e3c7', '#ecc99b'],
    body: (
      <>
        <rect x="0" y="150" width="320" height="50" fill="#b98457" />
        <ellipse cx="160" cy="150" rx="90" ry="12" fill="#fff" />
        <path d="M95 148 Q100 95 160 92 Q220 95 225 148Z" fill="#c4813f" />
        <path d="M100 120 Q160 108 220 120" stroke="#fff" strokeWidth="5" fill="none" opacity=".8" />
        <circle cx="160" cy="86" r="8" fill="#d6001c" />
        <path d="M250 60 l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-17 9 l4 -18 l-13 -12 l18 -2Z" fill="#ffd56b" />
      </>
    ),
  },
  tv: {
    bg: ['#d33a3a', '#9e1f2a'],
    body: (
      <>
        <rect x="80" y="45" width="160" height="110" rx="10" fill="#111" />
        <rect x="92" y="57" width="136" height="86" rx="4" fill="#2d6a4f" />
        <path d="M120 140 L160 85 L200 140Z" fill="#fff" />
        <circle cx="160" cy="80" r="10" fill="#ffd56b" />
        <path d="M130 170 H190" stroke="#111" strokeWidth="8" strokeLinecap="round" />
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={(i * 61) % 320} cy={(i * 37) % 40 + 10} r="2" fill="#fff" />
        ))}
      </>
    ),
  },
  music: {
    bg: ['#191919', '#2b2b2b'],
    body: (
      <>
        <circle cx="160" cy="100" r="72" fill="#0b0b0b" />
        {[60, 50, 40].map((r) => (
          <circle key={r} cx="160" cy="100" r={r} fill="none" stroke="#333" strokeWidth="2" />
        ))}
        <circle cx="160" cy="100" r="22" fill="#d6001c" />
        <circle cx="160" cy="100" r="4" fill="#111" />
        <path d="M255 40 V100 a12 12 0 1 1 -6 -10 V52 L285 44 V92 a12 12 0 1 1 -6 -10 V40Z" fill="#ffd56b" />
      </>
    ),
  },
  festival: {
    bg: ['#ff8a5b', '#ff5470'],
    body: (
      <>
        <path d="M60 160 L160 50 L260 160Z" fill="#fff" />
        <path d="M60 160 L160 50 L160 160Z" fill="#f1e6d8" />
        <path d="M160 50 V30" stroke="#111" strokeWidth="3" />
        <path d="M160 30 L180 36 L160 42Z" fill="#111" />
        <rect x="0" y="160" width="320" height="40" fill="#3d2b5a" />
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={i * 21 + 4} cy={170 + (i % 3) * 4} r="7" fill="#1b1230" />
        ))}
      </>
    ),
  },
  books: {
    bg: ['#efe6d6', '#dccfb8'],
    body: (
      <>
        <rect x="0" y="160" width="320" height="40" fill="#8b6b4a" />
        {[
          ['#d6001c', 70, 70],
          ['#111', 96, 50],
          ['#2f6b5a', 118, 80],
          ['#e0a12b', 150, 60],
          ['#1f6feb', 176, 74],
          ['#7b3fe4', 206, 56],
          ['#111', 228, 84],
        ].map(([c, x, h]) => (
          <rect key={String(x)} x={Number(x)} y={160 - Number(h)} width="22" height={Number(h)} fill={String(c)} />
        ))}
      </>
    ),
  },
  farm: {
    bg: ['#cfe3ef', '#b2d0e3'],
    body: (
      <>
        <path d="M0 130 Q160 100 320 130 V200 H0Z" fill="#9cbf6a" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${-20 + i * 70} 200 L${60 + i * 50} 130`} stroke="#7aa24f" strokeWidth="6" />
        ))}
        <rect x="200" y="80" width="70" height="50" fill="#b03a2e" />
        <path d="M195 82 L235 55 L275 82Z" fill="#7a261e" />
        <rect x="226" y="100" width="18" height="30" fill="#fff" />
      </>
    ),
  },
  road: {
    bg: ['#c9d6dd', '#a9bbc5'],
    body: (
      <>
        <path d="M0 120 Q160 100 320 120 V200 H0Z" fill="#86a66a" />
        <path d="M120 200 L150 110 H170 L230 200Z" fill="#555" />
        <path d="M168 200 L161 110" stroke="#fff" strokeWidth="3" strokeDasharray="10 10" />
        <g transform="translate(195 150)" stroke="#111" strokeWidth="3" fill="none">
          <circle cx="-10" cy="12" r="9" />
          <circle cx="14" cy="12" r="9" />
          <path d="M-10 12 L2 0 L14 12" />
        </g>
        <circle cx="198" cy="138" r="6" fill="#c6e83a" />
      </>
    ),
  },
  train: {
    bg: ['#dfe7ee', '#c3d2de'],
    body: (
      <>
        <rect x="0" y="150" width="320" height="50" fill="#777" />
        <path d="M0 170 H320" stroke="#444" strokeWidth="4" />
        <rect x="40" y="90" width="230" height="60" rx="14" fill="#d6001c" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={60 + i * 40} y="102" width="28" height="22" rx="3" fill="#cfe6f5" />
        ))}
        <rect x="40" y="132" width="230" height="6" fill="#fff" />
      </>
    ),
  },
  city: {
    bg: ['#f3c9a0', '#e79f77'],
    body: (
      <>
        {[
          [20, 80],
          [70, 50],
          [120, 95],
          [170, 40],
          [220, 75],
          [270, 60],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="44" height={200 - y} fill={i % 2 ? '#5b4a6b' : '#3d3150'} />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={28 + (i % 6) * 50} y={110 + Math.floor(i / 6) * 20} width="8" height="8" fill="#ffd56b" opacity=".8" />
        ))}
      </>
    ),
  },
  grocery: {
    bg: ['#f2ead9', '#e5d6b8'],
    body: (
      <>
        <rect x="30" y="40" width="260" height="10" fill="#8b6b4a" />
        <rect x="30" y="100" width="260" height="10" fill="#8b6b4a" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={36 + i * 25} y={14 + (i % 2) * 6} width="18" height={26 - (i % 2) * 6} fill={['#d6001c', '#1f6feb', '#e0a12b', '#2f6b5a'][i % 4]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={46 + i * 32} cy="88" r="12" fill={['#e0a12b', '#7aa24f', '#d6001c'][i % 3]} />
        ))}
        <g transform="translate(120 130)" stroke="#111" strokeWidth="4" fill="none">
          <path d="M0 0 H14 L26 42 H80 L92 10 H20" />
          <circle cx="34" cy="56" r="6" />
          <circle cx="74" cy="56" r="6" />
        </g>
      </>
    ),
  },
  harbor: {
    bg: ['#bcd9ea', '#8fbcd6'],
    body: (
      <>
        <rect x="0" y="130" width="320" height="70" fill="#2e6c8f" />
        <path d="M80 130 L100 150 H200 L220 130Z" fill="#fff" />
        <path d="M150 130 V60 L200 125Z" fill="#fff" />
        <path d="M146 130 V70 L110 125Z" fill="#d6001c" />
        {[150, 170, 188].map((y) => (
          <path key={y} d={`M0 ${y} Q40 ${y - 6} 80 ${y} T160 ${y} T240 ${y} T320 ${y}`} stroke="#fff" strokeWidth="2" fill="none" opacity=".4" />
        ))}
      </>
    ),
  },
  forest: {
    bg: ['#d7e8cf', '#b9d5ac'],
    body: (
      <>
        <rect x="0" y="160" width="320" height="40" fill="#6b8f4e" />
        {[30, 80, 140, 200, 260].map((x, i) => (
          <g key={x}>
            <rect x={x + 18} y={130} width="8" height="32" fill="#6b4a2e" />
            <circle cx={x + 22} cy={110 - (i % 2) * 10} r={30 - (i % 3) * 4} fill={i % 2 ? '#3f7a3a' : '#2f6b2f'} />
          </g>
        ))}
      </>
    ),
  },
  school: {
    bg: ['#f5e1b8', '#ecc98a'],
    body: (
      <>
        <rect x="40" y="40" width="240" height="120" fill="#2f4f3f" stroke="#8b6b4a" strokeWidth="8" />
        <text x="70" y="100" fill="#fff" fontSize="26" fontFamily="Figtree, sans-serif" fontWeight="700">a² + b² = c²</text>
        <path d="M70 125 H240" stroke="#fff" strokeWidth="2" opacity=".6" />
        <rect x="0" y="160" width="320" height="40" fill="#b98457" />
      </>
    ),
  },
}

export const ILLUSTRATION_KINDS = Object.keys(scenes)

// Royalty-free photos (CC0 / public domain, see src/assets/photos/CREDITS.md), bundled locally.
// A photo named "<kind>.jpg" replaces the SVG scene for that kind.
const photoFiles = import.meta.glob<string>('../assets/photos/*.jpg', { eager: true, query: '?url', import: 'default' })
const PHOTOS: Record<string, string> = Object.fromEntries(
  Object.entries(photoFiles).map(([path, url]) => [path.split('/').pop()!.replace('.jpg', ''), url]),
)

export function Illustration({ kind, className = '', label }: { kind: string; className?: string; label?: string }) {
  const photo = PHOTOS[kind]
  if (photo) {
    return (
      <img
        src={photo}
        alt={label ?? ''}
        aria-hidden={label ? undefined : true}
        loading="lazy"
        decoding="async"
        className={`block h-full w-full object-cover ${className}`}
      />
    )
  }
  const scene = scenes[kind] ?? scenes.city
  const id = `g-${kind}`
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={scene.bg[0]} />
          <stop offset="1" stopColor={scene.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id})`} />
      {scene.body}
    </svg>
  )
}
