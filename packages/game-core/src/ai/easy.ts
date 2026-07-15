import type { Action, BoardState } from '../types'
import { applyAction, listLegalActions } from '../rules'
import { evaluateScore } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'

/** Softmax-ish: prefer slightly better moves but keep randomness. */
export function pickEasy(state: BoardState, rng: Rng): Action {
  const actions = listLegalActions(state)
  if (actions.length === 0) throw new Error('easy: no legal sheep moves')

  const scored = actions.map((action) => {
    const result = applyAction(state, action)
    if (!result.ok) return { action, score: -Infinity }
    return { action, score: evaluateScore(result.state) }
  })

  // Temperature-ish: weight = exp(score / T) with soft floor
  const T = 8
  const max = Math.max(...scored.map((s) => s.score))
  const weights = scored.map((s) => Math.exp((s.score - max) / T) + 0.15)
  const sum = weights.reduce((a, b) => a + b, 0)
  let r = rng.nextFloat() * sum
  for (let i = 0; i < scored.length; i++) {
    r -= weights[i]!
    if (r <= 0) return scored[i]!.action
  }
  return scored[pickIndex(rng, scored.length)]!.action
}
