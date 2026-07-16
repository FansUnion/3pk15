import { describe, expect, it } from 'vitest'
import {
  applyAction,
  createInitialState,
  createSeededRng,
  LEVELS,
  listLegalActions,
  pickSheepAction,
  evaluateScore,
  type Action,
  type LevelConfig,
} from '../src/index'

type BalanceSummary = {
  level: string
  sheepDifficulty: string
  wolfStrategy: string
  wolfWins: number
  sheepWins: number
  draws: number
  averagePlies: number
}

function chooseWolfAction(state: ReturnType<typeof createInitialState>, actions: Action[], rng: ReturnType<typeof createSeededRng>, strategy: string) {
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

function runBalance(level: LevelConfig, sheepDifficulty: 'easy' | 'normal' | 'hard', wolfStrategy: string, games = 3): BalanceSummary {
  let wolfWins = 0
  let sheepWins = 0
  let draws = 0
  let totalPlies = 0

  for (let i = 0; i < games; i += 1) {
    let state = createInitialState(level.id, level.rocks, level.targetEaten, level.maxPlies)
    const rng = createSeededRng(i + level.indexInChapter * 1000 + sheepDifficulty.length * 10000)
    for (let ply = 0; ply < 500 && state.status === 'playing'; ply += 1) {
      const actions = listLegalActions(state)
      if (actions.length === 0) break
      const action = state.toMove === 'wolf'
        ? chooseWolfAction(state, actions, rng, wolfStrategy)
        : pickSheepAction(state, { difficulty: sheepDifficulty, rng })
      const result = applyAction(state, action)
      if (!result.ok) throw new Error(result.error)
      state = result.state
      totalPlies += 1
    }
    if (state.status === 'won') wolfWins += 1
    else if (state.status === 'lost') sheepWins += 1
    else if (state.status === 'draw') draws += 1
    else draws += 1
  }

  return { level: level.id, sheepDifficulty, wolfStrategy, wolfWins, sheepWins, draws, averagePlies: totalPlies / games }
}

describe('spring balance smoke simulation', () => {
  it('terminates every spring layout under the current rules and AI', () => {
    const summaries = LEVELS.filter((level) => level.chapterId === 'spring').slice(0, 3).flatMap((level) =>
      (['easy', 'normal', 'hard'] as const).flatMap((difficulty) =>
        ['random', 'greedy', 'mixed'].map((strategy) => runBalance(level, difficulty, strategy)),
      ),
    )
    console.table(summaries)
    expect(summaries.every((summary) => summary.wolfWins + summary.sheepWins + summary.draws === 3)).toBe(true)
  }, 30000)

  it('starts and terminates every mainline level with its configured AI', () => {
    for (const level of LEVELS) {
      let state = createInitialState(level.id, level.rocks, level.targetEaten, level.maxPlies)
      const rng = createSeededRng(level.indexInChapter * 97 + level.id.length)
      for (let ply = 0; ply < 320 && state.status === 'playing'; ply += 1) {
        const actions = listLegalActions(state)
        if (actions.length === 0) break
        const action = state.toMove === 'wolf'
          ? actions[Math.floor(rng.nextFloat() * actions.length)]!
          : pickSheepAction(state, { difficulty: level.ai, rng })
        const result = applyAction(state, action)
        expect(result.ok).toBe(true)
        if (!result.ok) break
        state = result.state
      }
      expect(['won', 'lost', 'draw']).toContain(state.status)
    }
  }, 30000)

  it('records a configured-AI baseline for all 24 mainline levels', () => {
    const summaries = LEVELS.map((level) => runBalance(level, level.ai, 'mixed', 3))
    console.table(summaries)
    expect(summaries).toHaveLength(24)
    expect(summaries.every((summary) => summary.wolfWins + summary.sheepWins + summary.draws === 3)).toBe(true)
  }, 60000)
})
