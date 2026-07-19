import { BOARD_MAX, BOARD_MIN } from '../types'
import { inBounds, keyOf, ORTHO, parseKey, posKey } from '../board'
import type { LevelConfig } from '../content/levels'
import type { Pos } from '../types'

export type RockGap = { a: string; b: string; through: string }

export type LevelTopology = {
  levelId: string
  rockCount: number
  traversableComponents: number
  largestComponent: number
  articulationPoints: string[]
  deadEnds: string[]
  alignedRockGaps: RockGap[]
  rockSignature: string
  horizontalMirrorSignature: string
  verticalMirrorSignature: string
  rotationSignature: string
}

function cellsWithoutRocks(rocks: ReadonlySet<string>): string[] {
  const cells: string[] = []
  for (let r = BOARD_MIN; r <= BOARD_MAX; r += 1) {
    for (let c = BOARD_MIN; c <= BOARD_MAX; c += 1) {
      if (!rocks.has(posKey(r, c))) cells.push(posKey(r, c))
    }
  }
  return cells
}

function neighbors(key: string, rocks: ReadonlySet<string>): string[] {
  const { r, c } = parseKey(key)
  return ORTHO
    .map((d) => posKey(r + d.r, c + d.c))
    .filter((candidate) => {
      const position = parseKey(candidate)
      return inBounds(position.r, position.c) && !rocks.has(candidate)
    })
}

function canonicalSignature(rocks: ReadonlySet<string>, transform: (p: Pos) => Pos): string {
  return [...rocks]
    .map((key) => {
      const next = transform(parseKey(key))
      return keyOf(next)
    })
    .sort()
    .join('|')
}

function findArticulationPoints(cells: string[], rocks: ReadonlySet<string>): string[] {
  const discovery = new Map<string, number>()
  const low = new Map<string, number>()
  const parent = new Map<string, string | null>()
  const result = new Set<string>()
  let time = 0

  const visit = (node: string) => {
    discovery.set(node, time)
    low.set(node, time)
    time += 1
    let children = 0
    for (const next of neighbors(node, rocks)) {
      if (!discovery.has(next)) {
        parent.set(next, node)
        children += 1
        visit(next)
        low.set(node, Math.min(low.get(node)!, low.get(next)!))
        const nodeParent = parent.get(node)
        if (nodeParent === null && children > 1) result.add(node)
        if (nodeParent !== null && low.get(next)! >= discovery.get(node)!) result.add(node)
      } else if (next !== parent.get(node)) {
        low.set(node, Math.min(low.get(node)!, discovery.get(next)!))
      }
    }
  }

  for (const cell of cells) {
    if (!discovery.has(cell)) {
      parent.set(cell, null)
      visit(cell)
    }
  }
  return [...result].sort()
}

export function analyzeLevelTopology(level: Pick<LevelConfig, 'id' | 'rocks'>): LevelTopology {
  const rocks = new Set(level.rocks.map(keyOf))
  const cells = cellsWithoutRocks(rocks)
  const seen = new Set<string>()
  const sizes: number[] = []
  for (const start of cells) {
    if (seen.has(start)) continue
    const queue = [start]
    seen.add(start)
    let size = 0
    while (queue.length > 0) {
      const current = queue.shift()!
      size += 1
      for (const next of neighbors(current, rocks)) {
        if (!seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
    sizes.push(size)
  }

  const alignedRockGaps: RockGap[] = []
  for (const rock of level.rocks) {
    for (const direction of ORTHO) {
      const other = { r: rock.r + direction.r * 2, c: rock.c + direction.c * 2 }
      const through = { r: rock.r + direction.r, c: rock.c + direction.c }
      if (inBounds(other.r, other.c) && rocks.has(keyOf(other)) && !rocks.has(keyOf(through))) {
        const a = keyOf(rock)
        const b = keyOf(other)
        if (a < b) alignedRockGaps.push({ a, b, through: keyOf(through) })
      }
    }
  }

  return {
    levelId: level.id,
    rockCount: rocks.size,
    traversableComponents: sizes.length,
    largestComponent: Math.max(0, ...sizes),
    articulationPoints: findArticulationPoints(cells, rocks),
    deadEnds: cells.filter((cell) => neighbors(cell, rocks).length <= 1).sort(),
    alignedRockGaps: alignedRockGaps.sort((left, right) => `${left.a}:${left.b}`.localeCompare(`${right.a}:${right.b}`)),
    rockSignature: canonicalSignature(rocks, (p) => p),
    horizontalMirrorSignature: canonicalSignature(rocks, (p) => ({ r: p.r, c: BOARD_MAX + BOARD_MIN - p.c })),
    verticalMirrorSignature: canonicalSignature(rocks, (p) => ({ r: BOARD_MAX + BOARD_MIN - p.r, c: p.c })),
    rotationSignature: canonicalSignature(rocks, (p) => ({
      r: BOARD_MAX + BOARD_MIN - p.r,
      c: BOARD_MAX + BOARD_MIN - p.c,
    })),
  }
}

export function topologySignatureGroup(level: Pick<LevelConfig, 'id' | 'rocks'>): string {
  const topology = analyzeLevelTopology(level)
  return [topology.rockSignature, topology.horizontalMirrorSignature, topology.verticalMirrorSignature, topology.rotationSignature]
    .sort()
    .join('||')
}
