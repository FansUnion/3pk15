export type { ChapterId, LevelConfig } from './content/levels'
export {
  adjacentLevels,
  CHAPTER_AI,
  CHAPTER_BLURB_EN,
  CHAPTER_BLURB_ZH,
  CHAPTER_LABEL,
  CHAPTER_LABEL_EN,
  CHAPTER_ORDER,
  createLevelInitialState,
  getLevel,
  levelBlurb,
  levelDisplayName,
  levelTeachingPoint,
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
  recordGuideHint,
  recordGuideResult,
  rollClearReward,
  SAVE_KEY,
} from './content/save'
export type { DropGrant, SaveGame } from './content/save'
export {
  claimQuest,
  dailyKey,
  emptyQuestState,
  QUEST_DEFS,
  questDisplayTitle,
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
  skinDisplayName,
  SKIN_CATALOG,
  unlockSkinWithCost,
  validateSkinCatalog,
} from './content/skins'
export type { BoardSkin, SkinCatalogItem, WolfSetSkin } from './content/skins'
export { getWolfStrategy, LEVEL_STRATEGIES, strategyName, WOLF_STRATEGIES } from './content/strategies'
export type { LevelStrategyProfile, WolfStrategy, WolfStrategyId } from './content/strategies'
export type {
  Action,
  ApplyResult,
  BoardState,
  ChainContext,
  Difficulty,
  GameStatus,
  JumpMove,
  OpeningLayout,
  PassAction,
  Piece,
  Pos,
  Side,
  StepMove,
  TerminalReason,
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
  boardPositionKey,
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
export { analyzeSheepActions, evaluate, evaluateScore } from './ai/evaluate'
export type { EvalBreakdown, SheepActionAnalysis } from './ai/evaluate'
export { assessLevelCandidate } from './analysis/candidateAcceptance'
export type {
  CandidateAcceptanceOptions,
  CandidateAcceptanceReport,
  CandidateFinding,
  CandidateGameEvidence,
  CandidateVerdict,
  CandidateWolfStrategy,
} from './analysis/candidateAcceptance'
export { chooseDiagnosticWolfAction, shouldContinueDiagnosticChain } from './analysis/diagnosticWolf'
export type { DiagnosticWolfStrategy } from './analysis/diagnosticWolf'
export { analyzeLevelTopology, topologySignatureGroup } from './analysis/topology'
export type { LevelTopology, RockGap } from './analysis/topology'
export { measureSheepAdvantage } from './analysis/sheepAdvantage'
export type { SheepAdvantageMetrics } from './analysis/sheepAdvantage'
export { solveFinitePosition } from './analysis/finiteSolver'
export type { FiniteSolveOptions, FiniteSolveResult, SolverVerdict } from './analysis/finiteSolver'
export { auditLevel, auditLevels } from './analysis/levelAudit'
export type { LevelAuditOptions, LevelAuditReport, LevelAuditVerdict } from './analysis/levelAudit'
