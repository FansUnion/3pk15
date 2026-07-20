import { getWolfLegalSummary, listWolfActionsAsIfTurn, type BoardState } from '@wolf-sheep/game-core'

export function newlyTrappedWolfIds(before: BoardState, after: BoardState): string[] {
  const beforeMoves = new Map(getWolfLegalSummary(before).map((wolf) => [wolf.wolfId, wolf.steps + wolf.jumps]))
  return getWolfLegalSummary(after)
    .filter((wolf) => (beforeMoves.get(wolf.wolfId) ?? 0) > 0 && wolf.steps + wolf.jumps === 0)
    .map((wolf) => wolf.wolfId)
}

export function threatenedSheepIds(state: BoardState): string[] {
  const threatened = new Set<string>()
  for (const action of listWolfActionsAsIfTurn(state)) {
    if (action.type !== 'jump') continue
    const sheep = state.pieces.find((piece) => piece.side === 'sheep'
      && piece.r === action.to.r
      && piece.c === action.to.c)
    if (sheep) threatened.add(sheep.id)
  }
  return [...threatened]
}
