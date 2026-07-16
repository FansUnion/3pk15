import { keyOf, parseKey } from './board'
import { boardPositionKey } from './rules'
import type { BoardState, ChainContext, Piece } from './types'

export type SerializedBoard = {
  pieces: Piece[]
  rocks: string[]
  eatenSheep: number
  toMove: BoardState['toMove']
  chain: ChainContext | null
  status: BoardState['status']
  levelId: string
  targetEaten?: number
  plyCount?: number
  maxPlies?: number
  repetitionCounts?: [string, number][]
}

export function serialize(state: BoardState): SerializedBoard {
  return {
    pieces: state.pieces.map((p) => ({ ...p })),
    rocks: [...state.rocks],
    eatenSheep: state.eatenSheep,
    toMove: state.toMove,
    chain: state.chain ? { ...state.chain } : null,
    status: state.status,
    levelId: state.levelId,
    targetEaten: state.targetEaten,
    plyCount: state.plyCount,
    maxPlies: state.maxPlies,
    repetitionCounts: [...state.repetitionCounts],
  }
}

export function deserialize(data: SerializedBoard): BoardState {
  const state: BoardState = {
    pieces: data.pieces.map((p) => ({ ...p })),
    rocks: new Set(data.rocks),
    eatenSheep: data.eatenSheep,
    toMove: data.toMove,
    chain: data.chain ? { ...data.chain } : null,
    status: data.status,
    levelId: data.levelId,
    targetEaten: data.targetEaten ?? 8,
    plyCount: data.plyCount ?? 0,
    maxPlies: data.maxPlies ?? 300,
    repetitionCounts: new Map(data.repetitionCounts),
  }
  if (data.repetitionCounts) return state
  return { ...state, repetitionCounts: new Map([[boardPositionKey(state), 1]]) }
}

/** Build a custom position for tests / admin (rocks as Pos[]). */
export function makeState(partial: {
  pieces: Piece[]
  rocks?: { r: number; c: number }[]
  eatenSheep?: number
  toMove?: BoardState['toMove']
  chain?: ChainContext | null
  status?: BoardState['status']
  levelId?: string
  targetEaten?: number
  plyCount?: number
  maxPlies?: number
  repetitionCounts?: ReadonlyMap<string, number>
}): BoardState {
  const state: BoardState = {
    pieces: partial.pieces.map((p) => ({ ...p })),
    rocks: new Set((partial.rocks ?? []).map(keyOf)),
    eatenSheep: partial.eatenSheep ?? 0,
    toMove: partial.toMove ?? 'wolf',
    chain: partial.chain ?? null,
    status: partial.status ?? 'playing',
    levelId: partial.levelId ?? 'test',
    targetEaten: partial.targetEaten ?? 8,
    plyCount: partial.plyCount ?? 0,
    maxPlies: partial.maxPlies ?? 300,
    repetitionCounts: partial.repetitionCounts ?? new Map(),
  }
  if (partial.repetitionCounts) return state
  return { ...state, repetitionCounts: new Map([[boardPositionKey(state), 1]]) }
}

export { parseKey }
