import { keyOf, parseKey } from './board'
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
  }
}

export function deserialize(data: SerializedBoard): BoardState {
  return {
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
  }
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
}): BoardState {
  return {
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
  }
}

export { parseKey }
