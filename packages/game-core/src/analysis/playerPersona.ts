import type { Rng } from '../ai/rng'
import { applyAction, boardPositionKey, endWolfTurn, getWolfLegalSummary, listLegalActions, listWolfActionsAsIfTurn } from '../rules'
import type { Action, BoardState } from '../types'

export type PlayerPersona = 'novice' | 'regular' | 'skilled' | 'expert'

export const PLAYER_PERSONA_LABEL_ZH: Record<PlayerPersona, string> = {
  novice: '新手狼',
  regular: '普通狼',
  skilled: '熟练狼',
  expert: '资深狼',
}

export const PLAYER_PERSONA_DESCRIPTION_ZH: Record<PlayerPersona, string> = {
  novice: '看到直接捕食会执行，其他时候接近随机移动。',
  regular: '会完成短连吃、保留退路，并使用基础双狼配合。',
  skilled: '会比较夹击、换线、岩石通道和捕食后的机动性。',
  expert: '会固定猎手、让其他狼控线，并在临近目标时主动竞速。',
}

export type PlayerPersonaMemory = {
  primaryHunterId: string | null
  capturesByWolf: Record<string, number>
  movesByWolf: Record<string, number>
}

export function createPlayerPersonaMemory(): PlayerPersonaMemory {
  return { primaryHunterId: null, capturesByWolf: {}, movesByWolf: {} }
}

function randomItem<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng.nextFloat() * items.length)]!
}

function wolfSpread(state: BoardState) {
  const wolves = state.pieces.filter((piece) => piece.side === 'wolf')
  let total = 0
  for (let left = 0; left < wolves.length; left += 1) {
    for (let right = left + 1; right < wolves.length; right += 1) {
      total += Math.abs(wolves[left]!.r - wolves[right]!.r) + Math.abs(wolves[left]!.c - wolves[right]!.c)
    }
  }
  return total
}

/** Wolf-oriented score intentionally independent from the production sheep evaluator. */
export function playerPersonaPositionScore(state: BoardState, memory: PlayerPersonaMemory, actingWolfId?: string) {
  if (state.status === 'won') return 100_000 - state.plyCount
  if (state.status === 'lost') return -100_000 + state.plyCount
  if (state.status === 'draw') return -2_000 + state.eatenSheep * 40

  const summary = getWolfLegalSummary(state)
  const wolfMoves = summary.reduce((sum, wolf) => sum + wolf.steps + wolf.jumps, 0)
  const directJumps = summary.reduce((sum, wolf) => sum + wolf.jumps, 0)
  const trapped = summary.filter((wolf) => wolf.steps + wolf.jumps === 0).length
  const weakest = summary.length === 0 ? 0 : Math.min(...summary.map((wolf) => wolf.steps + wolf.jumps))
  const remainingToWin = Math.max(0, state.targetEaten - state.eatenSheep)
  const urgency = 1 - remainingToWin / Math.max(1, state.targetEaten)
  const hunterBonus = actingWolfId && actingWolfId === memory.primaryHunterId ? 5 + urgency * 12 : 0
  const repetition = state.repetitionCounts.get(boardPositionKey(state)) ?? 0

  return state.eatenSheep * 55
    + directJumps * (14 + urgency * 18)
    + wolfMoves * 1.6
    + weakest * 2
    - trapped * 45
    - Math.max(0, wolfSpread(state) - 12) * 1.5
    - repetition * 10
    + hunterBonus
}

function scoreAction(
  state: BoardState,
  action: Action,
  persona: PlayerPersona,
  memory: PlayerPersonaMemory,
) {
  const result = applyAction(state, action)
  if (!result.ok) return -Infinity
  const capture = result.state.eatenSheep - state.eatenSheep
  let score = playerPersonaPositionScore(result.state, memory, action.type === 'pass' ? undefined : action.pieceId)
  score += capture * (persona === 'expert' ? 180 : persona === 'skilled' ? 150 : 120)

  if (persona === 'skilled' || persona === 'expert') {
    const sheepReplies = result.state.status === 'playing' && result.state.toMove === 'sheep'
      ? listLegalActions(result.state)
      : []
    if (sheepReplies.length > 0) {
      const replyScores = sheepReplies.slice(0, persona === 'expert' ? 20 : 10).map((reply) => {
        const replied = applyAction(result.state, reply)
        return replied.ok ? playerPersonaPositionScore(replied.state, memory, action.type === 'pass' ? undefined : action.pieceId) : score
      })
      score = Math.min(score, ...replyScores)
    }
  }
  return score
}

/**
 * Chooses a wolf action according to an explicit skill persona. Unlike diagnostic
 * policies, these personas do not call the production sheep evaluation function.
 */
export function choosePlayerPersonaAction(
  state: BoardState,
  actions: Action[],
  rng: Rng,
  persona: PlayerPersona,
  memory: PlayerPersonaMemory,
): Action {
  if (actions.length === 0) throw new Error('choosePlayerPersonaAction: no legal actions')
  const captures = actions.filter((action) => action.type === 'jump')
  if (persona === 'novice') return randomItem(captures.length > 0 ? captures : actions, rng)

  const candidatePool = captures.length > 0 ? captures : actions
  const evaluated = candidatePool.map((action) => ({ action, score: scoreAction(state, action, persona, memory) }))
  const randomRate = persona === 'regular' ? 0.2 : persona === 'skilled' ? 0.08 : 0
  if (rng.nextFloat() < randomRate) {
    const sorted = [...evaluated].sort((left, right) => right.score - left.score)
    return randomItem(sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2))), rng).action
  }
  const best = Math.max(...evaluated.map((candidate) => candidate.score))
  return randomItem(evaluated.filter((candidate) => candidate.score === best), rng).action
}

export function shouldContinuePlayerPersonaChain(
  state: BoardState,
  rng: Rng,
  persona: PlayerPersona,
  memory: PlayerPersonaMemory,
) {
  if (!state.chain || state.status !== 'playing') return false
  const continuations = listLegalActions(state)
  if (continuations.length === 0) return false
  if (persona === 'novice') return rng.nextFloat() >= 0.35
  if (persona === 'regular') return true
  const ended = endWolfTurn(state)
  if (!ended.ok) return true
  const endScore = playerPersonaPositionScore(ended.state, memory, state.chain.wolfId)
  const continueScore = Math.max(...continuations.map((action) => scoreAction(state, action, persona, memory)))
  return continueScore > endScore || (continueScore === endScore && persona === 'expert')
}

export function recordPlayerPersonaAction(
  before: BoardState,
  action: Action,
  after: BoardState,
  memory: PlayerPersonaMemory,
) {
  if (action.type === 'pass') return
  memory.movesByWolf[action.pieceId] = (memory.movesByWolf[action.pieceId] ?? 0) + 1
  const captured = after.eatenSheep - before.eatenSheep
  if (captured <= 0) return
  memory.capturesByWolf[action.pieceId] = (memory.capturesByWolf[action.pieceId] ?? 0) + captured
  if (!memory.primaryHunterId) memory.primaryHunterId = action.pieceId
}

export function countCurrentWolfThreats(state: BoardState) {
  return listWolfActionsAsIfTurn(state).filter((action) => action.type === 'jump').length
}
