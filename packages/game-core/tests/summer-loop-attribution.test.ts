import { describe, expect, it } from 'vitest'
import { assessLevelCandidate, LEVELS, type Difficulty } from '../src/index'

const attributionDescribe = process.env.RUN_SUMMER_LOOP_ATTRIBUTION === '1' ? describe : describe.skip

function summarize(levelId: string, difficulty: Difficulty, hardMaxNodes = 80) {
  const base = LEVELS.find((level) => level.id === levelId)!
  const report = assessLevelCandidate({ ...base, ai: difficulty }, { hardMaxNodes })
  const draws = report.games.filter((game) => game.strategy === 'mixed' && game.reason === 'repetition')
  return {
    level: levelId,
    difficulty,
    hardMaxNodes: difficulty === 'hard' ? hardMaxNodes : 0,
    verdict: report.verdict,
    mixed: `${report.summaries.mixed.wolfWins}/${report.summaries.mixed.sheepWins}/${report.summaries.mixed.draws}`,
    averagePlies: report.summaries.mixed.averagePlies,
    drawSeeds: draws.map((game) => game.seed).join(','),
    cycles: draws.map((game) => ({
      seed: game.seed,
      eaten: game.eaten,
      firstCapture: game.firstCapturePly,
      cycle: game.repetitionCycle,
    })),
  }
}

attributionDescribe('summer repetition attribution', () => {
  it('compares summer-02 under normal and hard sheep AI', () => {
    const rows = [
      summarize('summer-02', 'normal'),
      summarize('summer-02', 'hard', 80),
      summarize('summer-02', 'hard', 400),
    ]
    console.table(rows.map(({ cycles, ...row }) => ({ ...row, cycleLengths: cycles.map((item) => item.cycle?.actions.length ?? 0).join(',') })))
    for (const row of rows) console.log(`CYCLES ${row.level}/${row.difficulty}`, JSON.stringify(row.cycles))
    expect(rows).toHaveLength(3)
    expect(rows.every((row) => row.cycles.every((item) => item.cycle && item.cycle.actions.length > 0))).toBe(true)
  }, 60_000)

  it('records summer-03 mixed repetition cycles', () => {
    const row = summarize('summer-03', 'normal')
    console.table([{ ...row, cycles: row.cycles.length }])
    console.log(`CYCLES ${row.level}/normal`, JSON.stringify(row.cycles))
    expect(row.cycles).toHaveLength(0)
    expect(row.cycles.every((item) => item.cycle && item.cycle.actions.length > 0)).toBe(true)
  }, 60_000)
})
