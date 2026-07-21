import { describe, expect, it } from 'vitest'
import {
  applyClearToSave,
  createLevelInitialState,
  createSeededRng,
  defaultSave,
  LEVELS,
  levelTeachingPoint,
  levelConfigFingerprint,
  isLevelUnlocked,
  migrate,
  recomputeUnlockedChapters,
  recordGuideHint,
  recordGuideResult,
  rollClearReward,
  validateAllLevels,
  validateLevel,
  WOLF_STRATEGIES,
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

  it('binds all 24 levels to the five production AI profiles', () => {
    expect(LEVELS.filter((level) => level.aiProfile === 'guided').map((level) => level.id)).toEqual(['spring-01', 'spring-02'])
    expect(LEVELS.filter((level) => level.aiProfile === 'foundation').map((level) => level.id)).toEqual(['spring-03', 'spring-04', 'spring-05', 'spring-06'])
    expect(LEVELS.filter((level) => level.aiProfile === 'tactical')).toHaveLength(6)
    expect(LEVELS.filter((level) => level.aiProfile === 'strategic')).toHaveLength(6)
    expect(LEVELS.filter((level) => level.aiProfile === 'expert')).toHaveLength(6)
  })

  it('binds every level to a complete three-dimensional opponent contract', () => {
    for (const level of LEVELS) {
      expect(level.aiStyle.primary).not.toBe(level.aiStyle.secondary)
      expect(level.opponentIntent.target).toBeTruthy()
      expect(level.opponentIntent.summaryZh).toMatch(/[\u3400-\u9fff]/)
      expect(level.opponentIntent.counterplayZh).toMatch(/[\u3400-\u9fff]/)
    }
    expect(new Set(LEVELS.map((level) => level.aiStyle.primary))).toEqual(new Set([
      'blockade', 'encircle', 'disperse', 'exchange', 'hunter-counter',
    ]))
  })

  it('gives every production level a stable unique configuration fingerprint', () => {
    const first = LEVELS.map(levelConfigFingerprint)
    const second = LEVELS.map(levelConfigFingerprint)
    expect(first).toEqual(second)
    expect(new Set(first)).toHaveLength(24)
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

  it('provides localized teaching points for every level', () => {
    for (const level of LEVELS) {
      expect(levelTeachingPoint(level, 'zh')).toMatch(/[\u3400-\u9fff]/)
      expect(levelTeachingPoint(level, 'en')).toMatch(/[A-Za-z]/)
      expect(levelTeachingPoint(level, 'en')).not.toMatch(/[\u3400-\u9fff]/)
    }
  })

  it('binds every level to two distinct documented strategies', () => {
    expect(WOLF_STRATEGIES).toHaveLength(6)
    for (const strategy of WOLF_STRATEGIES) {
      expect(strategy.nameEn).toBeTruthy()
      expect(strategy.nameZh).toBeTruthy()
      expect(strategy.signalEn).toBeTruthy()
      expect(strategy.signalZh).toBeTruthy()
      expect(strategy.mistakeEn).toBeTruthy()
      expect(strategy.mistakeZh).toBeTruthy()
    }
    for (const level of LEVELS) {
      expect(level.strategy.primary).not.toBe(level.strategy.secondary)
      expect(WOLF_STRATEGIES.some((item) => item.id === level.strategy.primary)).toBe(true)
      expect(WOLF_STRATEGIES.some((item) => item.id === level.strategy.secondary)).toBe(true)
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

  it('allows and uses sparse winter-rock layouts', () => {
    const base = LEVELS.find((level) => level.id === 'winter-05')!
    const candidate = { ...base, rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }] }
    expect(validateLevel(candidate)).toEqual([])
    const productionRockCounts = LEVELS.filter((level) => level.chapterId === 'winter').map((level) => level.rocks.length)
    expect(productionRockCounts.every((count) => count >= 0 && count <= 2)).toBe(true)
    expect(new Set(productionRockCounts).size).toBeGreaterThanOrEqual(3)
  })

  it('allows and uses low and medium density autumn layouts', () => {
    const base = LEVELS.find((level) => level.id === 'autumn-01')!
    expect(validateLevel({ ...base, rocks: [{ r: 4, c: 2 }, { r: 4, c: 5 }] })).toEqual([])
    expect(validateLevel({ ...base, rocks: [{ r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }] })).toEqual([])
    const productionRockCounts = LEVELS.filter((level) => level.chapterId === 'autumn').map((level) => level.rocks.length)
    expect(Math.min(...productionRockCounts)).toBe(2)
    expect(Math.max(...productionRockCounts)).toBe(3)
  })
})

describe('save clear flow', () => {
  it('unlocks only the first level and the level after the latest clear', () => {
    const base = defaultSave()
    expect(isLevelUnlocked(base, LEVELS.find((level) => level.id === 'spring-01')!)).toBe(true)
    expect(isLevelUnlocked(base, LEVELS.find((level) => level.id === 'spring-02')!)).toBe(false)
    expect(isLevelUnlocked(base, LEVELS.find((level) => level.id === 'summer-01')!)).toBe(false)

    const afterFirst = { ...base, clearedLevels: ['spring-01'] }
    expect(isLevelUnlocked(afterFirst, LEVELS.find((level) => level.id === 'spring-02')!)).toBe(true)
  })
  it('migrates and records guide usage without losing old saves', () => {
    const migrated = migrate({ schemaVersion: 1, guide: { spring1Done: true } })
    expect(migrated.guide).toEqual({ spring1Done: true, hintUsage: {}, failureStreak: {} })

    const hinted = recordGuideHint(migrated, 'summer-01')
    const failedTwice = recordGuideResult(recordGuideResult(hinted, 'summer-01', false), 'summer-01', false)
    expect(failedTwice.guide.hintUsage['summer-01']).toBe(1)
    expect(failedTwice.guide.failureStreak['summer-01']).toBe(2)
    expect(recordGuideResult(failedTwice, 'summer-01', true).guide.failureStreak['summer-01']).toBe(0)
  })
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

  it('makes each seasonal board affordable at the end of its six-level season without ads', () => {
    let save = defaultSave()
    const rng = createSeededRng(20260720)
    const expectedUniversal = [60, 120, 180, 240]

    for (const [chapterIndex, chapter] of (['spring', 'summer', 'autumn', 'winter'] as const).entries()) {
      for (const level of LEVELS.filter((candidate) => candidate.chapterId === chapter)) {
        const grant = rollClearReward(level, save, rng)
        expect(grant).toMatchObject({ universal: 10, season: { [chapter]: 5 }, firstClear: true })
        save = applyClearToSave(save, level, grant)
      }
      expect(save.fragments.season[chapter]).toBe(30)
      expect(save.fragments.universal).toBe(expectedUniversal[chapterIndex])
    }
  })

  it('ignores the retired timed-double field while preserving an existing save', () => {
    const migrated = migrate({
      ...defaultSave(),
      fragments: { universal: 47, season: { spring: 11, summer: 0, autumn: 0, winter: 0 } },
      buffs: { doubleDropUntil: Date.now() + 60_000 },
    })
    expect(migrated.fragments.universal).toBe(47)
    expect(migrated.fragments.season.spring).toBe(11)
    expect(migrated).not.toHaveProperty('buffs')
  })

  it('migrates legacy board choices without overriding an intentional skin', () => {
    const untouched = migrate({
      ...defaultSave(),
      schemaVersion: 1,
      equipped: { wolfSetId: 'wolf-default', boardId: 'board-default' },
    })
    expect(untouched.schemaVersion).toBe(2)
    expect(untouched.equipped.boardMode).toBe('seasonal')
    expect(untouched.equipped.seasonalBoardIds.winter).toBe('board-winter')

    const intentional = migrate({
      ...defaultSave(),
      schemaVersion: 1,
      equipped: { wolfSetId: 'wolf-frost', boardId: 'board-night' },
    })
    expect(intentional.equipped.boardMode).toBe('fixed')
    expect(intentional.equipped.boardId).toBe('board-night')
  })

  it('repeat clear may drop zero', () => {
    const level = LEVELS[0]!
    let save = applyClearToSave(defaultSave(), level, {
      universal: 10,
      season: { spring: 5 },
      firstClear: true,
    })
    // force miss: rng always >= chance
    const grant = rollClearReward(level, save, { nextFloat: () => 0.99 })
    expect(grant.firstClear).toBe(false)
    expect(grant.universal).toBe(0)
  })

  it('does not apply the same first-clear grant twice', () => {
    const level = LEVELS[0]!
    const grant = {
      universal: 10,
      season: { spring: 5 },
      firstClear: true,
    } as const
    const once = applyClearToSave(defaultSave(), level, grant)
    const twice = applyClearToSave(once, level, grant)

    expect(twice.fragments).toEqual(once.fragments)
    expect(twice.clearedLevels).toEqual(once.clearedLevels)
    expect(twice.quests).toEqual(once.quests)
  })
})
