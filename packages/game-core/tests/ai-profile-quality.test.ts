import { describe, expect, it } from 'vitest'
import {
  AI_PROFILE_CONFIG,
  LEVELS,
  analyzeSheepActions,
  applyAction,
  createLevelInitialState,
  createSeededRng,
  endWolfTurn,
  listLegalActions,
  pickSheepActionWithMeta,
} from '../src/index'

function firstSheepDecision(level: (typeof LEVELS)[number]) {
  let state = createLevelInitialState(level)
  const wolfAction = listLegalActions(state)[0]!
  const moved = applyAction(state, wolfAction)
  if (!moved.ok) throw new Error(moved.error)
  state = moved.state
  if (state.chain) {
    const ended = endWolfTurn(state)
    if (!ended.ok) throw new Error(ended.error)
    state = ended.state
  }
  return state
}

describe('24-level production AI profile gate', () => {
  for (const level of LEVELS) {
    it(`${level.id} uses a legal, non-dominated and reproducible ${level.aiProfile} decision`, () => {
      const state = firstSheepDecision(level)
      const first = pickSheepActionWithMeta(state, {
        profile: level.aiProfile,
        rng: createSeededRng(20260719),
      })
      const second = pickSheepActionWithMeta(state, {
        profile: level.aiProfile,
        rng: createSeededRng(20260719),
      })
      const analysis = analyzeSheepActions(state).find((candidate) =>
        JSON.stringify(candidate.action) === JSON.stringify(first.action))

      expect(listLegalActions(state)).toContainEqual(first.action)
      expect(first.action).toEqual(second.action)
      expect(first.meta.nodes).toBe(second.meta.nodes)
      expect(first.meta.profile).toBe(level.aiProfile)
      expect(first.meta.nodes).toBeLessThanOrEqual(AI_PROFILE_CONFIG[level.aiProfile].budgets.maxNodes)
      expect(analysis?.dominated).toBe(false)
      if (AI_PROFILE_CONFIG[level.aiProfile].searchDepth > 0) {
        expect(first.meta.completedDepth).toBeGreaterThanOrEqual(1)
      }
    })
  }
})
