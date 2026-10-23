export const HOUR = 3_600_000
export const DAY = 24 * HOUR

const WEEKDAYS = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
const MONTHS = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
]

/** "Fredag 23. oktober" */
export function formatLongDate(ts: number): string {
  const d = new Date(ts)
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

/** "23. okt. kl. 21.00" */
export function formatShortDateTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}. ${MONTHS[d.getMonth()].slice(0, 3)}. kl. ${hh}.${mm}`
}

/** Calendar key used for "max once per day" logic. */
export function dateKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** ISO week key, e.g. "2026-W43". */
export function weekKey(ts: number): string {
  const d = new Date(ts)
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNr = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNr + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / DAY - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${target.getUTCFullYear()}-W${week}`
}

/** "5 t 12 min", "3 dage", "12 min" */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'nu'
  const mins = Math.floor(ms / 60_000)
  const days = Math.floor(mins / 1440)
  if (days >= 2) return `${days} dage`
  if (days === 1) return `1 dag ${Math.floor((mins % 1440) / 60)} t`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  return `${h} t ${m} min`
}

export function formatAgo(ms: number): string {
  const mins = Math.max(1, Math.floor(ms / 60_000))
  if (mins < 60) return `${mins} min. siden`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h} t. siden`
  const d = Math.floor(h / 24)
  return d === 1 ? 'I går' : `${d} dage siden`
}

export const fmtInt = (n: number) => n.toLocaleString('da-DK')
