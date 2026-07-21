import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assessLearningCurve, assessPersonaMatrix, LEVELS, SHEEP_AI_ALGORITHM_VERSION, simulatePersonaGame, type PersonaMatrixReport, type PlayerPersona } from '../src/index'

const enabled = process.env.RUN_PERSONA_MATRIX === '1' ? describe : describe.skip
const seeds = process.env.PERSONA_SEEDS
  ? JSON.parse(process.env.PERSONA_SEEDS) as number[]
  : Array.from({ length: 10 }, (_, index) => 20260720 + index)
const requestedLevel = process.env.PERSONA_LEVEL
const requestedPersona = process.env.PERSONA_NAME as PlayerPersona | undefined
const levels = LEVELS.filter((level) => !requestedLevel || level.id === requestedLevel)

/** Slow four-persona evidence run; outcomes are proxy behavior, never human win rates. */
enabled('24-level active-opponent player-persona matrix', () => {
  it('writes reproducible evidence for every production level', () => {
    const reports = levels.map((level) => requestedPersona
      ? {
          levelId: level.id,
          aiProfile: level.aiProfile,
          aiStyle: level.aiStyle,
          opponentIntent: level.opponentIntent,
          seeds,
          games: seeds.map((seed) => simulatePersonaGame(level, requestedPersona, seed)),
          summaries: {},
        }
      : assessPersonaMatrix(level, seeds))
    const output = {
      generatedAt: new Date().toISOString(),
      aiAlgorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
      seeds,
      reports,
    }
    const outputPath = process.env.PERSONA_REPORT_PATH
    if (outputPath) {
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
    }
    if (requestedPersona) {
      console.table(reports.map((report) => ({
        level: report.levelId,
        persona: requestedPersona,
        result: `${report.games[0]?.winner}/${report.games[0]?.reason}`,
      })))
    } else {
      const completeReports = reports as PersonaMatrixReport[]
      console.table(completeReports.map((report) => ({
        level: report.levelId,
        novice: `${report.summaries.novice.wolfWins}/${report.summaries.novice.sheepWins}/${report.summaries.novice.draws}`,
        regular: `${report.summaries.regular.wolfWins}/${report.summaries.regular.sheepWins}/${report.summaries.regular.draws}`,
        skilled: `${report.summaries.skilled.wolfWins}/${report.summaries.skilled.sheepWins}/${report.summaries.skilled.draws}`,
        expert: `${report.summaries.expert.wolfWins}/${report.summaries.expert.sheepWins}/${report.summaries.expert.draws}`,
      })))
    }
    expect(reports).toHaveLength(levels.length)
    expect(reports.every((report) => report.games.length === seeds.length * (requestedPersona ? 1 : 4))).toBe(true)
  }, 900_000)
})

const curveEnabled = process.env.RUN_PERSONA_CURVE === '1' ? describe : describe.skip
curveEnabled('24-level learning-curve gate', () => {
  it('appends the product curve assessment to preserved evidence', () => {
    const path = process.env.PERSONA_CURVE_REPORT_PATH
    if (!path) throw new Error('PERSONA_CURVE_REPORT_PATH is required')
    const evidence = JSON.parse(readFileSync(path, 'utf8')) as { reports: PersonaMatrixReport[]; [key: string]: unknown }
    const curveAssessment = assessLearningCurve(evidence.reports)
    writeFileSync(path, `${JSON.stringify({ ...evidence, curveAssessment }, null, 2)}\n`, 'utf8')
    expect(curveAssessment.complete).toBe(true)
    expect(curveAssessment.passed).toBe(true)
    expect(evidence.reports.every((report) => report.games.length === 40)).toBe(true)
    expect(evidence.reports.every((report) => ['novice', 'regular', 'skilled', 'expert'].every((persona) => report.games.filter((game) => game.persona === persona).length === 10))).toBe(true)
  })
})
