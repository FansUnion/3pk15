import type { SaveGame } from './save'

export type QuestDef = {
  id: string
  period: 'daily' | 'weekly'
  title: string
  target: number
  metric: 'plays' | 'clears' | 'fragments_earned'
  rewardUniversal: number
}

export const QUEST_DEFS: QuestDef[] = [
  {
    id: 'daily-play-1',
    period: 'daily',
    title: '今日对局 1 次',
    target: 1,
    metric: 'plays',
    rewardUniversal: 3,
  },
  {
    id: 'daily-clear-1',
    period: 'daily',
    title: '今日通关 1 关',
    target: 1,
    metric: 'clears',
    rewardUniversal: 5,
  },
  {
    id: 'weekly-clear-3',
    period: 'weekly',
    title: '本周通关 3 关',
    target: 3,
    metric: 'clears',
    rewardUniversal: 15,
  },
  {
    id: 'weekly-frag-20',
    period: 'weekly',
    title: '本周获得 20 通用碎片',
    target: 20,
    metric: 'fragments_earned',
    rewardUniversal: 10,
  },
]

export type QuestBucket = {
  key: string
  progress: Record<string, number>
  claimed: string[]
}

export type QuestState = {
  daily: QuestBucket
  weekly: QuestBucket
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
  }
}

export function refreshQuestPeriod(state: QuestState, now = new Date()): QuestState {
  const dKey = dailyKey(now)
  const wKey = weeklyKey(now)
  return {
    daily:
      state.daily.key === dKey
        ? state.daily
        : { key: dKey, progress: {}, claimed: [] },
    weekly:
      state.weekly.key === wKey
        ? state.weekly
        : { key: wKey, progress: {}, claimed: [] },
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

export function claimQuest(
  save: SaveGame,
  questId: string,
  now = new Date(),
): { ok: true; save: SaveGame } | { ok: false; error: string } {
  const def = QUEST_DEFS.find((q) => q.id === questId)
  if (!def) return { ok: false, error: 'unknown quest' }
  const quests = refreshQuestPeriod(save.quests, now)
  const bucket = def.period === 'daily' ? quests.daily : quests.weekly
  if (bucket.claimed.includes(questId)) return { ok: false, error: 'already claimed' }
  const progress = bucket.progress[questId] ?? 0
  if (progress < def.target) return { ok: false, error: 'incomplete' }

  const nextBucket = { ...bucket, claimed: [...bucket.claimed, questId] }
  const nextQuests: QuestState = {
    ...quests,
    [def.period]: nextBucket,
  }

  return {
    ok: true,
    save: {
      ...save,
      quests: nextQuests,
      fragments: {
        ...save.fragments,
        universal: save.fragments.universal + def.rewardUniversal,
      },
    },
  }
}
