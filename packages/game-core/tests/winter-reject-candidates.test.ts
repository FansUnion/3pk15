import { describe, expect, it } from 'vitest'
import {
  assessLevelCandidate,
  LEVELS,
  validateLevel,
  type LevelConfig,
  type OpeningLayout,
} from '../src/index'

const SHEEP_CANDIDATES: Record<string, OpeningLayout['sheep'] | undefined> = {
  default: undefined,
  'front-wide': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'row3-edge': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'front-left-gap': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 },
    { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'front-center-gap': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'right-shift': [
    { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 },
    { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'split-flank': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 6 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 6 },
  ],
}

function withSheepOpening(base: LevelConfig, sheep: OpeningLayout['sheep'] | undefined): LevelConfig {
  return sheep ? { ...base, opening: { ...base.opening, sheep } } : base
}

const candidateDescribe = process.env.RUN_WINTER_REJECT_CANDIDATES === '1' ? describe : describe.skip

candidateDescribe('winter reject candidate openings', () => {
  it.each(['winter-01', 'winter-03', 'winter-05'])('compares one-variable sheep openings for %s', (levelId) => {
    const base = LEVELS.find((level) => level.id === levelId)!
    const reports = Object.entries(SHEEP_CANDIDATES).map(([candidate, sheep]) => {
      const level = withSheepOpening(base, sheep)
      expect(validateLevel(level)).toEqual([])
      return { candidate, report: assessLevelCandidate(level) }
    })

    console.table(reports.map(({ candidate, report }) => ({
      level: levelId,
      candidate,
      verdict: report.verdict,
      findings: report.findings.map((finding) => finding.code).join(','),
      random: `${report.summaries.random.wolfWins}/${report.summaries.random.sheepWins}/${report.summaries.random.draws}`,
      mixed: `${report.summaries.mixed.wolfWins}/${report.summaries.mixed.sheepWins}/${report.summaries.mixed.draws}`,
      p95: report.summaries.mixed.p95Plies,
      eaten: report.summaries.mixed.averageEaten,
      firstCapture: report.summaries.mixed.firstCaptureCoverage,
    })))
    expect(reports).toHaveLength(7)
  }, 60_000)
})
