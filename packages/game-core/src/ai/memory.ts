import type { Action, AiOpponentMemory, AiTargetChangeReason, BoardState } from '../types'

export function createAiOpponentMemory(): AiOpponentMemory {
  return {
    currentTargetWolfId: null,
    targetSincePly: 0,
    lastTargetChangeReason: 'initial-target',
    capturesByWolf: {},
    movesByWolf: {},
    lastWolfActionPly: 0,
  }
}

export function normalizeAiOpponentMemory(value?: Partial<AiOpponentMemory> | null): AiOpponentMemory {
  const fallback = createAiOpponentMemory()
  if (!value) return fallback
  return {
    currentTargetWolfId: typeof value.currentTargetWolfId === 'string' ? value.currentTargetWolfId : null,
    targetSincePly: Number.isSafeInteger(value.targetSincePly) && value.targetSincePly! >= 0 ? value.targetSincePly! : 0,
    lastTargetChangeReason: isTargetChangeReason(value.lastTargetChangeReason) ? value.lastTargetChangeReason : 'initial-target',
    capturesByWolf: normalizeCountRecord(value.capturesByWolf),
    movesByWolf: normalizeCountRecord(value.movesByWolf),
    lastWolfActionPly: Number.isSafeInteger(value.lastWolfActionPly) && value.lastWolfActionPly! >= 0 ? value.lastWolfActionPly! : 0,
  }
}

export function observeAiOpponentAction(
  memory: AiOpponentMemory,
  before: BoardState,
  action: Action,
  after: BoardState,
): AiOpponentMemory {
  if (before.toMove !== 'wolf' || action.type === 'pass') return memory
  const movesByWolf = { ...memory.movesByWolf, [action.pieceId]: (memory.movesByWolf[action.pieceId] ?? 0) + 1 }
  const captured = Math.max(0, after.eatenSheep - before.eatenSheep)
  const capturesByWolf = captured > 0
    ? { ...memory.capturesByWolf, [action.pieceId]: (memory.capturesByWolf[action.pieceId] ?? 0) + captured }
    : memory.capturesByWolf
  return { ...memory, movesByWolf, capturesByWolf, lastWolfActionPly: after.plyCount }
}

export function commitAiTarget(
  memory: AiOpponentMemory,
  targetWolfId: string | null,
  reason: AiTargetChangeReason,
  ply: number,
): AiOpponentMemory {
  const changed = targetWolfId !== memory.currentTargetWolfId
  return {
    ...memory,
    currentTargetWolfId: targetWolfId,
    targetSincePly: changed ? ply : memory.targetSincePly,
    lastTargetChangeReason: reason,
  }
}

function normalizeCountRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value)
    .filter((entry): entry is [string, number] => Number.isSafeInteger(entry[1]) && entry[1] >= 0))
}

function isTargetChangeReason(value: unknown): value is AiTargetChangeReason {
  return ['initial-target', 'target-retained', 'target-trapped', 'hunter-emerged', 'better-opportunity', 'target-missing'].includes(String(value))
}
