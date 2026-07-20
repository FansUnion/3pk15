import { describe, expect, it } from 'vitest'
import {
  applyAction,
  createLevelInitialState,
  createSeededRng,
  endWolfTurn,
  evaluateScore,
  LEVELS,
  listLegalActions,
  pickSheepAction,
  type Action,
  type ChapterId,
  type LevelConfig,
} from '../src/index'

type WolfStrategy = 'random' | 'greedy' | 'mixed'

type Profile = {
  wolfWins: number
  sheepWins: number
  draws: number
  averagePlies: number
  p95Plies: number
  anomalies: string[]
}

const HARD_BUDGETS = { maxNodes: 80 }

function chooseWolfAction(
  state: ReturnType<typeof createInitialState>,
  actions: Action[],
  rng: ReturnType<typeof createSeededRng>,
  strategy: WolfStrategy,
) {
  if (strategy === 'random') return actions[Math.floor(rng.nextFloat() * actions.length)]!
  const scored = actions.map((action) => {
    const result = applyAction(state, action)
    return { action, score: result.ok ? evaluateScore(result.state) : Infinity }
  })
  const best = Math.min(...scored.map((item) => item.score))
  const candidates = scored.filter((item) => item.score === best)
  if (strategy === 'mixed' && rng.nextFloat() < 0.35) return actions[Math.floor(rng.nextFloat() * actions.length)]!
  return candidates[Math.floor(rng.nextFloat() * candidates.length)]!.action
}

function runProfile(level: LevelConfig, strategy: WolfStrategy, games = 5): Profile {
  let wolfWins = 0
  let sheepWins = 0
  let draws = 0
  const plies: number[] = []
  const anomalies: string[] = []
  for (let seed = 0; seed < games; seed += 1) {
    let state = createLevelInitialState(level)
    const trace: string[] = []
    const rng = createSeededRng(seed + level.indexInChapter * 1_000 + strategy.length * 10_000)
    while (state.status === 'playing' && state.plyCount < 500) {
      const actions = listLegalActions(state)
      if (actions.length === 0) break
      const action = state.toMove === 'wolf'
        ? chooseWolfAction(state, actions, rng, strategy)
        : pickSheepAction(state, { profile: level.aiProfile, rng })
      trace.push(`${action.type}:${action.pieceId}>${action.to.r},${action.to.c}`)
      const result = applyAction(state, action)
      if (!result.ok) throw new Error(result.error)
      state = result.state
      if (state.status === 'playing' && state.chain) {
        const ended = endWolfTurn(state)
        if (!ended.ok) throw new Error(ended.error)
        state = ended.state
        trace.push(`${state.plyCount}:end-chain`)
      }
    }
    if (state.status === 'won') wolfWins += 1
    else if (state.status === 'lost') sheepWins += 1
    else draws += 1
    plies.push(state.plyCount)
    if (state.status === 'draw' || state.plyCount >= level.maxPlies * 0.9) {
      anomalies.push(
        `seed ${seed}: ${state.status} at ply ${state.plyCount}; tail ${trace.slice(-12).join(' ')}`,
      )
    }
  }
  const ordered = [...plies].sort((a, b) => a - b)
  return {
    wolfWins,
    sheepWins,
    draws,
    averagePlies: plies.reduce((total, value) => total + value, 0) / games,
    p95Plies: ordered[Math.ceil(ordered.length * 0.95) - 1]!,
    anomalies,
  }
}

function format(profile: Profile) {
  return `${profile.wolfWins * 20}% wolf / ${profile.draws * 20}% draw`
}

const runDeepBalanceSuite = process.env.RUN_DEEP_BALANCE === '1'

describe.skipIf(!runDeepBalanceSuite)('five-game, multi-strategy balance review', () => {
  function runLevels(chapterId: ChapterId, indexes: number[]) {
    const rows = LEVELS.filter((level) => level.chapterId === chapterId && indexes.includes(level.indexInChapter)).map((level) => {
      const random = runProfile(level, 'random')
      const greedy = runProfile(level, 'greedy')
      const mixed = runProfile(level, 'mixed')
      return {
        level: level.id,
        random: format(random),
        greedy: format(greedy),
        mixed: format(mixed),
        mixedAveragePlies: mixed.averagePlies.toFixed(1),
        mixedP95Plies: mixed.p95Plies,
        mixedAnomalies: mixed.anomalies.join('; ') || '-',
      }
    })
    if (process.env.PRINT_DEEP_BALANCE === '1') console.table(rows)
    expect(rows).toHaveLength(indexes.length)
  }

  it('records spring 1-3 risk signals without making player-win claims', () => runLevels('spring', [1, 2, 3]), 120_000)
  it('records spring 4-6 risk signals without making player-win claims', () => runLevels('spring', [4, 5, 6]), 120_000)
  it('records summer 1-3 risk signals without making player-win claims', () => runLevels('summer', [1, 2, 3]), 120_000)
  it('records summer 4-6 risk signals without making player-win claims', () => runLevels('summer', [4, 5, 6]), 120_000)
  it('records autumn 1-3 risk signals without making player-win claims', () => runLevels('autumn', [1, 2, 3]), 120_000)
  it('records autumn 4-6 risk signals without making player-win claims', () => runLevels('autumn', [4, 5, 6]), 120_000)
  it('records winter 1-3 risk signals without making player-win claims', () => runLevels('winter', [1, 2, 3]), 120_000)
  it('records winter 4-6 risk signals without making player-win claims', () => runLevels('winter', [4, 5, 6]), 120_000)
})
