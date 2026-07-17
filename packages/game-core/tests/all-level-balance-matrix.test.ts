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
  type Action,
  type BoardState,
} from '../src/index'

type WolfStrategy = 'random' | 'mixed'

const SEEDS = Array.from({ length: 10 }, (_, index) => 20260717 + index)
const HARD_BUDGET = { maxNodes: 80 }

function percentile(values: number[], ratio: number) {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)] ?? 0
}

function reason(state: BoardState) {
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= 3) return 'repetition'
  return 'unexpected'
}

function runGame(level: (typeof LEVELS)[number], strategy: WolfStrategy, seed: number) {
  let state = createLevelInitialState(level)
  const wolfRng = createSeededRng(seed)
  const sheepRng = createSeededRng(seed ^ 0x5f3759df)
  let firstCapturePly: number | null = null

  while (state.status === 'playing') {
    const actions = listLegalActions(state)
    if (actions.length === 0) break
    const action = state.toMove === 'wolf'
      ? chooseDiagnosticWolfAction(state, actions, wolfRng, strategy)
      : pickSheepAction(state, {
        difficulty: level.ai,
        rng: sheepRng,
        budgets: level.ai === 'hard' ? HARD_BUDGET : undefined,
      })
    const beforeEaten = state.eatenSheep
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    if (firstCapturePly === null && state.eatenSheep > beforeEaten) firstCapturePly = state.plyCount
    if (state.status === 'playing' && state.chain) {
      const ended = endWolfTurn(state)
      if (!ended.ok) throw new Error(ended.error)
      state = ended.state
    }
  }

  return {
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: reason(state),
    plies: state.plyCount,
    eaten: state.eatenSheep,
    firstCapturePly,
  }
}

const matrixDescribe = process.env.RUN_BALANCE_MATRIX === '1' ? describe : describe.skip

matrixDescribe('all-level seeded balance matrix', () => {
  it.each(['spring', 'summer', 'autumn', 'winter'] as const)(
    'records a reproducible %s two-strategy matrix',
    (chapterId) => {
      const summaries = LEVELS.filter((level) => level.chapterId === chapterId).flatMap((level) => (['random', 'mixed'] as const).map((strategy) => {
      const games = SEEDS.map((seed) => runGame(level, strategy, seed))
      return {
        level: level.id,
        ai: level.ai,
        strategy,
        games: games.length,
        wolfWins: games.filter((game) => game.winner === 'wolf').length,
        sheepWins: games.filter((game) => game.winner === 'sheep').length,
        draws: games.filter((game) => game.winner === 'draw').length,
        averagePlies: games.reduce((sum, game) => sum + game.plies, 0) / games.length,
        p95Plies: percentile(games.map((game) => game.plies), 0.95),
        averageEaten: games.reduce((sum, game) => sum + game.eaten, 0) / games.length,
        firstCapture: games.filter((game) => game.firstCapturePly !== null).length,
        averageFirstCapturePly: games.filter((game) => game.firstCapturePly !== null)
          .reduce((sum, game) => sum + game.firstCapturePly!, 0)
          / Math.max(1, games.filter((game) => game.firstCapturePly !== null).length),
        reasons: games.reduce<Record<string, number>>((counts, game) => {
          counts[game.reason] = (counts[game.reason] ?? 0) + 1
          return counts
        }, {}),
      }
      }))
      console.table(summaries.map((summary) => ({ ...summary, reasons: JSON.stringify(summary.reasons) })))
      expect(summaries).toHaveLength(12)
      expect(summaries.every((summary) => summary.wolfWins + summary.sheepWins + summary.draws === 10)).toBe(true)
      expect(summaries.every((summary) => summary.firstCapture >= 0)).toBe(true)
    },
    60_000,
  )
})
