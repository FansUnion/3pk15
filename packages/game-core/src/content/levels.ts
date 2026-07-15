import type { Difficulty, Pos } from '../types'
import { BOARD_MAX, BOARD_MIN } from '../types'
import { inBounds, keyOf, ORTHO, posKey } from '../board'

export type ChapterId = 'spring' | 'summer' | 'autumn' | 'winter'

export type LevelConfig = {
  id: string
  chapterId: ChapterId
  indexInChapter: number
  name: string
  rocks: Pos[]
  ai: Difficulty
  firstClearReward: {
    universal?: number
    season?: Partial<Record<ChapterId, number>>
  }
  repeatDrop?: {
    chance: number
    universal?: number
    season?: Partial<Record<ChapterId, number>>
  }
}

/** Opening piece positions — rocks must not occupy these. */
const OPENING_KEYS = new Set<string>([
  ...[1, 2, 3].flatMap((r) => [1, 2, 3, 4, 5].map((c) => posKey(r, c))),
  posKey(6, 2),
  posKey(6, 3),
  posKey(6, 5),
])

export const CHAPTER_AI: Record<ChapterId, Difficulty> = {
  spring: 'easy',
  summer: 'normal',
  autumn: 'normal',
  winter: 'hard',
}

export const CHAPTER_ORDER: ChapterId[] = ['spring', 'summer', 'autumn', 'winter']

export const CHAPTER_LABEL: Record<ChapterId, string> = {
  spring: '春日',
  summer: '夏日',
  autumn: '秋日',
  winter: '冬日',
}

const ROCK_COUNT_RANGE: Record<ChapterId, { min: number; max: number }> = {
  spring: { min: 0, max: 2 },
  summer: { min: 2, max: 4 },
  autumn: { min: 6, max: 8 },
  winter: { min: 0, max: 0 },
}

export function validateLevel(level: LevelConfig): string[] {
  const errors: string[] = []
  const expectedAi = CHAPTER_AI[level.chapterId]
  if (level.ai !== expectedAi) {
    errors.push(`ai must be ${expectedAi} for ${level.chapterId}`)
  }

  const range = ROCK_COUNT_RANGE[level.chapterId]
  if (level.rocks.length < range.min || level.rocks.length > range.max) {
    errors.push(
      `rocks count ${level.rocks.length} out of range [${range.min},${range.max}] for ${level.chapterId}`,
    )
  }

  const seen = new Set<string>()
  for (const p of level.rocks) {
    if (!inBounds(p.r, p.c)) {
      errors.push(`rock out of bounds (${p.r},${p.c})`)
      continue
    }
    const k = keyOf(p)
    if (seen.has(k)) errors.push(`duplicate rock ${k}`)
    seen.add(k)
    if (OPENING_KEYS.has(k)) errors.push(`rock on opening piece ${k}`)
  }

  const adj = new Set<string>()
  for (const a of level.rocks) {
    for (const d of ORTHO) {
      const nr = a.r + d.r
      const nc = a.c + d.c
      if (nr < BOARD_MIN || nr > BOARD_MAX || nc < BOARD_MIN || nc > BOARD_MAX) continue
      if (seen.has(posKey(nr, nc))) {
        const pair = [keyOf(a), posKey(nr, nc)].sort().join('|')
        adj.add(`adjacent rocks ${pair}`)
      }
    }
  }
  errors.push(...adj)

  return errors
}

function L(
  partial: Omit<LevelConfig, 'ai' | 'firstClearReward' | 'repeatDrop'> & {
    firstClearReward?: LevelConfig['firstClearReward']
    repeatDrop?: LevelConfig['repeatDrop']
  },
): LevelConfig {
  return {
    ...partial,
    ai: CHAPTER_AI[partial.chapterId],
    firstClearReward: partial.firstClearReward ?? {
      universal: 10,
      season: { [partial.chapterId]: 2 },
    },
    repeatDrop: partial.repeatDrop ?? {
      chance: 0.3,
      universal: 2,
    },
  }
}

/**
 * MVP level table.
 * Empty cells for rocks: row4 all; row5 all; (1-3,6); (6,1)(6,4)(6,6).
 * Prefer midfield; never adjacent; never on opening pieces.
 */
export const LEVELS: LevelConfig[] = [
  L({
    id: 'spring-01',
    chapterId: 'spring',
    indexInChapter: 1,
    name: '春日 · 空野',
    rocks: [],
  }),
  L({
    id: 'spring-02',
    chapterId: 'spring',
    indexInChapter: 2,
    name: '春日 · 一石',
    rocks: [{ r: 4, c: 6 }],
  }),
  L({
    id: 'spring-03',
    chapterId: 'spring',
    indexInChapter: 3,
    name: '春日 · 双石',
    rocks: [
      { r: 4, c: 2 },
      { r: 4, c: 5 },
    ],
  }),

  L({
    id: 'summer-01',
    chapterId: 'summer',
    indexInChapter: 1,
    name: '夏日 · 裂隙',
    rocks: [
      { r: 3, c: 6 },
      { r: 4, c: 3 },
    ],
  }),
  L({
    id: 'summer-02',
    chapterId: 'summer',
    indexInChapter: 2,
    name: '夏日 · 横切',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 4 },
    ],
  }),
  L({
    id: 'summer-03',
    chapterId: 'summer',
    indexInChapter: 3,
    name: '夏日 · 拉扯',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 2 },
      { r: 4, c: 5 },
      { r: 5, c: 3 },
    ],
  }),

  L({
    id: 'autumn-01',
    chapterId: 'autumn',
    indexInChapter: 1,
    name: '秋日 · 碎盘',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 3 },
      { r: 4, c: 5 },
      { r: 5, c: 2 },
      { r: 5, c: 6 },
    ],
  }),
  L({
    id: 'autumn-02',
    chapterId: 'autumn',
    indexInChapter: 2,
    name: '秋日 · 通道',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 3 },
      { r: 4, c: 5 },
      { r: 5, c: 2 },
      { r: 5, c: 4 },
      { r: 5, c: 6 },
    ],
  }),
  L({
    id: 'autumn-03',
    chapterId: 'autumn',
    indexInChapter: 3,
    name: '秋日 · 丰收',
    rocks: [
      { r: 1, c: 6 },
      { r: 3, c: 6 },
      { r: 4, c: 2 },
      { r: 4, c: 4 },
      { r: 5, c: 1 },
      { r: 5, c: 3 },
      { r: 5, c: 5 },
      { r: 6, c: 4 },
    ],
  }),

  L({
    id: 'winter-01',
    chapterId: 'winter',
    indexInChapter: 1,
    name: '冬日 · 空寂',
    rocks: [],
  }),
  L({
    id: 'winter-02',
    chapterId: 'winter',
    indexInChapter: 2,
    name: '冬日 · 合围',
    rocks: [],
  }),
  L({
    id: 'winter-03',
    chapterId: 'winter',
    indexInChapter: 3,
    name: '冬日 · 绝境',
    rocks: [],
  }),
]

export function getLevel(id: string): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id)
}

export function levelsForChapter(chapterId: ChapterId): LevelConfig[] {
  return LEVELS.filter((l) => l.chapterId === chapterId).sort(
    (a, b) => a.indexInChapter - b.indexInChapter,
  )
}

export function validateAllLevels(): string[] {
  return LEVELS.flatMap((l) => validateLevel(l).map((e) => `${l.id}: ${e}`))
}
