import { adjacentLevels, getLevel, isLevelCleared, type SaveGame } from '@wolf-sheep/game-core'

export type HomeContinuation = {
  levelId: string
  mode: 'start' | 'continue' | 'next' | 'replay'
}

export function resolveHomeContinuation(save: SaveGame): HomeContinuation {
  const lastLevel = save.lastPlayedLevelId ? getLevel(save.lastPlayedLevelId) : undefined
  if (!lastLevel) return { levelId: 'spring-01', mode: 'start' }
  if (!isLevelCleared(save, lastLevel.id)) return { levelId: lastLevel.id, mode: 'continue' }
  const next = adjacentLevels(lastLevel.id).next
  return next
    ? { levelId: next.id, mode: 'next' }
    : { levelId: lastLevel.id, mode: 'replay' }
}
