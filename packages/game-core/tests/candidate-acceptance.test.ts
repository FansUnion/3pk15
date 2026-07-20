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
const candidateChapter = process.env.CANDIDATE_CHAPTER
const candidateLevel = process.env.CANDIDATE_LEVEL
const productionLevels = LEVELS.filter((level) => (!candidateChapter || level.chapterId === candidateChapter)
  && (!candidateLevel || level.id === candidateLevel))

productionDescribe('production level candidate gate', () => {
  it.each(productionLevels)('prints the current $id verdict and evidence triggers', (level) => {
    const reports = [assessLevelCandidate(level)]
    console.table(reports.map((report) => ({
      level: report.levelId,
      verdict: report.verdict,
      findings: report.findings.map((finding) => finding.code).join(','),
      random: `${report.summaries.random.wolfWins}/${report.summaries.random.sheepWins}/${report.summaries.random.draws}`,
      mixed: `${report.summaries.mixed.wolfWins}/${report.summaries.mixed.sheepWins}/${report.summaries.mixed.draws}`,
      chainAware: `${report.summaries['chain-aware'].wolfWins}/${report.summaries['chain-aware'].sheepWins}/${report.summaries['chain-aware'].draws}`,
      p95: report.summaries.mixed.p95Plies,
      dominated: report.summaries.mixed.chosenDominated,
      avoidableChain: report.summaries.mixed.avoidableChainExposure,
      degraded: report.summaries.mixed.degradedTurns,
      maxChain: report.summaries.mixed.maxCaptureChain,
    })))
    expect(reports).toHaveLength(1)
    expect(reports.every((report) => report.structuralErrors.length === 0)).toBe(true)
  }, 150_000)
})
