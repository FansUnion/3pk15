import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  assessLevelCandidate,
  buildCandidateAcceptanceReport,
  LEVELS,
  type CandidateGameEvidence,
  type CandidateWolfStrategy,
} from '../src/index'

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
  // This deliberately runs the same six games twice to prove byte-for-byte
  // reproducibility; V5 intent analysis can exceed 15s on loaded CI workers.
  }, 60_000)
})

// Slow proxy matrix. Each worker runs one wolf policy so Vitest can keep reporting
// progress; the final verdict is rebuilt from all preserved games by core logic.
const partialDescribe = process.env.RUN_CANDIDATE_PARTIAL === '1' ? describe : describe.skip
const candidateLevel = process.env.CANDIDATE_LEVEL
const candidateStrategy = process.env.CANDIDATE_STRATEGY as CandidateWolfStrategy | undefined
const candidateReportPath = process.env.CANDIDATE_REPORT_PATH
const candidateSeeds = JSON.parse(process.env.CANDIDATE_SEEDS ?? '[]') as number[]

partialDescribe('production level candidate evidence worker', () => {
  it('writes one level and one strategy with full production AI budget', () => {
    const level = LEVELS.find((entry) => entry.id === candidateLevel)
    if (!level || !candidateStrategy || !candidateReportPath || candidateSeeds.length === 0) {
      throw new Error('candidate worker environment is incomplete')
    }
    const report = assessLevelCandidate(level, { strategies: [candidateStrategy], seeds: candidateSeeds })
    mkdirSync(dirname(candidateReportPath), { recursive: true })
    writeFileSync(candidateReportPath, `${JSON.stringify(report.games, null, 2)}\n`, 'utf8')
    expect(report.games).toHaveLength(candidateSeeds.length)
    expect(report.structuralErrors).toEqual([])
  }, 150_000)
})

const aggregateDescribe = process.env.RUN_CANDIDATE_AGGREGATE === '1' ? describe : describe.skip
aggregateDescribe('production level candidate aggregate', () => {
  it('rebuilds final verdicts from every strategy worker', () => {
    const inputDir = process.env.CANDIDATE_INPUT_DIR
    const outputPath = process.env.CANDIDATE_OUTPUT_PATH
    const requestedLevels = JSON.parse(process.env.CANDIDATE_LEVELS ?? '[]') as string[]
    if (!inputDir || !outputPath || requestedLevels.length === 0) throw new Error('candidate aggregate environment is incomplete')
    const reports = requestedLevels.map((levelId) => {
      const level = LEVELS.find((entry) => entry.id === levelId)
      if (!level) throw new Error(`unknown level ${levelId}`)
      const chunks = levelId.startsWith('winter-') ? ['w0', 'w1', 'w2', 'w3', 'w4'] : ['0', '1']
      const games = (['random', 'mixed', 'chain-aware'] as const).flatMap((strategy) =>
        chunks.flatMap((chunk) =>
          JSON.parse(readFileSync(join(inputDir, `${levelId}-${strategy}-${chunk}.json`), 'utf8')) as CandidateGameEvidence[]))
      return buildCandidateAcceptanceReport(level, games, Array.from({ length: 10 }, (_, index) => 20260717 + index))
    })
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
      hunterShare: report.summaries.mixed.averageDominantWolfShare.toFixed(2),
      hunterStreak: report.summaries.mixed.maxSameHunterCaptureStreak,
    })))
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      aiAlgorithmVersion: reports[0]?.aiAlgorithmVersion,
      seeds: Array.from({ length: 10 }, (_, index) => 20260717 + index),
      reports,
    }, null, 2)}\n`, 'utf8')
    expect(reports).toHaveLength(requestedLevels.length)
    expect(reports.every((report) => report.games.length === 30)).toBe(true)
  })
})

const rebuildDescribe = process.env.RUN_CANDIDATE_REBUILD === '1' ? describe : describe.skip
rebuildDescribe('production candidate evidence rebuild', () => {
  it('rebuilds verdicts from preserved game evidence without rerunning matches', () => {
    const path = process.env.CANDIDATE_REBUILD_PATH
    if (!path) throw new Error('CANDIDATE_REBUILD_PATH is required')
    const evidence = JSON.parse(readFileSync(path, 'utf8')) as { seeds: number[]; reports: Array<{ levelId: string; games: CandidateGameEvidence[] }>; [key: string]: unknown }
    const reports = evidence.reports.map((previous) => {
      const level = LEVELS.find((entry) => entry.id === previous.levelId)
      if (!level) throw new Error(`unknown level ${previous.levelId}`)
      return buildCandidateAcceptanceReport(level, previous.games, evidence.seeds)
    })
    writeFileSync(path, `${JSON.stringify({ ...evidence, reports }, null, 2)}\n`, 'utf8')
    expect(reports).toHaveLength(24)
    expect(reports.every((report) => report.games.length === 30)).toBe(true)
  })
})
