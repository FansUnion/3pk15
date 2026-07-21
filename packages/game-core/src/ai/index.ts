import type { Action, AiBehaviorProfile, AiOpponentMemory, AiProfile, BoardState, Difficulty } from '../types'
import { getLevel, type ChapterId } from '../content/levels'
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
  /** Legacy diagnostic algorithm. Production callers provide `profile` instead. */
  difficulty?: Difficulty
  profile?: AiProfile
  /** Overrides the level contract only for diagnostics. Production resolves it from state.levelId. */
  behavior?: AiBehaviorProfile
  /** Mutable caller-owned match memory. It is updated only after a sheep decision succeeds. */
  memory?: AiOpponentMemory
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
    const level = getLevel(state.levelId)
    const behavior = ctx.behavior ?? (level ? { style: level.aiStyle, intent: level.opponentIntent } : undefined)
    const result = pickProfiledSheepActionWithMeta(state, ctx.profile, ctx.rng, ctx.budgets, behavior, ctx.memory)
    if (ctx.memory) Object.assign(ctx.memory, result.meta.nextMemory)
    return result.action
  }

  const difficulty = ctx.difficulty ?? 'normal'
  switch (difficulty) {
    case 'easy':
      return pickEasy(state, ctx.rng)
    case 'normal':
      return pickNormal(state, ctx.rng)
    case 'hard':
      return pickHard(state, ctx.rng, ctx.budgets)
    default: {
      const _exhaustive: never = difficulty
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
  const level = getLevel(state.levelId)
  const behavior = ctx.behavior ?? (level ? { style: level.aiStyle, intent: level.opponentIntent } : undefined)
  return pickProfiledSheepActionWithMeta(state, ctx.profile, ctx.rng, ctx.budgets, behavior, ctx.memory)
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
export { createAiOpponentMemory, normalizeAiOpponentMemory, observeAiOpponentAction } from './memory'
export type { Rng } from './rng'
export type { AiProfileConfig, HardBudgets, HardPickMeta } from './hard'
