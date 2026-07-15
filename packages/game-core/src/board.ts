import type { Pos } from './types'
import { BOARD_MAX, BOARD_MIN } from './types'

export function posKey(r: number, c: number): string {
  return `${r},${c}`
}

export function keyOf(p: Pos): string {
  return posKey(p.r, p.c)
}

export function parseKey(key: string): Pos {
  const [rs, cs] = key.split(',')
  return { r: Number(rs), c: Number(cs) }
}

export function inBounds(r: number, c: number): boolean {
  return r >= BOARD_MIN && r <= BOARD_MAX && c >= BOARD_MIN && c <= BOARD_MAX
}

export function inBoundsPos(p: Pos): boolean {
  return inBounds(p.r, p.c)
}

/** Orthogonal neighbors: up/down/left/right */
export const ORTHO: ReadonlyArray<Pos> = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
]

export function cloneRocks(rocks: ReadonlySet<string>): Set<string> {
  return new Set(rocks)
}
