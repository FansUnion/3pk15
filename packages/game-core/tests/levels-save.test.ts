import { describe, expect, it } from 'vitest'
import {
  applyClearToSave,
  createSeededRng,
  defaultSave,
  LEVELS,
  recomputeUnlockedChapters,
  rollClearReward,
  validateAllLevels,
  validateLevel,
} from '../src/index'

describe('level table', () => {
  it('all levels pass validation', () => {
    expect(validateAllLevels()).toEqual([])
  })

  it('has 3 levels per season', () => {
    for (const ch of ['spring', 'summer', 'autumn', 'winter'] as const) {
      expect(LEVELS.filter((l) => l.chapterId === ch)).toHaveLength(3)
    }
  })

  it('rejects adjacent rocks', () => {
    const bad = {
      ...LEVELS[0]!,
      id: 'bad',
      rocks: [
        { r: 4, c: 2 },
        { r: 4, c: 3 },
      ],
    }
    expect(validateLevel(bad).some((e) => e.includes('adjacent'))).toBe(true)
  })
})

describe('save clear flow', () => {
  it('first clear grants reward and unlocks summer after spring done', () => {
    let save = defaultSave()
    const spring = LEVELS.filter((l) => l.chapterId === 'spring')
    const rng = createSeededRng(1)

    for (const level of spring) {
      const grant = rollClearReward(level, save, rng)
      expect(grant.firstClear).toBe(true)
      expect(grant.universal).toBeGreaterThan(0)
      save = applyClearToSave(save, level, grant)
    }

    expect(save.unlockedChapters).toContain('summer')
    expect(recomputeUnlockedChapters(save)).toEqual(save.unlockedChapters)
  })

  it('repeat clear may drop zero', () => {
    const level = LEVELS[0]!
    let save = applyClearToSave(defaultSave(), level, {
      universal: 10,
      season: { spring: 2 },
      firstClear: true,
      doubled: false,
    })
    // force miss: rng always >= chance
    const grant = rollClearReward(level, save, { nextFloat: () => 0.99 })
    expect(grant.firstClear).toBe(false)
    expect(grant.universal).toBe(0)
  })
})
