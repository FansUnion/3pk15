import { describe, expect, it } from 'vitest'
import {
  LEVELS,
  applyAction,
  createInitialState,
  createSeededRng,
  listLegalActions,
  listWolfActionsAsIfTurn,
  makeState,
  pickHardWithMeta,
  pickSheepAction,
} from '../src/index'

describe('sheep AI behavior guardrails', () => {
  function directCaptureCountAfter(state: ReturnType<typeof makeState>, action: ReturnType<typeof listLegalActions>[number]) {
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    return listWolfActionsAsIfTurn(result.state).filter((candidate) => candidate.type === 'jump').length
  }

  it('normal and hard avoid a directly capturable square when a safe move exists', () => {
    const state = makeState({
      toMove: 'sheep',
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 6, c: 1 },
        { id: 'sheep-1', side: 'sheep', r: 3, c: 1 },
        { id: 'sheep-2', side: 'sheep', r: 1, c: 4 },
      ],
    })
    const legal = listLegalActions(state)
    const risks = legal.map((action) => directCaptureCountAfter(state, action))
    expect(Math.min(...risks)).toBe(0)
    expect(Math.max(...risks)).toBeGreaterThan(0)

    for (const difficulty of ['normal', 'hard'] as const) {
      const action = pickSheepAction(state, { difficulty, rng: createSeededRng(31) })
      expect(directCaptureCountAfter(state, action)).toBe(0)
    }
  })

  it('keeps every difficulty inside the current legal action set', () => {
    const level = LEVELS.find((item) => item.id === 'summer-02')!
    const state = {
      ...createInitialState(level.id, level.rocks, level.targetEaten, level.maxPlies),
      toMove: 'sheep' as const,
    }
    const legal = listLegalActions(state)

    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const action = pickSheepAction(state, {
        difficulty,
        rng: createSeededRng(difficulty.length),
      })
      expect(legal).toContainEqual(action)
    }
  })

  it('keeps hard AI bounded and reports whether it degraded', () => {
    const level = LEVELS.find((item) => item.id === 'winter-01')!
    const state = {
      ...createInitialState(level.id, level.rocks, level.targetEaten, level.maxPlies),
      toMove: 'sheep' as const,
    }
    const result = pickHardWithMeta(state, createSeededRng(7), { maxNodes: 80, maxMs: 8 })
    expect(listLegalActions(state)).toContainEqual(result.action)
    expect(result.meta.nodes).toBeLessThanOrEqual(80)
    expect(result.meta.elapsedMs).toBeGreaterThanOrEqual(0)
    expect(typeof result.meta.degraded).toBe('boolean')
  })

  it('hard falls back to a legal normal action when its search budget is exhausted', () => {
    const level = LEVELS.find((item) => item.id === 'winter-02')!
    const state = {
      ...createInitialState(level.id, level.rocks, level.targetEaten, level.maxPlies),
      toMove: 'sheep' as const,
    }
    const result = pickHardWithMeta(state, createSeededRng(9), { maxNodes: 0, maxMs: 0 })
    expect(result.meta.degraded).toBe(true)
    expect(result.meta.nodes).toBe(0)
    expect(listLegalActions(state)).toContainEqual(result.action)
  })

  it('keeps the same AI profile deterministic for the same seed', () => {
    const level = LEVELS.find((item) => item.id === 'autumn-03')!
    const state = {
      ...createInitialState(level.id, level.rocks, level.targetEaten, level.maxPlies),
      toMove: 'sheep' as const,
    }
    const first = pickSheepAction(state, { difficulty: 'normal', rng: createSeededRng(42) })
    const second = pickSheepAction(state, { difficulty: 'normal', rng: createSeededRng(42) })
    expect(first).toEqual(second)
  })
})
