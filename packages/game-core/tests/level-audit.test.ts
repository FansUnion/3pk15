import { describe, expect, it } from 'vitest'
import { auditLevels, LEVELS } from '../src/index'

describe('unified level audit', () => {
  it('combines topology, simulation and finite evidence for all levels', () => {
    const reports = auditLevels(LEVELS, {
      seeds: [20260717, 20260718],
      hardMaxNodes: 20,
      solveDepth: 2,
      solveMaxNodes: 2_000,
    })
    expect(reports).toHaveLength(24)
    expect(reports.every((report) => report.topology.levelId === report.levelId)).toBe(true)
    expect(reports.every((report) => report.simulation.levelId === report.levelId)).toBe(true)
    expect(reports.every((report) => ['pass', 'review', 'reject'].includes(report.verdict))).toBe(true)
  }, 60_000)
})

const matrixDescribe = process.env.RUN_LEVEL_AUDIT_MATRIX === '1' ? describe : describe.skip

matrixDescribe('unified production audit matrix', () => {
  it('prints one evidence row per production level', () => {
    const chapter = process.env.LEVEL_AUDIT_CHAPTER
    const selected = chapter ? LEVELS.filter((level) => level.chapterId === chapter) : LEVELS
    const reports = auditLevels(selected, {
      seeds: [20260717, 20260718, 20260719, 20260720, 20260721],
      hardMaxNodes: 80,
      solveDepth: 4,
      solveMaxNodes: 10_000,
    })
    console.table(reports.map((report) => ({
      level: report.levelId,
      verdict: report.verdict,
      reasons: report.reasons.join(','),
      sim: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
      chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
      solver: report.finite.verdict,
      nodes: report.finite.nodes,
      sheepBlocked: report.simulation.games.filter((game) => game.winner === 'sheep').map((game) => game.finalSheepAdvantage.trappedWolfCount).join(','),
    })))
    expect(reports).toHaveLength(chapter ? 6 : 24)
    expect(reports.every((report) => report.verdict !== 'reject')).toBe(true)
    expect(reports.every((report) => report.simulation.summaries['chain-aware'].wolfWins > 0)).toBe(true)
    const structuralRiskCodes = new Set([
      'TOPOLOGY_DISCONNECTED',
      'DEAD_END_PRESSURE',
      'REPEATED_ROCK_TOPOLOGY',
      'FIRST_CAPTURE_BLOCKED',
      'LONG_TAIL',
      'WOLF_FORCED_WIN_RISK',
      'UNEXPECTED_TERMINAL',
    ])
    expect(reports.every((report) => report.reasons.every((reason) => !structuralRiskCodes.has(reason)))).toBe(true)
  }, 120_000)
})
