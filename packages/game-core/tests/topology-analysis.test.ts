import { describe, expect, it } from 'vitest'
import { analyzeLevelTopology, createLevelInitialState, LEVELS, topologySignatureGroup, type Pos } from '../src/index'

function completeOpeningSignature(level: (typeof LEVELS)[number]): string {
  const state = createLevelInitialState(level)
  const transforms = [
    ({ r, c }: Pos) => ({ r, c }),
    ({ r, c }: Pos) => ({ r, c: 7 - c }),
    ({ r, c }: Pos) => ({ r: 7 - r, c }),
    ({ r, c }: Pos) => ({ r: 7 - r, c: 7 - c }),
  ]
  return transforms.map((transform) => {
    const rocks = [...state.rocks].map((key) => {
      const [r, c] = key.split(',').map(Number)
      const next = transform({ r: r!, c: c! })
      return `R${next.r},${next.c}`
    })
    const pieces = state.pieces.map((piece) => {
      const next = transform(piece)
      return `${piece.side === 'wolf' ? 'W' : 'S'}${next.r},${next.c}`
    })
    return [...rocks, ...pieces].sort().join('|')
  }).sort()[0]!
}

describe('level topology analysis', () => {
  it('finds connected traversable space and rock gaps', () => {
    const topology = analyzeLevelTopology({
      id: 'topology-fixture',
      rocks: [{ r: 2, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }],
    })
    expect(topology.traversableComponents).toBe(1)
    expect(topology.rockCount).toBe(5)
    expect(topology.alignedRockGaps.length).toBeGreaterThan(0)
  })

  it('groups exact or mirrored rock layouts consistently', () => {
    const original = { id: 'original', rocks: [{ r: 2, c: 1 }, { r: 4, c: 3 }] }
    const mirrored = { id: 'mirrored', rocks: [{ r: 2, c: 6 }, { r: 4, c: 4 }] }
    expect(topologySignatureGroup(original)).toBe(topologySignatureGroup(mirrored))
  })

  it('keeps every non-empty production rock layout distinct up to reflection', () => {
    const groups = new Map<string, string[]>()
    for (const level of LEVELS.filter((item) => item.rocks.length > 0)) {
      const signature = topologySignatureGroup(level)
      groups.set(signature, [...(groups.get(signature) ?? []), level.id])
    }
    expect([...groups.values()].filter((ids) => ids.length > 1)).toEqual([])
  })

  it('keeps every complete production opening distinct up to reflection', () => {
    const groups = new Map<string, string[]>()
    for (const level of LEVELS) {
      const signature = completeOpeningSignature(level)
      groups.set(signature, [...(groups.get(signature) ?? []), level.id])
    }
    expect([...groups.values()].filter((ids) => ids.length > 1)).toEqual([])
  })

  it('does not change production level data', () => {
    expect(LEVELS).toHaveLength(24)
    expect(LEVELS.every((level) => level.rocks.every((rock) => rock.r >= 1 && rock.r <= 6 && rock.c >= 1 && rock.c <= 6))).toBe(true)
  })
})

const matrixDescribe = process.env.RUN_TOPOLOGY_MATRIX === '1' ? describe : describe.skip

matrixDescribe('production topology matrix', () => {
  it('prints topology evidence for all 24 production levels', () => {
    const rows = LEVELS.map((level) => {
      const topology = analyzeLevelTopology(level)
      return {
        level: level.id,
        rocks: topology.rockCount,
        components: topology.traversableComponents,
        articulation: topology.articulationPoints.length,
        deadEnds: topology.deadEnds.length,
        rockGaps: topology.alignedRockGaps.length,
        signature: topologySignatureGroup(level).slice(0, 42),
      }
    })
    console.table(rows)
    expect(rows).toHaveLength(24)
  })
})
