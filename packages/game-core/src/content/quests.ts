import type { SaveGame } from './save'

export type QuestDef = {
  id: string
  period: 'daily' | 'weekly'
  title: string
  titleEn: string
  titleZh: string
  target: number
  metric: 'plays' | 'clears' | 'gameplay_fragments_earned'
  rewardUniversal: number
}

export const QUEST_DEFS: QuestDef[] = [
  {
    id: 'daily-play-1',
    period: 'daily',
    title: '今日对局 1 次',
    titleEn: 'Play 1 hunt today',
    titleZh: '今日对局 1 次',
    target: 1,
    metric: 'plays',
    rewardUniversal: 2,
  },
  {
    id: 'daily-clear-1',
    period: 'daily',
    title: '今日通关 1 关',
    titleEn: 'Clear 1 hunt today',
    titleZh: '今日通关 1 关',
    target: 1,
    metric: 'clears',
    rewardUniversal: 2,
  },
  {
    id: 'weekly-clear-3',
    period: 'weekly',
    title: '本周通关 3 关',
    titleEn: 'Clear 3 hunts this week',
    titleZh: '本周通关 3 关',
    target: 3,
    metric: 'clears',
    rewardUniversal: 8,
  },
  {
    id: 'weekly-frag-20',
    period: 'weekly',
    title: '本周通过对局获得 20 通用碎片',
    titleEn: 'Earn 20 shards from hunts this week',
    titleZh: '本周通过对局获得 20 通用碎片',
    target: 20,
    metric: 'gameplay_fragments_earned',
    rewardUniversal: 4,
  },
]

export function questDisplayTitle(quest: QuestDef, locale: 'en' | 'zh'): string {
  return locale === 'zh' ? quest.titleZh : quest.titleEn
}

export type QuestBucket = {
  key: string
  progress: Record<string, number>
  claimed: string[]
}

export type QuestState = {
  daily: QuestBucket
  weekly: QuestBucket
  pendingUniversal: number
}

export function dailyKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function weeklyKey(d = new Date()): string {
  const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNum = (tmp.getDay() + 6) % 7
  tmp.setDate(tmp.getDate() - dayNum + 3)
  const firstThursday = new Date(tmp.getFullYear(), 0, 4)
  const week =
    1 +
    Math.round(
      ((tmp.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  return `${tmp.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function emptyQuestState(now = new Date()): QuestState {
  return {
    daily: { key: dailyKey(now), progress: {}, claimed: [] },
    weekly: { key: weeklyKey(now), progress: {}, claimed: [] },
    pendingUniversal: 0,
  }
}

function completedUnclaimedReward(bucket: QuestBucket, period: QuestDef['period']): number {
  return QUEST_DEFS
    .filter((quest) => quest.period === period
      && !bucket.claimed.includes(quest.id)
      && (bucket.progress[quest.id] ?? 0) >= quest.target)
    .reduce((total, quest) => total + quest.rewardUniversal, 0)
}

export function refreshQuestPeriod(state: QuestState, now = new Date()): QuestState {
  const dKey = dailyKey(now)
  const wKey = weeklyKey(now)
  let pendingUniversal = Math.max(0, state.pendingUniversal ?? 0)
  let daily = state.daily
  let weekly = state.weekly

  if (!daily.key || dKey > daily.key) {
    pendingUniversal += completedUnclaimedReward(daily, 'daily')
    daily = { key: dKey, progress: {}, claimed: [] }
  }
  if (!weekly.key || wKey > weekly.key) {
    pendingUniversal += completedUnclaimedReward(weekly, 'weekly')
    weekly = { key: wKey, progress: {}, claimed: [] }
  }

  return { daily, weekly, pendingUniversal }
}

export function settleQuestPeriods(
  save: SaveGame,
  now = new Date(),
): { save: SaveGame; protectedUniversal: number } {
  const quests = refreshQuestPeriod(save.quests, now)
  const protectedUniversal = quests.pendingUniversal
  return {
    protectedUniversal,
    save: {
      ...save,
      fragments: protectedUniversal > 0
        ? { ...save.fragments, universal: save.fragments.universal + protectedUniversal }
        : save.fragments,
      quests: protectedUniversal > 0 ? { ...quests, pendingUniversal: 0 } : quests,
    },
  }
}

export function recordQuestMetric(
  quests: QuestState,
  period: 'daily' | 'weekly' | 'both',
  metric: QuestDef['metric'],
  amount: number,
  now = new Date(),
): QuestState {
  let q = refreshQuestPeriod(quests, now)
  const apply = (bucket: QuestBucket, p: 'daily' | 'weekly'): QuestBucket => {
    const progress = { ...bucket.progress }
    for (const def of QUEST_DEFS) {
      if (def.period !== p || def.metric !== metric) continue
      progress[def.id] = Math.min(def.target, (progress[def.id] ?? 0) + amount)
    }
    return { ...bucket, progress }
  }
  if (period === 'daily' || period === 'both') {
    q = { ...q, daily: apply(q.daily, 'daily') }
  }
  if (period === 'weekly' || period === 'both') {
    q = { ...q, weekly: apply(q.weekly, 'weekly') }
  }
  return q
}

export function claimableQuestCount(save: SaveGame, now = new Date()): number {
  const settled = settleQuestPeriods(save, now).save
  return QUEST_DEFS.filter((quest) => {
    const bucket = settled.quests[quest.period]
    return !bucket.claimed.includes(quest.id) && (bucket.progress[quest.id] ?? 0) >= quest.target
  }).length
}

export function claimQuest(
  save: SaveGame,
  questId: string,
  now = new Date(),
): { ok: true; save: SaveGame; rewardUniversal: number } | { ok: false; error: string } {
  const def = QUEST_DEFS.find((q) => q.id === questId)
  if (!def) return { ok: false, error: 'unknown quest' }
  const settled = settleQuestPeriods(save, now).save
  const bucket = settled.quests[def.period]
  if (bucket.claimed.includes(questId)) return { ok: false, error: 'already claimed' }
  const progress = bucket.progress[questId] ?? 0
  if (progress < def.target) return { ok: false, error: 'incomplete' }

  const nextBucket = { ...bucket, claimed: [...bucket.claimed, questId] }
  return {
    ok: true,
    rewardUniversal: def.rewardUniversal,
    save: {
      ...settled,
      quests: { ...settled.quests, [def.period]: nextBucket },
      fragments: {
        ...settled.fragments,
        universal: settled.fragments.universal + def.rewardUniversal,
      },
    },
  }
}

export function claimAllQuests(
  save: SaveGame,
  now = new Date(),
): { ok: true; save: SaveGame; claimedCount: number; rewardUniversal: number } | { ok: false; error: string } {
  const settled = settleQuestPeriods(save, now).save
  const claimable = QUEST_DEFS.filter((quest) => {
    const bucket = settled.quests[quest.period]
    return !bucket.claimed.includes(quest.id) && (bucket.progress[quest.id] ?? 0) >= quest.target
  })
  if (claimable.length === 0) return { ok: false, error: 'nothing claimable' }

  const claimedByPeriod = {
    daily: new Set(settled.quests.daily.claimed),
    weekly: new Set(settled.quests.weekly.claimed),
  }
  let rewardUniversal = 0
  for (const quest of claimable) {
    claimedByPeriod[quest.period].add(quest.id)
    rewardUniversal += quest.rewardUniversal
  }

  return {
    ok: true,
    claimedCount: claimable.length,
    rewardUniversal,
    save: {
      ...settled,
      quests: {
        ...settled.quests,
        daily: { ...settled.quests.daily, claimed: [...claimedByPeriod.daily] },
        weekly: { ...settled.quests.weekly, claimed: [...claimedByPeriod.weekly] },
      },
      fragments: {
        ...settled.fragments,
        universal: settled.fragments.universal + rewardUniversal,
      },
    },
  }
}
