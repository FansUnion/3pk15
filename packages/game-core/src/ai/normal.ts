import type { Action, BoardState } from '../types'
import { listLegalActions } from '../rules'
import { analyzeSheepActions } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'

/** Greedy: pick max evaluate; ties broken by rng. */
export function pickNormal(state: BoardState, rng: Rng): Action {
  const actions = listLegalActions(state)
  if (actions.length === 0) throw new Error('normal: no legal sheep moves')

  let best = -Infinity
  const tops: Action[] = []
  const analyses = analyzeSheepActions(state)
  const safePool = analyses.some((analysis) => !analysis.dominated) ? analyses.filter((analysis) => !analysis.dominated) : analyses
  for (const { action, score } of safePool) {
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
