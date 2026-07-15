import type { Difficulty, Pos } from '../types'
import { BOARD_MAX, BOARD_MIN } from '../types'
import { inBounds, keyOf, ORTHO, posKey } from '../board'

export type ChapterId = 'spring' | 'summer' | 'autumn' | 'winter'

export type LevelConfig = {
  id: string
  chapterId: ChapterId
  indexInChapter: number
  /** Display name (zh) — legacy field kept for UI that still reads `.name`. */
  name: string
  nameEn: string
  nameZh: string
  blurbEn: string
  blurbZh: string
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

export const CHAPTER_LABEL_EN: Record<ChapterId, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
}

export const CHAPTER_BLURB_EN: Record<ChapterId, string> = {
  spring: 'Learn gap-eat and short chains on a gentle flock — rocks stay scarce.',
  summer: 'The flock blocks for real. Midfield rocks start to matter.',
  autumn: 'Same AI tier as summer, but dense rocks crack your lines and create lanes.',
  winter: 'Empty-board master duel — the hard AI surrounds without rock crutches.',
}

export const CHAPTER_BLURB_ZH: Record<ChapterId, string> = {
  spring: '在温和羊群上学会隔空吃与短连吃；岩石很少，专注规则。',
  summer: '羊群开始认真挡线，中场岩石开始影响路线。',
  autumn: 'AI 档位与夏同级，但密岩撕开通道、逼出隔空连吃。',
  winter: '空盘硬仗：高阶合围，不再靠岩石挡点。',
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
  partial: Omit<LevelConfig, 'ai' | 'firstClearReward' | 'repeatDrop' | 'name'> & {
    firstClearReward?: LevelConfig['firstClearReward']
    repeatDrop?: LevelConfig['repeatDrop']
  },
): LevelConfig {
  return {
    ...partial,
    name: partial.nameZh,
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

export function levelDisplayName(level: LevelConfig, locale: 'en' | 'zh'): string {
  return locale === 'zh' ? level.nameZh : level.nameEn
}

export function levelBlurb(level: LevelConfig, locale: 'en' | 'zh'): string {
  return locale === 'zh' ? level.blurbZh : level.blurbEn
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
    nameZh: '春日 · 空野',
    nameEn: 'Spring · Open Meadow',
    blurbZh: '无岩石的开阔草地。先学会点选狼、走空格，再试一次隔空吃。',
    blurbEn: 'An open meadow with no rocks. Learn to select a wolf, step to empty points, then try one gap-eat.',
    rocks: [],
  }),
  L({
    id: 'spring-02',
    chapterId: 'spring',
    indexInChapter: 2,
    nameZh: '春日 · 一石',
    nameEn: 'Spring · Single Stone',
    blurbZh: '一枚边石轻轻挡路。绕开它，把隔空吃练顺，别急着连吃。',
    blurbEn: 'One edge rock nudges your path. Slip around it, clean a gap-eat, and keep chains short.',
    rocks: [{ r: 4, c: 6 }],
  }),
  L({
    id: 'spring-03',
    chapterId: 'spring',
    indexInChapter: 3,
    nameZh: '春日 · 双石',
    nameEn: 'Spring · Twin Stones',
    blurbZh: '两枚中场石切开通道。用它们当支点，完成春日的第一次短连吃。',
    blurbEn: 'Two midfield stones split the lanes. Use them as pivots for your first short spring chain.',
    rocks: [
      { r: 4, c: 2 },
      { r: 4, c: 5 },
    ],
  }),

  L({
    id: 'summer-01',
    chapterId: 'summer',
    indexInChapter: 1,
    nameZh: '夏日 · 裂隙',
    nameEn: 'Summer · Fissure',
    blurbZh: '羊群开始认真挡线。两枚岩石撕开裂隙，逼你选择冲吃方向。',
    blurbEn: 'The flock blocks for real. Two rocks tear a fissure — pick which gap-rush line to force.',
    rocks: [
      { r: 3, c: 6 },
      { r: 4, c: 3 },
    ],
  }),
  L({
    id: 'summer-02',
    chapterId: 'summer',
    indexInChapter: 2,
    nameZh: '夏日 · 横切',
    nameEn: 'Summer · Crosscut',
    blurbZh: '三石横切中场。耐心摆位，再隔空切入，别被羊群拖进死角。',
    blurbEn: 'Three rocks crosscut the midfield. Set up patiently, then gap-cut in — don’t get herded into a dead corner.',
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
    nameZh: '夏日 · 拉扯',
    nameEn: 'Summer · Tug',
    blurbZh: '四石拉扯战线。三狼要分工：一狼诱开，另两狼冲吃收割。',
    blurbEn: 'Four rocks tug the front. Split duties: one wolf baits, the other two gap-rush the harvest.',
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
    nameZh: '秋日 · 碎盘',
    nameEn: 'Autumn · Shattered Board',
    blurbZh: '六枚岩石把盘面打碎。找窄通道连吃，岩石就是你的跳板。',
    blurbEn: 'Six rocks shatter the board. Hunt narrow corridors — the stones become your springboards.',
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
    nameZh: '秋日 · 通道',
    nameEn: 'Autumn · Corridor',
    blurbZh: '七石挤出一条主通道。控制通道两端，连吃会像潮水一样涌出。',
    blurbEn: 'Seven rocks squeeze one main corridor. Own both ends and chains will surge like a tide.',
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
    nameZh: '秋日 · 丰收',
    nameEn: 'Autumn · Harvest',
    blurbZh: '八石密布的丰收盘。敢冲敢停：连吃满档前记得主动结束，保住胜势。',
    blurbEn: 'An eight-rock harvest board. Rush hard, stop clean — end the chain before you strand a wolf.',
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
    nameZh: '冬日 · 空寂',
    nameEn: 'Winter · Silence',
    blurbZh: '空盘寂静。没有岩石挡点，完全靠走位撕开合围。',
    blurbEn: 'Silent empty board. No rocks to lean on — only spacing can tear the surround.',
    rocks: [],
  }),
  L({
    id: 'winter-02',
    chapterId: 'winter',
    indexInChapter: 2,
    nameZh: '冬日 · 合围',
    nameEn: 'Winter · Encirclement',
    blurbZh: '高阶羊群合力围狼。先保三狼通路，再找隔空破口。',
    blurbEn: 'A hard flock closes the ring. Keep all three wolves mobile, then punch a gap-eat hole.',
    rocks: [],
  }),
  L({
    id: 'winter-03',
    chapterId: 'winter',
    indexInChapter: 3,
    nameZh: '冬日 · 绝境',
    nameEn: 'Winter · Last Stand',
    blurbZh: '四季终章。在绝境里打出干净的隔空连吃，证明你真正掌控猎场。',
    blurbEn: 'Season finale. Land clean gap-chains under pressure — prove you own the hunt.',
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

export function adjacentLevels(id: string): { prev?: LevelConfig; next?: LevelConfig } {
  const idx = LEVELS.findIndex((l) => l.id === id)
  if (idx < 0) return {}
  return {
    prev: idx > 0 ? LEVELS[idx - 1] : undefined,
    next: idx < LEVELS.length - 1 ? LEVELS[idx + 1] : undefined,
  }
}
