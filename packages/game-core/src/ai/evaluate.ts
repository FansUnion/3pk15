import { MAX_CHAIN, type Action, type BoardState } from '../types'
import { applyAction, boardPositionKey, listLegalActions, getWolfLegalSummary, listWolfActionsAsIfTurn } from '../rules'
import { inBounds, ORTHO, posKey } from '../board'

/**
 * Higher is better for sheep (defender).
 * Weights are starting points for calibration (see docs/MVP????/05).
 */
export type EvalBreakdown = {
  total: number
  material: number
  wolfMobility: number
  cluster: number
  advance: number
  surround: number
  safety: number
  sheepMobility: number
  captureChainRisk: number
  trappedWolves: number
  weakestWolfMobility: number
  repetitionPressure: number
  persistentHunterRisk: number
  terminalUrgency: number
  targetPressure: number
}

const W = {
  material: 12,
  wolfMobility: -1.5,
  cluster: 0.8,
  advance: 0.4,
  surround: 2.5,
  safety: 5,
  sheepMobility: 0.6,
  captureChainRisk: -7,
  trappedWolves: 18,
  weakestWolfMobility: -1.2,
  repetitionPressure: -2,
  persistentHunterRisk: 0,
  terminalUrgency: 0,
  targetPressure: 0,
}

function sheepPositions(state: BoardState) {
  return state.pieces.filter((p) => p.side === 'sheep')
}

function wolfPositions(state: BoardState) {
  return state.pieces.filter((p) => p.side === 'wolf')
}

/** Average pairwise Chebyshev proximity among sheep (higher = tighter). */
function clusterScore(state: BoardState): number {
  const sheep = sheepPositions(state)
  if (sheep.length < 2) return 0
  let sum = 0
  let n = 0
  for (let i = 0; i < sheep.length; i++) {
    for (let j = i + 1; j < sheep.length; j++) {
      const a = sheep[i]!
      const b = sheep[j]!
      const dist = Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c))
      sum += Math.max(0, 5 - dist)
      n++
    }
  }
  return n === 0 ? 0 : sum / n
}

/** Prefer sheep not all stuck on row 1. */
function advanceScore(state: BoardState): number {
  const sheep = sheepPositions(state)
  if (sheep.length === 0) return 0
  return sheep.reduce((s, p) => s + p.r, 0) / sheep.length
}

/** Empty ortho neighbors of wolves occupied by sheep or rocks count as pressing. */
function surroundScore(state: BoardState): number {
  const occ = new Set(state.pieces.map((p) => posKey(p.r, p.c)))
  let score = 0
  for (const w of wolfPositions(state)) {
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const
    for (const [dr, dc] of dirs) {
      const k = posKey(w.r + dr, w.c + dc)
      if (state.rocks.has(k) || occ.has(k)) score += 1
    }
  }
  return score
}

/** Penalize positions where wolves already have a direct jump capture. */
function safetyScore(wolfJumps: number): number {
  return -wolfJumps
}

/** Keep sheep from choosing moves that leave the flock with no useful exits. */
function sheepMobilityScore(state: BoardState): number {
  if (state.status !== 'playing') return 0
  return listLegalActions({ ...state, toMove: 'sheep' as const, chain: null })
    .filter((action) => action.type === 'step').length
}

/** Maximum sheep a wolf can capture during its next complete turn. */
export function maxCapturesInWolfTurn(state: BoardState): number {
  const sheep = new Set(state.pieces.filter((piece) => piece.side === 'sheep').map((piece) => posKey(piece.r, piece.c)))
  const wolves = state.pieces.filter((piece) => piece.side === 'wolf')

  function visit(r: number, c: number, remainingSheep: Set<string>, otherWolves: Set<string>, depth: number): number {
    if (depth >= MAX_CHAIN) return 0
    let best = 0
    for (const direction of ORTHO) {
      const through = posKey(r + direction.r, c + direction.c)
      const targetR = r + direction.r * 2
      const targetC = c + direction.c * 2
      if (!inBounds(targetR, targetC)) continue
      if (state.rocks.has(through) || otherWolves.has(through) || remainingSheep.has(through)) continue
      const target = posKey(targetR, targetC)
      if (!remainingSheep.has(target)) continue
      const nextSheep = new Set(remainingSheep)
      nextSheep.delete(target)
      best = Math.max(best, 1 + visit(targetR, targetC, nextSheep, otherWolves, depth + 1))
    }
    return best
  }

  return wolves.reduce((best, wolf) => {
    const otherWolves = new Set(wolves.filter((candidate) => candidate.id !== wolf.id).map((candidate) => posKey(candidate.r, candidate.c)))
    return Math.max(best, visit(wolf.r, wolf.c, sheep, otherWolves, 0))
  }, 0)
}

/** Immediate jumps plus the best one-step setup for a single recurring hunter. */
export function persistentHunterRisk(state: BoardState): number {
  const wolves = state.pieces.filter((piece) => piece.side === 'wolf')
  const actions = listWolfActionsAsIfTurn(state)
  const sheep = new Set(state.pieces.filter((piece) => piece.side === 'sheep').map((piece) => posKey(piece.r, piece.c)))
  const occupiedWithout = (wolfId: string) => new Set(state.pieces.filter((piece) => piece.id !== wolfId).map((piece) => posKey(piece.r, piece.c)))
  return wolves.reduce((highest, wolf) => {
    const direct = actions.filter((action) => action.type === 'jump' && action.pieceId === wolf.id).length
    const occupied = occupiedWithout(wolf.id)
    const setup = actions
      .filter((action): action is Extract<Action, { type: 'step' }> => action.type === 'step' && action.pieceId === wolf.id)
      .reduce((best, action) => {
        let future = 0
        for (const direction of ORTHO) {
          const through = posKey(action.to.r + direction.r, action.to.c + direction.c)
          const target = posKey(action.to.r + direction.r * 2, action.to.c + direction.c * 2)
          if (!inBounds(action.to.r + direction.r * 2, action.to.c + direction.c * 2)) continue
          if (state.rocks.has(through) || occupied.has(through)) continue
          if (sheep.has(target)) future += 1
        }
        return Math.max(best, future)
      }, 0)
    return Math.max(highest, direct * 2 + setup)
  }, 0)
}

export function evaluate(state: BoardState): EvalBreakdown {
  const sheepCount = sheepPositions(state).length
  const summary = getWolfLegalSummary(state)
  const wolfMoves = summary.reduce((s, x) => s + x.steps + x.jumps, 0)
  const wolfJumps = summary.reduce((s, x) => s + x.jumps, 0)
  const material = sheepCount
  const cluster = clusterScore(state)
  const advance = advanceScore(state)
  const surround = surroundScore(state)
  const safety = safetyScore(wolfJumps)
  const sheepMobility = sheepMobilityScore(state)
  const captureChainRisk = maxCapturesInWolfTurn(state)
  const trappedWolves = summary.filter((wolf) => wolf.steps + wolf.jumps === 0).length
  const weakestWolfMobility = summary.length === 0
    ? 0
    : Math.min(...summary.map((wolf) => wolf.steps + wolf.jumps))
  const repetitionPressure = state.repetitionCounts.get(boardPositionKey(state)) ?? 0
  const persistentHunter = persistentHunterRisk(state)
  const urgencyRatio = state.eatenSheep / Math.max(1, state.targetEaten)
  const terminalUrgency = urgencyRatio * (wolfJumps * 8 + captureChainRisk * 12 + persistentHunter * 4)
  const averageWolfMobility = summary.length === 0 ? 0 : wolfMoves / summary.length
  const targetPressure = Math.max(0, averageWolfMobility - weakestWolfMobility)

  const total =
    W.material * material +
    W.wolfMobility * wolfMoves +
    W.cluster * cluster +
    W.advance * advance +
    W.surround * surround
    + W.safety * safety
    + W.sheepMobility * sheepMobility
    + W.captureChainRisk * captureChainRisk
    + W.trappedWolves * trappedWolves
    + W.weakestWolfMobility * weakestWolfMobility
    + W.repetitionPressure * repetitionPressure
    + W.persistentHunterRisk * persistentHunter
    + W.terminalUrgency * terminalUrgency
    + W.targetPressure * targetPressure

  if (state.status === 'won') {
    return { total: -100_000 + state.plyCount, material, wolfMobility: wolfMoves, cluster, advance, surround, safety, sheepMobility, captureChainRisk, trappedWolves, weakestWolfMobility, repetitionPressure, persistentHunterRisk: persistentHunter, terminalUrgency, targetPressure }
  }
  if (state.status === 'lost' || wolfMoves === 0) {
    return { total: 100_000 - state.plyCount, material, wolfMobility: wolfMoves, cluster, advance, surround, safety, sheepMobility, captureChainRisk, trappedWolves, weakestWolfMobility, repetitionPressure, persistentHunterRisk: persistentHunter, terminalUrgency, targetPressure }
  }
  if (state.status === 'draw') {
    return { total: 2_000 - state.plyCount, material, wolfMobility: wolfMoves, cluster, advance, surround, safety, sheepMobility, captureChainRisk, trappedWolves, weakestWolfMobility, repetitionPressure, persistentHunterRisk: persistentHunter, terminalUrgency, targetPressure }
  }

  return {
    total,
    material,
    wolfMobility: wolfMoves,
    cluster,
    advance,
    surround,
    safety,
    sheepMobility,
    captureChainRisk,
    trappedWolves,
    weakestWolfMobility,
    repetitionPressure,
    persistentHunterRisk: persistentHunter,
    terminalUrgency,
    targetPressure,
  }
}

export function evaluateScore(state: BoardState): number {
  return evaluate(state).total
}

export type SheepActionAnalysis = {
  action: Action
  score: number
  directCaptures: number
  maxCaptureChain: number
  wolfMobility: number
  trappedWolves: number
  weakestWolfMobility: number
  repetitionPressure: number
  threatenedSheep: string[]
  movedThreatenedSheep: boolean
  dominated: boolean
  explanation: 'pass' | 'escape' | 'block' | 'sacrifice' | 'equivalent' | 'blunder'
}

export function analyzeSheepActions(state: BoardState): SheepActionAnalysis[] {
  const beforeThreatened = threatenedSheepIds(state)
  const candidates = listLegalActions(state).flatMap((action) => {
    const result = applyAction(state, action)
    if (!result.ok) return []
    const threatenedSheep = [...threatenedSheepIds(result.state)]
    const wolfSummary = getWolfLegalSummary(result.state)
    return [{
      action,
      score: evaluateScore(result.state),
      directCaptures: listWolfActionsAsIfTurn(result.state).filter((candidate) => candidate.type === 'jump').length,
      maxCaptureChain: maxCapturesInWolfTurn(result.state),
      wolfMobility: wolfSummary.reduce((sum, wolf) => sum + wolf.steps + wolf.jumps, 0),
      trappedWolves: wolfSummary.filter((wolf) => wolf.steps + wolf.jumps === 0).length,
      weakestWolfMobility: wolfSummary.length === 0 ? 0 : Math.min(...wolfSummary.map((wolf) => wolf.steps + wolf.jumps)),
      repetitionPressure: result.state.repetitionCounts.get(boardPositionKey(result.state)) ?? 0,
      threatenedSheep,
      movedThreatenedSheep: action.type !== 'pass' && beforeThreatened.has(action.pieceId),
    }]
  })

  return candidates.map((candidate) => {
    const dominated = candidates.some((other) => other !== candidate
      && other.maxCaptureChain <= candidate.maxCaptureChain
      && other.directCaptures <= candidate.directCaptures
      && other.wolfMobility <= candidate.wolfMobility
      && other.trappedWolves >= candidate.trappedWolves
      && (other.maxCaptureChain < candidate.maxCaptureChain
        || other.directCaptures < candidate.directCaptures
        || other.wolfMobility < candidate.wolfMobility
        || other.trappedWolves > candidate.trappedWolves))
    const explanation: SheepActionAnalysis['explanation'] = candidate.action.type === 'pass'
      ? 'pass'
      : dominated
        ? 'blunder'
        : candidate.threatenedSheep.length === 0 && candidate.movedThreatenedSheep
          ? 'escape'
          : candidate.maxCaptureChain === 0
            ? 'block'
            : candidate.score > Math.max(...candidates.filter((other) => other !== candidate).map((other) => other.score), -Infinity)
              ? 'sacrifice'
              : 'equivalent'
    return { ...candidate, dominated, explanation }
  })
}

function threatenedSheepIds(state: BoardState) {
  const byPosition = new Map(state.pieces.filter((piece) => piece.side === 'sheep').map((piece) => [`${piece.r},${piece.c}`, piece.id]))
  return new Set(listWolfActionsAsIfTurn(state)
    .filter((action) => action.type === 'jump')
    .map((action) => byPosition.get(`${action.to.r},${action.to.c}`))
    .filter((id): id is string => Boolean(id)))
}
