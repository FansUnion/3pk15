import type { ChapterId, LevelConfig } from './levels'
import { CHAPTER_ORDER, levelsForChapter } from './levels'
import {
  emptyQuestState,
  recordQuestMetric,
  refreshQuestPeriod,
  type QuestState,
} from './quests'

export type SaveGame = {
  schemaVersion: 1
  clearedLevels: string[]
  unlockedChapters: ChapterId[]
  fragments: {
    universal: number
    season: Record<ChapterId, number>
  }
  unlockedSkinIds: string[]
  equipped: {
    wolfSetId: string
    boardId: string
  }
  guide: {
    spring1Done: boolean
    hintUsage: Record<string, number>
    failureStreak: Record<string, number>
  }
  settings: { muted: boolean }
  buffs: {
    doubleDropUntil: number | null
  }
  quests: QuestState
  lastPlayedLevelId?: string
}

export type DropGrant = {
  universal: number
  season: Partial<Record<ChapterId, number>>
  firstClear: boolean
  doubled: boolean
}

export const SAVE_KEY = 'wolf-sheep-save-v1'

export function defaultSave(): SaveGame {
  return {
    schemaVersion: 1,
    clearedLevels: [],
    unlockedChapters: ['spring'],
    fragments: {
      universal: 0,
      season: { spring: 0, summer: 0, autumn: 0, winter: 0 },
    },
    unlockedSkinIds: ['wolf-default', 'board-default', 'board-spring'],
    equipped: {
      wolfSetId: 'wolf-default',
      boardId: 'board-default',
    },
    guide: { spring1Done: false, hintUsage: {}, failureStreak: {} },
    settings: { muted: false },
    buffs: { doubleDropUntil: null },
    quests: emptyQuestState(),
  }
}

function emptySeason(): Record<ChapterId, number> {
  return { spring: 0, summer: 0, autumn: 0, winter: 0 }
}

function safeAmount(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function parseQuests(raw: unknown): QuestState {
  if (!raw || typeof raw !== 'object') return emptyQuestState()
  const o = raw as QuestState
  return refreshQuestPeriod({
    daily: {
      key: typeof o.daily?.key === 'string' ? o.daily.key : '',
      progress: o.daily?.progress && typeof o.daily.progress === 'object' ? o.daily.progress : {},
      claimed: Array.isArray(o.daily?.claimed) ? o.daily.claimed.filter((x) => typeof x === 'string') : [],
    },
    weekly: {
      key: typeof o.weekly?.key === 'string' ? o.weekly.key : '',
      progress: o.weekly?.progress && typeof o.weekly.progress === 'object' ? o.weekly.progress : {},
      claimed: Array.isArray(o.weekly?.claimed)
        ? o.weekly.claimed.filter((x) => typeof x === 'string')
        : [],
    },
  })
}

export function migrate(raw: unknown): SaveGame {
  if (!raw || typeof raw !== 'object') return defaultSave()
  const o = raw as Record<string, unknown>
  if (o.schemaVersion !== 1) return defaultSave()

  const base = defaultSave()
  const fragments = o.fragments && typeof o.fragments === 'object' ? (o.fragments as Record<string, unknown>) : {}
  const rawSeason = fragments.season && typeof fragments.season === 'object' ? (fragments.season as Record<string, unknown>) : {}
  const unlockedChapters = Array.isArray(o.unlockedChapters)
    ? (o.unlockedChapters.filter((x) => CHAPTER_ORDER.includes(x as ChapterId)) as ChapterId[])
    : []
  return {
    schemaVersion: 1,
    clearedLevels: Array.isArray(o.clearedLevels)
      ? o.clearedLevels.filter((x): x is string => typeof x === 'string')
      : [],
    unlockedChapters: unlockedChapters.includes('spring') ? unlockedChapters : ['spring', ...unlockedChapters],
    fragments: {
      universal: safeAmount(fragments.universal),
      season: {
        ...emptySeason(),
        spring: safeAmount(rawSeason.spring),
        summer: safeAmount(rawSeason.summer),
        autumn: safeAmount(rawSeason.autumn),
        winter: safeAmount(rawSeason.winter),
      },
    },
    unlockedSkinIds: Array.isArray(o.unlockedSkinIds)
      ? o.unlockedSkinIds.filter((x): x is string => typeof x === 'string')
      : base.unlockedSkinIds,
    equipped: {
      wolfSetId:
        typeof (o.equipped as SaveGame['equipped'] | undefined)?.wolfSetId === 'string'
          ? (o.equipped as SaveGame['equipped']).wolfSetId
          : base.equipped.wolfSetId,
      boardId:
        typeof (o.equipped as SaveGame['equipped'] | undefined)?.boardId === 'string'
          ? (o.equipped as SaveGame['equipped']).boardId
          : base.equipped.boardId,
    },
    guide: {
      spring1Done: Boolean((o.guide as SaveGame['guide'] | undefined)?.spring1Done),
      hintUsage: parseNonNegativeRecord((o.guide as SaveGame['guide'] | undefined)?.hintUsage),
      failureStreak: parseNonNegativeRecord((o.guide as SaveGame['guide'] | undefined)?.failureStreak),
    },
    settings: {
      muted: Boolean((o.settings as SaveGame['settings'] | undefined)?.muted),
    },
    buffs: {
      doubleDropUntil:
        typeof (o.buffs as SaveGame['buffs'] | undefined)?.doubleDropUntil === 'number'
          ? (o.buffs as SaveGame['buffs']).doubleDropUntil
          : null,
    },
    quests: parseQuests(o.quests),
    lastPlayedLevelId:
      typeof o.lastPlayedLevelId === 'string' ? o.lastPlayedLevelId : undefined,
  }
}

function parseNonNegativeRecord(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {}
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, number] =>
      typeof entry[1] === 'number' && Number.isInteger(entry[1]) && entry[1] >= 0,
    ),
  )
}

export function recordGuideHint(save: SaveGame, levelId: string): SaveGame {
  return {
    ...save,
    guide: {
      ...save.guide,
      hintUsage: {
        ...save.guide.hintUsage,
        [levelId]: (save.guide.hintUsage[levelId] ?? 0) + 1,
      },
    },
  }
}

export function recordGuideResult(save: SaveGame, levelId: string, won: boolean): SaveGame {
  return {
    ...save,
    guide: {
      ...save.guide,
      failureStreak: {
        ...save.guide.failureStreak,
        [levelId]: won ? 0 : (save.guide.failureStreak[levelId] ?? 0) + 1,
      },
    },
  }
}

export function isChapterUnlocked(save: SaveGame, chapterId: ChapterId): boolean {
  return save.unlockedChapters.includes(chapterId)
}

export function isLevelCleared(save: SaveGame, levelId: string): boolean {
  return save.clearedLevels.includes(levelId)
}

export function isLevelUnlocked(save: SaveGame, level: LevelConfig): boolean {
  if (!isChapterUnlocked(save, level.chapterId)) return false
  const levels = levelsForChapter(level.chapterId)
  const index = levels.findIndex((candidate) => candidate.id === level.id)
  if (index < 0) return false
  return index === 0 || isLevelCleared(save, levels[index - 1]!.id)
}

export function recomputeUnlockedChapters(save: SaveGame): ChapterId[] {
  const unlocked: ChapterId[] = ['spring']
  for (let i = 0; i < CHAPTER_ORDER.length - 1; i++) {
    const chapter = CHAPTER_ORDER[i]!
    const next = CHAPTER_ORDER[i + 1]!
    const levels = levelsForChapter(chapter)
    const allClear = levels.every((l) => save.clearedLevels.includes(l.id))
    if (allClear) unlocked.push(next)
    else break
  }
  return unlocked
}

export function isDoubleDropActive(save: SaveGame, now = Date.now()): boolean {
  return save.buffs.doubleDropUntil != null && save.buffs.doubleDropUntil > now
}

export function rollClearReward(
  level: LevelConfig,
  save: SaveGame,
  rng: { nextFloat(): number },
  now = Date.now(),
): DropGrant {
  const firstClear = !save.clearedLevels.includes(level.id)
  const doubled = isDoubleDropActive(save, now)
  const mult = doubled ? 2 : 1

  if (firstClear) {
    const season: Partial<Record<ChapterId, number>> = {}
    for (const [k, v] of Object.entries(level.firstClearReward.season ?? {})) {
      season[k as ChapterId] = (v ?? 0) * mult
    }
    return {
      universal: (level.firstClearReward.universal ?? 0) * mult,
      season,
      firstClear: true,
      doubled,
    }
  }

  const drop = level.repeatDrop
  if (!drop || rng.nextFloat() >= drop.chance) {
    return { universal: 0, season: {}, firstClear: false, doubled }
  }
  const season: Partial<Record<ChapterId, number>> = {}
  for (const [k, v] of Object.entries(drop.season ?? {})) {
    season[k as ChapterId] = (v ?? 0) * mult
  }
  return {
    universal: (drop.universal ?? 0) * mult,
    season,
    firstClear: false,
    doubled,
  }
}

export function applyClearToSave(
  save: SaveGame,
  level: LevelConfig,
  grant: DropGrant,
): SaveGame {
  const alreadyCleared = save.clearedLevels.includes(level.id)
  const effectiveGrant: DropGrant = alreadyCleared && grant.firstClear
    ? { universal: 0, season: {}, firstClear: false, doubled: grant.doubled }
    : grant
  const clearedLevels = alreadyCleared
    ? save.clearedLevels
    : [...save.clearedLevels, level.id]

  const season = { ...save.fragments.season }
  for (const [k, v] of Object.entries(effectiveGrant.season)) {
    const id = k as ChapterId
    season[id] = (season[id] ?? 0) + (v ?? 0)
  }

  let quests = alreadyCleared && grant.firstClear
    ? save.quests
    : recordQuestMetric(save.quests, 'both', 'clears', 1)
  if (effectiveGrant.universal > 0) {
    quests = recordQuestMetric(quests, 'both', 'fragments_earned', effectiveGrant.universal)
  }

  const next: SaveGame = {
    ...save,
    clearedLevels,
    fragments: {
      universal: save.fragments.universal + effectiveGrant.universal,
      season,
    },
    lastPlayedLevelId: level.id,
    quests,
  }
  next.unlockedChapters = recomputeUnlockedChapters(next)

  const skins = new Set(next.unlockedSkinIds)
  for (const ch of next.unlockedChapters) {
    skins.add(`board-${ch}`)
  }
  skins.add('wolf-default')
  skins.add('board-default')
  next.unlockedSkinIds = [...skins]

  return next
}

export function recordPlayStarted(save: SaveGame, levelId?: string): SaveGame {
  return {
    ...save,
    ...(levelId ? { lastPlayedLevelId: levelId } : {}),
    quests: recordQuestMetric(save.quests, 'both', 'plays', 1),
  }
}

export function activateDoubleDrop(save: SaveGame, durationMs = 30 * 60 * 1000, now = Date.now()): SaveGame {
  return {
    ...save,
    buffs: { doubleDropUntil: now + durationMs },
  }
}

export function grantUniversalFragments(save: SaveGame, amount: number): SaveGame {
  let quests = save.quests
  if (amount > 0) {
    quests = recordQuestMetric(quests, 'both', 'fragments_earned', amount)
  }
  return {
    ...save,
    quests,
    fragments: {
      ...save.fragments,
      universal: save.fragments.universal + amount,
    },
  }
}
