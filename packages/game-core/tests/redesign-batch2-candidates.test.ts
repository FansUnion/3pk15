import { describe, expect, it } from 'vitest'
import { auditLevel, LEVELS, validateLevel, type LevelConfig, type OpeningLayout, type Pos } from '../src/index'

const SPLIT_LEFT: Pos[] = [
  { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 6 },
  { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 5 }, { r: 2, c: 6 },
  { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
]

const SPLIT_RIGHT: Pos[] = SPLIT_LEFT.map(({ r, c }) => ({ r, c: 7 - c }))

type Candidate = { name: string; rocks: Pos[]; opening?: OpeningLayout }

const CANDIDATES: Record<string, Candidate[]> = {
  'spring-06': [
    { name: 'graduation-wedge', rocks: [{ r: 4, c: 2 }, { r: 5, c: 4 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }] } },
    { name: 'graduation-switchback', rocks: [{ r: 4, c: 1 }, { r: 5, c: 5 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_LEFT } },
    { name: 'graduation-center-post', rocks: [{ r: 4, c: 3 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
  ],
  'autumn-02': [
    { name: 'vertical-corridor', rocks: [{ r: 4, c: 1 }, { r: 4, c: 5 }, { r: 5, c: 3 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] } },
    { name: 'offset-corridor', rocks: [{ r: 4, c: 2 }, { r: 5, c: 4 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }] } },
    { name: 'open-corridor', rocks: [{ r: 4, c: 1 }, { r: 5, c: 5 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
  ],
  'autumn-04': [
    { name: 'broken-diagonal', rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }, { r: 5, c: 2 }, { r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 5 }] } },
    { name: 'two-islands', rocks: [{ r: 4, c: 2 }, { r: 4, c: 6 }, { r: 5, c: 4 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: SPLIT_LEFT } },
    { name: 'staggered-bridge', rocks: [{ r: 4, c: 1 }, { r: 4, c: 5 }, { r: 5, c: 3 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
  ],
  'autumn-05': [
    { name: 'timing-window-left', rocks: [{ r: 4, c: 2 }, { r: 5, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: SPLIT_LEFT } },
    { name: 'timing-window-right', rocks: [{ r: 4, c: 5 }, { r: 5, c: 2 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_LEFT } },
    { name: 'timing-window-hook', rocks: [{ r: 4, c: 1 }, { r: 5, c: 4 }], opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
  ],
  'winter-04': [
    { name: 'single-edge-break', rocks: [{ r: 4, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }], sheep: SPLIT_LEFT } },
    { name: 'single-center-loop', rocks: [{ r: 4, c: 4 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
    { name: 'open-opposed-flocks', rocks: [], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
  ],
  'winter-05': [
    { name: 'diagonal-snow-posts', rocks: [{ r: 4, c: 2 }, { r: 5, c: 5 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: SPLIT_LEFT } },
    { name: 'opposed-snow-posts', rocks: [{ r: 4, c: 5 }, { r: 5, c: 2 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: SPLIT_RIGHT } },
    { name: 'single-edge-ring-break', rocks: [{ r: 5, c: 6 }], opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }], sheep: SPLIT_LEFT } },
  ],
}

const candidateDescribe = process.env.RUN_REDESIGN_BATCH2 === '1' ? describe : describe.skip

candidateDescribe('second batch redesign candidates', () => {
  const selectedLevel = process.env.REDESIGN_LEVEL
  const ids = selectedLevel ? [selectedLevel] : Object.keys(CANDIDATES)
  it.each(ids)('%s compares three structurally distinct candidates', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const rows = CANDIDATES[levelId]!.map((candidate) => {
      const level = { ...base, rocks: candidate.rocks, opening: candidate.opening ?? base.opening } satisfies LevelConfig
      const errors = validateLevel(level)
      const report = errors.length === 0 ? auditLevel(level, {
        seeds: [20260717, 20260718, 20260719], hardMaxNodes: 80, solveDepth: 2, solveMaxNodes: 2_000,
      }) : null
      return {
        candidate: candidate.name,
        rocks: candidate.rocks.length,
        valid: errors.length === 0,
        verdict: report?.verdict ?? 'invalid',
        reasons: report?.reasons.join(',') ?? errors.join(','),
        random: report ? `${report.simulation.summaries.random.wolfWins}/${report.simulation.summaries.random.sheepWins}/${report.simulation.summaries.random.draws}` : '-',
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
  'spring-06': 'graduation-wedge',
  'autumn-02': 'offset-corridor',
  'autumn-04': 'two-islands',
  'autumn-05': 'timing-window-right',
  'winter-04': 'single-center-loop',
  'winter-05': 'opposed-snow-posts',
}

candidateDescribe('second batch redesign finalists', () => {
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
    }])
    expect(validateLevel(level)).toEqual([])
    expect(report.simulation.games).toHaveLength(30)
  }, 120_000)
})
