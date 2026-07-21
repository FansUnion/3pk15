'use client'

import { deserialize, normalizeAiOpponentMemory, serialize, type AiOpponentMemory, type BoardState, type SerializedBoard } from '@wolf-sheep/game-core'

const CANDIDATE_HANDOFF_KEY = 'wolf-sheep:candidate-handoff:v2'

export function saveCandidateHandoff(state: BoardState, aiMemory: AiOpponentMemory): void {
  window.sessionStorage.setItem(CANDIDATE_HANDOFF_KEY, JSON.stringify({ board: serialize(state), aiMemory }))
}

export function consumeCandidateHandoff(): { state: BoardState; aiMemory: AiOpponentMemory } | null {
  const text = window.sessionStorage.getItem(CANDIDATE_HANDOFF_KEY)
  window.sessionStorage.removeItem(CANDIDATE_HANDOFF_KEY)
  if (!text) return null
  try {
    const parsed = JSON.parse(text) as { board: SerializedBoard; aiMemory?: AiOpponentMemory }
    return { state: deserialize(parsed.board), aiMemory: normalizeAiOpponentMemory(parsed.aiMemory) }
  } catch {
    return null
  }
}
