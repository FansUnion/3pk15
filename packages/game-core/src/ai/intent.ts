import type { AiBehaviorProfile, AiIntentTarget, AiOpponentMemory, AiStyle, AiTargetChangeReason, BoardState } from '../types'
import { getWolfLegalSummary } from '../rules'
import { maxCapturesInWolfTurn, persistentHunterRisk } from './evaluate'
import { commitAiTarget, normalizeAiOpponentMemory } from './memory'

export const DEFAULT_AI_BEHAVIOR: AiBehaviorProfile = {
  style: { primary: 'blockade', secondary: 'encircle' },
  intent: {
    target: 'weakest-wolf',
    summaryZh: '压缩低机动狼的出口。',
    counterplayZh: '保持三狼接应并及时换线。',
    focusCells: [{ r: 4, c: 3 }, { r: 4, c: 4 }],
    retargetAfterPlies: 8,
  },
}

export type AiIntentPhase = 'deny-capture' | 'contain' | 'close-net'

export type ResolvedAiIntent = {
  targetWolfId: string | null
  target: AiIntentTarget
  phase: AiIntentPhase
  targetChangeReason: AiTargetChangeReason
  nextMemory: AiOpponentMemory
}

export type AiIntentImpact = {
  targetMobilityDelta: number
  totalMobilityDelta: number
  trappedWolfDelta: number
  hunterRiskDelta: number
  captureChainRiskDelta: number
  spreadDelta: number
  focusControlDelta: number
  styleScore: number
  activePressure: boolean
  noProgress: boolean
  styleAligned: boolean
}

function mobilityByWolf(state: BoardState) {
  return new Map(getWolfLegalSummary(state).map((wolf) => [wolf.wolfId, wolf.steps + wolf.jumps]))
}

function sheepSpread(state: BoardState) {
  const sheep = state.pieces.filter((piece) => piece.side === 'sheep')
  if (sheep.length < 2) return 0
  let total = 0
  let pairs = 0
  for (let left = 0; left < sheep.length; left += 1) {
    for (let right = left + 1; right < sheep.length; right += 1) {
      total += Math.abs(sheep[left]!.r - sheep[right]!.r) + Math.abs(sheep[left]!.c - sheep[right]!.c)
      pairs += 1
    }
  }
  return total / Math.max(1, pairs)
}

function nearestSheepDistance(state: BoardState, wolfId: string) {
  const wolf = state.pieces.find((piece) => piece.id === wolfId)
  const sheep = state.pieces.filter((piece) => piece.side === 'sheep')
  if (!wolf || sheep.length === 0) return Infinity
  return Math.min(...sheep.map((piece) => Math.abs(piece.r - wolf.r) + Math.abs(piece.c - wolf.c)))
}

function isolationDistance(state: BoardState, wolfId: string) {
  const wolf = state.pieces.find((piece) => piece.id === wolfId)
  const others = state.pieces.filter((piece) => piece.side === 'wolf' && piece.id !== wolfId)
  if (!wolf || others.length === 0) return 0
  return others.reduce((sum, piece) => sum + Math.abs(piece.r - wolf.r) + Math.abs(piece.c - wolf.c), 0) / others.length
}

function targetWolf(state: BoardState, target: AiIntentTarget, memory: AiOpponentMemory) {
  const summaries = getWolfLegalSummary(state)
  if (summaries.length === 0) return null
  const sorted = [...summaries].sort((left, right) => {
    const leftMobility = left.steps + left.jumps
    const rightMobility = right.steps + right.jumps
    if (target === 'active-hunter' || target === 'capture-landing') {
      return (memory.capturesByWolf[right.wolfId] ?? 0) - (memory.capturesByWolf[left.wolfId] ?? 0)
        || right.jumps - left.jumps
        || leftMobility - rightMobility
        || left.wolfId.localeCompare(right.wolfId)
    }
    if (target === 'support-link') {
      return isolationDistance(state, right.wolfId) - isolationDistance(state, left.wolfId)
        || leftMobility - rightMobility
        || left.wolfId.localeCompare(right.wolfId)
    }
    if (target === 'approach') {
      return nearestSheepDistance(state, left.wolfId) - nearestSheepDistance(state, right.wolfId)
        || leftMobility - rightMobility
        || left.wolfId.localeCompare(right.wolfId)
    }
    return leftMobility - rightMobility || right.jumps - left.jumps || left.wolfId.localeCompare(right.wolfId)
  })
  return sorted[0]!.wolfId
}

export function resolveAiIntent(
  state: BoardState,
  behavior: AiBehaviorProfile,
  rawMemory?: AiOpponentMemory,
): ResolvedAiIntent {
  const memory = normalizeAiOpponentMemory(rawMemory)
  const preferred = targetWolf(state, behavior.intent.target, memory)
  const mobility = mobilityByWolf(state)
  const current = memory.currentTargetWolfId && mobility.has(memory.currentTargetWolfId) ? memory.currentTargetWolfId : null
  let targetWolfId = current ?? preferred
  let targetChangeReason: AiTargetChangeReason = current ? 'target-retained' : memory.currentTargetWolfId ? 'target-missing' : 'initial-target'
  if (current && (mobility.get(current) ?? 0) === 0) {
    const nextOpen = preferred !== current && preferred && (mobility.get(preferred) ?? 0) > 0
      ? preferred
      : [...mobility.entries()].filter(([id, moves]) => id !== current && moves > 0).sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]))[0]?.[0]
    if (nextOpen) {
      targetWolfId = nextOpen
      targetChangeReason = 'target-trapped'
    }
  } else if (current && preferred && preferred !== current) {
    const currentCaptures = memory.capturesByWolf[current] ?? 0
    const preferredCaptures = memory.capturesByWolf[preferred] ?? 0
    if (behavior.intent.target === 'active-hunter' && preferredCaptures > currentCaptures) {
      targetWolfId = preferred
      targetChangeReason = 'hunter-emerged'
    } else if (state.plyCount - memory.targetSincePly >= behavior.intent.retargetAfterPlies
      && (mobility.get(preferred) ?? 0) + 1 < (mobility.get(current) ?? 0)) {
      targetWolfId = preferred
      targetChangeReason = 'better-opportunity'
    }
  }
  const targetMobility = targetWolfId ? mobility.get(targetWolfId) ?? 0 : 0
  const phase: AiIntentPhase = targetMobility === 0
    ? 'close-net'
    : state.eatenSheep >= Math.max(1, state.targetEaten - 2) || maxCapturesInWolfTurn(state) > 0
      ? 'deny-capture'
      : 'contain'
  return {
    targetWolfId,
    target: behavior.intent.target,
    phase,
    targetChangeReason,
    nextMemory: commitAiTarget(memory, targetWolfId, targetChangeReason, state.plyCount),
  }
}

function focusControl(state: BoardState, behavior: AiBehaviorProfile) {
  const focus = behavior.intent.focusCells
  if (focus.length === 0) return 0
  const pieces = new Map(state.pieces.map((piece) => [`${piece.r},${piece.c}`, piece.side]))
  const sheep = state.pieces.filter((piece) => piece.side === 'sheep')
  return focus.reduce((score, cell) => {
    const occupant = pieces.get(`${cell.r},${cell.c}`)
    const distance = sheep.length === 0 ? 6 : Math.min(...sheep.map((piece) => Math.abs(piece.r - cell.r) + Math.abs(piece.c - cell.c)))
    return score + (occupant === 'sheep' ? 4 : occupant === 'wolf' ? -4 : 0) - distance * 0.5
  }, 0)
}

function scoreForStyle(style: AiStyle, impact: Omit<AiIntentImpact, 'styleScore' | 'activePressure' | 'noProgress' | 'styleAligned'>) {
  switch (style) {
    case 'blockade':
      return impact.targetMobilityDelta * 4 + impact.totalMobilityDelta * 2 + impact.captureChainRiskDelta * 7 + impact.trappedWolfDelta * 18 + impact.focusControlDelta * 5
    case 'encircle':
      return impact.targetMobilityDelta * 7 + impact.totalMobilityDelta + impact.trappedWolfDelta * 28 + impact.focusControlDelta * 2
    case 'disperse':
      return impact.spreadDelta * 4 + impact.targetMobilityDelta * 2 + impact.totalMobilityDelta + impact.focusControlDelta * 3
    case 'exchange':
      return impact.targetMobilityDelta * 5 + impact.totalMobilityDelta * 2 + impact.trappedWolfDelta * 24 + impact.hunterRiskDelta * 3 + impact.focusControlDelta * 2
    case 'hunter-counter':
      return impact.hunterRiskDelta * 9 + impact.captureChainRiskDelta * 8 + impact.targetMobilityDelta * 2 + impact.focusControlDelta * 2
  }
}

export function measureAiIntentImpact(
  before: BoardState,
  after: BoardState,
  behavior: AiBehaviorProfile,
  targetWolfId = resolveAiIntent(before, behavior).targetWolfId,
): AiIntentImpact {
  const beforeMobility = mobilityByWolf(before)
  const afterMobility = mobilityByWolf(after)
  const totalBefore = [...beforeMobility.values()].reduce((sum, value) => sum + value, 0)
  const totalAfter = [...afterMobility.values()].reduce((sum, value) => sum + value, 0)
  const trappedBefore = [...beforeMobility.values()].filter((value) => value === 0).length
  const trappedAfter = [...afterMobility.values()].filter((value) => value === 0).length
  const raw = {
    targetMobilityDelta: targetWolfId ? (beforeMobility.get(targetWolfId) ?? 0) - (afterMobility.get(targetWolfId) ?? 0) : 0,
    totalMobilityDelta: totalBefore - totalAfter,
    trappedWolfDelta: trappedAfter - trappedBefore,
    hunterRiskDelta: persistentHunterRisk(before) - persistentHunterRisk(after),
    captureChainRiskDelta: maxCapturesInWolfTurn(before) - maxCapturesInWolfTurn(after),
    spreadDelta: sheepSpread(after) - sheepSpread(before),
    focusControlDelta: focusControl(after, behavior) - focusControl(before, behavior),
  }
  const primary = scoreForStyle(behavior.style.primary, raw)
  const secondary = scoreForStyle(behavior.style.secondary, raw)
  const styleScore = primary + secondary * 0.35
  const activePressure = raw.targetMobilityDelta > 0
    || raw.totalMobilityDelta > 0
    || raw.trappedWolfDelta > 0
    || raw.hunterRiskDelta > 0
    || raw.captureChainRiskDelta > 0
    || raw.focusControlDelta > 0
  const noProgress = !activePressure && raw.spreadDelta <= 0 && raw.focusControlDelta <= 0
  return { ...raw, styleScore, activePressure, noProgress, styleAligned: primary > 0 }
}

export function aiBehaviorStateScore(state: BoardState, behavior: AiBehaviorProfile, memory?: AiOpponentMemory) {
  const intent = resolveAiIntent(state, behavior, memory)
  const mobility = mobilityByWolf(state)
  const targetMobility = intent.targetWolfId ? mobility.get(intent.targetWolfId) ?? 0 : 0
  const trapped = [...mobility.values()].filter((value) => value === 0).length
  const common = -targetMobility * 2 + trapped * 12 + focusControl(state, behavior) * 4
  switch (behavior.style.primary) {
    case 'blockade': return common - [...mobility.values()].reduce((sum, value) => sum + value, 0)
    case 'encircle': return common - targetMobility * 3 + trapped * 12
    case 'disperse': return common + sheepSpread(state) * 2
    case 'exchange': return common - targetMobility * 2 + trapped * 8
    case 'hunter-counter': return common - persistentHunterRisk(state) * 6 - maxCapturesInWolfTurn(state) * 5
  }
}
