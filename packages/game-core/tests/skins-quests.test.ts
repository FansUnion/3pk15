import { describe, expect, it } from 'vitest'
import {
  claimQuest,
  claimAllQuests,
  claimableQuestCount,
  currentQuestRewardBudget,
  defaultSave,
  emptyQuestState,
  equipSkin,
  recordPlayStarted,
  recordQuestMetric,
  nextUniversalSkinTarget,
  resolveSkin,
  setBoardMode,
  settleQuestPeriods,
  simulateEconomyScenario,
  simulateFirstClearEconomy,
  SKIN_CATALOG,
  QUEST_DEFS,
  unlockSkinWithCost,
  validateSkinCatalog,
  grantUniversalFragments,
  questWeeklyMaximum,
  QUEST_REWARD_BUDGETS,
} from '../src/index'

describe('skins', () => {
  it('catalog validates', () => {
    expect(validateSkinCatalog()).toEqual([])
  })

  it('unlock frost with enough fragments', () => {
    let save = defaultSave()
    save = { ...save, fragments: { ...save.fragments, universal: 80 } }
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

  it('keeps a three-step 80/160/240 universal collection ladder', () => {
    expect(SKIN_CATALOG
      .filter((skin) => skin.kind === 'wolf_set' && skin.unlock.type === 'cost')
      .map((skin) => skin.kind === 'wolf_set' && skin.unlock.type === 'cost' ? skin.unlock.universal : 0)
      .sort((a, b) => a - b)).toEqual([80, 160, 240])
  })

  it('stops offering rewarded fragments after every universal target is owned', () => {
    const save = defaultSave()
    expect(nextUniversalSkinTarget(save)?.id).toBe('wolf-frost')
    const complete = {
      ...save,
      unlockedSkinIds: [...save.unlockedSkinIds, 'wolf-frost', 'wolf-night', 'wolf-aurora'],
    }
    expect(nextUniversalSkinTarget(complete)).toBeNull()
  })

  it('makes ads accelerate rather than block the first-clear collection path', () => {
    const none = simulateFirstClearEconomy('none')
    const half = simulateFirstClearEconomy('half')
    const all = simulateFirstClearEconomy('all')

    expect(none).toMatchObject({ earnedUniversal: 240, adsCompleted: 0 })
    expect(none.unlocks.map((unlock) => [unlock.skinId, unlock.clearNumber])).toEqual([
      ['wolf-frost', 8], ['wolf-night', 24],
    ])
    expect(half).toMatchObject({ earnedUniversal: 360, adsCompleted: 12 })
    expect(half.unlocks.map((unlock) => unlock.skinId)).toEqual(['wolf-frost', 'wolf-night'])
    expect(all).toMatchObject({ earnedUniversal: 480, spentUniversal: 480, balance: 0, adsCompleted: 24 })
    expect(all.unlocks.map((unlock) => [unlock.skinId, unlock.clearNumber])).toEqual([
      ['wolf-frost', 4], ['wolf-night', 12], ['wolf-aurora', 24],
    ])
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

  it('follows the level season by default and keeps per-season choices', () => {
    let save = defaultSave()
    expect(resolveSkin(save, 'spring').board.id).toBe('board-spring')
    expect(resolveSkin(save, 'winter').board.id).toBe('board-winter')

    save = {
      ...save,
      fragments: { ...save.fragments, season: { ...save.fragments.season, winter: 30 } },
    }
    const unlocked = unlockSkinWithCost(save, 'board-night')
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    const equipped = equipSkin(unlocked.save, 'board-night')
    expect(equipped.ok).toBe(true)
    if (!equipped.ok) return
    expect(resolveSkin(equipped.save, 'winter').board.id).toBe('board-night')
    expect(resolveSkin(equipped.save, 'spring').board.id).toBe('board-spring')

    const fixed = setBoardMode({ ...equipped.save, equipped: { ...equipped.save.equipped, boardId: 'board-night' } }, 'fixed')
    expect(resolveSkin(fixed, 'spring').board.id).toBe('board-night')
  })

  it('switches to fixed mode when equipping a season-neutral board', () => {
    const equipped = equipSkin(defaultSave(), 'board-default')
    expect(equipped.ok).toBe(true)
    if (!equipped.ok) return
    expect(equipped.save.equipped.boardMode).toBe('fixed')
    expect(resolveSkin(equipped.save, 'winter').board.id).toBe('board-default')
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
    expect(r.save.fragments.universal).toBe(2)
    expect(claimQuest(r.save, 'daily-play-1').ok).toBe(false)
  })

  it('keeps the current quest budget at 40 universal shards per fully active week', () => {
    expect(currentQuestRewardBudget()).toEqual({
      id: 'current',
      dailyPlay: 2,
      dailyClear: 2,
      weeklyClear: 8,
      weeklyGameplayFragments: 4,
    })
    expect(questWeeklyMaximum(currentQuestRewardBudget())).toBe(40)
    expect(questWeeklyMaximum(QUEST_REWARD_BUDGETS.find((budget) => budget.id === 'legacy')!)).toBe(81)
  })

  it('does not let rewarded ads advance gameplay-fragment quests', () => {
    const adSave = grantUniversalFragments(defaultSave(), 20, 'ad')
    expect(adSave.fragments.universal).toBe(20)
    expect(adSave.quests.weekly.progress['weekly-frag-20'] ?? 0).toBe(0)

    const gameplaySave = grantUniversalFragments(defaultSave(), 20, 'gameplay')
    expect(gameplaySave.quests.weekly.progress['weekly-frag-20']).toBe(20)
  })

  it('protects completed unclaimed rewards across a daily rollover exactly once', () => {
    const day1 = new Date(2026, 6, 20, 12)
    const day2 = new Date(2026, 6, 21, 12)
    const quests = recordQuestMetric(emptyQuestState(day1), 'daily', 'plays', 1, day1)
    const save = { ...defaultSave(), quests }
    const first = settleQuestPeriods(save, day2)
    expect(first.protectedUniversal).toBe(2)
    expect(first.save.fragments.universal).toBe(2)
    expect(first.save.quests.daily.progress).toEqual({})

    const second = settleQuestPeriods(first.save, day2)
    expect(second.protectedUniversal).toBe(0)
    expect(second.save.fragments.universal).toBe(2)
  })

  it('does not reopen an older task period when the device clock moves backward', () => {
    const later = new Date(2026, 6, 21, 12)
    const earlier = new Date(2026, 6, 20, 12)
    const quests = recordQuestMetric(emptyQuestState(later), 'daily', 'plays', 1, later)
    const save = { ...defaultSave(), quests }
    const result = settleQuestPeriods(save, earlier)
    expect(result.protectedUniversal).toBe(0)
    expect(result.save.quests.daily.key).toBe('2026-07-21')
    expect(result.save.quests.daily.progress['daily-play-1']).toBe(1)
  })

  it('claims every completed task in one idempotent action', () => {
    const now = new Date(2026, 6, 20, 12)
    let quests = emptyQuestState(now)
    quests = recordQuestMetric(quests, 'both', 'plays', 1, now)
    quests = recordQuestMetric(quests, 'both', 'clears', 3, now)
    quests = recordQuestMetric(quests, 'both', 'gameplay_fragments_earned', 20, now)
    const save = { ...defaultSave(), quests }
    expect(claimableQuestCount(save, now)).toBe(4)
    const claimed = claimAllQuests(save, now)
    expect(claimed.ok).toBe(true)
    if (!claimed.ok) return
    expect(claimed).toMatchObject({ claimedCount: 4, rewardUniversal: 16 })
    expect(claimed.save.fragments.universal).toBe(16)
    expect(claimableQuestCount(claimed.save, now)).toBe(0)
    expect(claimAllQuests(claimed.save, now).ok).toBe(false)
  })

  it('keeps the current regular no-ad path below total collection exhaustion at 28 days', () => {
    const scenario = simulateEconomyScenario({ days: 28, activity: 'regular', ads: 'none' })
    expect(scenario.earned).toMatchObject({ gameplay: 200, quests: 128, ads: 0, total: 328 })
    expect(scenario.unlocks.map((unlock) => unlock.skinId)).toEqual(['wolf-frost', 'wolf-night'])
    expect(scenario.nextTarget?.id).toBe('wolf-aurora')
    expect(scenario.nextTargetRemaining).toBe(152)
  })
})
