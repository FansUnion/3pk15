import type { ChapterId, LevelConfig } from './levels'
import { CHAPTER_ORDER, levelsForChapter } from './levels'
import {
  emptyQuestState,
  recordQuestMetric,
  settleQuestPeriods,
  type QuestState,
} from './quests'

export type SaveGame = {
  schemaVersion: 2
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
    boardMode: 'seasonal' | 'fixed'
    seasonalBoardIds: Record<ChapterId, string>
  }
  guide: {
    spring1Done: boolean
    hintUsage: Record<string, number>
    failureStreak: Record<string, number>
  }
  settings: { muted: boolean }
  quests: QuestState
  lastPlayedLevelId?: string
}

export type DropGrant = {
  universal: number
  season: Partial<Record<ChapterId, number>>
  firstClear: boolean
}

export type UniversalFragmentSource = 'gameplay' | 'ad' | 'quest' | 'compensation'

export const SAVE_KEY = 'wolf-sheep-save-v1'

function defaultSeasonalBoards(): Record<ChapterId, string> {
  return {
    spring: 'board-spring',
    summer: 'board-summer',
    autumn: 'board-autumn',
    winter: 'board-winter',
  }
}

export function defaultSave(): SaveGame {
  return {
    schemaVersion: 2,
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
      boardMode: 'seasonal',
      seasonalBoardIds: defaultSeasonalBoards(),
    },
    guide: { spring1Done: false, hintUsage: {}, failureStreak: {} },
    settings: { muted: false },
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
  return {
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
    pendingUniversal: safeAmount(o.pendingUniversal),
  }
}

export function migrate(raw: unknown): SaveGame {
  if (!raw || typeof raw !== 'object') return defaultSave()
  const o = raw as Record<string, unknown>
  if (o.schemaVersion !== 1 && o.schemaVersion !== 2) return defaultSave()

  const base = defaultSave()
  const fragments = o.fragments && typeof o.fragments === 'object' ? (o.fragments as Record<string, unknown>) : {}
  const rawSeason = fragments.season && typeof fragments.season === 'object' ? (fragments.season as Record<string, unknown>) : {}
  const unlockedChapters = Array.isArray(o.unlockedChapters)
    ? (o.unlockedChapters.filter((x) => CHAPTER_ORDER.includes(x as ChapterId)) as ChapterId[])
    : []
  const rawEquipped = o.equipped && typeof o.equipped === 'object'
    ? o.equipped as Partial<SaveGame['equipped']>
    : {}
  const boardId = typeof rawEquipped.boardId === 'string' ? rawEquipped.boardId : base.equipped.boardId
  const rawSeasonalBoards: Partial<Record<ChapterId, string>> =
    rawEquipped.seasonalBoardIds && typeof rawEquipped.seasonalBoardIds === 'object'
      ? rawEquipped.seasonalBoardIds
      : {}
  const seasonalBoardIds = defaultSeasonalBoards()
  for (const chapter of CHAPTER_ORDER) {
    const candidate = rawSeasonalBoards[chapter]
    if (typeof candidate === 'string') seasonalBoardIds[chapter] = candidate
  }
  const boardMode = rawEquipped.boardMode === 'seasonal' || rawEquipped.boardMode === 'fixed'
    ? rawEquipped.boardMode
    : boardId === 'board-default' ? 'seasonal' : 'fixed'

  const migrated: SaveGame = {
    schemaVersion: 2,
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
        typeof rawEquipped.wolfSetId === 'string'
          ? rawEquipped.wolfSetId
          : base.equipped.wolfSetId,
      boardId,
      boardMode,
      seasonalBoardIds,
    },
    guide: {
      spring1Done: Boolean((o.guide as SaveGame['guide'] | undefined)?.spring1Done),
      hintUsage: parseNonNegativeRecord((o.guide as SaveGame['guide'] | undefined)?.hintUsage),
      failureStreak: parseNonNegativeRecord((o.guide as SaveGame['guide'] | undefined)?.failureStreak),
    },
    settings: {
      muted: Boolean((o.settings as SaveGame['settings'] | undefined)?.muted),
    },
    quests: parseQuests(o.quests),
    lastPlayedLevelId:
      typeof o.lastPlayedLevelId === 'string' ? o.lastPlayedLevelId : undefined,
  }
  return settleQuestPeriods(migrated).save
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

export function rollClearReward(
  level: LevelConfig,
  save: SaveGame,
  rng: { nextFloat(): number },
): DropGrant {
  const firstClear = !save.clearedLevels.includes(level.id)

  if (firstClear) {
    const season: Partial<Record<ChapterId, number>> = {}
    for (const [k, v] of Object.entries(level.firstClearReward.season ?? {})) {
      season[k as ChapterId] = v ?? 0
    }
    return {
      universal: level.firstClearReward.universal ?? 0,
      season,
      firstClear: true,
    }
  }

  const drop = level.repeatDrop
  if (!drop || rng.nextFloat() >= drop.chance) {
    return { universal: 0, season: {}, firstClear: false }
  }
  const season: Partial<Record<ChapterId, number>> = {}
  for (const [k, v] of Object.entries(drop.season ?? {})) {
    season[k as ChapterId] = v ?? 0
  }
  return {
    universal: drop.universal ?? 0,
    season,
    firstClear: false,
  }
}

export function applyClearToSave(
  save: SaveGame,
  level: LevelConfig,
  grant: DropGrant,
): SaveGame {
  const settled = settleQuestPeriods(save).save
  const alreadyCleared = settled.clearedLevels.includes(level.id)
  const effectiveGrant: DropGrant = alreadyCleared && grant.firstClear
    ? { universal: 0, season: {}, firstClear: false }
    : grant
  const clearedLevels = alreadyCleared
    ? settled.clearedLevels
    : [...settled.clearedLevels, level.id]

  const season = { ...settled.fragments.season }
  for (const [k, v] of Object.entries(effectiveGrant.season)) {
    const id = k as ChapterId
    season[id] = (season[id] ?? 0) + (v ?? 0)
  }

  let quests = alreadyCleared && grant.firstClear
    ? settled.quests
    : recordQuestMetric(settled.quests, 'both', 'clears', 1)
  if (effectiveGrant.universal > 0) {
    quests = recordQuestMetric(quests, 'both', 'gameplay_fragments_earned', effectiveGrant.universal)
  }

  const next: SaveGame = {
    ...settled,
    clearedLevels,
    fragments: {
      universal: settled.fragments.universal + effectiveGrant.universal,
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
  const settled = settleQuestPeriods(save).save
  return {
    ...settled,
    ...(levelId ? { lastPlayedLevelId: levelId } : {}),
    quests: recordQuestMetric(settled.quests, 'both', 'plays', 1),
  }
}

export function grantUniversalFragments(
  save: SaveGame,
  amount: number,
  source: UniversalFragmentSource = 'compensation',
): SaveGame {
  const settled = settleQuestPeriods(save).save
  let quests = settled.quests
  if (amount > 0 && source === 'gameplay') {
    quests = recordQuestMetric(quests, 'both', 'gameplay_fragments_earned', amount)
  }
  return {
    ...settled,
    quests,
    fragments: {
      ...settled.fragments,
      universal: settled.fragments.universal + amount,
    },
  }
}
