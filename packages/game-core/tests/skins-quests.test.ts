import { describe, expect, it } from 'vitest'
import {
  claimQuest,
  defaultSave,
  equipSkin,
  recordPlayStarted,
  SKIN_CATALOG,
  QUEST_DEFS,
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

  it('has complete localized catalog names', () => {
    expect(SKIN_CATALOG.every((skin) => skin.nameEn && skin.nameZh)).toBe(true)
  })

  it('unlocks a board with season fragments exactly once', () => {
    const save = {
      ...defaultSave(),
      fragments: { ...defaultSave().fragments, season: { ...defaultSave().fragments.season, winter: 30 } },
    }
    const result = unlockSkinWithCost(save, 'board-night')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.save.fragments.season.winter).toBe(0)
    expect(result.save.unlockedSkinIds).toContain('board-night')
    expect(unlockSkinWithCost(result.save, 'board-night').ok).toBe(false)
  })

  it('offers one equal-cost premium board for every season', () => {
    const premiumBoards = SKIN_CATALOG.filter((skin) => skin.kind === 'board' && skin.unlock.type === 'cost')
    expect(premiumBoards).toHaveLength(4)
    expect(new Set(premiumBoards.map((skin) => skin.kind === 'board' && skin.unlock.type === 'cost' ? skin.unlock.season : null))).toEqual(new Set(['spring', 'summer', 'autumn', 'winter']))
    expect(premiumBoards.every((skin) => skin.kind === 'board' && skin.unlock.type === 'cost' && skin.unlock.amount === 30)).toBe(true)
  })
})

describe('quests', () => {
  it('has complete localized quest titles', () => {
    expect(QUEST_DEFS.every((quest) => quest.titleEn && quest.titleZh)).toBe(true)
  })
  it('claim daily play after recording', () => {
    let save = recordPlayStarted(defaultSave())
    const r = claimQuest(save, 'daily-play-1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.save.fragments.universal).toBe(3)
    expect(claimQuest(r.save, 'daily-play-1').ok).toBe(false)
  })
})
