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
  /** Default is 8; special challenge levels may override this target. */
  targetEaten?: number
  /** Maximum half-moves before a stalemate is declared. Default is 300. */
  maxPlies?: number
  openingTemplate?: string
  teachingPoint?: string
  expectedPlies?: { min: number; target: number; max: number }
  difficulty?: 1 | 2 | 3 | 4 | 5
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
  spring: 'normal',
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
  autumn: { min: 5, max: 6 },
  winter: { min: 0, max: 0 },
}

export function validateLevel(level: LevelConfig): string[] {
  const errors: string[] = []
  const allowedAi: Record<ChapterId, Difficulty[]> = {
    spring: ['easy', 'normal'],
    summer: ['normal', 'hard'],
    autumn: ['normal', 'hard'],
    winter: ['hard'],
  }
  if (!allowedAi[level.chapterId].includes(level.ai)) {
    errors.push(`ai ${level.ai} is not allowed for ${level.chapterId}`)
  }

  if (level.targetEaten !== undefined && (!Number.isInteger(level.targetEaten) || level.targetEaten < 1 || level.targetEaten > 15)) {
    errors.push('targetEaten must be an integer between 1 and 15')
  }
  if (level.maxPlies !== undefined && (!Number.isInteger(level.maxPlies) || level.maxPlies < 20)) {
    errors.push('maxPlies must be an integer of at least 20')
  }
  if (level.expectedPlies) {
    const { min, target, max } = level.expectedPlies
    if (!(min > 0 && min <= target && target <= max)) {
      errors.push('expectedPlies must satisfy 0 < min <= target <= max')
    }
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
    ai?: Difficulty
    firstClearReward?: LevelConfig['firstClearReward']
    repeatDrop?: LevelConfig['repeatDrop']
  },
): LevelConfig {
  const seasonTeaching: Record<ChapterId, string> = {
    spring: 'Learn one clear movement or capture idea before adding pressure.',
    summer: 'Read flock blocking and plan a route through midfield pressure.',
    autumn: 'Use dense rock corridors to plan the order of a short chain.',
    winter: 'Keep all wolves mobile and solve the open-board surround.',
  }
  const seasonDifficulty: Record<ChapterId, 1 | 2 | 3 | 4 | 5> = {
    spring: 1,
    summer: 3,
    autumn: 4,
    winter: 5,
  }
  const baseExpected: Record<ChapterId, { min: number; target: number; max: number }> = {
    spring: { min: 30, target: 100, max: 260 },
    summer: { min: 40, target: 130, max: 290 },
    autumn: { min: 45, target: 145, max: 300 },
    winter: { min: 50, target: 160, max: 300 },
  }
  return {
    ...partial,
    name: partial.nameZh,
    ai: partial.ai ?? CHAPTER_AI[partial.chapterId],
    targetEaten: partial.targetEaten ?? 8,
    maxPlies: partial.maxPlies ?? 300,
    openingTemplate: partial.openingTemplate ?? `${partial.chapterId}-standard-${partial.indexInChapter}`,
    teachingPoint: partial.teachingPoint ?? seasonTeaching[partial.chapterId],
    expectedPlies: partial.expectedPlies ?? baseExpected[partial.chapterId],
    difficulty: partial.difficulty ?? Math.min(5, seasonDifficulty[partial.chapterId] + Math.max(0, partial.indexInChapter - 1)) as 1 | 2 | 3 | 4 | 5,
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
    blurbZh: '带一枚边缘岩石的开阔草地。先学会点选狼、走空格，再试一次隔空吃。',
    blurbEn: 'An open meadow with one safe edge rock. Learn to select a wolf, step to empty points, then try one gap-eat.',
    rocks: [{ r: 4, c: 6 }],
    openingTemplate: 'spring-gentle-edge-rock',
    teachingPoint: 'Select a wolf, make one step, then complete the first gap-eat.',
    expectedPlies: { min: 20, target: 90, max: 220 },
    difficulty: 1,
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
    openingTemplate: 'spring-single-edge-rock',
    teachingPoint: 'Read a rock as a blocked landing point and route around it.',
    expectedPlies: { min: 25, target: 100, max: 240 },
    difficulty: 2,
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
    openingTemplate: 'spring-twin-midfield-rocks',
    teachingPoint: 'Choose a short chain route and end it before stranding a wolf.',
    expectedPlies: { min: 30, target: 110, max: 260 },
    difficulty: 3,
  }),
  L({
    id: 'spring-04', chapterId: 'spring', indexInChapter: 4,
    ai: 'normal',
    nameZh: '春日 · 回旋', nameEn: 'Spring · Turnaround',
    blurbZh: '边缘岩石改变回路，学会先稳住位置再找吃口。',
    blurbEn: 'An edge rock bends the route. Hold position before opening the next gap.',
    rocks: [{ r: 4, c: 1 }],
    openingTemplate: 'spring-edge-turnaround',
    teachingPoint: 'Use a safe reposition before committing to a capture.',
    expectedPlies: { min: 35, target: 120, max: 280 }, difficulty: 3,
  }),
  L({
    id: 'spring-05', chapterId: 'spring', indexInChapter: 5,
    ai: 'normal',
    nameZh: '春日 · 双线', nameEn: 'Spring · Two Lanes',
    blurbZh: '两条路线都能接近羊群，选择先处理哪一侧。',
    blurbEn: 'Two lanes reach the flock. Choose which side to pressure first.',
    rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }],
    openingTemplate: 'spring-two-lanes',
    teachingPoint: 'Compare two capture lanes before moving the second wolf.',
    expectedPlies: { min: 40, target: 130, max: 290 }, difficulty: 3,
  }),
  L({
    id: 'spring-06', chapterId: 'spring', indexInChapter: 6,
    ai: 'normal',
    nameZh: '春日 · 收束', nameEn: 'Spring · Close',
    blurbZh: '春日终局，综合短连吃、路线选择和提前收束。',
    blurbEn: 'Spring finale: combine short chains, route choice, and clean exits.',
    rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }],
    openingTemplate: 'spring-finale',
    teachingPoint: 'Finish a short spring hunt without stranding a wolf.',
    expectedPlies: { min: 45, target: 140, max: 300 }, difficulty: 4,
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
    openingTemplate: 'summer-midfield-fissure',
    teachingPoint: 'Read flock blocking and choose one of two pressure lanes.',
    expectedPlies: { min: 35, target: 120, max: 280 },
    difficulty: 3,
  }),
  L({
    id: 'summer-02',
    chapterId: 'summer',
    indexInChapter: 2,
    ai: 'hard',
    nameZh: '夏日 · 横切',
    nameEn: 'Summer · Crosscut',
    blurbZh: '三石横切中场。耐心摆位，再隔空切入，别被羊群拖进死角。',
    blurbEn: 'Three rocks crosscut the midfield. Set up patiently, then gap-cut in — don’t get herded into a dead corner.',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 4 },
    ],
    openingTemplate: 'summer-crosscut-rocks',
    teachingPoint: 'Delay the rush and keep a second wolf available for the crosscut.',
    expectedPlies: { min: 40, target: 135, max: 290 },
    difficulty: 4,
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
    openingTemplate: 'summer-tug-of-war',
    teachingPoint: 'Split wolf roles and avoid entering a dead corner too early.',
    expectedPlies: { min: 45, target: 145, max: 300 },
    difficulty: 4,
  }),
  L({
    id: 'summer-04', chapterId: 'summer', indexInChapter: 4,
    nameZh: '夏日 · 分流', nameEn: 'Summer · Split Flow',
    blurbZh: '羊群分流后，狼需要决定追击主线还是侧翼。',
    blurbEn: 'The flock splits the flow. Choose the main lane or the flank.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 5, c: 5 }],
    openingTemplate: 'summer-split-flow',
    teachingPoint: 'Assign wolves to pressure two flock lanes without losing mobility.',
    expectedPlies: { min: 50, target: 150, max: 300 }, difficulty: 4,
  }),
  L({
    id: 'summer-05', chapterId: 'summer', indexInChapter: 5,
    ai: 'hard',
    nameZh: '夏日 · 反推', nameEn: 'Summer · Counterpush',
    blurbZh: '羊群会把狼推向边角，提前保留第二条退路。',
    blurbEn: 'The flock pushes back toward the edge. Keep a second exit open.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 4 }, { r: 6, c: 1 }],
    openingTemplate: 'summer-counterpush',
    teachingPoint: 'Protect a retreat route before starting a committed chain.',
    expectedPlies: { min: 55, target: 160, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'summer-06', chapterId: 'summer', indexInChapter: 6,
    nameZh: '夏日 · 压线', nameEn: 'Summer · Pressure Line',
    blurbZh: '夏日终局，综合阻挡、分工和中场路线压力。',
    blurbEn: 'Summer finale: combine blocking, wolf roles, and midfield pressure.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 3 }],
    openingTemplate: 'summer-pressure-line',
    teachingPoint: 'Coordinate all three wolves before taking the decisive line.',
    expectedPlies: { min: 60, target: 170, max: 300 }, difficulty: 5,
  }),

  L({
    id: 'autumn-01',
    chapterId: 'autumn',
    indexInChapter: 1,
    ai: 'normal',
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
    ai: 'normal',
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
      { r: 5, c: 6 },
    ],
  }),
  L({
    id: 'autumn-03',
    chapterId: 'autumn',
    indexInChapter: 3,
    ai: 'normal',
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
    ],
  }),
  L({
    id: 'autumn-04', chapterId: 'autumn', indexInChapter: 4,
    ai: 'normal',
    nameZh: '秋日 · 断桥', nameEn: 'Autumn · Broken Bridge',
    blurbZh: '密集岩石留下多个断点，必须提前判断连吃方向。',
    blurbEn: 'Dense rocks leave broken bridges. Read the chain direction early.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 2 }],
    openingTemplate: 'autumn-broken-bridge',
    teachingPoint: 'Use rock gaps as deliberate chain entry points.',
    expectedPlies: { min: 60, target: 165, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'autumn-05', chapterId: 'autumn', indexInChapter: 5,
    ai: 'normal',
    nameZh: '秋日 · 窄门', nameEn: 'Autumn · Narrow Gate',
    blurbZh: '两端都要保持通行，任何一只狼走错都会失去窗口。',
    blurbEn: 'Keep both ends open. One careless wolf can close the window.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 4 }],
    openingTemplate: 'autumn-narrow-gate',
    teachingPoint: 'Preserve both corridor ends while planning a forced capture.',
    expectedPlies: { min: 65, target: 180, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'autumn-06', chapterId: 'autumn', indexInChapter: 6,
    ai: 'normal',
    nameZh: '秋日 · 丰收终局', nameEn: 'Autumn · Harvest Finale',
    blurbZh: '秋日终局，要求在密集岩石中完成干净的连吃。',
    blurbEn: 'Autumn finale: land a clean chain through the dense rock field.',
    rocks: [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 1 }],
    openingTemplate: 'autumn-harvest-finale',
    teachingPoint: 'Balance chain ambition against the need to keep wolves mobile.',
    expectedPlies: { min: 70, target: 190, max: 300 }, difficulty: 5,
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
  L({
    id: 'winter-04', chapterId: 'winter', indexInChapter: 4,
    nameZh: '冬日 · 回环', nameEn: 'Winter · Loop',
    blurbZh: '空盘中羊群不断回环，保持狼的覆盖范围。',
    blurbEn: 'The flock loops across the empty board. Keep wolf coverage wide.',
    rocks: [], openingTemplate: 'winter-open-loop',
    teachingPoint: 'Avoid chasing one sheep while the flock changes the whole board.',
    expectedPlies: { min: 70, target: 180, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'winter-05', chapterId: 'winter', indexInChapter: 5,
    nameZh: '冬日 · 合围线', nameEn: 'Winter · Ring Line',
    blurbZh: '先保持三狼机动，再从边缘撕开第一条吃子线。',
    blurbEn: 'Keep three wolves mobile, then tear the first capture line from the edge.',
    rocks: [], openingTemplate: 'winter-ring-line',
    teachingPoint: 'Build a surround before committing to the first gap-eat.',
    expectedPlies: { min: 75, target: 195, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'winter-06', chapterId: 'winter', indexInChapter: 6,
    nameZh: '冬日 · 终极狩猎', nameEn: 'Winter · Final Hunt',
    blurbZh: '四季终章，检验空盘位置计算和连续狩猎能力。',
    blurbEn: 'The four-season finale: prove open-board calculation and clean chains.',
    rocks: [], openingTemplate: 'winter-final-hunt',
    teachingPoint: 'Solve the open-board surround without sacrificing wolf mobility.',
    expectedPlies: { min: 80, target: 210, max: 300 }, difficulty: 5,
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
