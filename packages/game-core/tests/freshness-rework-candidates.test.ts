import { describe, expect, it } from 'vitest'
import { auditLevel, LEVELS, topologySignatureGroup, validateLevel, type LevelConfig, type OpeningLayout, type Pos } from '../src/index'

const EDGE_FLOCK: Pos[] = [
  { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
  { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
  { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
]

type Candidate = { name: string; rocks: Pos[]; opening?: OpeningLayout }

const CANDIDATES: Record<string, Candidate[]> = {
  'spring-04': [
    { name: 'lower-edge-turn', rocks: [{ r: 5, c: 1 }] },
    { name: 'lower-inner-turn', rocks: [{ r: 5, c: 2 }] },
    { name: 'upper-inner-turn', rocks: [{ r: 3, c: 2 }] },
  ],
  'autumn-01': [
    { name: 'sloped-gate', rocks: [{ r: 4, c: 2 }, { r: 5, c: 5 }] },
    { name: 'left-hook-gate', rocks: [{ r: 4, c: 1 }, { r: 5, c: 4 }] },
    { name: 'right-hook-gate', rocks: [{ r: 4, c: 6 }, { r: 5, c: 3 }] },
  ],
  'autumn-03': [
    { name: 'offset-chain-cross', rocks: [{ r: 4, c: 2 }, { r: 5, c: 6 }] },
    { name: 'broken-chain-cross', rocks: [{ r: 4, c: 1 }, { r: 5, c: 5 }] },
    { name: 'single-chain-marker', rocks: [{ r: 5, c: 3 }] },
  ],
  'winter-04': [
    { name: 'lower-center-loop', rocks: [{ r: 5, c: 4 }] },
    { name: 'lower-edge-loop', rocks: [{ r: 5, c: 6 }] },
    { name: 'upper-center-loop', rocks: [{ r: 4, c: 3 }] },
  ],
  'winter-02': [
    { name: 'lower-single-anchor', rocks: [{ r: 5, c: 3 }] },
    { name: 'upper-single-anchor', rocks: [{ r: 3, c: 3 }] },
    { name: 'lower-edge-anchor', rocks: [{ r: 5, c: 1 }] },
  ],
  'winter-05': [
    { name: 'opposed-wide-posts', rocks: [{ r: 4, c: 4 }, { r: 5, c: 1 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: EDGE_FLOCK } },
    { name: 'opposed-edge-posts', rocks: [{ r: 4, c: 6 }, { r: 5, c: 2 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: EDGE_FLOCK } },
    { name: 'offset-snow-posts', rocks: [{ r: 4, c: 3 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }], sheep: EDGE_FLOCK } },
  ],
  'winter-06': [
    { name: 'sloped-final-gates', rocks: [{ r: 4, c: 1 }, { r: 5, c: 4 }] },
    { name: 'offset-final-gates', rocks: [{ r: 4, c: 6 }, { r: 5, c: 3 }] },
    { name: 'wide-final-gates', rocks: [{ r: 4, c: 2 }, { r: 5, c: 6 }] },
    { name: 'split-level-final', rocks: [{ r: 4, c: 1 }, { r: 5, c: 5 }] },
    { name: 'inner-final', rocks: [{ r: 4, c: 3 }, { r: 5, c: 5 }] },
    { name: 'outer-final', rocks: [{ r: 4, c: 1 }, { r: 5, c: 6 }] },
  ],
}

const run = process.env.RUN_FRESHNESS_REWORK === '1' ? describe : describe.skip

run('freshness rework candidates', () => {
  it.each(Object.keys(CANDIDATES))('%s removes reflected rock duplicates and retains playable evidence', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const otherSignatures = new Set(LEVELS.filter((level) => level.id !== levelId && level.rocks.length > 0).map(topologySignatureGroup))
    const rows = CANDIDATES[levelId]!.map((candidate) => {
      const level = { ...base, rocks: candidate.rocks, opening: candidate.opening ?? base.opening } satisfies LevelConfig
      const errors = validateLevel(level)
      const report = errors.length === 0 ? auditLevel(level, {
        seeds: [20260717, 20260718, 20260719], hardMaxNodes: 80, solveDepth: 2, solveMaxNodes: 2_000,
      }) : null
      return {
        candidate: candidate.name,
        unique: !otherSignatures.has(topologySignatureGroup(level)),
        valid: errors.length === 0,
        verdict: report?.verdict ?? 'invalid',
        reasons: report?.reasons.join(',') ?? errors.join(','),
        mixed: report ? `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}` : '-',
        chain: report ? `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}` : '-',
      }
    })
    console.table(rows)
    expect(rows.some((row) => row.valid && row.unique && row.verdict !== 'reject')).toBe(true)
  }, 120_000)
})
