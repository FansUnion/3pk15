import type { Action, AiProfile, BoardState, Difficulty } from '../types'
import type { ChapterId } from '../content/levels'
import { pickEasy } from './easy'
import { pickNormal } from './normal'
import {
  pickHard,
  pickHardWithMeta,
  pickProfiledSheepActionWithMeta,
  type HardBudgets,
  type HardPickMeta,
} from './hard'
import type { Rng } from './rng'
import { createSeededRng } from './rng'

export type AiContext = {
  difficulty: Difficulty
  profile?: AiProfile
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

  if (ctx.profile) {
    return pickProfiledSheepActionWithMeta(state, ctx.profile, ctx.rng, ctx.budgets).action
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

export function pickSheepActionWithMeta(
  state: BoardState,
  ctx: AiContext & { profile: AiProfile },
): { action: Action; meta: HardPickMeta } {
  if (state.status !== 'playing') throw new Error('pickSheepActionWithMeta: game not playing')
  if (state.toMove !== 'sheep') throw new Error('pickSheepActionWithMeta: not sheep turn')
  return pickProfiledSheepActionWithMeta(state, ctx.profile, ctx.rng, ctx.budgets)
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

export {
  AI_PROFILE_CONFIG,
  SHEEP_AI_ALGORITHM_VERSION,
  pickHard,
  pickHardWithMeta,
  pickProfiledSheepActionWithMeta,
} from './hard'
export { createSeededRng, pickEasy, pickNormal }
export type { Rng } from './rng'
export type { AiProfileConfig, HardBudgets, HardPickMeta } from './hard'
