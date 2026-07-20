import { describe, expect, it } from 'vitest'
import {
  LEVELS,
  applyAction,
  analyzeSheepActions,
  createLevelInitialState,
  createSeededRng,
  evaluateScore,
  getWolfLegalSummary,
  listLegalActions,
  listWolfActionsAsIfTurn,
  makeState,
  pickHardWithMeta,
  pickSheepAction,
  pickSheepActionWithMeta,
} from '../src/index'

describe('sheep AI behavior guardrails', () => {
  function directCaptureCountAfter(state: ReturnType<typeof makeState>, action: ReturnType<typeof listLegalActions>[number]) {
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    return listWolfActionsAsIfTurn(result.state).filter((candidate) => candidate.type === 'jump').length
  }

  function wolfMoveCount(state: ReturnType<typeof makeState>) {
    return getWolfLegalSummary(state).reduce((total, wolf) => total + wolf.steps + wolf.jumps, 0)
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
    expect(analyzeSheepActions(state).some((analysis) => analysis.dominated && analysis.explanation === 'blunder')).toBe(true)

    for (const difficulty of ['normal', 'hard'] as const) {
      const action = pickSheepAction(state, {
        difficulty,
        rng: createSeededRng(31),
        budgets: difficulty === 'hard' ? { maxNodes: 4_000, maxMs: 100 } : undefined,
      })
      expect(directCaptureCountAfter(state, action), difficulty).toBe(0)
      expect(analyzeSheepActions(state).find((analysis) => JSON.stringify(analysis.action) === JSON.stringify(action))?.dominated).toBe(false)
    }
  })

  it('normal and hard close an available flock gap', () => {
    const state = makeState({
      toMove: 'sheep',
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 1, c: 6 },
        { id: 'sheep-1', side: 'sheep', r: 1, c: 1 },
        { id: 'sheep-2', side: 'sheep', r: 1, c: 3 },
      ],
      rocks: [{ r: 2, c: 1 }, { r: 2, c: 3 }],
    })

    for (const difficulty of ['normal', 'hard'] as const) {
      const action = pickSheepAction(state, {
        difficulty,
        rng: createSeededRng(41),
        budgets: difficulty === 'hard' ? { maxNodes: 4_000, maxMs: 100 } : undefined,
      })
      expect(action.to).toEqual({ r: 1, c: 2 })
    }
  })

  it('normal and hard block wolf mobility when a blocking move is available', () => {
    const state = makeState({
      toMove: 'sheep',
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 2, c: 2 },
        { id: 'sheep-1', side: 'sheep', r: 1, c: 3 },
      ],
      rocks: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 2 }],
    })
    const minWolfMoves = Math.min(
      ...listLegalActions(state).map((action) => {
        const result = applyAction(state, action)
        if (!result.ok) throw new Error(result.error)
        return wolfMoveCount(result.state)
      }),
    )

    for (const difficulty of ['normal', 'hard'] as const) {
      const action = pickSheepAction(state, {
        difficulty,
        rng: createSeededRng(53),
        budgets: difficulty === 'hard' ? { maxNodes: 4_000, maxMs: 100 } : undefined,
      })
      const result = applyAction(state, action)
      if (!result.ok) throw new Error(result.error)
      expect(wolfMoveCount(result.state)).toBe(minWolfMoves)
    }
  })

  it('normal and hard keep an available sheep out of a low-mobility corner', () => {
    const state = makeState({
      toMove: 'sheep',
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 1, c: 6 },
        { id: 'sheep-1', side: 'sheep', r: 5, c: 1 },
      ],
    })

    for (const difficulty of ['normal', 'hard'] as const) {
      const action = pickSheepAction(state, {
        difficulty,
        rng: createSeededRng(67),
        budgets: difficulty === 'hard' ? { maxNodes: 4_000, maxMs: 100 } : undefined,
      })
      expect(action).toMatchObject({ pieceId: 'sheep-1', to: { r: 5, c: 2 } })
    }
  })

  it('keeps every difficulty inside the current legal action set', () => {
    const level = LEVELS.find((item) => item.id === 'summer-02')!
    const state = {
      ...createLevelInitialState(level),
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
      ...createLevelInitialState(level),
      toMove: 'sheep' as const,
    }
    const result = pickHardWithMeta(state, createSeededRng(7), { maxNodes: 80, maxMs: 8 })
    expect(listLegalActions(state)).toContainEqual(result.action)
    expect(result.meta.nodes).toBeLessThanOrEqual(80)
    expect(result.meta.elapsedMs).toBeGreaterThanOrEqual(0)
    expect(typeof result.meta.degraded).toBe('boolean')
    expect(typeof result.meta.lookaheadCompleted).toBe('boolean')
  })

  it('hard evaluates at least one complete wolf response when budget permits', () => {
    const level = LEVELS.find((item) => item.id === 'winter-01')!
    const state = { ...createLevelInitialState(level), toMove: 'sheep' as const }
    const result = pickHardWithMeta(state, createSeededRng(17), { maxNodes: 4_000 })
    expect(result.meta.lookaheadCompleted).toBe(true)
    expect(result.meta.completedDepth).toBeGreaterThanOrEqual(1)
    expect(listLegalActions(state)).toContainEqual(result.action)
  })

  it('hard simulation preserves the input board while resolving wolf replies', () => {
    const state = makeState({
      toMove: 'sheep',
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 6, c: 1 },
        { id: 'sheep-1', side: 'sheep', r: 3, c: 1 },
        { id: 'sheep-2', side: 'sheep', r: 1, c: 4 },
      ],
    })
    const before = {
      ...state,
      pieces: state.pieces.map((piece) => ({ ...piece })),
      rocks: new Set(state.rocks),
    }

    pickHardWithMeta(state, createSeededRng(23), { maxNodes: 4_000, maxMs: 100 })

    expect(state).toEqual(before)
  })

  it('hard falls back to a legal normal action when its search budget is exhausted', () => {
    const level = LEVELS.find((item) => item.id === 'winter-02')!
    const state = {
      ...createLevelInitialState(level),
      toMove: 'sheep' as const,
    }
    const result = pickHardWithMeta(state, createSeededRng(9), { maxNodes: 0, maxMs: 0 })
    expect(result.meta.degraded).toBe(true)
    expect(result.meta.nodes).toBe(0)
    expect(result.meta.lookaheadCompleted).toBe(false)
    expect(listLegalActions(state)).toContainEqual(result.action)
  })

  it('keeps the same AI profile deterministic for the same seed', () => {
    const level = LEVELS.find((item) => item.id === 'autumn-03')!
    const state = {
      ...createLevelInitialState(level),
      toMove: 'sheep' as const,
    }
    const first = pickSheepAction(state, { difficulty: 'normal', rng: createSeededRng(42) })
    const second = pickSheepAction(state, { difficulty: 'normal', rng: createSeededRng(42) })
    expect(first).toEqual(second)
  })

  it('keeps hard AI deterministic when analysis uses only its node budget', () => {
    const level = LEVELS.find((item) => item.id === 'winter-02')!
    const state = { ...createLevelInitialState(level), toMove: 'sheep' as const }
    const first = pickHardWithMeta(state, createSeededRng(71), { maxNodes: 80 })
    const second = pickHardWithMeta(state, createSeededRng(71), { maxNodes: 80 })
    expect(first.action).toEqual(second.action)
    expect(first.meta.nodes).toBe(second.meta.nodes)
  })

  it('lets expert search wider than the immediate-best set without choosing a dominated move', () => {
    const level = LEVELS.find((item) => item.id === 'summer-02')!
    const state = { ...createLevelInitialState(level), toMove: 'sheep' as const }
    const hard = pickSheepActionWithMeta(state, {
      profile: level.aiProfile,
      rng: createSeededRng(91),
      budgets: { maxNodes: 800 },
    })
    const selected = analyzeSheepActions(state).find((candidate) => candidate.action.type === hard.action.type
      && JSON.stringify(candidate.action) === JSON.stringify(hard.action))

    expect(selected?.dominated).toBe(false)
    expect(hard.meta.candidateCount).toBeGreaterThanOrEqual(1)
  })
})
