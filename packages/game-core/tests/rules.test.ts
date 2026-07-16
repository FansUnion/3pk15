import { describe, expect, it } from 'vitest'
import {
  applyAction,
  assertInvariants,
  createInitialState,
  createSeededRng,
  endWolfTurn,
  listLegalActions,
  makeState,
  pickSheepAction,
  refreshStatus,
  serialize,
  deserialize,
  WIN_EATEN,
} from '../src/index'

describe('opening (T01)', () => {
  it('supports per-level targets and declares a draw at the ply limit', () => {
    const custom = createInitialState('challenge', [], 8, 1)
    const action = listLegalActions(custom)[0]!
    const result = applyAction(custom, action)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.targetEaten).toBe(8)
    expect(result.state.status).toBe('draw')
  })

  it('places 3 wolves and 15 sheep on fixed coords', () => {
    const s = createInitialState('spring-01')
    assertInvariants(s)
    expect(s.pieces.filter((p) => p.side === 'wolf')).toHaveLength(3)
    expect(s.pieces.filter((p) => p.side === 'sheep')).toHaveLength(15)
    expect(s.pieces.find((p) => p.id === 'wolf-1')).toMatchObject({ r: 6, c: 2 })
    expect(s.pieces.find((p) => p.id === 'wolf-2')).toMatchObject({ r: 6, c: 3 })
    expect(s.pieces.find((p) => p.id === 'wolf-3')).toMatchObject({ r: 6, c: 5 })
    const legal = listLegalActions(s)
    expect(legal.some((a) => a.type === 'step' && a.pieceId === 'wolf-1' && a.to.r === 5)).toBe(
      true,
    )
  })
})

describe('gap capture ??? (T02/T03)', () => {
  it('allows wolf-empty-sheep capture on a line', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 2, c: 3 },
      ],
      eatenSheep: 14,
      toMove: 'wolf',
    })
    const jumps = listLegalActions(state).filter((a) => a.type === 'jump')
    expect(jumps).toHaveLength(1)
    expect(jumps[0]).toMatchObject({
      type: 'jump',
      through: { r: 3, c: 3 },
      to: { r: 2, c: 3 },
    })
    const res = applyAction(state, jumps[0]!)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.state.pieces.some((p) => p.id === 'sheep-1')).toBe(false)
    expect(res.state.pieces.find((p) => p.id === 'wolf-1')).toMatchObject({ r: 2, c: 3 })
  })

  it('blocks capture when mid has rock', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 2, c: 3 },
      ],
      rocks: [{ r: 3, c: 3 }],
      eatenSheep: 14,
      toMove: 'wolf',
    })
    const jumps = listLegalActions(state).filter((a) => a.type === 'jump')
    expect(jumps).toHaveLength(0)
  })

  it('blocks capture when adjacent (no empty mid)', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 3, c: 3 },
      ],
      eatenSheep: 14,
      toMove: 'wolf',
    })
    const jumps = listLegalActions(state).filter((a) => a.type === 'jump')
    expect(jumps).toHaveLength(0)
  })
})

describe('chain eat cap 5 (T04)', () => {
  it('ends chain at 5th jump and switches to sheep', () => {
    const fillers = [
      { id: 'f1', side: 'sheep' as const, r: 1, c: 1 },
      { id: 'f2', side: 'sheep' as const, r: 1, c: 2 },
      { id: 'f3', side: 'sheep' as const, r: 1, c: 3 },
      { id: 'f4', side: 'sheep' as const, r: 1, c: 4 },
      { id: 'f5', side: 'sheep' as const, r: 1, c: 5 },
      { id: 'f6', side: 'sheep' as const, r: 2, c: 1 },
      { id: 'f7', side: 'sheep' as const, r: 2, c: 2 },
      { id: 'f8', side: 'sheep' as const, r: 3, c: 1 },
    ]
    // ???????? ? ???????
    // (6,1)-?(6,2)-?(6,3) ? (6,3)-?(6,4)-?(6,5)
    // ? (6,5)-?(5,5)-?(4,5) ? (4,5)-?(4,4)-?(4,3) ? (4,3)-?(4,2)-?(4,1)
    let state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 6, c: 1 },
        { id: 's1', side: 'sheep', r: 6, c: 3 },
        { id: 's2', side: 'sheep', r: 6, c: 5 },
        { id: 's3', side: 'sheep', r: 4, c: 5 },
        { id: 's4', side: 'sheep', r: 4, c: 3 },
        { id: 's5', side: 'sheep', r: 4, c: 1 },
        ...fillers,
      ],
      eatenSheep: 2,
      toMove: 'wolf',
    })

    const seq = [
      { through: { r: 6, c: 2 }, to: { r: 6, c: 3 } },
      { through: { r: 6, c: 4 }, to: { r: 6, c: 5 } },
      { through: { r: 5, c: 5 }, to: { r: 4, c: 5 } },
      { through: { r: 4, c: 4 }, to: { r: 4, c: 3 } },
      { through: { r: 4, c: 2 }, to: { r: 4, c: 1 } },
    ]

    for (let i = 0; i < 5; i++) {
      const step = seq[i]!
      const res = applyAction(state, {
        type: 'jump',
        pieceId: 'wolf-1',
        through: step.through,
        to: step.to,
      })
      expect(res.ok, `jump ${i + 1} failed`).toBe(true)
      if (!res.ok) return
      state = res.state
      assertInvariants(state)
      if (i < 4) {
        expect(state.toMove).toBe('wolf')
        expect(state.chain?.count).toBe(i + 1)
      }
    }
    expect(state.chain).toBeNull()
    expect(state.toMove).toBe('sheep')
    expect(state.eatenSheep).toBe(7)
    expect(state.status).toBe('playing')
  })
})

describe('win at 8 (T05)', () => {
  it('sets won when eaten reaches 8', () => {
    const fixed = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 2, c: 3 },
        { id: 's2', side: 'sheep', r: 1, c: 1 },
        { id: 's3', side: 'sheep', r: 1, c: 2 },
        { id: 's4', side: 'sheep', r: 1, c: 3 },
        { id: 's5', side: 'sheep', r: 1, c: 4 },
        { id: 's6', side: 'sheep', r: 1, c: 5 },
        { id: 's7', side: 'sheep', r: 2, c: 1 },
        { id: 's8', side: 'sheep', r: 2, c: 2 },
      ],
      eatenSheep: 7,
      toMove: 'wolf',
    })
    const res = applyAction(fixed, {
      type: 'jump',
      pieceId: 'wolf-1',
      through: { r: 3, c: 3 },
      to: { r: 2, c: 3 },
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.state.eatenSheep).toBe(WIN_EATEN)
    expect(res.state.status).toBe('won')
  })
})

describe('sheep no retreat (T06)', () => {
  it('does not list decreasing-r moves', () => {
    const state = makeState({
      pieces: [
        { id: 'sheep-1', side: 'sheep', r: 3, c: 3 },
        { id: 'wolf-1', side: 'wolf', r: 6, c: 2 },
        { id: 'wolf-2', side: 'wolf', r: 6, c: 3 },
        { id: 'wolf-3', side: 'wolf', r: 6, c: 5 },
      ],
      eatenSheep: 14,
      toMove: 'sheep',
    })
    const legal = listLegalActions(state).filter((a) => a.pieceId === 'sheep-1')
    expect(legal.every((a) => a.type === 'step' && a.to.r >= 3)).toBe(true)
    expect(legal.some((a) => a.type === 'step' && a.to.r === 2)).toBe(false)
  })
})

describe('loss when wolves trapped (T07)', () => {
  it('lost when all wolves have zero legal actions at wolf turn', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 2, c: 2 },
        { id: 'wolf-2', side: 'wolf', r: 2, c: 5 },
        { id: 'wolf-3', side: 'wolf', r: 5, c: 3 },
      ],
      rocks: [
        { r: 1, c: 2 },
        { r: 2, c: 1 },
        { r: 2, c: 3 },
        { r: 3, c: 2 },
        { r: 1, c: 5 },
        { r: 2, c: 4 },
        { r: 2, c: 6 },
        { r: 3, c: 5 },
        { r: 4, c: 3 },
        { r: 5, c: 2 },
        { r: 5, c: 4 },
        { r: 6, c: 3 },
      ],
      eatenSheep: 0,
      toMove: 'wolf',
    })
    const refreshed = refreshStatus(state)
    expect(listLegalActions(refreshed)).toHaveLength(0)
    expect(refreshed.status).toBe('lost')
  })
})

describe('illegal apply (T08)', () => {
  it('rejects illegal action without mutating', () => {
    const state = createInitialState('t')
    const before = serialize(state)
    const res = applyAction(state, {
      type: 'step',
      pieceId: 'wolf-1',
      to: { r: 1, c: 1 },
    })
    expect(res.ok).toBe(false)
    expect(serialize(state)).toEqual(before)
  })
})

describe('endWolfTurn (T09)', () => {
  it('ends chain and switches to sheep', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 2, c: 3 },
        { id: 'sheep-2', side: 'sheep', r: 2, c: 1 },
        { id: 'wolf-2', side: 'wolf', r: 6, c: 2 },
        { id: 'wolf-3', side: 'wolf', r: 6, c: 5 },
      ],
      eatenSheep: 13,
      toMove: 'wolf',
      chain: { wolfId: 'wolf-1', count: 1 },
    })
    const res = endWolfTurn(state)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.state.chain).toBeNull()
    expect(res.state.toMove).toBe('sheep')
  })
})

describe('serialize roundtrip', () => {
  it('round-trips', () => {
    const s = createInitialState('spring-01', [{ r: 4, c: 4 }])
    const again = deserialize(serialize(s))
    expect(serialize(again)).toEqual(serialize(s))
  })
})

describe('AI deterministic seed', () => {
  it('same seed same move on sheep turn', () => {
    let state = createInitialState('spring-01')
    const step = listLegalActions(state).find((a) => a.type === 'step')!
    const r = applyAction(state, step)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    state = r.state
    expect(state.toMove).toBe('sheep')

    const a1 = pickSheepAction(state, { difficulty: 'easy', rng: createSeededRng(42) })
    const a2 = pickSheepAction(state, { difficulty: 'easy', rng: createSeededRng(42) })
    expect(a1).toEqual(a2)

    const n1 = pickSheepAction(state, { difficulty: 'normal', rng: createSeededRng(7) })
    const n2 = pickSheepAction(state, { difficulty: 'normal', rng: createSeededRng(7) })
    expect(n1).toEqual(n2)
  })
})

describe('invariants random playout (T10)', () => {
  it('survives 100 semi-random moves', () => {
    const rng = createSeededRng(99)
    let state = createInitialState('fuzz')
    for (let i = 0; i < 100; i++) {
      if (state.status !== 'playing') break
      if (state.toMove === 'wolf') {
        const legal = listLegalActions(state)
        if (legal.length === 0) {
          expect(state.status).toBe('lost')
          break
        }
        const jumps = legal.filter((a) => a.type === 'jump')
        const pool = jumps.length && rng.nextFloat() > 0.3 ? jumps : legal
        const action = pool[Math.floor(rng.nextFloat() * pool.length)]!
        const res = applyAction(state, action)
        expect(res.ok).toBe(true)
        if (!res.ok) break
        state = res.state
        if (state.chain && rng.nextFloat() > 0.7) {
          const end = endWolfTurn(state)
          if (end.ok) state = end.state
        }
      } else {
        const action = pickSheepAction(state, { difficulty: 'easy', rng })
        const res = applyAction(state, action)
        expect(res.ok).toBe(true)
        if (!res.ok) break
        state = res.state
      }
      assertInvariants(state)
    }
  })
})
