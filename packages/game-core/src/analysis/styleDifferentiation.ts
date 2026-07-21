import { createAiOpponentMemory, createSeededRng, pickSheepActionWithMeta } from '../ai/index'
import type { LevelConfig } from '../content/levels'
import type { Action, AiStyle, BoardState } from '../types'

export const AI_PRIMARY_STYLES: readonly AiStyle[] = ['blockade', 'encircle', 'disperse', 'exchange', 'hunter-counter']

export type StyleDecisionEvidence = {
  style: AiStyle
  action: Action
  actionKey: string
  styleAligned: boolean
  styleScore: number
  targetWolfId: string | null
  candidateCount: number
}

export type StyleDifferentiationReport = {
  levelId: string
  ply: number
  decisions: StyleDecisionEvidence[]
  distinctActionCount: number
  pairwiseDivergence: number
}

export function compareAiStyles(state: BoardState, level: LevelConfig, seed = 20260720): StyleDifferentiationReport {
  if (state.status !== 'playing' || state.toMove !== 'sheep') throw new Error('compareAiStyles requires a playing sheep turn')
  const decisions = AI_PRIMARY_STYLES.map((style, index) => {
    const secondary = AI_PRIMARY_STYLES[(index + 1) % AI_PRIMARY_STYLES.length]!
    const decision = pickSheepActionWithMeta(state, {
      profile: level.aiProfile,
      rng: createSeededRng(seed),
      memory: createAiOpponentMemory(),
      behavior: { style: { primary: style, secondary }, intent: level.opponentIntent },
    })
    return {
      style,
      action: decision.action,
      actionKey: JSON.stringify(decision.action),
      styleAligned: decision.meta.impact.styleAligned,
      styleScore: decision.meta.impact.styleScore,
      targetWolfId: decision.meta.targetWolfId,
      candidateCount: decision.meta.candidateCount,
    }
  })
  let differingPairs = 0
  let pairs = 0
  for (let left = 0; left < decisions.length; left += 1) {
    for (let right = left + 1; right < decisions.length; right += 1) {
      pairs += 1
      if (decisions[left]!.actionKey !== decisions[right]!.actionKey) differingPairs += 1
    }
  }
  return {
    levelId: level.id,
    ply: state.plyCount,
    decisions,
    distinctActionCount: new Set(decisions.map((decision) => decision.actionKey)).size,
    pairwiseDivergence: differingPairs / Math.max(1, pairs),
  }
}
