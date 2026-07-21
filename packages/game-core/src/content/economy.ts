import { LEVELS } from './levels'
import { QUEST_DEFS } from './quests'
import { SKIN_CATALOG, type WolfSetSkin } from './skins'
import type { DropGrant, SaveGame } from './save'

export type AdEngagement = 'none' | 'half' | 'all'

export type UniversalTarget = {
  id: string
  nameZh: string
  nameEn: string
  cost: number
}

export type EconomyPath = {
  mode: AdEngagement
  earnedUniversal: number
  spentUniversal: number
  balance: number
  adsCompleted: number
  unlocks: Array<{ skinId: string; levelId: string; clearNumber: number }>
  nextTarget: UniversalTarget | null
  nextTargetRemaining: number
}

export type ActivityProfile = 'casual' | 'regular' | 'active'

export type QuestRewardBudget = {
  id: 'current' | 'middle' | 'legacy'
  dailyPlay: number
  dailyClear: number
  weeklyClear: number
  weeklyGameplayFragments: number
}

export const QUEST_REWARD_BUDGETS: QuestRewardBudget[] = [
  { id: 'current', dailyPlay: 2, dailyClear: 2, weeklyClear: 8, weeklyGameplayFragments: 4 },
  { id: 'middle', dailyPlay: 3, dailyClear: 3, weeklyClear: 8, weeklyGameplayFragments: 5 },
  { id: 'legacy', dailyPlay: 3, dailyClear: 5, weeklyClear: 15, weeklyGameplayFragments: 10 },
]

export type EconomyScenario = {
  days: number
  activity: ActivityProfile
  ads: AdEngagement
  questBudget: QuestRewardBudget['id']
  clears: number
  firstClears: number
  repeatClears: number
  adsCompleted: number
  earned: {
    gameplay: number
    quests: number
    ads: number
    total: number
  }
  spentUniversal: number
  balance: number
  unlocks: Array<{ skinId: string; day: number }>
  nextTarget: UniversalTarget | null
  nextTargetRemaining: number
}

export function universalSkinTargets(): UniversalTarget[] {
  return SKIN_CATALOG
    .filter((skin): skin is WolfSetSkin & { unlock: { type: 'cost'; universal: number } } =>
      skin.kind === 'wolf_set' && skin.unlock.type === 'cost')
    .map((skin) => ({ id: skin.id, nameZh: skin.nameZh, nameEn: skin.nameEn, cost: skin.unlock.universal }))
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id))
}

export function nextUniversalSkinTarget(save: SaveGame): UniversalTarget | null {
  return universalSkinTargets().find((target) => !save.unlockedSkinIds.includes(target.id)) ?? null
}

export function rewardedFragmentAmount(grant: Pick<DropGrant, 'universal'> | null): number {
  return Math.max(3, grant?.universal ?? 0)
}

export function simulateFirstClearEconomy(mode: AdEngagement): EconomyPath {
  const targets = universalSkinTargets()
  const unlocks: EconomyPath['unlocks'] = []
  let earnedUniversal = 0
  let spentUniversal = 0
  let balance = 0
  let adsCompleted = 0
  let targetIndex = 0

  for (const [index, level] of LEVELS.entries()) {
    const base = level.firstClearReward.universal ?? 0
    const adEligible = mode === 'all' || (mode === 'half' && index % 2 === 1)
    const adReward = adEligible ? rewardedFragmentAmount({ universal: base }) : 0
    if (adEligible) adsCompleted++
    earnedUniversal += base + adReward
    balance += base + adReward

    while (targetIndex < targets.length && balance >= targets[targetIndex]!.cost) {
      const target = targets[targetIndex]!
      balance -= target.cost
      spentUniversal += target.cost
      unlocks.push({ skinId: target.id, levelId: level.id, clearNumber: index + 1 })
      targetIndex++
    }
  }

  const nextTarget = targets[targetIndex] ?? null
  return {
    mode,
    earnedUniversal,
    spentUniversal,
    balance,
    adsCompleted,
    unlocks,
    nextTarget,
    nextTargetRemaining: nextTarget ? Math.max(0, nextTarget.cost - balance) : 0,
  }
}

export function currentQuestRewardBudget(): QuestRewardBudget {
  const reward = (id: string) => QUEST_DEFS.find((quest) => quest.id === id)?.rewardUniversal ?? 0
  return {
    id: 'current',
    dailyPlay: reward('daily-play-1'),
    dailyClear: reward('daily-clear-1'),
    weeklyClear: reward('weekly-clear-3'),
    weeklyGameplayFragments: reward('weekly-frag-20'),
  }
}

export function questWeeklyMaximum(budget: QuestRewardBudget): number {
  return (budget.dailyPlay + budget.dailyClear) * 7
    + budget.weeklyClear
    + budget.weeklyGameplayFragments
}

function activityForDay(profile: ActivityProfile, day: number): { active: boolean; clears: number } {
  if (profile === 'casual') return { active: day % 3 === 1, clears: day % 3 === 1 ? 1 : 0 }
  if (profile === 'regular') return { active: (day - 1) % 7 < 5, clears: (day - 1) % 7 < 5 ? 1 : 0 }
  return { active: true, clears: 2 }
}

function shouldWatchAd(mode: AdEngagement, firstClearNumber: number): boolean {
  return mode === 'all' || (mode === 'half' && firstClearNumber % 2 === 0)
}

export function simulateEconomyScenario({
  days,
  activity,
  ads,
  questBudget = 'current',
}: {
  days: number
  activity: ActivityProfile
  ads: AdEngagement
  questBudget?: QuestRewardBudget['id']
}): EconomyScenario {
  const budget = questBudget === 'current'
    ? currentQuestRewardBudget()
    : QUEST_REWARD_BUDGETS.find((candidate) => candidate.id === questBudget) ?? currentQuestRewardBudget()
  const targets = universalSkinTargets()
  const unlocks: EconomyScenario['unlocks'] = []
  let targetIndex = 0
  let balance = 0
  let gameplay = 0
  let quests = 0
  let adEarned = 0
  let clears = 0
  let firstClears = 0
  let repeatClears = 0
  let adsCompleted = 0
  let weeklyClears = 0
  let weeklyGameplay = 0

  const earn = (amount: number, source: 'gameplay' | 'quests' | 'ads') => {
    balance += amount
    if (source === 'gameplay') gameplay += amount
    else if (source === 'quests') quests += amount
    else adEarned += amount
  }
  const spendAvailable = (day: number) => {
    while (targetIndex < targets.length && balance >= targets[targetIndex]!.cost) {
      balance -= targets[targetIndex]!.cost
      unlocks.push({ skinId: targets[targetIndex]!.id, day })
      targetIndex++
    }
  }

  for (let day = 1; day <= Math.max(1, days); day++) {
    const activityDay = activityForDay(activity, day)
    if (activityDay.active) earn(budget.dailyPlay, 'quests')

    for (let clear = 0; clear < activityDay.clears; clear++) {
      clears++
      weeklyClears++
      if (firstClears < LEVELS.length) {
        firstClears++
        const base = LEVELS[firstClears - 1]!.firstClearReward.universal ?? 0
        earn(base, 'gameplay')
        weeklyGameplay += base
        if (shouldWatchAd(ads, firstClears)) {
          const reward = rewardedFragmentAmount({ universal: base })
          earn(reward, 'ads')
          adsCompleted++
        }
      } else {
        repeatClears++
        const expectedRepeat = 0.6
        earn(expectedRepeat, 'gameplay')
        weeklyGameplay += expectedRepeat
      }
    }

    if (activityDay.clears > 0) earn(budget.dailyClear, 'quests')
    const periodEnds = day % 7 === 0 || day === days
    if (periodEnds) {
      if (weeklyClears >= 3) earn(budget.weeklyClear, 'quests')
      if (weeklyGameplay >= 20) earn(budget.weeklyGameplayFragments, 'quests')
      weeklyClears = 0
      weeklyGameplay = 0
    }
    spendAvailable(day)
  }

  const nextTarget = targets[targetIndex] ?? null
  const round = (value: number) => Math.round(value * 10) / 10
  return {
    days,
    activity,
    ads,
    questBudget: budget.id,
    clears,
    firstClears,
    repeatClears,
    adsCompleted,
    earned: {
      gameplay: round(gameplay),
      quests: round(quests),
      ads: round(adEarned),
      total: round(gameplay + quests + adEarned),
    },
    spentUniversal: unlocks.reduce((total, unlock) => total + (targets.find((target) => target.id === unlock.skinId)?.cost ?? 0), 0),
    balance: round(balance),
    unlocks,
    nextTarget,
    nextTargetRemaining: nextTarget ? round(Math.max(0, nextTarget.cost - balance)) : 0,
  }
}
