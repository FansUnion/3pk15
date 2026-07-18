import type { Difficulty, OpeningLayout, Pos } from '../types'
import { BOARD_MAX, BOARD_MIN } from '../types'
import { inBounds, keyOf, ORTHO, posKey } from '../board'
import {
  createInitialState,
  DEFAULT_SHEEP_OPENING,
  DEFAULT_WOLF_OPENING,
  listLegalActions,
} from '../rules'
import { LEVEL_STRATEGIES, type LevelStrategyProfile } from './strategies'

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
  /** Override either side's standard start while preserving a full legal opening. */
  opening?: OpeningLayout
  ai: Difficulty
  /** Default is 8; special challenge levels may override this target. */
  targetEaten?: number
  /** Maximum half-moves before a stalemate is declared. Default is 300. */
  maxPlies?: number
  openingTemplate?: string
  teachingPoint?: string
  expectedPlies?: { min: number; target: number; max: number }
  difficulty?: 1 | 2 | 3 | 4 | 5
  nameMeaningZh: string
  designConceptZh: string
  playerGoalZh: string
  wolfStrategyZh: string
  sheepDefenseZh: string
  riskTags: string[]
  productionStatus: 'approved' | 'needs_changes'
  strategy: LevelStrategyProfile
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

type LevelProductMeta = Pick<
  LevelConfig,
  'nameMeaningZh' | 'designConceptZh' | 'playerGoalZh' | 'wolfStrategyZh' | 'sheepDefenseZh' | 'riskTags' | 'productionStatus'
>

const LEVEL_PRODUCT_META: Record<string, LevelProductMeta> = {
  'spring-01': meta('空野代表干扰最少的基础猎场。', '用一枚边石保留地形概念，集中教学移动和首次跳吃。', '看懂目标并完成第一次有效捕食。', '先移动中狼接近羊群，再寻找清晰跳吃。', '羊群压力较低，主要通过基础占位阻挡。', ['教学']),
  'spring-02': meta('一石强调唯一岩石会阻挡落点。', '在开阔盘面加入单点绕行，建立岩石意识。', '绕开岩石完成短跳吃。', '从岩石另一侧换线，不急于连续跳吃。', '羊群利用边石压缩单侧落点。', ['教学']),
  'spring-03': meta('双石表示两枚中场石共同切出路线。', '用双石形成通道，首次引入短连吃选择。', '找到短连吃并在被困前停止。', '比较左右入口，优先保留退出位置。', '羊群填补通道并封锁后续落点。', ['连吃']),
  'spring-04': meta('回旋表示先换位再回到捕食线路。', '边石改变直线路径，训练安全调整。', '接受准备回合并建立吃口。', '先稳住三狼间距，再从侧面回切。', '羊群通过换线诱导狼无效追逐。', ['走位']),
  'spring-05': meta('双线表示左右都有接近羊群的路线。', '提供两个入口，训练主攻方向选择。', '选择主攻侧并保留另一狼支援。', '一侧施压，另一侧狼控制出口。', '羊群在两线间转移以分散狼群。', ['双路线']),
  'spring-06': meta('收束既是春季终关，也指把优势转成胜势。', '综合短连吃、路线选择和安全退出。', '独立完成基础狩猎并解释停止时机。', '三狼分工后用短链稳定累计捕食。', '羊群综合使用占位、换线和拖延。', ['季末']),
  'summer-01': meta('裂隙指封锁之间留下的突破缝隙。', '从教学盘进入真实防守压力，要求集中突破。', '识别封锁并制造首个吃口。', '选择一条压力线，不同时追逐两侧。', '羊群主动挡线并填补跳吃落点。', ['封锁']),
  'summer-02': meta('横切指岩石横向分割中场路线。', '三石配合 Hard AI，训练耐心布置和接应。', '在高压下保持退路并打开中场。', '保留第二只狼，从侧面横切进入。', 'Hard 羊群会抱团、避吃并把狼推向死角。', ['Hard AI', '死角']),
  'summer-03': meta('拉扯表示双方围绕漏斗反复争夺。', '四石漏斗要求诱开、封口和收割三狼分工。', '执行右侧首吃、左侧封口、中路支援。', '一狼诱开，两狼控制出口与后续吃线。', '羊群利用漏斗封口并诱导狼进入窄区。', ['漏斗', '困狼']),
  'summer-04': meta('分流指羊群沿主线与侧翼分开。', '三石形成两条防守流向，训练压力分配。', '保持两线压力而不失去机动。', '主线逼退、侧翼截断，避免三狼挤在一侧。', '羊群分散换线，迫使狼错误调动。', ['分流']),
  'summer-05': meta('反推表示羊群会反向压缩狼的空间。', 'Hard AI 与底线地形强化反制和退路管理。', '识别陷阱并保留第二出口。', '捕食前先确认另一条退路仍开放。', '羊群通过站位把狼推向边角。', ['Hard AI', '退路']),
  'summer-06': meta('压线指三狼共同压迫中场路线。', '四石与偏右狼位检验夏季协作能力。', '完成协作站位后进入决定性吃线。', '两狼压线，一狼保留换线和收割位置。', '羊群集中封锁中场并拖延突破。', ['季末', '策略敏感']),
  'autumn-01': meta('碎盘表示五石把棋盘切成多个窄道。', '让岩石成为路线边界，训练复杂地形识别。', '快速找到有效窄道并避免困狼。', '两狼控口，一狼沿可退出通道推进。', '羊群填满狭窄落点并制造快速困狼。', ['密岩', '困狼']),
  'autumn-02': meta('通道指胜负围绕唯一主路线展开。', '把复杂地形压力集中到通道两端争夺。', '理解两狼控口、一狼兑现。', '控制两端后把一次跳吃扩展为连续收割。', '羊群争夺通道口并切断狼的接应。', ['主通道']),
  'autumn-03': meta('丰收表示打开路线后可连续捕食。', '高收益窗口同时要求判断何时停止。', '体验长连吃并及时保住机动。', '边线建立首吃，确认出口后再延长链。', '羊群改变落点，引诱狼为贪吃失去退路。', ['连吃', '偏狼风险']),
  'autumn-04': meta('断桥指连吃路线被切成多个断点。', '入口清晰但后续方向变化，训练提前计算。', '进线前检查落点和出口。', '中狼进入断点，边狼维持两端控制。', '羊群在断点两侧切断后续接触。', ['断桥', '困狼']),
  'autumn-05': meta('窄门表示进攻窗口狭窄且需要双端开放。', '通过双端通道考验三狼协作。', '保持两端通行并兑现短暂窗口。', '两狼守门，一狼等待强制跳吃。', '羊群封住任一端即可破坏连吃窗口。', ['窄门']),
  'autumn-06': meta('丰收终局是在高压力下完成秋季体系。', '综合密岩、连吃收益和三狼机动。', '完成干净可控的长连吃。', '先占稳定入口，再由第二狼接管出口。', '羊群分散到多个岩隙，迫使狼跨区。', ['季末', '密岩']),
  'winter-01': meta('空寂表示没有岩石，空间关系完全暴露。', '移除地形支点，只考验三狼间距与覆盖。', '从地形解题过渡到纯站位对抗。', '保持三狼横向覆盖，等待羊群出现破口。', 'Hard 羊群在空盘抱团并主动合围。', ['空盘', 'Hard AI']),
  'winter-02': meta('合围表示高阶羊群主动压缩狼的空间。', '用 Hard AI 形成真实封锁压力。', '在高压下找到可解释的边线突破。', '先保三狼通路，再从边线制造首吃。', '羊群协同封锁、抱团并反复换线。', ['空盘', '高压']),
  'winter-03': meta('绝境表示容错极低，需要连续精确计算。', '不靠岩石变化，以空盘站位精度构成挑战。', '识别一次可连续兑现的决定性机会。', '耐心扩大覆盖，避免无支援的单狼突入。', '羊群最大化合围和拖延，等待狼失位。', ['空盘', '高难']),
  'winter-04': meta('回环指羊群反复换线诱导狼追逐。', '前置羊阵扩大横向流动，考验整体覆盖。', '不追单羊，维持三狼控制区域。', '用宽覆盖限制羊群回环路线。', '羊群横向循环并制造重复局面。', ['空盘', '重复']),
  'winter-05': meta('合围线指先包围再撕出捕食路线。', '不对称狼位训练从边缘建立首吃。', '建立合围后再投入进攻。', '边狼制造破口，中狼保持接应。', '羊群压缩边线并封锁孤立狼。', ['空盘', '策略敏感']),
  'winter-06': meta('终极狩猎是四季能力的综合考验。', '用空盘检验计算、协作、连吃控制和耐心。', '综合全部能力完成最终狩猎。', '维持机动与覆盖，等待干净连续吃线。', 'Hard 羊群综合合围、避吃、拖延和反重复。', ['终局', '高难']),
}

function meta(
  nameMeaningZh: string,
  designConceptZh: string,
  playerGoalZh: string,
  wolfStrategyZh: string,
  sheepDefenseZh: string,
  riskTags: string[],
): LevelProductMeta {
  return { nameMeaningZh, designConceptZh, playerGoalZh, wolfStrategyZh, sheepDefenseZh, riskTags, productionStatus: 'approved' }
}

function openingPositions(level: LevelConfig) {
  return {
    wolves: level.opening?.wolves ?? DEFAULT_WOLF_OPENING,
    sheep: level.opening?.sheep ?? DEFAULT_SHEEP_OPENING,
  }
}

/** Creates the exact configured opening used by gameplay, previews, and simulations. */
export function createLevelInitialState(level: LevelConfig) {
  return createInitialState(
    level.id,
    level.rocks,
    level.targetEaten,
    level.maxPlies,
    level.opening,
  )
}

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

const LEVEL_TEACHING_EN: Record<string, string> = {
  'spring-01': 'Select a wolf, step to an empty point, then find your first gap capture.',
  'spring-02': 'Treat the rock as a blocked landing point and route around it to create a capture.',
  'spring-03': 'Choose a short capture chain and stop before the wolf becomes trapped.',
  'spring-04': 'Make a safe repositioning move before committing to a capture route.',
  'spring-05': 'Compare the left and right capture routes before moving the second wolf.',
  'spring-06': 'Combine short chains and route choice while keeping every wolf mobile.',
  'summer-01': 'Read the flock block and concentrate pressure on one breakthrough line.',
  'summer-02': 'Keep a second wolf available to cut across midfield instead of rushing in.',
  'summer-03': 'Give the three wolves separate roles: draw out, seal the exit, and support.',
  'summer-04': 'Pressure both flock routes without crowding all three wolves onto one side.',
  'summer-05': 'Check that a second exit remains open before starting a capture.',
  'summer-06': 'Coordinate all three wolves before entering the decisive capture line.',
  'autumn-01': 'Use two wolves to control a corridor while the third advances with an exit.',
  'autumn-02': 'Control both ends of the main corridor, then extend one capture into a chain.',
  'autumn-03': 'Balance chain value against the exit, and stop early when mobility is at risk.',
  'autumn-04': 'Treat gaps between rocks as chain entries and calculate the next direction first.',
  'autumn-05': 'Keep both ends of the narrow gate open while preparing the forced capture.',
  'autumn-06': 'Choose between a long chain and keeping all three wolves mobile.',
  'winter-01': 'Without rocks, use the spacing between all three wolves to open the flock.',
  'winter-02': 'Keep a route for every wolf, then create the first opening from an edge.',
  'winter-03': 'Maintain open-board coverage and wait for a capture opportunity you can fully convert.',
  'winter-04': 'Do not chase one sheep; preserve broad three-wolf control of the board.',
  'winter-05': 'Build the surround before committing the first wolf to a capture route.',
  'winter-06': 'Complete the open-board surround and chain hunt without sacrificing mobility.',
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
  if (!level.strategy || level.strategy.primary === level.strategy.secondary) {
    errors.push('level must have distinct primary and secondary strategies')
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

  const opening = openingPositions(level)
  if (opening.wolves.length !== 3) errors.push('opening wolves must contain exactly 3 positions')
  if (opening.sheep.length !== 15) errors.push('opening sheep must contain exactly 15 positions')
  const openingKeys = new Set<string>()
  for (const p of [...opening.wolves, ...opening.sheep]) {
    if (!inBounds(p.r, p.c)) {
      errors.push(`opening piece out of bounds (${p.r},${p.c})`)
      continue
    }
    const key = keyOf(p)
    if (openingKeys.has(key)) errors.push(`opening pieces overlap at ${key}`)
    openingKeys.add(key)
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
    if (openingKeys.has(k)) errors.push(`rock on opening piece ${k}`)
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

  if (errors.length === 0) {
    try {
      if (listLegalActions(createLevelInitialState(level)).length === 0) {
        errors.push('opening must provide at least one wolf legal action')
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'invalid opening')
    }
  }

  return errors
}

function L(
  partial: Omit<LevelConfig, 'ai' | 'firstClearReward' | 'repeatDrop' | 'name' | 'strategy' | keyof LevelProductMeta> & {
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
    ...LEVEL_PRODUCT_META[partial.id]!,
    strategy: LEVEL_STRATEGIES[partial.id]!,
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

export function levelTeachingPoint(level: LevelConfig, locale: 'en' | 'zh'): string {
  if (locale === 'zh') return level.teachingPoint ?? ''
  return LEVEL_TEACHING_EN[level.id] ?? level.teachingPoint ?? ''
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
    nameZh: '春日 01 · 初猎之野',
    nameEn: 'Spring 01 · First Hunt Meadow',
    blurbZh: '带一枚边缘岩石的开阔草地。先学会点选狼、走空格，再试一次隔空吃。',
    blurbEn: 'An open meadow with one safe edge rock. Learn to select a wolf, step to empty points, then try one gap-eat.',
    rocks: [{ r: 4, c: 6 }],
    openingTemplate: 'spring-gentle-edge-rock',
    teachingPoint: '先点选一只狼走到空位，再寻找第一次隔空跳吃。',
    expectedPlies: { min: 20, target: 90, max: 220 },
    difficulty: 1,
  }),
  L({
    id: 'spring-02',
    chapterId: 'spring',
    indexInChapter: 2,
    nameZh: '春日 02 · 借石之径',
    nameEn: 'Spring 02 · Stonepath',
    blurbZh: '一枚边石轻轻挡路。绕开它，把隔空吃练顺，别急着连吃。',
    blurbEn: 'One edge rock nudges your path. Slip around it, clean a gap-eat, and keep chains short.',
    rocks: [{ r: 4, c: 4 }],
    openingTemplate: 'spring-single-edge-rock',
    teachingPoint: '把岩石视为不可落脚的位置，绕开它建立跳吃路线。',
    expectedPlies: { min: 25, target: 100, max: 240 },
    difficulty: 2,
  }),
  L({
    id: 'spring-03',
    chapterId: 'spring',
    indexInChapter: 3,
    nameZh: '春日 03 · 双隙',
    nameEn: 'Spring 03 · Twin Gaps',
    blurbZh: '两枚中场石切开通道。用它们当支点，完成春日的第一次短连吃。',
    blurbEn: 'Two midfield stones split the lanes. Use them as pivots for your first short spring chain.',
    rocks: [
      { r: 4, c: 2 },
      { r: 4, c: 5 },
    ],
    openingTemplate: 'spring-twin-midfield-rocks',
    teachingPoint: '选择一条短连吃路线，并在狼被困前主动结束。',
    expectedPlies: { min: 30, target: 110, max: 260 },
    difficulty: 3,
  }),
  L({
    id: 'spring-04', chapterId: 'spring', indexInChapter: 4,
    ai: 'normal',
    nameZh: '春日 04 · 回风角', nameEn: 'Spring 04 · Turning Edge',
    blurbZh: '边缘岩石改变回路，学会先稳住位置再找吃口。',
    blurbEn: 'An edge rock bends the route. Hold position before opening the next gap.',
    rocks: [{ r: 4, c: 1 }],
    openingTemplate: 'spring-edge-turnaround',
    teachingPoint: '先安全换位稳住阵形，再投入吃子路线。',
    expectedPlies: { min: 35, target: 120, max: 280 }, difficulty: 3,
  }),
  L({
    id: 'spring-05', chapterId: 'spring', indexInChapter: 5,
    ai: 'normal',
    nameZh: '春日 05 · 双径抉择', nameEn: 'Spring 05 · Forked Trail',
    blurbZh: '两条路线都能接近羊群，选择先处理哪一侧。',
    blurbEn: 'Two lanes reach the flock. Choose which side to pressure first.',
    rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }],
    openingTemplate: 'spring-two-lanes',
    teachingPoint: '移动第二只狼前，先比较左右两条吃子路线。',
    expectedPlies: { min: 40, target: 130, max: 290 }, difficulty: 3,
  }),
  L({
    id: 'spring-06', chapterId: 'spring', indexInChapter: 6,
    ai: 'normal',
    nameZh: '春日 06 · 春猎收网', nameEn: 'Spring 06 · Closing Net',
    blurbZh: '春日终局，综合短连吃、路线选择和提前收束。',
    blurbEn: 'Spring finale: combine short chains, route choice, and clean exits.',
    rocks: [{ r: 4, c: 1 }, { r: 4, c: 4 }],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }] },
    openingTemplate: 'spring-finale',
    teachingPoint: '综合短连吃与路线选择，在不困狼的前提下完成春季狩猎。',
    expectedPlies: { min: 45, target: 140, max: 300 }, difficulty: 4,
  }),

  L({
    id: 'summer-01',
    chapterId: 'summer',
    indexInChapter: 1,
    nameZh: '夏日 01 · 裂石前线',
    nameEn: 'Summer 01 · Riftline',
    blurbZh: '羊群开始认真挡线。两枚岩石撕开裂隙，逼你选择冲吃方向。',
    blurbEn: 'The flock blocks for real. Two rocks tear a fissure — pick which gap-rush line to force.',
    rocks: [
      { r: 3, c: 6 },
      { r: 4, c: 3 },
    ],
    openingTemplate: 'summer-midfield-fissure',
    teachingPoint: '观察羊群封锁，选择一条压力线集中突破。',
    expectedPlies: { min: 35, target: 120, max: 280 },
    difficulty: 3,
  }),
  L({
    id: 'summer-02',
    chapterId: 'summer',
    indexInChapter: 2,
    ai: 'hard',
    nameZh: '夏日 02 · 横断阵',
    nameEn: 'Summer 02 · Crosscut',
    blurbZh: '三石横切中场。耐心摆位，再隔空切入，别被羊群拖进死角。',
    blurbEn: 'Three rocks crosscut the midfield. Set up patiently, then gap-cut in — don’t get herded into a dead corner.',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 4 },
    ],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }] },
    openingTemplate: 'summer-crosscut-rocks',
    teachingPoint: '不要急冲，保留第二只狼用于中场横切。',
    expectedPlies: { min: 40, target: 135, max: 290 },
    difficulty: 4,
  }),
  L({
    id: 'summer-03',
    chapterId: 'summer',
    indexInChapter: 3,
    nameZh: '夏日 03 · 三狼拉锯',
    nameEn: 'Summer 03 · Three-Wolf Tug',
    blurbZh: '四石拉扯战线。三狼要分工：一狼诱开，另两狼冲吃收割。',
    blurbEn: 'Four rocks tug the front. Split duties: one wolf baits, the other two gap-rush the harvest.',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 2 },
      { r: 4, c: 5 },
      { r: 5, c: 1 },
    ],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] },
    openingTemplate: 'summer-tug-of-war',
    teachingPoint: '让三狼分工，避免过早进入无法退出的死角。',
    expectedPlies: { min: 45, target: 145, max: 300 },
    difficulty: 4,
  }),
  L({
    id: 'summer-04', chapterId: 'summer', indexInChapter: 4,
    nameZh: '夏日 04 · 双流追猎', nameEn: 'Summer 04 · Split Current',
    blurbZh: '羊群分流后，狼需要决定追击主线还是侧翼。',
    blurbEn: 'The flock splits the flow. Choose the main lane or the flank.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }] },
    openingTemplate: 'summer-split-flow',
    teachingPoint: '分配狼压制两条羊群路线，同时保持彼此机动。',
    expectedPlies: { min: 50, target: 150, max: 300 }, difficulty: 4,
  }),
  L({
    id: 'summer-05', chapterId: 'summer', indexInChapter: 5,
    ai: 'hard',
    nameZh: '夏日 05 · 逆潮退路', nameEn: 'Summer 05 · Against the Tide',
    blurbZh: '羊群会把狼推向边角，提前保留第二条退路。',
    blurbEn: 'The flock pushes back toward the edge. Keep a second exit open.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 4 }, { r: 6, c: 1 }],
    opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }] },
    openingTemplate: 'summer-counterpush',
    teachingPoint: '开始连续跳吃前，先为狼保留一条退路。',
    expectedPlies: { min: 55, target: 160, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'summer-06', chapterId: 'summer', indexInChapter: 6,
    nameZh: '夏日 06 · 灼夏压阵', nameEn: 'Summer 06 · Heatline',
    blurbZh: '夏日终局，综合阻挡、分工和中场路线压力。',
    blurbEn: 'Summer finale: combine blocking, wolf roles, and midfield pressure.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 5 }, { r: 5, c: 1 }],
    opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 5 }, { r: 6, c: 6 }] },
    openingTemplate: 'summer-pressure-line',
    teachingPoint: '先让三狼形成协作位置，再进入决定性的吃子线。',
    expectedPlies: { min: 60, target: 170, max: 300 }, difficulty: 5,
  }),

  L({
    id: 'autumn-01',
    chapterId: 'autumn',
    indexInChapter: 1,
    ai: 'normal',
    nameZh: '秋日 01 · 碎岩猎场',
    nameEn: 'Autumn 01 · Shattered Hunt',
    blurbZh: '五枚岩石把盘面切成窄道。找准通道连吃，岩石就是你的跳板。',
    blurbEn: 'Five rocks cut the board into narrow lanes. Hunt the corridor — the stones become your springboards.',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 3 },
      { r: 4, c: 5 },
      { r: 5, c: 6 },
    ],
    opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }] },
    teachingPoint: '识别被岩石切开的窄道，用两狼控口、一狼寻找连吃。',
  }),
  L({
    id: 'autumn-02',
    chapterId: 'autumn',
    indexInChapter: 2,
    ai: 'normal',
    nameZh: '秋日 02 · 一线长廊',
    nameEn: 'Autumn 02 · Long Corridor',
    blurbZh: '六石挤出一条主通道。控制通道两端，连吃会像潮水一样涌出。',
    blurbEn: 'Six rocks squeeze one main corridor. Own both ends and chains will surge like a tide.',
    rocks: [
      { r: 2, c: 6 },
      { r: 4, c: 1 },
      { r: 4, c: 3 },
      { r: 4, c: 5 },
      { r: 5, c: 6 },
    ],
    opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 5 }, { r: 6, c: 6 }] },
    teachingPoint: '控制主通道两端，再把一次跳吃扩展成连续收割。',
  }),
  L({
    id: 'autumn-03',
    chapterId: 'autumn',
    indexInChapter: 3,
    ai: 'normal',
    nameZh: '秋日 03 · 金穗连收',
    nameEn: 'Autumn 03 · Golden Chain',
    blurbZh: '五石密布的丰收盘。敢冲敢停：连吃满档前记得主动结束，保住胜势。',
    blurbEn: 'A five-rock harvest board. Rush hard, stop clean — end the chain before you strand a wolf.',
    rocks: [
      { r: 1, c: 6 },
      { r: 3, c: 6 },
      { r: 4, c: 2 },
      { r: 4, c: 4 },
      { r: 5, c: 1 },
    ],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] },
    teachingPoint: '连吃时同时计算收益与退路，必要时主动收手。',
  }),
  L({
    id: 'autumn-04', chapterId: 'autumn', indexInChapter: 4,
    ai: 'normal',
    nameZh: '秋日 04 · 断桥跃袭', nameEn: 'Autumn 04 · Broken Crossing',
    blurbZh: '密集岩石留下多个断点，必须提前判断连吃方向。',
    blurbEn: 'Dense rocks leave broken bridges. Read the chain direction early.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }] },
    openingTemplate: 'autumn-broken-bridge',
    teachingPoint: '把岩石间的断点当作连吃入口，提前判断跳吃方向。',
    expectedPlies: { min: 60, target: 165, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'autumn-05', chapterId: 'autumn', indexInChapter: 5,
    ai: 'normal',
    nameZh: '秋日 05 · 窄门守猎', nameEn: 'Autumn 05 · Narrow Gate',
    blurbZh: '两端都要保持通行，任何一只狼走错都会失去窗口。',
    blurbEn: 'Keep both ends open. One careless wolf can close the window.',
    rocks: [{ r: 2, c: 6 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 6 }],
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }] },
    openingTemplate: 'autumn-narrow-gate',
    teachingPoint: '规划强制跳吃时，始终保持窄门两端可通行。',
    expectedPlies: { min: 65, target: 180, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'autumn-06', chapterId: 'autumn', indexInChapter: 6,
    ai: 'normal',
    nameZh: '秋日 06 · 丰收收网', nameEn: 'Autumn 06 · Harvest Finale',
    blurbZh: '秋日终局，要求在密集岩石中完成干净的连吃。',
    blurbEn: 'Autumn finale: land a clean chain through the dense rock field.',
    rocks: [{ r: 1, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 3 }],
    openingTemplate: 'autumn-harvest-finale',
    teachingPoint: '在追求长连吃与保持三狼机动之间做出取舍。',
    expectedPlies: { min: 70, target: 190, max: 300 }, difficulty: 5,
  }),

  L({
    id: 'winter-01',
    chapterId: 'winter',
    indexInChapter: 1,
    nameZh: '冬日 01 · 寂雪原',
    nameEn: 'Winter 01 · Silent Snowfield',
    blurbZh: '空盘寂静。没有岩石挡点，完全靠走位撕开合围。',
    blurbEn: 'Silent empty board. No rocks to lean on — only spacing can tear the surround.',
    rocks: [],
    opening: {
      wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }],
      sheep: [
        { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
        { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
        { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
      ],
    },
    openingTemplate: 'winter-silence-edge',
    teachingPoint: '没有岩石可借力时，用三狼间距撕开羊群合围。',
  }),
  L({
    id: 'winter-02',
    chapterId: 'winter',
    indexInChapter: 2,
    nameZh: '冬日 02 · 霜环',
    nameEn: 'Winter 02 · Frost Ring',
    blurbZh: '高阶羊群合力围狼。先保三狼通路，再找隔空破口。',
    blurbEn: 'A hard flock closes the ring. Keep all three wolves mobile, then punch a gap-eat hole.',
    rocks: [],
    opening: { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }] },
    teachingPoint: '先保证三狼都有通路，再从边线制造第一个破口。',
  }),
  L({
    id: 'winter-03',
    chapterId: 'winter',
    indexInChapter: 3,
    nameZh: '冬日 03 · 雪线绝境',
    nameEn: 'Winter 03 · Last Stand',
    blurbZh: '四季终章。在绝境里打出干净的隔空连吃，证明你真正掌控猎场。',
    blurbEn: 'Season finale. Land clean gap-chains under pressure — prove you own the hunt.',
    rocks: [],
    opening: {
      sheep: [
        { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 },
        { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
        { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
      ],
    },
    openingTemplate: 'winter-last-stand-right',
    teachingPoint: '在空盘高压下保持覆盖，等待可连续兑现的隔空跳吃。',
  }),
  L({
    id: 'winter-04', chapterId: 'winter', indexInChapter: 4,
    nameZh: '冬日 04 · 白原回环', nameEn: 'Winter 04 · Whitefield Loop',
    blurbZh: '空盘中羊群不断回环，保持狼的覆盖范围。',
    blurbEn: 'The flock loops across the empty board. Keep wolf coverage wide.',
    rocks: [],
    opening: {
      sheep: [
        { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
        { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
        { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
      ],
    },
    openingTemplate: 'winter-open-loop',
    teachingPoint: '不要追逐单只羊，要维持三狼对整盘的覆盖。',
    expectedPlies: { min: 70, target: 180, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'winter-05', chapterId: 'winter', indexInChapter: 5,
    nameZh: '冬日 05 · 破围之线', nameEn: 'Winter 05 · Break the Ring',
    blurbZh: '先保持三狼机动，再从边缘撕开第一条吃子线。',
    blurbEn: 'Keep three wolves mobile, then tear the first capture line from the edge.',
    rocks: [],
    opening: {
      wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }],
      sheep: [
        { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 },
        { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
        { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
      ],
    },
    openingTemplate: 'winter-ring-line',
    teachingPoint: '先建立合围位置，再投入第一条隔空跳吃路线。',
    expectedPlies: { min: 75, target: 195, max: 300 }, difficulty: 5,
  }),
  L({
    id: 'winter-06', chapterId: 'winter', indexInChapter: 6,
    nameZh: '冬日 06 · 无痕终猎', nameEn: 'Winter 06 · The Final Hunt',
    blurbZh: '四季终章，检验空盘位置计算和连续狩猎能力。',
    blurbEn: 'The four-season finale: prove open-board calculation and clean chains.',
    rocks: [], openingTemplate: 'winter-final-hunt',
    opening: { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }] },
    teachingPoint: '在空盘完成合围与连续狩猎，同时不牺牲狼的机动性。',
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
