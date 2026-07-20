export type Side = 'wolf' | 'sheep'
export type Difficulty = 'easy' | 'normal' | 'hard'
/** Production-facing defensive behavior used by the 24-level learning curve. */
export type AiProfile = 'guided' | 'foundation' | 'tactical' | 'strategic' | 'expert'
export type GameStatus = 'playing' | 'won' | 'lost' | 'draw'
export type TerminalReason = 'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition'

export type Pos = { r: number; c: number }

/** Optional per-level starting positions. Omitted sides use the standard opening. */
export type OpeningLayout = {
  wolves?: readonly Pos[]
  sheep?: readonly Pos[]
}

export type Piece = {
  id: string
  side: Side
  r: number
  c: number
}

export type ChainContext = {
  wolfId: string
  /** Completed jumps this turn, 1..5 */
  count: number
}

export type BoardState = {
  pieces: Piece[]
  rocks: ReadonlySet<string>
  eatenSheep: number
  toMove: Side
  chain: ChainContext | null
  status: GameStatus
  terminalReason: TerminalReason | null
  levelId: string
  targetEaten: number
  plyCount: number
  maxPlies: number
  /** Occurrences of complete positions in this game; the third is a draw. */
  repetitionCounts: ReadonlyMap<string, number>
}

export type StepMove = {
  type: 'step'
  pieceId: string
  to: Pos
}

/** 隔空吃：狼 — through(空) — to(羊)；狼落到羊位并移除羊 */
export type JumpMove = {
  type: 'jump'
  pieceId: string
  /** 中间空点（无子、无岩） */
  through: Pos
  /** 目标羊位兼落点 */
  to: Pos
}

/** Only legal for sheep when the entire flock has no step. */
export type PassAction = {
  type: 'pass'
}

export type Action = StepMove | JumpMove | PassAction

export type ApplyResult =
  | { ok: true; state: BoardState }
  | { ok: false; error: string }

export const BOARD_MIN = 1
export const BOARD_MAX = 6
export const WIN_EATEN = 8
export const MAX_CHAIN = 5
export const OPENING_SHEEP = 15
