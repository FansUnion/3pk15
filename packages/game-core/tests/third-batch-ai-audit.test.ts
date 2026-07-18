import { describe, expect, it } from 'vitest'
import {
  analyzeSheepActions,
  applyAction,
  chooseDiagnosticWolfAction,
  createLevelInitialState,
  createSeededRng,
  endWolfTurn,
  getLevel,
  listLegalActions,
  pickSheepAction,
} from '../src/index'

describe('third-batch sheep decision audit', () => {
  it('never selects a dominated sacrifice in the three reported summer levels', () => {
    const rows: Array<{ level: string; sheepTurns: number; dominatedOpportunities: number; chosenDominated: number; chosenSacrifices: number }> = []
    for (const levelId of ['summer-01', 'summer-02', 'summer-06']) {
      const level = getLevel(levelId)!
      const row = { level: levelId, sheepTurns: 0, dominatedOpportunities: 0, chosenDominated: 0, chosenSacrifices: 0 }
      for (let seed = 20260717; seed < 20260722; seed += 1) {
        let state = createLevelInitialState(level)
        const wolfRng = createSeededRng(seed)
        const sheepRng = createSeededRng(seed ^ 0x5f3759df)
        while (state.status === 'playing') {
          const legal = listLegalActions(state)
          const action = state.toMove === 'wolf'
            ? chooseDiagnosticWolfAction(state, legal, wolfRng, 'mixed')
            : pickSheepAction(state, { difficulty: level.ai, rng: sheepRng, budgets: { maxNodes: 80 } })
          if (state.toMove === 'sheep') {
            row.sheepTurns += 1
            const analyses = analyzeSheepActions(state)
            if (analyses.some((analysis) => analysis.dominated)) row.dominatedOpportunities += 1
            const chosen = analyses.find((analysis) => JSON.stringify(analysis.action) === JSON.stringify(action))
            if (chosen?.dominated) row.chosenDominated += 1
            if (chosen?.explanation === 'sacrifice') row.chosenSacrifices += 1
          }
          const result = applyAction(state, action)
          if (!result.ok) throw new Error(result.error)
          state = result.state
          if (state.status === 'playing' && state.chain) {
            const ended = endWolfTurn(state)
            if (!ended.ok) throw new Error(ended.error)
            state = ended.state
          }
        }
      }
      rows.push(row)
    }
    console.table(rows)
    expect(rows.every((row) => row.sheepTurns > 0)).toBe(true)
    expect(rows.reduce((sum, row) => sum + row.dominatedOpportunities, 0)).toBeGreaterThan(0)
    expect(rows.every((row) => row.chosenDominated === 0)).toBe(true)
  }, 20_000)
})
