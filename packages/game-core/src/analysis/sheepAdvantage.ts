import { getWolfLegalSummary, listLegalActions, listWolfActionsAsIfTurn } from '../rules'
import type { BoardState } from '../types'

export type SheepAdvantageMetrics = {
  sheepCount: number
  wolfMoveCount: number
  wolfJumpCount: number
  trappedWolfCount: number
  sheepMoveCount: number
  threatenedSheepCount: number
  pressureRatio: number
  converted: boolean
}

/**
 * Snapshot metrics for explaining a sheep defensive position. These metrics
 * are evidence, not a replacement for a game result or a perfect solver.
 */
export function measureSheepAdvantage(state: BoardState): SheepAdvantageMetrics {
  const wolfSummary = getWolfLegalSummary(state)
  const wolfMoveCount = wolfSummary.reduce((sum, wolf) => sum + wolf.steps + wolf.jumps, 0)
  const wolfJumpCount = wolfSummary.reduce((sum, wolf) => sum + wolf.jumps, 0)
  const trappedWolfCount = wolfSummary.filter((wolf) => wolf.steps + wolf.jumps === 0).length
  const sheepMoveCount = listLegalActions({ ...state, toMove: 'sheep', chain: null })
    .filter((action) => action.type === 'step').length
  const threatenedSheep = new Set(
    listWolfActionsAsIfTurn(state)
      .filter((action) => action.type === 'jump')
      .map((action) => `${action.to.r},${action.to.c}`),
  )
  const sheepCount = state.pieces.filter((piece) => piece.side === 'sheep').length
  const pressureRatio = wolfSummary.length === 0 ? 1 : trappedWolfCount / wolfSummary.length
  return {
    sheepCount,
    wolfMoveCount,
    wolfJumpCount,
    trappedWolfCount,
    sheepMoveCount,
    threatenedSheepCount: threatenedSheep.size,
    pressureRatio,
    converted: state.status === 'lost' && trappedWolfCount === wolfSummary.length,
  }
}
