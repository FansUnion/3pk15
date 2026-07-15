export type Rng = { nextFloat(): number }

/** Mulberry32 ? deterministic given seed. */
export function createSeededRng(seed: number): Rng {
  let t = seed >>> 0
  return {
    nextFloat() {
      t += 0x6d2b79f5
      let r = Math.imul(t ^ (t >>> 15), 1 | t)
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    },
  }
}

export function pickIndex(rng: Rng, length: number): number {
  if (length <= 0) throw new Error('pickIndex: empty')
  return Math.min(length - 1, Math.floor(rng.nextFloat() * length))
}
