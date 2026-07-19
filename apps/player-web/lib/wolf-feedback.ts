import { getWolfLegalSummary, type BoardState } from '@wolf-sheep/game-core'

export function newlyTrappedWolfIds(before: BoardState, after: BoardState): string[] {
  const beforeMoves = new Map(getWolfLegalSummary(before).map((wolf) => [wolf.wolfId, wolf.steps + wolf.jumps]))
  return getWolfLegalSummary(after)
    .filter((wolf) => (beforeMoves.get(wolf.wolfId) ?? 0) > 0 && wolf.steps + wolf.jumps === 0)
    .map((wolf) => wolf.wolfId)
}
