import { describe, expect, it } from 'vitest'
import {
  applyAction,
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
  type LevelConfig,
  type OpeningLayout,
} from '../src/index'

type WolfStrategy = 'random' | 'greedy' | 'capture-first'

const BASE_LEVEL = LEVELS.find((level) => level.id === 'summer-03')!
const CANDIDATES: Record<string, OpeningLayout | undefined> = {
  default: undefined,
  // Move one sheep from row 1 to the open row-3 edge to shorten the first approach.
  'row3-edge': {
    sheep: [
      { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
      { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
      { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
    ],
  },
  // Open two central exits and use column 6 to create a split flock.
  'split-flank': {
    sheep: [
      { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 6 },
      { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
      { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 6 },
    ],
  },
  // Keep the main block but add a row-3 flank and remove one row-2 center.
  'row3-flank': {
    sheep: [
      { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 6 },
      { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
      { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 },
    ],
  },
}

function chooseWolfAction(state: ReturnType<typeof createLevelInitialState>, actions: Action[], rng: ReturnType<typeof createSeededRng>, strategy: WolfStrategy) {
  if (strategy === 'random') return actions[Math.floor(rng.nextFloat() * actions.length)]!
  if (strategy === 'capture-first') {
    const jumps = actions.filter((action) => action.type === 'jump')
    if (jumps.length > 0) return jumps[Math.floor(rng.nextFloat() * jumps.length)]!
  }
  const scored = actions.map((action) => {
    const result = applyAction(state, action)
    return { action, score: result.ok ? evaluateScore(result.state) : Infinity }
  })
  const best = Math.min(...scored.map((item) => item.score))
  const candidates = scored.filter((item) => item.score === best)
  return candidates[Math.floor(rng.nextFloat() * candidates.length)]!.action
}

function run(level: LevelConfig, seed: number, strategy: WolfStrategy) {
  let state = createLevelInitialState(level)
  const rng = createSeededRng(seed)
  let firstCapturePly: number | null = null
  let trace: string[] = []
  while (state.status === 'playing') {
    const legal = listLegalActions(state)
    if (legal.length === 0) break
    const action = state.toMove === 'wolf'
      ? chooseWolfAction(state, legal, rng, strategy)
      : pickSheepAction(state, { difficulty: level.ai, profile: level.aiProfile, rng })
    const before = state.eatenSheep
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    trace.push(`${state.plyCount}:${action.type}:${action.pieceId}>${action.to.r},${action.to.c}`)
    if (firstCapturePly === null && state.eatenSheep > before) firstCapturePly = state.plyCount
    if (state.status === 'playing' && state.chain) {
      const ended = endWolfTurn(state)
      if (!ended.ok) throw new Error(ended.error)
      state = ended.state
      trace.push(`${state.plyCount}:end-chain`)
    }
  }
  return {
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: state.status === 'won'
      ? 'targetEaten'
      : listWolfActionsAsIfTurn(state).length === 0
        ? 'wolvesTrapped'
        : (state.repetitionCounts.values().some((count) => count >= REPETITION_DRAW_COUNT) ? 'repetition' : 'maxPlies'),
    plies: state.plyCount,
    eaten: state.eatenSheep,
    firstCapturePly,
    trace,
  }
}

describe('summer-03 sheep opening candidates', () => {
  it('compares candidate sheep openings without changing production LEVELS', () => {
    const rows = Object.entries(CANDIDATES).flatMap(([candidate, opening]) => {
      const level = {
        ...BASE_LEVEL,
        opening: opening ? { ...BASE_LEVEL.opening, ...opening } : BASE_LEVEL.opening,
      } satisfies LevelConfig
      return (['random', 'greedy', 'capture-first'] as const).flatMap((strategy) => {
        const games = Array.from({ length: 10 }, (_, offset) => run(level, 20260717 + offset, strategy))
        if (strategy === 'capture-first' && candidate !== 'default') {
          for (const [index, game] of games.entries()) {
            if (game.winner === 'wolf') console.log(`WIN TRACE ${candidate}/${strategy}/seed-${20260717 + index}: ${game.trace.join(' ')}`)
          }
        }
        return [{
          candidate,
          strategy,
          wolfWins: games.filter((game) => game.winner === 'wolf').length,
          sheepWins: games.filter((game) => game.winner === 'sheep').length,
          draws: games.filter((game) => game.winner === 'draw').length,
          averagePlies: games.reduce((sum, game) => sum + game.plies, 0) / games.length,
          captures: games.map((game) => game.eaten).join(','),
          firstCaptures: games.map((game) => game.firstCapturePly ?? '-').join(','),
          representativeTrace: games.find((game) => game.winner !== 'wolf')?.trace.slice(-12).join(' ') ?? games[0]!.trace.slice(-12).join(' '),
        }]
      })
    })
    console.table(rows)
    expect(rows).toHaveLength(12)
    expect(rows.every((row) => row.wolfWins + row.sheepWins + row.draws === 10)).toBe(true)
    expect(BASE_LEVEL.opening?.sheep).toBeUndefined()
  }, 60_000)
})
