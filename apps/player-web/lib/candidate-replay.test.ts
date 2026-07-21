import { describe, expect, it } from 'vitest'
import { applyAction, createLevelInitialState, getLevel, listLegalActions, type Action } from '@wolf-sheep/game-core'
import { buildCandidateReplay } from './candidate-replay'

function traceLabel(ply: number, action: Action) {
  if (action.type === 'pass') return `${ply}:pass`
  const through = action.type === 'jump' ? ` via ${action.through.r},${action.through.c}` : ''
  return `${ply}:${action.type}:${action.pieceId}>${action.to.r},${action.to.c}${through}`
}

describe('candidate replay AI context', () => {
  it('reconstructs opponent target and wolf history for takeover', () => {
    const level = getLevel('summer-06')!
    let state = createLevelInitialState(level)
    const wolfAction = listLegalActions(state)[0]!
    const wolfResult = applyAction(state, wolfAction)
    if (!wolfResult.ok) throw new Error(wolfResult.error)
    state = wolfResult.state
    const sheepAction = listLegalActions(state)[0]!
    const sheepResult = applyAction(state, sheepAction)
    if (!sheepResult.ok) throw new Error(sheepResult.error)

    const replay = buildCandidateReplay(level, [traceLabel(wolfResult.state.plyCount, wolfAction), traceLabel(sheepResult.state.plyCount, sheepAction)])
    expect(replay.ok).toBe(true)
    if (!replay.ok) return
    const final = replay.frames.at(-1)!
    expect(Object.values(final.aiMemory.movesByWolf).reduce((sum, moves) => sum + moves, 0)).toBe(1)
    expect(final.aiMemory.currentTargetWolfId).toMatch(/^wolf-/)
  })
})
