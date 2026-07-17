import { describe, expect, it } from 'vitest'
import {
  applyAction,
  boardPositionKey,
  chooseDiagnosticWolfAction,
  createLevelInitialState,
  createSeededRng,
  LEVELS,
  listLegalActions,
} from '../src/index'

describe('diagnostic mixed wolf strategy', () => {
  it('avoids a repeated result when a fresh legal result exists', () => {
    const base = createLevelInitialState(LEVELS.find((level) => level.id === 'spring-01')!)
    const actions = listLegalActions(base)
    const repeatedAction = actions[0]!
    const repeatedResult = applyAction(base, repeatedAction)
    if (!repeatedResult.ok) throw new Error(repeatedResult.error)
    const repeatedKey = boardPositionKey(repeatedResult.state)
    const state = {
      ...base,
      repetitionCounts: new Map(base.repetitionCounts).set(repeatedKey, 1),
    }

    const chosen = chooseDiagnosticWolfAction(state, actions, createSeededRng(3), 'mixed')
    const result = applyAction(state, chosen)
    if (!result.ok) throw new Error(result.error)
    expect(boardPositionKey(result.state)).not.toBe(repeatedKey)
  })
})
