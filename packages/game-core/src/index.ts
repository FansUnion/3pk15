export type { ChapterId, LevelConfig } from './content/levels'
export {
  adjacentLevels,
  CHAPTER_AI,
  CHAPTER_BLURB_EN,
  CHAPTER_BLURB_ZH,
  CHAPTER_LABEL,
  CHAPTER_LABEL_EN,
  CHAPTER_ORDER,
  getLevel,
  levelBlurb,
  levelDisplayName,
  LEVELS,
  levelsForChapter,
  validateAllLevels,
  validateLevel,
} from './content/levels'
export {
  activateDoubleDrop,
  applyClearToSave,
  defaultSave,
  grantUniversalFragments,
  isChapterUnlocked,
  isDoubleDropActive,
  isLevelCleared,
  migrate,
  recomputeUnlockedChapters,
  recordPlayStarted,
  rollClearReward,
  SAVE_KEY,
} from './content/save'
export type { DropGrant, SaveGame } from './content/save'
export {
  claimQuest,
  dailyKey,
  emptyQuestState,
  QUEST_DEFS,
  recordQuestMetric,
  refreshQuestPeriod,
  weeklyKey,
} from './content/quests'
export type { QuestBucket, QuestDef, QuestState } from './content/quests'
export {
  equipSkin,
  getBoardSkin,
  getSkin,
  getWolfSet,
  isSkinUnlocked,
  resolveSkin,
  SKIN_CATALOG,
  unlockSkinWithCost,
  validateSkinCatalog,
} from './content/skins'
export type { BoardSkin, SkinCatalogItem, WolfSetSkin } from './content/skins'
export type {
  Action,
  ApplyResult,
  BoardState,
  ChainContext,
  Difficulty,
  GameStatus,
  JumpMove,
  Piece,
  Pos,
  Side,
  StepMove,
} from './types'
export {
  BOARD_MAX,
  BOARD_MIN,
  MAX_CHAIN,
  OPENING_SHEEP,
  WIN_EATEN,
} from './types'
export { keyOf, posKey, inBounds, ORTHO } from './board'
export {
  applyAction,
  assertInvariants,
  createInitialState,
  endWolfTurn,
  evaluateTerminal,
  getWolfLegalSummary,
  listLegalActions,
  listWolfActionsAsIfTurn,
  refreshStatus,
} from './rules'
export { deserialize, makeState, serialize } from './serialize'
export type { SerializedBoard } from './serialize'
export {
  createSeededRng,
  pickSheepAction,
  tierForChapter,
} from './ai/index'
export type { AiContext, HardBudgets, HardPickMeta, Rng } from './ai/index'
export { pickHardWithMeta } from './ai/index'
export { evaluate, evaluateScore } from './ai/evaluate'
export type { EvalBreakdown } from './ai/evaluate'
