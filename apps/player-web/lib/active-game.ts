'use client'

import {
  assertInvariants,
  deserialize,
  serialize,
  type BoardState,
  type OpeningLayout,
  type Pos,
  type SerializedBoard,
} from '@wolf-sheep/game-core'
import { ACTIVE_GAME_STORAGE_KEY } from '@wolf-sheep/web-shared'

const ACTIVE_GAME_KEY = ACTIVE_GAME_STORAGE_KEY

export type ActiveGameConfig = {
  levelId: string
  rocks: Pos[]
  targetEaten?: number
  maxPlies?: number
  opening?: OpeningLayout
}

export function loadActiveGame(config: ActiveGameConfig): BoardState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACTIVE_GAME_KEY)
    const restored = parseActiveGameSnapshot(raw, config)
    if (raw && !restored) clearActiveGame()
    return restored
  } catch {
    clearActiveGame()
    return null
  }
}

export function parseActiveGameSnapshot(raw: string | null, config: ActiveGameConfig): BoardState | null {
  try {
    const parsed = JSON.parse(raw ?? 'null') as { signature?: string; board?: SerializedBoard } | null
    if (!parsed?.board || parsed.signature !== activeGameSignature(config)) return null
    const state = deserialize(parsed.board)
    assertInvariants(state)
    return state.status === 'playing' && state.levelId === config.levelId ? state : null
  } catch {
    return null
  }
}

export function saveActiveGame(config: ActiveGameConfig, state: BoardState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify({ signature: activeGameSignature(config), board: serialize(state) }))
  } catch {
    // A failed activity snapshot must never interrupt the match.
  }
}

export function clearActiveGame(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(ACTIVE_GAME_KEY)
  } catch {
    // Storage may be unavailable in privacy modes.
  }
}

export function activeGameSignature(config: ActiveGameConfig): string {
  const rocks = [...config.rocks].sort((a, b) => a.r - b.r || a.c - b.c)
  return JSON.stringify([config.levelId, rocks, config.targetEaten ?? 8, config.maxPlies ?? 300, config.opening ?? null])
}
