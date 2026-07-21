import { describe, expect, it } from 'vitest'
import { createAiOpponentMemory, createInitialState } from '@wolf-sheep/game-core'
import { buildPlayerReproductionBundle } from './reproduction-bundle'

describe('player reproduction bundle', () => {
  it('keeps the board, AI seed progression, actions, and exact terminal reason', () => {
    const state = { ...createInitialState('summer-06'), status: 'draw' as const, terminalReason: 'repetition' as const }
    const bundle = buildPlayerReproductionBundle({ state, aiProfile: 'tactical', initialAiSeed: 41, nextAiSeed: 44, actions: [{ type: 'pass' }], aiMemory: createAiOpponentMemory(), muted: false })
    expect(bundle).toMatchObject({ kind: 'fangrush-player-reproduction', levelId: 'summer-06', initialAiSeed: 41, nextAiSeed: 44 })
    expect(bundle.board.terminalReason).toBe('repetition')
    expect(bundle.actions).toEqual([{ type: 'pass' }])
    expect(bundle.audio.muted).toBe(false)
    expect(bundle).toMatchObject({ schema: 4, rulesVersion: 3, aiProfile: 'tactical', aiAlgorithmVersion: 'sheep-ai-v5' })
  })
})
