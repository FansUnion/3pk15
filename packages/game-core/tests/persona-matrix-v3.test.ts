import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assessPersonaMatrix, LEVELS, SHEEP_AI_ALGORITHM_VERSION } from '../src/index'

const enabled = process.env.RUN_PERSONA_MATRIX === '1' ? describe : describe.skip
const seeds = [20260720, 20260721]
const requestedLevel = process.env.PERSONA_LEVEL
const levels = LEVELS.filter((level) => !requestedLevel || level.id === requestedLevel)

/** Slow four-persona evidence run; outcomes are proxy behavior, never human win rates. */
enabled('24-level V3 player-persona matrix', () => {
  it('writes reproducible evidence for every production level', () => {
    const reports = levels.map((level) => assessPersonaMatrix(level, seeds))
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
    console.table(reports.map((report) => ({
      level: report.levelId,
      novice: `${report.summaries.novice.wolfWins}/${report.summaries.novice.sheepWins}/${report.summaries.novice.draws}`,
      regular: `${report.summaries.regular.wolfWins}/${report.summaries.regular.sheepWins}/${report.summaries.regular.draws}`,
      skilled: `${report.summaries.skilled.wolfWins}/${report.summaries.skilled.sheepWins}/${report.summaries.skilled.draws}`,
      expert: `${report.summaries.expert.wolfWins}/${report.summaries.expert.sheepWins}/${report.summaries.expert.draws}`,
    })))
    expect(reports).toHaveLength(levels.length)
    expect(reports.every((report) => report.games.length === seeds.length * 4)).toBe(true)
  }, 900_000)
})
