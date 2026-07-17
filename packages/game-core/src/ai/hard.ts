import type { Action, BoardState } from '../types'
import { applyAction, endWolfTurn, listLegalActions } from '../rules'
import { evaluateScore } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'
import { pickNormal } from './normal'

export type HardBudgets = {
  maxNodes: number
  /** Omit for deterministic node-limited analysis; gameplay uses 12ms by default. */
  maxMs?: number
}

const DEFAULT_BUDGETS: HardBudgets = { maxNodes: 4000, maxMs: 12 }

function clockNow() {
  return Date.now()
}

function exhausted(nodes: { n: number }, budget: HardBudgets, start: number) {
  return nodes.n >= budget.maxNodes || (budget.maxMs !== undefined && clockNow() - start >= budget.maxMs)
}

/**
 * Resolve the most damaging legal wolf turn, including any continuation of a
 * capture chain. The result is always a completed wolf turn or a terminal state.
 */
function worstWolfTurn(
  state: BoardState,
  nodes: { n: number },
  budget: HardBudgets,
  start: number,
): BoardState {
  if (state.status !== 'playing' || exhausted(nodes, budget, start)) return state
  // A wolf step ends the turn. Only a jump with an active chain can recurse.
  if (state.toMove !== 'wolf') return state

  const wolfState: BoardState = state
  if (wolfState.chain) {
    const ended = endWolfTurn(wolfState)
    let worst: BoardState = ended.ok ? ended.state : wolfState
    let worstScore = evaluateScore(worst)

    for (const action of listLegalActions(wolfState)) {
      if (exhausted(nodes, budget, start)) break
      nodes.n++
      const result = applyAction(wolfState, action)
      if (!result.ok) continue
      const candidate = worstWolfTurn(result.state, nodes, budget, start)
      const score = evaluateScore(candidate)
      if (score < worstScore) {
        worst = candidate
        worstScore = score
      }
    }
    return worst
  }

  const actions = listLegalActions(wolfState)
  if (actions.length === 0) return wolfState

  let worst: BoardState = wolfState
  let worstScore = Infinity
  for (const action of actions) {
    if (exhausted(nodes, budget, start)) break
    nodes.n++
    const result = applyAction(wolfState, action)
    if (!result.ok) continue
    const candidate = worstWolfTurn(result.state, nodes, budget, start)
    const score = evaluateScore(candidate)
    if (score < worstScore) {
      worst = candidate
      worstScore = score
    }
  }
  return worstScore === Infinity ? wolfState : worst
}

/** Evaluate one additional sheep decision after the worst complete wolf turn. */
function bestNextSheepResponse(
  state: BoardState,
  nodes: { n: number },
  budget: HardBudgets,
  start: number,
): { score: number; completed: boolean } {
  if (state.status !== 'playing' || state.toMove !== 'sheep' || exhausted(nodes, budget, start)) {
    return { score: evaluateScore(state), completed: false }
  }

  let best = -Infinity
  let completed = false
  for (const action of listLegalActions(state)) {
    if (exhausted(nodes, budget, start)) break
    nodes.n++
    const result = applyAction(state, action)
    if (!result.ok) continue
    const afterWolf = worstWolfTurn(result.state, nodes, budget, start)
    best = Math.max(best, evaluateScore(afterWolf))
    completed = true
  }
  return {
    score: best === -Infinity ? evaluateScore(state) : best,
    completed,
  }
}

export type HardPickMeta = {
  degraded: boolean
  nodes: number
  elapsedMs: number
  /** True when the chosen decision evaluated at least one next sheep response. */
  lookaheadCompleted: boolean
}

/**
 * Hard is deliberately bounded: one sheep decision, the worst complete wolf
 * reply, then one best sheep response. It is not an exhaustive game solver.
 */
export function pickHardWithMeta(
  state: BoardState,
  rng: Rng,
  budgets: HardBudgets = DEFAULT_BUDGETS,
): { action: Action; meta: HardPickMeta } {
  const actions = listLegalActions(state)
  if (actions.length === 0) throw new Error('hard: no legal sheep moves')

  const start = clockNow()
  const nodes = { n: 0 }
  let bestScore = -Infinity
  let lookaheadCompleted = false
  const tops: Action[] = []
  const applicable = actions.flatMap((action) => {
    const result = applyAction(state, action)
    return result.ok ? [{ action, result, immediateSheepScore: evaluateScore(result.state) }] : []
  })
  const normalBest = Math.max(...applicable.map((item) => item.immediateSheepScore))

  for (const { action, result, immediateSheepScore } of applicable) {
    // Hard refines Normal's safest immediate choices; bounded lookahead must not
    // justify an immediately inferior move through a horizon artifact.
    if (immediateSheepScore < normalBest) continue
    if (exhausted(nodes, budgets, start)) break
    nodes.n++

    const afterWolf = worstWolfTurn(result.state, nodes, budgets, start)
    const immediate = evaluateScore(afterWolf)
    const next = bestNextSheepResponse(afterWolf, nodes, budgets, start)
    const score = immediate * 0.35 + next.score * 0.65
    lookaheadCompleted ||= next.completed

    if (score > bestScore) {
      bestScore = score
      tops.length = 0
      tops.push(action)
    } else if (score === bestScore) {
      tops.push(action)
    }
  }

  const elapsedMs = clockNow() - start
  if (tops.length === 0) {
    return {
      action: pickNormal(state, rng),
      meta: { degraded: true, nodes: nodes.n, elapsedMs, lookaheadCompleted: false },
    }
  }
  return {
    action: tops[pickIndex(rng, tops.length)]!,
    meta: { degraded: false, nodes: nodes.n, elapsedMs, lookaheadCompleted },
  }
}

export function pickHard(
  state: BoardState,
  rng: Rng,
  budgets: HardBudgets = DEFAULT_BUDGETS,
): Action {
  return pickHardWithMeta(state, rng, budgets).action
}
