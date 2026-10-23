// Deterministic pseudo-randomness so synthetic demo data is stable across reloads.

export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function rng(seed: string) {
  let a = hash(seed)
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Round shares so they are integers summing to exactly 100. */
export function normalize100(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0) || 1
  const raw = values.map((v) => (v / total) * 100)
  const floored = raw.map(Math.floor)
  let rest = 100 - floored.reduce((a, b) => a + b, 0)
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0])
  for (const [, i] of order) {
    if (rest <= 0) break
    floored[i]++
    rest--
  }
  return floored
}
