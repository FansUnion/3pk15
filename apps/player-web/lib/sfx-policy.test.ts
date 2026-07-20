import { describe, expect, it } from 'vitest'
import { actionSoundFor } from './sfx-policy'

describe('action sound policy', () => {
  it('uses one movement sound even when a wolf creates a threat', () => {
    expect(actionSoundFor({ kind: 'step', side: 'wolf', chainCount: 0, newlyTrappedWolfCount: 0 })).toBe('step')
  })

  it('lets a newly trapped wolf replace a movement sound', () => {
    expect(actionSoundFor({ kind: 'step', side: 'sheep', chainCount: 0, newlyTrappedWolfCount: 1 })).toBe('trapped')
  })

  it('keeps capture feedback above secondary board state', () => {
    expect(actionSoundFor({ kind: 'jump', side: 'wolf', chainCount: 1, newlyTrappedWolfCount: 1 })).toBe('jump')
    expect(actionSoundFor({ kind: 'jump', side: 'wolf', chainCount: 3, newlyTrappedWolfCount: 1 })).toBe('chain')
  })
})
