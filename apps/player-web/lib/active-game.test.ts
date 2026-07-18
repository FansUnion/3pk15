import { describe, expect, it } from 'vitest'
import { createLevelInitialState, LEVELS, serialize } from '@wolf-sheep/game-core'
import { activeGameSignature, parseActiveGameSnapshot, type ActiveGameConfig } from './active-game'

const level = LEVELS[0]!
const config: ActiveGameConfig = { levelId: level.id, rocks: level.rocks, opening: level.opening, targetEaten: level.targetEaten, maxPlies: level.maxPlies }

describe('active game recovery', () => {
  it('rejects corrupt and configuration-mismatched snapshots', () => {
    expect(parseActiveGameSnapshot('{bad', config)).toBeNull()
    const raw = JSON.stringify({ signature: activeGameSignature(config), board: serialize(createLevelInitialState(level)) })
    expect(parseActiveGameSnapshot(raw, { ...config, maxPlies: (config.maxPlies ?? 300) + 1 })).toBeNull()
  })

  it('restores only a matching playing position', () => {
    const state = createLevelInitialState(level)
    const raw = JSON.stringify({ signature: activeGameSignature(config), board: serialize(state) })
    expect(parseActiveGameSnapshot(raw, config)?.board).toEqual(state)
    const terminal = { ...state, status: 'won' as const }
    const terminalRaw = JSON.stringify({ signature: activeGameSignature(config), board: serialize(terminal) })
    expect(parseActiveGameSnapshot(terminalRaw, config)).toBeNull()
  })

  it('restores AI seed progress and action history', () => {
    const state = createLevelInitialState(level)
    const raw = JSON.stringify({
      signature: activeGameSignature(config),
      board: serialize(state),
      initialAiSeed: 71,
      aiSeed: 73,
      actions: [{ type: 'step', pieceId: 'wolf-1', to: { r: 5, c: 1 } }],
    })
    expect(parseActiveGameSnapshot(raw, config)).toMatchObject({ initialAiSeed: 71, aiSeed: 73 })
    expect(parseActiveGameSnapshot(raw, config)?.actions).toHaveLength(1)
  })
})
