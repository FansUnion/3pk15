import { createSeededRng } from '../ai/index'
import { evaluateScore } from '../ai/evaluate'
import { applyAction, boardPositionKey, endWolfTurn, listLegalActions } from '../rules'
import type { Action, BoardState } from '../types'

export type DiagnosticWolfStrategy = 'random' | 'mixed' | 'chain-aware'

function entersRepeatedPosition(state: BoardState) {
  return (state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= 2
}

/** Player proxy used by candidate gates; mixed avoids reversible loops when another legal action exists. */
export function chooseDiagnosticWolfAction(
  state: BoardState,
  actions: Action[],
  random: ReturnType<typeof createSeededRng>,
  strategy: DiagnosticWolfStrategy,
) {
  if (strategy === 'random') return actions[Math.floor(random.nextFloat() * actions.length)]!

  const evaluated = actions.map((action) => {
    const result = applyAction(state, action)
    return {
      action,
      score: result.ok ? evaluateScore(result.state) : Infinity,
      repeats: result.ok && entersRepeatedPosition(result.state),
    }
  })
  const nonRepeating = evaluated.filter((item) => !item.repeats)
  const pool = nonRepeating.length > 0 ? nonRepeating : evaluated
  if (random.nextFloat() < 0.35) return pool[Math.floor(random.nextFloat() * pool.length)]!.action

  const best = Math.min(...pool.map((item) => item.score))
  const candidates = pool.filter((item) => item.score === best)
  return candidates[Math.floor(random.nextFloat() * candidates.length)]!.action
}

export function shouldContinueDiagnosticChain(
  state: BoardState,
  random: ReturnType<typeof createSeededRng>,
): boolean {
  if (!state.chain || state.status !== 'playing') return false
  const ended = endWolfTurn(state)
  if (!ended.ok) return false
  const continuations = listLegalActions(state)
  if (continuations.length === 0) return false
  const endScore = evaluateScore(ended.state)
  const bestContinuation = Math.min(...continuations.map((action) => {
    const result = applyAction(state, action)
    return result.ok ? evaluateScore(result.state) : Infinity
  }))
  return bestContinuation < endScore || (bestContinuation === endScore && random.nextFloat() >= 0.5)
}
