import { describe, expect, it } from 'vitest'
import {
  claimQuest,
  defaultSave,
  equipSkin,
  recordPlayStarted,
  unlockSkinWithCost,
  validateSkinCatalog,
} from '../src/index'

describe('skins', () => {
  it('catalog validates', () => {
    expect(validateSkinCatalog()).toEqual([])
  })

  it('unlock frost with enough fragments', () => {
    let save = defaultSave()
    save = { ...save, fragments: { ...save.fragments, universal: 50 } }
    const r = unlockSkinWithCost(save, 'wolf-frost')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.save.fragments.universal).toBe(0)
    expect(r.save.unlockedSkinIds).toContain('wolf-frost')
    const eq = equipSkin(r.save, 'wolf-frost')
    expect(eq.ok).toBe(true)
  })
})

describe('quests', () => {
  it('claim daily play after recording', () => {
    let save = recordPlayStarted(defaultSave())
    const r = claimQuest(save, 'daily-play-1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.save.fragments.universal).toBe(3)
    expect(claimQuest(r.save, 'daily-play-1').ok).toBe(false)
  })
})
