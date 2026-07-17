'use client'

import { deserialize, serialize, type BoardState, type SerializedBoard } from '@wolf-sheep/game-core'

const CANDIDATE_HANDOFF_KEY = 'wolf-sheep:candidate-handoff:v1'

export function saveCandidateHandoff(state: BoardState): void {
  window.sessionStorage.setItem(CANDIDATE_HANDOFF_KEY, JSON.stringify(serialize(state)))
}

export function consumeCandidateHandoff(): BoardState | null {
  const text = window.sessionStorage.getItem(CANDIDATE_HANDOFF_KEY)
  window.sessionStorage.removeItem(CANDIDATE_HANDOFF_KEY)
  if (!text) return null
  try {
    return deserialize(JSON.parse(text) as SerializedBoard)
  } catch {
    return null
  }
}
