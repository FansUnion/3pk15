import { describe, expect, it } from 'vitest'
import { auditLevel, LEVELS, topologySignatureGroup, validateLevel, type LevelConfig, type OpeningLayout, type Pos } from '../src/index'

const SPLIT_FLOCK: Pos[] = [
  { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 5 }, { r: 1, c: 6 },
  { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
  { r: 3, c: 1 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
]

type Candidate = { name: string; rocks: Pos[]; opening?: OpeningLayout }

const CANDIDATES: Record<string, Candidate[]> = {
  'spring-03': [
    { name: 'short-chain-hook', rocks: [{ r: 4, c: 3 }, { r: 5, c: 1 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
    { name: 'short-chain-lower', rocks: [{ r: 5, c: 2 }, { r: 5, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }] } },
    { name: 'short-chain-corner', rocks: [{ r: 4, c: 4 }, { r: 5, c: 1 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 5 }, { r: 6, c: 6 }], sheep: SPLIT_FLOCK } },
  ],
  'summer-03': [
    { name: 'open-funnel', rocks: [{ r: 3, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }] } },
    { name: 'asymmetric-funnel', rocks: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 4 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }] } },
    { name: 'split-funnel', rocks: [{ r: 4, c: 1 }, { r: 4, c: 5 }, { r: 5, c: 3 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_FLOCK } },
  ],
  'summer-06': [
    { name: 'three-point-pressure', rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 5, c: 4 }] },
    { name: 'offset-pressure', rocks: [{ r: 3, c: 6 }, { r: 4, c: 1 }, { r: 5, c: 3 }] },
    { name: 'split-pressure', rocks: [{ r: 4, c: 2 }, { r: 5, c: 4 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }], sheep: SPLIT_FLOCK } },
  ],
  'autumn-06': [
    { name: 'harvest-diamond', rocks: [{ r: 3, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 4 }, { r: 5, c: 6 }] },
    { name: 'harvest-stagger', rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 4 }, { r: 5, c: 2 }] },
    { name: 'harvest-three-islands', rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }], sheep: SPLIT_FLOCK } },
  ],
}

const run = process.env.RUN_REDESIGN_BATCH3 === '1' ? describe : describe.skip

run('third batch risk candidates', () => {
  it.each(Object.keys(CANDIDATES))('%s compares lower-risk structures', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const otherSignatures = new Set(LEVELS.filter((level) => level.id !== levelId && level.rocks.length > 0).map(topologySignatureGroup))
    const rows = CANDIDATES[levelId]!.map((candidate) => {
      const level = { ...base, rocks: candidate.rocks, opening: candidate.opening ?? base.opening } satisfies LevelConfig
      const errors = validateLevel(level)
      const report = errors.length === 0 ? auditLevel(level, {
        seeds: [20260717, 20260718, 20260719, 20260720, 20260721], hardMaxNodes: 80, solveDepth: 2, solveMaxNodes: 2_000,
      }) : null
      return {
        candidate: candidate.name,
        unique: !otherSignatures.has(topologySignatureGroup(level)),
        valid: errors.length === 0,
        verdict: report?.verdict ?? 'invalid',
        reasons: report?.reasons.join(',') ?? errors.join(','),
        mixed: report ? `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}` : '-',
        chain: report ? `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}` : '-',
        p95: report?.simulation.summaries.mixed.p95Plies ?? '-',
      }
    })
    console.table(rows)
    expect(rows.some((row) => row.valid && row.unique && row.verdict !== 'reject')).toBe(true)
  }, 120_000)
})

const FINALISTS: Record<string, string> = {
  'spring-03': 'short-chain-lower',
  'summer-03': 'asymmetric-funnel',
  'summer-06': 'offset-pressure',
  'autumn-06': 'harvest-three-islands',
}

run('third batch finalists', () => {
  it.each(Object.keys(FINALISTS))('%s finalist survives ten seeds', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const candidate = CANDIDATES[levelId]!.find((item) => item.name === FINALISTS[levelId])!
    const level = { ...base, rocks: candidate.rocks, opening: candidate.opening ?? base.opening } satisfies LevelConfig
    const report = auditLevel(level, {
      seeds: Array.from({ length: 10 }, (_, index) => 20260717 + index), hardMaxNodes: 80, solveDepth: 4, solveMaxNodes: 10_000,
    })
    console.table([{
      level: levelId,
      candidate: candidate.name,
      verdict: report.verdict,
      reasons: report.reasons.join(','),
      random: `${report.simulation.summaries.random.wolfWins}/${report.simulation.summaries.random.sheepWins}/${report.simulation.summaries.random.draws}`,
      mixed: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
      chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
      p95: report.simulation.summaries.mixed.p95Plies,
    }])
    expect(validateLevel(level)).toEqual([])
    expect(report.verdict).not.toBe('reject')
  }, 120_000)
})
