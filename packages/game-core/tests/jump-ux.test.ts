import { describe, expect, it } from 'vitest'
import { applyAction, listLegalActions, makeState, type Action, type BoardState, type Pos } from '../src/index'

/** Mirrors apps/web play-store highlightsFor + findAction (through + sheep to). */
function highlightsFor(state: BoardState, wolfId: string) {
  const legal = listLegalActions(state).filter((a) => a.pieceId === wolfId)
  return {
    steps: legal.filter((a) => a.type === 'step').map((a) => a.to),
    jumps: legal.filter((a) => a.type === 'jump').map((a) => a.to),
    throughs: legal.filter((a) => a.type === 'jump').map((a) => a.through),
  }
}

function findAction(state: BoardState, wolfId: string, pos: Pos): Action | null {
  const legal = listLegalActions(state).filter((a) => a.pieceId === wolfId)
  // Prefer gap-capture: mid empty is also a legal step, but click means eat
  for (const a of legal) {
    if (a.type === 'jump') {
      if (a.to.r === pos.r && a.to.c === pos.c) return a
      if (a.through.r === pos.r && a.through.c === pos.c) return a
    }
  }
  for (const a of legal) {
    if (a.type === 'step' && a.to.r === pos.r && a.to.c === pos.c) return a
  }
  return null
}

describe('gap-capture UX matching (through + sheep)', () => {
  it('highlights empty mid and sheep; click either applies capture', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 2, c: 3 },
      ],
      eatenSheep: 14,
      toMove: 'wolf',
    })

    const hl = highlightsFor(state, 'wolf-1')
    expect(hl.throughs).toEqual([{ r: 3, c: 3 }])
    expect(hl.jumps).toEqual([{ r: 2, c: 3 }])

    const viaMid = findAction(state, 'wolf-1', { r: 3, c: 3 })
    const viaSheep = findAction(state, 'wolf-1', { r: 2, c: 3 })
    expect(viaMid).toMatchObject({
      type: 'jump',
      through: { r: 3, c: 3 },
      to: { r: 2, c: 3 },
    })
    expect(viaSheep).toEqual(viaMid)

    const res = applyAction(state, viaSheep!)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.state.eatenSheep).toBe(15)
      expect(res.state.pieces.some((p) => p.id === 'sheep-1')).toBe(false)
      expect(res.state.pieces.find((p) => p.id === 'wolf-1')).toMatchObject({ r: 2, c: 3 })
    }
  })

  it('no capture when adjacent; click sheep does nothing', () => {
    const state = makeState({
      pieces: [
        { id: 'wolf-1', side: 'wolf', r: 4, c: 3 },
        { id: 'sheep-1', side: 'sheep', r: 3, c: 3 },
      ],
      eatenSheep: 14,
      toMove: 'wolf',
    })

    const hl = highlightsFor(state, 'wolf-1')
    expect(hl.jumps).toEqual([])
    expect(hl.throughs).toEqual([])
    expect(findAction(state, 'wolf-1', { r: 3, c: 3 })).toBeNull()
  })
})
