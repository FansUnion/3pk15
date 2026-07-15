import type { Action, BoardState } from '../types'
import { applyAction, listLegalActions } from '../rules'
import { evaluateScore } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'

/** Greedy: pick max evaluate; ties broken by rng. */
export function pickNormal(state: BoardState, rng: Rng): Action {
  const actions = listLegalActions(state)
  if (actions.length === 0) throw new Error('normal: no legal sheep moves')

  let best = -Infinity
  const tops: Action[] = []
  for (const action of actions) {
    const result = applyAction(state, action)
    if (!result.ok) continue
    const score = evaluateScore(result.state)
    if (score > best) {
      best = score
      tops.length = 0
      tops.push(action)
    } else if (score === best) {
      tops.push(action)
    }
  }
  if (tops.length === 0) throw new Error('normal: no applicable moves')
  return tops[pickIndex(rng, tops.length)]!
}
