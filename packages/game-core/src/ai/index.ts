import type { Action, BoardState, Difficulty } from '../types'
import type { ChapterId } from '../content/levels'
import { pickEasy } from './easy'
import { pickNormal } from './normal'
import { pickHard, type HardBudgets } from './hard'
import type { Rng } from './rng'
import { createSeededRng } from './rng'

export type AiContext = {
  difficulty: Difficulty
  rng: Rng
  budgets?: HardBudgets
}

export function pickSheepAction(state: BoardState, ctx: AiContext): Action {
  if (state.status !== 'playing') {
    throw new Error('pickSheepAction: game not playing')
  }
  if (state.toMove !== 'sheep') {
    throw new Error('pickSheepAction: not sheep turn')
  }

  switch (ctx.difficulty) {
    case 'easy':
      return pickEasy(state, ctx.rng)
    case 'normal':
      return pickNormal(state, ctx.rng)
    case 'hard':
      return pickHard(state, ctx.rng, ctx.budgets)
    default: {
      const _exhaustive: never = ctx.difficulty
      return _exhaustive
    }
  }
}

export type { ChapterId }

export function tierForChapter(chapterId: ChapterId): Difficulty {
  switch (chapterId) {
    case 'spring':
      return 'easy'
    case 'summer':
    case 'autumn':
      return 'normal'
    case 'winter':
      return 'hard'
  }
}

export { createSeededRng, pickEasy, pickNormal, pickHard }
export type { Rng, HardBudgets }
