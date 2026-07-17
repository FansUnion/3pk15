import { describe, expect, it } from 'vitest'
import { assessLevelCandidate, LEVELS, validateLevel, type OpeningLayout } from '../src/index'

const WOLF_CANDIDATES: Record<string, OpeningLayout['wolves']> = {
  current: [{ r: 6, c: 2 }, { r: 6, c: 5 }, { r: 6, c: 6 }],
  left: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }],
  even: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }],
  flank: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }],
  spread: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }],
}

const ROCK_CANDIDATES = {
  current: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 3 }],
  'open-lower': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }],
  'lower-left': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 1 }],
  'lower-right': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 4 }],
  'center-gate': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 3 }],
}

const candidateDescribe = process.env.RUN_SUMMER_06_CANDIDATES === '1' ? describe : describe.skip

candidateDescribe('summer-06 wolf candidates', () => {
  it('compares bottom-row wolf formations without changing other parameters', () => {
    const base = LEVELS.find((level) => level.id === 'summer-06')!
    const reports = Object.entries(WOLF_CANDIDATES).map(([candidate, wolves]) => {
      const level = { ...base, opening: { ...base.opening, wolves } }
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

  it('compares lower-rock routes without changing other parameters', () => {
    const base = LEVELS.find((level) => level.id === 'summer-06')!
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
