import type { Action, BoardState } from '../types'
import { applyAction, listLegalActions, getWolfLegalSummary, listWolfActionsAsIfTurn } from '../rules'
import { posKey } from '../board'

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
}

const W = {
  material: 12,
  wolfMobility: -1.5,
  cluster: 0.8,
  advance: 0.4,
  surround: 2.5,
  safety: 5,
  sheepMobility: 0.6,
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

  const total =
    W.material * material +
    W.wolfMobility * wolfMoves +
    W.cluster * cluster +
    W.advance * advance +
    W.surround * surround
    + W.safety * safety
    + W.sheepMobility * sheepMobility

  if (state.status === 'won') {
    return { total: -10_000, material, wolfMobility: wolfMoves, cluster, advance, surround, safety, sheepMobility }
  }
  if (state.status === 'lost' || wolfMoves === 0) {
    return { total: 10_000, material, wolfMobility: wolfMoves, cluster, advance, surround, safety, sheepMobility }
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
  }
}

export function evaluateScore(state: BoardState): number {
  return evaluate(state).total
}

export type SheepActionAnalysis = {
  action: Action
  score: number
  directCaptures: number
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
    return [{
      action,
      score: evaluateScore(result.state),
      directCaptures: listWolfActionsAsIfTurn(result.state).filter((candidate) => candidate.type === 'jump').length,
      threatenedSheep,
      movedThreatenedSheep: action.type !== 'pass' && beforeThreatened.has(action.pieceId),
    }]
  })

  return candidates.map((candidate) => {
    const dominated = candidates.some((other) => other !== candidate
      && other.directCaptures < candidate.directCaptures
      && other.score >= candidate.score)
    const explanation: SheepActionAnalysis['explanation'] = candidate.action.type === 'pass'
      ? 'pass'
      : dominated
        ? 'blunder'
        : candidate.threatenedSheep.length === 0 && candidate.movedThreatenedSheep
          ? 'escape'
          : candidate.directCaptures === 0
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
