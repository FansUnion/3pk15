import { describe, expect, it } from 'vitest'
import { auditLevel, LEVELS, validateLevel, type LevelConfig, type OpeningLayout, type Pos } from '../src/index'

const SPLIT_SHEEP: Pos[] = [
  { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 5 }, { r: 1, c: 6 },
  { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
  { r: 3, c: 1 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
]

const EDGE_SHEEP: Pos[] = [
  { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
  { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
  { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
]

type Candidate = { name: string; rocks: Pos[]; opening?: OpeningLayout }

const CANDIDATES: Record<string, Candidate[]> = {
  'winter-02': [
    { name: 'open-split', rocks: [], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_SHEEP } },
    { name: 'single-anchor', rocks: [{ r: 4, c: 3 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_SHEEP } },
    { name: 'double-gate', rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: EDGE_SHEEP } },
  ],
  'autumn-01': [
    { name: 'clear-narrow-gate', rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
    { name: 'three-lane-choice', rocks: [{ r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
    { name: 'asymmetric-pocket', rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 1 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
  ],
  'autumn-03': [
    { name: 'open-chain-cross', rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_SHEEP } },
    { name: 'staggered-chain', rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }] } },
    { name: 'four-point-harvest', rocks: [{ r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
  ],
  'summer-06': [
    { name: 'asymmetric-two-route', rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_SHEEP } },
    { name: 'three-point-finale', rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 5 }, { r: 6, c: 6 }] } },
    { name: 'broken-pressure-line', rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 4 }, { r: 5, c: 2 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
  ],
  'winter-06': [
    { name: 'open-final-split', rocks: [], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_SHEEP } },
    { name: 'single-final-anchor', rocks: [{ r: 4, c: 3 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: EDGE_SHEEP } },
    { name: 'final-double-gate', rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: SPLIT_SHEEP } },
  ],
}

const candidateDescribe = process.env.RUN_REDESIGN_BATCH1 === '1' ? describe : describe.skip

candidateDescribe('first batch redesign candidates', () => {
  const selectedLevel = process.env.REDESIGN_LEVEL
  const ids = selectedLevel ? [selectedLevel] : Object.keys(CANDIDATES)
  it.each(ids)('%s has three structurally valid candidates and a quick evidence row', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const rows = CANDIDATES[levelId]!.map((candidate) => {
      const level = { ...base, rocks: candidate.rocks, opening: candidate.opening ?? base.opening } satisfies LevelConfig
      const structuralErrors = validateLevel(level)
      const report = structuralErrors.length === 0 ? auditLevel(level, {
        seeds: [20260717, 20260718, 20260719],
        hardMaxNodes: 80,
        solveDepth: 2,
        solveMaxNodes: 2_000,
      }) : null
      return {
        candidate: candidate.name,
        rocks: candidate.rocks.length,
        valid: structuralErrors.length === 0,
        errors: structuralErrors.join(','),
        verdict: report?.verdict ?? 'invalid',
        mixed: report ? `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}` : '-',
        chain: report ? `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}` : '-',
      }
    })
    console.table(rows)
    expect(rows).toHaveLength(3)
    expect(rows.every((row) => row.valid)).toBe(true)
  }, 120_000)
})

const FINALISTS: Record<string, string> = {
  'winter-02': 'single-anchor',
  'autumn-01': 'clear-narrow-gate',
  'autumn-03': 'open-chain-cross',
  'summer-06': 'broken-pressure-line',
  'winter-06': 'final-double-gate',
}

candidateDescribe('first batch redesign finalists', () => {
  const selectedLevel = process.env.REDESIGN_LEVEL
  const ids = selectedLevel ? [selectedLevel] : Object.keys(FINALISTS)
  it.each(ids)('%s finalist survives a ten-seed gate', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const candidate = CANDIDATES[levelId]!.find((item) => item.name === FINALISTS[levelId])!
    const level = { ...base, rocks: candidate.rocks, opening: candidate.opening ?? base.opening } satisfies LevelConfig
    const report = auditLevel(level, {
      seeds: Array.from({ length: 10 }, (_, index) => 20260717 + index),
      hardMaxNodes: 80,
      solveDepth: 4,
      solveMaxNodes: 10_000,
    })
    console.table([{
      level: levelId,
      candidate: candidate.name,
      verdict: report.verdict,
      reasons: report.reasons.join(','),
      random: `${report.simulation.summaries.random.wolfWins}/${report.simulation.summaries.random.sheepWins}/${report.simulation.summaries.random.draws}`,
      mixed: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
      chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
      solver: report.finite.verdict,
    }])
    expect(validateLevel(level)).toEqual([])
    expect(report.simulation.games).toHaveLength(30)
  }, 120_000)
})
