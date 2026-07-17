import { describe, expect, it } from 'vitest'
import { assessLevelCandidate, LEVELS, validateLevel } from '../src/index'

const ROCK_CANDIDATES = {
  current: [{ r: 4, c: 6 }],
  'mid-right': [{ r: 4, c: 5 }],
  center: [{ r: 4, c: 4 }],
  'upper-edge': [{ r: 3, c: 6 }],
  'lower-edge': [{ r: 5, c: 6 }],
}

const candidateDescribe = process.env.RUN_SPRING_02_CANDIDATES === '1' ? describe : describe.skip

candidateDescribe('spring-02 rock candidates', () => {
  it('compares one-rock positions without changing any other level parameter', () => {
    const base = LEVELS.find((level) => level.id === 'spring-02')!
    const reports = Object.entries(ROCK_CANDIDATES).map(([candidate, rocks]) => {
      const level = { ...base, rocks }
      expect(validateLevel(level)).toEqual([])
      return { candidate, report: assessLevelCandidate(level) }
    })

    console.table(reports.map(({ candidate, report }) => ({
      candidate,
      verdict: report.verdict,
      findings: report.findings.map((finding) => finding.code).join(','),
      random: `${report.summaries.random.wolfWins}/${report.summaries.random.sheepWins}/${report.summaries.random.draws}`,
      mixed: `${report.summaries.mixed.wolfWins}/${report.summaries.mixed.sheepWins}/${report.summaries.mixed.draws}`,
      average: report.summaries.mixed.averagePlies,
      p95: report.summaries.mixed.p95Plies,
      eaten: report.summaries.mixed.averageEaten,
      firstCapture: report.summaries.mixed.firstCaptureCoverage,
    })))
    expect(reports).toHaveLength(5)
  }, 60_000)
})
