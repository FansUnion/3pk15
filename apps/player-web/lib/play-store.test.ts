import { describe, expect, it } from 'vitest'
import type { BoardState } from '@wolf-sheep/game-core'
import { newlyTrappedWolfIds, threatenedSheepIds } from './wolf-feedback'

function state(rocks: string[] = []): BoardState {
  return {
    pieces: [
      { id: 'wolf-1', side: 'wolf', r: 1, c: 1 },
      { id: 'wolf-2', side: 'wolf', r: 6, c: 5 },
      { id: 'wolf-3', side: 'wolf', r: 6, c: 6 },
    ],
    rocks: new Set(rocks),
    eatenSheep: 0,
    toMove: 'wolf',
    chain: null,
    status: 'playing',
    terminalReason: null,
    levelId: 'test',
    targetEaten: 8,
    plyCount: 0,
    maxPlies: 100,
    repetitionCounts: new Map(),
  }
}

describe('newlyTrappedWolfIds', () => {
  it('reports only a wolf that changes from mobile to immobile', () => {
    expect(newlyTrappedWolfIds(state(), state(['1,2', '2,1']))).toEqual(['wolf-1'])
  })

  it('does not repeat a trap that already existed', () => {
    const trapped = state(['1,2', '2,1'])
    expect(newlyTrappedWolfIds(trapped, trapped)).toEqual([])
  })

  it('allows the event to fire again after mobility was restored', () => {
    const mobile = state()
    const trapped = state(['1,2', '2,1'])
    expect(newlyTrappedWolfIds(trapped, mobile)).toEqual([])
    expect(newlyTrappedWolfIds(mobile, trapped)).toEqual(['wolf-1'])
  })
})

describe('threatenedSheepIds', () => {
  it('reports the target sheep beyond the required empty gap', () => {
    const position = state()
    position.pieces = [
      { id: 'wolf-1', side: 'wolf', r: 3, c: 1 },
      { id: 'wolf-2', side: 'wolf', r: 6, c: 5 },
      { id: 'wolf-3', side: 'wolf', r: 6, c: 6 },
      { id: 'sheep-1', side: 'sheep', r: 3, c: 3 },
    ]
    expect(threatenedSheepIds(position)).toEqual(['sheep-1'])
  })
})
