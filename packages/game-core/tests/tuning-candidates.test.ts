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
  validateLevel,
  type Action,
  type BoardState,
  type LevelConfig,
  type OpeningLayout,
} from '../src/index'

type WolfStrategy = 'random' | 'mixed'

const SEEDS = Array.from({ length: 10 }, (_, index) => 20260717 + index)
const HARD_BUDGET = { maxNodes: 80 }
const SHEEP_OPENINGS: Record<string, OpeningLayout['sheep']> = {
  'row3-edge': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'split-flank': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 6 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 6 },
  ],
}

const WOLF_OPENINGS: Record<string, OpeningLayout['wolves']> = {
  'wolf-left': [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }],
  'wolf-flank': [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }],
  'wolf-wide': [{ r: 6, c: 2 }, { r: 6, c: 5 }, { r: 6, c: 6 }],
  'wolf-even': [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }],
}

const CANDIDATES: Record<string, Record<string, OpeningLayout | undefined>> = {
  'summer-04': {
    default: undefined,
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
    'split-flank': { sheep: SHEEP_OPENINGS['split-flank'] },
    'wolf-wide': { wolves: WOLF_OPENINGS['wolf-wide'] },
  },
  'summer-06': {
    default: undefined,
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
    'split-flank': { sheep: SHEEP_OPENINGS['split-flank'] },
    'wolf-wide': { wolves: WOLF_OPENINGS['wolf-wide'] },
  },
  'autumn-02': {
    default: undefined,
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
    'split-flank': { sheep: SHEEP_OPENINGS['split-flank'] },
    'wolf-flank': { wolves: WOLF_OPENINGS['wolf-flank'] },
  },
  'autumn-05': {
    default: undefined,
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
    'split-flank': { sheep: SHEEP_OPENINGS['split-flank'] },
    'wolf-wide': { wolves: WOLF_OPENINGS['wolf-wide'] },
  },
  'winter-03': {
    default: undefined,
    'wolf-left': { wolves: WOLF_OPENINGS['wolf-left'] },
    'wolf-flank': { wolves: WOLF_OPENINGS['wolf-flank'] },
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
  },
  'winter-04': {
    default: undefined,
    'wolf-left': { wolves: WOLF_OPENINGS['wolf-left'] },
    'wolf-flank': { wolves: WOLF_OPENINGS['wolf-flank'] },
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
  },
  'winter-05': {
    default: undefined,
    'wolf-left': { wolves: WOLF_OPENINGS['wolf-left'] },
    'wolf-flank': { wolves: WOLF_OPENINGS['wolf-flank'] },
    'row3-edge': { sheep: SHEEP_OPENINGS['row3-edge'] },
  },
}

const TERRAIN_CANDIDATES: Record<string, Record<string, LevelConfig['rocks']>> = {
  'autumn-01': {
    default: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 2 }, { r: 5, c: 6 }],
    'open-left': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }],
    'open-right': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 2 }],
    'lower-center': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 4 }, { r: 5, c: 6 }],
    'center-gap': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 5 }, { r: 5, c: 2 }, { r: 5, c: 6 }],
  },
  'autumn-03': {
    default: [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 1 }, { r: 5, c: 3 }],
    'open-center': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 1 }],
    'open-edge': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 3 }],
    'lower-right': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 1 }, { r: 5, c: 5 }],
    'middle-gap': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 1 }, { r: 5, c: 3 }],
  },
  'autumn-04': {
    default: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 2 }],
    'lower-center': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 4 }],
    'lower-right': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }],
    'center-gap': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 5 }, { r: 5, c: 2 }, { r: 5, c: 4 }],
  },
  'autumn-06': {
    default: [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 1 }],
    'open-left': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 6 }],
    'lower-center': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 3 }],
    'lower-right': [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 5 }],
  },
  'summer-03': {
    default: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 3 }],
    'open-lower': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }],
    'lower-left': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 1 }],
    'center-gate': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 3 }],
    'open-right': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 3 }],
  },
  'summer-04': {
    default: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 5 }],
    'open-right': [{ r: 2, c: 6 }, { r: 4, c: 2 }],
    'right-gate': [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }],
    'central-cut': [{ r: 2, c: 6 }, { r: 4, c: 3 }, { r: 5, c: 5 }],
    'left-flank': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 5, c: 5 }],
  },
  'autumn-02': {
    default: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 6, c: 4 }, { r: 5, c: 6 }],
    'open-base': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }],
    'open-edge': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 6, c: 4 }],
    'lower-left': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 2 }, { r: 5, c: 6 }],
    'open-center': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 5 }, { r: 6, c: 4 }, { r: 5, c: 6 }],
  },
  'autumn-05': {
    default: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 4 }],
    'open-center': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }],
    'open-edge': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 4 }],
    'lower-left': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 2 }],
    'five-lane': [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 2 }],
  },
}

const OPEN_BASE_ROCKS = [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }]
const COMBINED_CANDIDATES: Record<string, { rocks: LevelConfig['rocks'], opening?: OpeningLayout }> = {
  'open-base-current': { rocks: OPEN_BASE_ROCKS },
  'open-base-flank': { rocks: OPEN_BASE_ROCKS, opening: { wolves: WOLF_OPENINGS['wolf-flank'] } },
  'open-base-wide': { rocks: OPEN_BASE_ROCKS, opening: { wolves: WOLF_OPENINGS['wolf-wide'] } },
  'open-base-even': { rocks: OPEN_BASE_ROCKS, opening: { wolves: WOLF_OPENINGS['wolf-even'] } },
}

const AUTUMN_COMBINED_CANDIDATES: Record<string, Record<string, { rocks: LevelConfig['rocks'], wolves: OpeningLayout['wolves'] }>> = {
  'autumn-01': {
    'open-left-wide': { rocks: OPEN_BASE_ROCKS, wolves: WOLF_OPENINGS['wolf-wide'] },
    'open-left-even': { rocks: OPEN_BASE_ROCKS, wolves: WOLF_OPENINGS['wolf-even'] },
    'open-left-flank': { rocks: OPEN_BASE_ROCKS, wolves: WOLF_OPENINGS['wolf-flank'] },
  },
  'autumn-04': {
    'lower-right-wide': { rocks: OPEN_BASE_ROCKS, wolves: WOLF_OPENINGS['wolf-wide'] },
    'lower-right-even': { rocks: OPEN_BASE_ROCKS, wolves: WOLF_OPENINGS['wolf-even'] },
    'lower-right-flank': { rocks: OPEN_BASE_ROCKS, wolves: WOLF_OPENINGS['wolf-flank'] },
  },
}

function chooseWolfAction(state: BoardState, actions: Action[], rng: ReturnType<typeof createSeededRng>, strategy: WolfStrategy) {
  if (strategy === 'random') return actions[Math.floor(rng.nextFloat() * actions.length)]!
  const scored = actions.map((action) => {
    const result = applyAction(state, action)
    return { action, score: result.ok ? evaluateScore(result.state) : Infinity }
  })
  const best = Math.min(...scored.map((item) => item.score))
  const candidates = scored.filter((item) => item.score === best)
  if (rng.nextFloat() < 0.35) return actions[Math.floor(rng.nextFloat() * actions.length)]!
  return candidates[Math.floor(rng.nextFloat() * candidates.length)]!.action
}

function reason(state: BoardState) {
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= REPETITION_DRAW_COUNT) return 'repetition'
  return 'unexpected'
}

function runGame(level: LevelConfig, strategy: WolfStrategy, seed: number) {
  let state = createLevelInitialState(level)
  const rng = createSeededRng(seed)
  while (state.status === 'playing') {
    const actions = listLegalActions(state)
    if (actions.length === 0) break
    const action = state.toMove === 'wolf'
      ? chooseWolfAction(state, actions, rng, strategy)
      : pickSheepAction(state, { profile: level.aiProfile, rng, budgets: HARD_BUDGET })
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
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
  }
}

function candidateLevel(base: LevelConfig, opening: OpeningLayout | undefined): LevelConfig {
  return opening
    ? { ...base, opening: { ...base.opening, ...opening } }
    : base
}

const candidateDescribe = process.env.RUN_TUNING_CANDIDATES === '1' ? describe : describe.skip

candidateDescribe('tuning candidates', () => {
  it('compares high-risk openings without changing production LEVELS', () => {
    const rows = Object.entries(CANDIDATES).flatMap(([levelId, candidates]) => {
      const base = LEVELS.find((level) => level.id === levelId)!
      return Object.entries(candidates).flatMap(([candidate, opening]) => {
        const level = candidateLevel(base, opening)
        return (['random', 'mixed'] as const).map((strategy) => {
          const games = SEEDS.map((seed) => runGame(level, strategy, seed))
          return {
            level: levelId,
            candidate,
            strategy,
            wolfWins: games.filter((game) => game.winner === 'wolf').length,
            sheepWins: games.filter((game) => game.winner === 'sheep').length,
            draws: games.filter((game) => game.winner === 'draw').length,
            averagePlies: games.reduce((sum, game) => sum + game.plies, 0) / games.length,
            reasons: JSON.stringify(games.reduce<Record<string, number>>((counts, game) => {
              counts[game.reason] = (counts[game.reason] ?? 0) + 1
              return counts
            }, {})),
          }
        })
      })
    })
    console.table(rows)
    expect(rows).toHaveLength(56)
    expect(rows.every((row) => row.wolfWins + row.sheepWins + row.draws === 10)).toBe(true)
  }, 120_000)

  it('compares high-risk terrain while preserving every other level parameter', () => {
    const rows = Object.entries(TERRAIN_CANDIDATES).flatMap(([levelId, candidates]) => {
      const base = LEVELS.find((level) => level.id === levelId)!
      return Object.entries(candidates).flatMap(([candidate, rocks]) => {
        const level = { ...base, rocks }
        expect(validateLevel(level)).toEqual([])
        return (['random', 'mixed'] as const).map((strategy) => {
          const games = SEEDS.map((seed) => runGame(level, strategy, seed))
          return {
            level: levelId,
            candidate,
            strategy,
            wolfWins: games.filter((game) => game.winner === 'wolf').length,
            sheepWins: games.filter((game) => game.winner === 'sheep').length,
            draws: games.filter((game) => game.winner === 'draw').length,
            averagePlies: games.reduce((sum, game) => sum + game.plies, 0) / games.length,
            reasons: JSON.stringify(games.reduce<Record<string, number>>((counts, game) => {
              counts[game.reason] = (counts[game.reason] ?? 0) + 1
              return counts
            }, {})),
          }
        })
      })
    })
    console.table(rows)
    expect(rows).toHaveLength(76)
    expect(rows.every((row) => row.wolfWins + row.sheepWins + row.draws === 10)).toBe(true)
  }, 120_000)

  it('compares autumn-02 combined terrain and wolf openings without duplicating autumn-05', () => {
    const base = LEVELS.find((level) => level.id === 'autumn-02')!
    const rows = Object.entries(COMBINED_CANDIDATES).flatMap(([candidate, patch]) => {
      const level = {
        ...base,
        rocks: patch.rocks,
        opening: patch.opening ? { ...base.opening, ...patch.opening } : base.opening,
      }
      expect(validateLevel(level)).toEqual([])
      return (['random', 'mixed'] as const).map((strategy) => {
        const games = SEEDS.map((seed) => runGame(level, strategy, seed))
        return {
          candidate,
          strategy,
          wolfWins: games.filter((game) => game.winner === 'wolf').length,
          sheepWins: games.filter((game) => game.winner === 'sheep').length,
          draws: games.filter((game) => game.winner === 'draw').length,
          averagePlies: games.reduce((sum, game) => sum + game.plies, 0) / games.length,
          reasons: JSON.stringify(games.reduce<Record<string, number>>((counts, game) => {
            counts[game.reason] = (counts[game.reason] ?? 0) + 1
            return counts
          }, {})),
        }
      })
    })
    console.table(rows)
    expect(rows).toHaveLength(8)
    expect(rows.every((row) => row.wolfWins + row.sheepWins + row.draws === 10)).toBe(true)
  }, 120_000)

  it('compares autumn-01 and autumn-04 combined candidates without duplicating autumn-05', () => {
    const rows = Object.entries(AUTUMN_COMBINED_CANDIDATES).flatMap(([levelId, candidates]) => {
      const base = LEVELS.find((level) => level.id === levelId)!
      return Object.entries(candidates).flatMap(([candidate, patch]) => {
        const level = {
          ...base,
          rocks: patch.rocks,
          opening: { ...base.opening, wolves: patch.wolves },
        }
        expect(validateLevel(level)).toEqual([])
        return (['random', 'mixed'] as const).map((strategy) => {
          const games = SEEDS.map((seed) => runGame(level, strategy, seed))
          return {
            level: levelId,
            candidate,
            strategy,
            wolfWins: games.filter((game) => game.winner === 'wolf').length,
            sheepWins: games.filter((game) => game.winner === 'sheep').length,
            draws: games.filter((game) => game.winner === 'draw').length,
            averagePlies: games.reduce((sum, game) => sum + game.plies, 0) / games.length,
            reasons: JSON.stringify(games.reduce<Record<string, number>>((counts, game) => {
              counts[game.reason] = (counts[game.reason] ?? 0) + 1
              return counts
            }, {})),
          }
        })
      })
    })
    console.table(rows)
    expect(rows).toHaveLength(12)
    expect(rows.every((row) => row.wolfWins + row.sheepWins + row.draws === 10)).toBe(true)
  }, 120_000)
})
