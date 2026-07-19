import { describe, expect, it } from 'vitest'
import {
  applyAction,
  boardPositionKey,
  chooseDiagnosticWolfAction,
  createLevelInitialState,
  createSeededRng,
  endWolfTurn,
  LEVELS,
  listLegalActions,
  listWolfActionsAsIfTurn,
  pickSheepAction,
  REPETITION_DRAW_COUNT,
  type Difficulty,
} from '../src/index'

type Outcome = { wolf: number; sheep: number; draw: number; reasons: Record<string, number> }

function reason(state: ReturnType<typeof createLevelInitialState>) {
  if (state.terminalReason) return state.terminalReason
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= REPETITION_DRAW_COUNT) return 'repetition'
  return 'unfinished'
}

function run(levelId: string, difficulty: Difficulty, strategy: 'random' | 'mixed', seed: number) {
  const level = LEVELS.find((candidate) => candidate.id === levelId)!
  let state = createLevelInitialState(level)
  const wolfRng = createSeededRng(seed)
  const sheepRng = createSeededRng(seed ^ 0x5f3759df)
  const trace: string[] = []
  let firstCapturePly: number | null = null
  for (let step = 0; step < 500 && state.status === 'playing'; step += 1) {
    const actions = listLegalActions(state)
    if (actions.length === 0) break
    const action = state.toMove === 'wolf'
      ? chooseDiagnosticWolfAction(state, actions, wolfRng, strategy)
      : pickSheepAction(state, { difficulty, rng: sheepRng, budgets: difficulty === 'hard' ? { maxNodes: 80 } : undefined })
    const eatenBefore = state.eatenSheep
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    const target = action.type === 'pass' ? 'pass' : `${action.pieceId}>${action.to.r},${action.to.c}`
    trace.push(`${state.plyCount}:${action.type}:${target}`)
    if (firstCapturePly === null && state.eatenSheep > eatenBefore) firstCapturePly = state.plyCount
    if (state.status === 'playing' && state.chain) {
      const ended = endWolfTurn(state)
      if (!ended.ok) throw new Error(ended.error)
      state = ended.state
      trace.push(`${state.plyCount}:end-chain`)
    }
  }
  return {
    levelId,
    seed,
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: reason(state),
    plies: state.plyCount,
    eaten: state.eatenSheep,
    firstCapturePly,
    trace,
  }
}

function summarize(levelId: string, difficulty: Difficulty, strategy: 'random' | 'mixed'): Outcome {
  const outcome: Outcome = { wolf: 0, sheep: 0, draw: 0, reasons: {} }
  for (let seed = 20260717; seed <= 20260726; seed += 1) {
    const result = run(levelId, difficulty, strategy, seed)
    outcome[result.winner] += 1
    outcome.reasons[result.reason] = (outcome.reasons[result.reason] ?? 0) + 1
  }
  return outcome
}

describe('strong-risk level attribution', () => {
  it('compares risk levels across sheep difficulty and wolf strategy', () => {
    const rows = ['autumn-01', 'autumn-03', 'winter-02'].flatMap((levelId) =>
      (['easy', 'normal', 'hard'] as const).flatMap((difficulty) =>
        (['random', 'mixed'] as const).map((strategy) => ({ level: levelId, difficulty, strategy, ...summarize(levelId, difficulty, strategy) })),
      ),
    )
    console.table(rows.map((row) => ({ ...row, reasons: JSON.stringify(row.reasons) })))
    expect(rows).toHaveLength(18)
    expect(rows.every((row) => row.wolf + row.sheep + row.draw === 10)).toBe(true)
  }, 120_000)

  it('keeps representative reproducible traces at configured difficulty', () => {
    const records = ['autumn-01', 'autumn-03', 'winter-02'].flatMap((levelId) => {
      const level = LEVELS.find((candidate) => candidate.id === levelId)!
      return Array.from({ length: 10 }, (_, index) => run(levelId, level.ai, 'mixed', 20260717 + index))
    })
    const representatives = ['autumn-01', 'autumn-03', 'winter-02'].flatMap((levelId) => {
      const levelRecords = records.filter((record) => record.levelId === levelId)
      return [levelRecords.find((record) => record.winner === 'wolf'), levelRecords.find((record) => record.winner !== 'wolf')].filter(Boolean)
    })
    for (const record of representatives) {
      console.log(`TRACE seed=${record!.seed} winner=${record!.winner} reason=${record!.reason} plies=${record!.plies} eaten=${record!.eaten} first=${record!.firstCapturePly ?? '-'} :: ${record!.trace.join(' ')}`)
    }
    expect(representatives.length).toBeGreaterThanOrEqual(5)
  }, 120_000)
})
