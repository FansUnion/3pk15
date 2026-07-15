import type { Action, BoardState } from '../types'
import { applyAction, listLegalActions } from '../rules'
import { evaluateScore } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'
import { pickNormal } from './normal'

export type HardBudgets = {
  maxNodes: number
  maxMs: number
}

const DEFAULT_BUDGETS: HardBudgets = { maxNodes: 4000, maxMs: 12 }

type SearchResult = { score: number; nodes: number }

/**
 * After a sheep move, approximate wolf reply by greedy-min (minimize sheep score).
 */
function wolfGreedyMin(state: BoardState, nodes: { n: number }, budget: HardBudgets): number {
  if (state.status !== 'playing') return evaluateScore(state)
  const wolfState = { ...state, toMove: 'wolf' as const, chain: null }
  const actions = listLegalActions(wolfState)
  if (actions.length === 0) return evaluateScore(wolfState)

  let worst = Infinity
  for (const action of actions) {
    if (nodes.n >= budget.maxNodes) break
    nodes.n++
    const result = applyAction(wolfState, action)
    if (!result.ok) continue
    let after = result.state
    if (after.chain && after.status === 'playing') {
      const cont = listLegalActions(after)
      if (cont.length === 0 || cont[0]!.type !== 'jump') {
        after = { ...after, chain: null, toMove: 'sheep' }
      }
    }
    const score = evaluateScore(after)
    if (score < worst) worst = score
  }
  return worst === Infinity ? evaluateScore(state) : worst
}

function searchSheep(
  state: BoardState,
  depth: number,
  nodes: { n: number },
  start: number,
  budget: HardBudgets,
): SearchResult {
  if (
    depth <= 0 ||
    state.status !== 'playing' ||
    nodes.n >= budget.maxNodes ||
    performance.now() - start >= budget.maxMs
  ) {
    return { score: evaluateScore(state), nodes: nodes.n }
  }

  const actions = listLegalActions(state)
  if (actions.length === 0) return { score: evaluateScore(state), nodes: nodes.n }

  let best = -Infinity
  for (const action of actions) {
    if (nodes.n >= budget.maxNodes || performance.now() - start >= budget.maxMs) break
    nodes.n++
    const result = applyAction(state, action)
    if (!result.ok) continue
    const afterWolf = wolfGreedyMin(result.state, nodes, budget)
    if (afterWolf > best) best = afterWolf
  }
  return { score: best === -Infinity ? evaluateScore(state) : best, nodes: nodes.n }
}

export function pickHard(
  state: BoardState,
  rng: Rng,
  budgets: HardBudgets = DEFAULT_BUDGETS,
): Action {
  const actions = listLegalActions(state)
  if (actions.length === 0) throw new Error('hard: no legal sheep moves')

  const start = performance.now()
  const nodes = { n: 0 }
  let bestScore = -Infinity
  const tops: Action[] = []

  for (const action of actions) {
    if (nodes.n >= budgets.maxNodes || performance.now() - start >= budgets.maxMs) break
    nodes.n++
    const result = applyAction(state, action)
    if (!result.ok) continue
    const after = wolfGreedyMin(result.state, nodes, budgets)
    const deep = searchSheep(
      { ...result.state, toMove: 'sheep', chain: null },
      0,
      nodes,
      start,
      budgets,
    )
    const score = Math.max(after, deep.score * 0.01 + after)
    if (score > bestScore) {
      bestScore = score
      tops.length = 0
      tops.push(action)
    } else if (score === bestScore) {
      tops.push(action)
    }
  }

  if (tops.length === 0) {
    return pickNormal(state, rng)
  }
  return tops[pickIndex(rng, tops.length)]!
}
