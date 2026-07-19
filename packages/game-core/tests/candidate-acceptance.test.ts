import { describe, expect, it } from 'vitest'
import { assessLevelCandidate, LEVELS } from '../src/index'

describe('level candidate acceptance', () => {
  it('rejects a structurally invalid candidate without simulating it', () => {
    const candidate = { ...LEVELS[0]!, rocks: [{ r: 9, c: 9 }] }
    const report = assessLevelCandidate(candidate, { seeds: [1] })

    expect(report.verdict).toBe('reject')
    expect(report.findings.some((finding) => finding.code === 'STRUCTURE_INVALID')).toBe(true)
    expect(report.games).toEqual([])
  })

  it('returns reproducible evidence and summaries for a legal candidate', () => {
    const options = { seeds: [20260717, 20260718], hardMaxNodes: 20 }
    const first = assessLevelCandidate(LEVELS[0]!, options)
    const second = assessLevelCandidate(LEVELS[0]!, options)

    expect(first).toEqual(second)
    expect(first.games).toHaveLength(6)
    expect(first.games.every((game) => game.trace.length > 0)).toBe(true)
    expect(first.games.every((game) => game.finalSheepAdvantage.wolfMoveCount >= 0)).toBe(true)
    expect(first.summaries.random.wolfWins + first.summaries.random.sheepWins + first.summaries.random.draws).toBe(2)
    expect(first.summaries['chain-aware'].wolfWins + first.summaries['chain-aware'].sheepWins + first.summaries['chain-aware'].draws).toBe(2)
  }, 15_000)
})

const productionDescribe = process.env.RUN_CANDIDATE_ACCEPTANCE === '1' ? describe : describe.skip

productionDescribe('production level candidate gate', () => {
  it.each(['spring', 'summer', 'autumn', 'winter'] as const)('prints the current %s verdicts and evidence triggers', (chapterId) => {
    const reports = LEVELS.filter((level) => level.chapterId === chapterId).map((level) => assessLevelCandidate(level))
    console.table(reports.map((report) => ({
      level: report.levelId,
      verdict: report.verdict,
      findings: report.findings.map((finding) => finding.code).join(','),
      random: `${report.summaries.random.wolfWins}/${report.summaries.random.sheepWins}/${report.summaries.random.draws}`,
      mixed: `${report.summaries.mixed.wolfWins}/${report.summaries.mixed.sheepWins}/${report.summaries.mixed.draws}`,
      p95: report.summaries.mixed.p95Plies,
    })))
    expect(reports).toHaveLength(6)
    expect(reports.every((report) => report.structuralErrors.length === 0)).toBe(true)
  }, 60_000)
})
