import { describe, expect, it } from 'vitest'
import {
  applyClearToSave,
  createLevelInitialState,
  createSeededRng,
  defaultSave,
  LEVELS,
  migrate,
  recomputeUnlockedChapters,
  rollClearReward,
  validateAllLevels,
  validateLevel,
  deserialize,
  serialize,
} from '../src/index'

describe('level table', () => {
  it('all levels pass validation', () => {
    expect(validateAllLevels()).toEqual([])
  })

  it('has 6 levels per season', () => {
    for (const ch of ['spring', 'summer', 'autumn', 'winter'] as const) {
      expect(LEVELS.filter((l) => l.chapterId === ch)).toHaveLength(6)
    }
  })

  it('every level has valid long-term design defaults', () => {
    for (const level of LEVELS) {
      expect(level.targetEaten).toBe(8)
      expect(level.maxPlies).toBeGreaterThanOrEqual(20)
      expect(level.openingTemplate).toBeTruthy()
      expect(level.teachingPoint).toBeTruthy()
      expect(level.expectedPlies!.min).toBeLessThanOrEqual(level.expectedPlies!.target)
      expect(level.expectedPlies!.target).toBeLessThanOrEqual(level.expectedPlies!.max)
    }
  })

  it('keeps production-facing Chinese level content complete', () => {
    for (const level of LEVELS) {
      expect(level.nameZh.trim()).not.toBe('')
      expect(level.blurbZh.trim().length).toBeGreaterThanOrEqual(15)
      expect(level.teachingPoint!.trim().length).toBeGreaterThanOrEqual(10)
      expect(level.teachingPoint).toMatch(/[\u3400-\u9fff]/)
      expect(level.nameMeaningZh.trim()).not.toBe('')
      expect(level.designConceptZh.trim()).not.toBe('')
      expect(level.playerGoalZh.trim()).not.toBe('')
      expect(level.wolfStrategyZh.trim()).not.toBe('')
      expect(level.sheepDefenseZh.trim()).not.toBe('')
      expect(level.productionStatus).toBe('approved')
    }
  })

  it('creates each configured opening without falling back to default positions', () => {
    for (const level of LEVELS) {
      const state = createLevelInitialState(level)
      expect(state.targetEaten).toBe(level.targetEaten)
      expect(state.maxPlies).toBe(level.maxPlies)
      if (level.opening?.wolves) {
        expect(state.pieces.filter((piece) => piece.side === 'wolf')).toMatchObject(
          level.opening.wolves,
        )
      }
    }
  })

  it('rebuilds and serializes every configured opening with its terrain and limits intact', () => {
    for (const level of LEVELS) {
      const first = createLevelInitialState(level)
      const restarted = createLevelInitialState(level)
      expect(serialize(restarted)).toEqual(serialize(first))
      expect(serialize(deserialize(serialize(first)))).toEqual(serialize(first))
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
  it('repairs malformed progress without removing the spring entry point', () => {
    const save = migrate({
      schemaVersion: 1,
      unlockedChapters: [],
      fragments: { universal: -20, season: 'broken' },
    })

    expect(save.unlockedChapters).toEqual(['spring'])
    expect(save.fragments.universal).toBe(0)
    expect(save.fragments.season).toEqual({ spring: 0, summer: 0, autumn: 0, winter: 0 })
  })

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
