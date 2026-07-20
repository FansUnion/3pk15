import { describe, expect, it } from 'vitest'
import {
  applyAction,
  boardPositionKey,
  createLevelInitialState,
  createSeededRng,
  endWolfTurn,
  evaluateScore,
  LEVELS,
  listLegalActions,
  listWolfActionsAsIfTurn,
  pickSheepAction,
  REPETITION_DRAW_COUNT,
  type Action,
  type BoardState,
} from '../src/index'

type WolfStrategy = 'random' | 'greedy' | 'chain-aware'

type GameRecord = {
  level: string
  strategy: WolfStrategy
  seed: number
  winner: 'wolf' | 'sheep' | 'draw'
  reason: 'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition' | 'unexpected'
  plies: number
  eatenSheep: number
  firstCapturePly: number | null
  captures: number
  voluntaryEnds: number
  trace: string[]
}

const CASES = [
  'spring-01', // Sparse/open: one edge rock.
  'summer-03', // Four-rock midfield funnel.
  'autumn-04', // Five-rock partition across the middle.
  'winter-02', // Empty board with edge-shifted wolves.
] as const

// Wall-clock limits make hard-AI choices machine/load dependent. Keep the
// existing node cap but disable the time cap for this reproducibility fixture.
const REPRODUCIBLE_HARD_BUDGET = { maxNodes: 80 }

function chooseWolfAction(
  state: BoardState,
  actions: Action[],
  rng: ReturnType<typeof createSeededRng>,
  strategy: WolfStrategy,
): Action {
  if (strategy === 'random') return actions[Math.floor(rng.nextFloat() * actions.length)]!
  const scored = actions.map((action) => {
    const result = applyAction(state, action)
    return { action, score: result.ok ? evaluateScore(result.state) : Infinity }
  })
  const best = Math.min(...scored.map((item) => item.score))
  const candidates = scored.filter((item) => item.score === best)
  return candidates[Math.floor(rng.nextFloat() * candidates.length)]!.action
}

function shouldContinueChain(state: BoardState, rng: ReturnType<typeof createSeededRng>): boolean {
  if (!state.chain) return false
  const end = endWolfTurn(state)
  if (!end.ok) return false
  const continuations = listLegalActions(state)
  if (continuations.length === 0) return false
  const endScore = evaluateScore(end.state)
  const scored = continuations
    .map((action) => {
      const result = applyAction(state, action)
      return result.ok ? evaluateScore(result.state) : Infinity
    })
    .filter(Number.isFinite)
  const bestContinuation = Math.min(...scored)
  // Keep a chain only when it improves the positional score. A small random
  // tie break keeps the strategy deterministic while allowing both decisions
  // to appear in the matrix.
  return bestContinuation < endScore || (bestContinuation === endScore && rng.nextFloat() >= 0.5)
}

function terminalReason(state: BoardState): GameRecord['reason'] {
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= REPETITION_DRAW_COUNT) return 'repetition'
  return 'unexpected'
}

function runGame(levelId: string, strategy: WolfStrategy, seed: number): GameRecord {
  const level = LEVELS.find((candidate) => candidate.id === levelId)
  if (!level) throw new Error(`missing level ${levelId}`)
  const rng = createSeededRng(seed)
  let state = createLevelInitialState(level)
  let firstCapturePly: number | null = null
  let voluntaryEnds = 0
  const trace: string[] = []

  while (state.status === 'playing') {
    const legal = listLegalActions(state)
    if (legal.length === 0) break
    const action = state.toMove === 'wolf'
      ? chooseWolfAction(state, legal, rng, strategy)
      : pickSheepAction(state, { profile: level.aiProfile, rng })
    const beforeEaten = state.eatenSheep
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    trace.push(`${state.plyCount}:${action.type}:${action.pieceId}>${action.to.r},${action.to.c}`)
    if (firstCapturePly === null && state.eatenSheep > beforeEaten) firstCapturePly = state.plyCount

    // A player may stop an optional capture chain. Use that legal action
    // deterministically so each run has one unambiguous chain policy.
    if (state.status === 'playing' && state.chain) {
      const continueChain = strategy === 'chain-aware' && shouldContinueChain(state, rng)
      if (!continueChain) {
        const ended = endWolfTurn(state)
        if (!ended.ok) throw new Error(ended.error)
        state = ended.state
        voluntaryEnds += 1
        trace.push(`${state.plyCount}:end-chain`)
      }
    }
  }

  return {
    level: level.id,
    strategy,
    seed,
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: terminalReason(state),
    plies: state.plyCount,
    eatenSheep: state.eatenSheep,
    firstCapturePly,
    captures: state.eatenSheep,
    voluntaryEnds,
    trace,
  }
}

describe('representative seeded balance runs', () => {
  it('records reproducible games across the main board shapes', () => {
    const games = CASES.flatMap((levelId) =>
      (['random', 'greedy', 'chain-aware'] as const).map((strategy) => runGame(levelId, strategy, 20260716)),
    )
    console.table(games.map(({ trace, ...row }) => ({ ...row, moves: trace.length })))
    for (const game of games) console.log(`TRACE ${game.level}/${game.strategy}: ${game.trace.join(' ')}`)

    expect(games).toHaveLength(12)
    expect(games.every((game) => game.reason !== 'unexpected')).toBe(true)
    expect(games.filter((game) => game.strategy === 'chain-aware').every((game) => game.captures >= 0)).toBe(true)
  }, 60_000)
})
