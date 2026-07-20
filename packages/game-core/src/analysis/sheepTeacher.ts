import { maxCapturesInWolfTurn } from '../ai/evaluate'
import { applyAction, boardPositionKey, endWolfTurn, getWolfLegalSummary, listLegalActions } from '../rules'
import type { Action, BoardState } from '../types'

export type TeacherOptions = {
  depth?: number
  maxNodes?: number
  sheepBranchLimit?: number
  wolfBranchLimit?: number
  regretTolerance?: number
}

export type TeacherActionScore = {
  action: Action
  score: number
  complete: boolean
}

export type TeacherJudgement = {
  verdict: 'supported' | 'questionable' | 'unknown'
  selectedScore: number | null
  bestScore: number
  regret: number | null
  nodes: number
  completed: boolean
  bestActions: Action[]
  candidates: TeacherActionScore[]
}

type SearchContext = Required<Omit<TeacherOptions, 'regretTolerance'>> & {
  nodes: number
  exhausted: boolean
  cache: Map<string, number>
}

/** Independent sheep score used by the offline teacher, not by production AI. */
export function teacherPositionScore(state: BoardState) {
  if (state.status === 'won') return -1_000_000 + state.plyCount
  if (state.status === 'lost') return 1_000_000 - state.plyCount
  if (state.status === 'draw') return 5_000 - state.plyCount
  const summary = getWolfLegalSummary(state)
  const wolfMoves = summary.reduce((sum, wolf) => sum + wolf.steps + wolf.jumps, 0)
  const directJumps = summary.reduce((sum, wolf) => sum + wolf.jumps, 0)
  const trapped = summary.filter((wolf) => wolf.steps + wolf.jumps === 0).length
  const weakest = summary.length === 0 ? 0 : Math.min(...summary.map((wolf) => wolf.steps + wolf.jumps))
  const urgency = state.eatenSheep / Math.max(1, state.targetEaten)
  const remainingSheep = state.pieces.filter((piece) => piece.side === 'sheep').length
  const repetition = state.repetitionCounts.get(boardPositionKey(state)) ?? 0
  return remainingSheep * 20
    - wolfMoves * 2
    - directJumps * (14 + urgency * 32)
    - maxCapturesInWolfTurn(state) * (18 + urgency * 45)
    + trapped * 55
    - weakest * 2
    - repetition * 4
}

function consume(ctx: SearchContext) {
  if (ctx.nodes >= ctx.maxNodes) {
    ctx.exhausted = true
    return false
  }
  ctx.nodes += 1
  return true
}

function actionKey(action: Action) {
  return JSON.stringify(action)
}

function orderedActions(state: BoardState, ctx: SearchContext) {
  const actions = listLegalActions(state).map((action) => {
    const result = applyAction(state, action)
    return { action, score: result.ok ? teacherPositionScore(result.state) : (state.toMove === 'sheep' ? -Infinity : Infinity) }
  })
  actions.sort((left, right) => state.toMove === 'sheep'
    ? right.score - left.score || actionKey(left.action).localeCompare(actionKey(right.action))
    : left.score - right.score || actionKey(left.action).localeCompare(actionKey(right.action)))
  return actions.slice(0, state.toMove === 'sheep' ? ctx.sheepBranchLimit : ctx.wolfBranchLimit)
}

function search(state: BoardState, depth: number, ctx: SearchContext): { score: number; complete: boolean } {
  if (state.status !== 'playing' || depth <= 0) return { score: teacherPositionScore(state), complete: true }
  if (!consume(ctx)) return { score: teacherPositionScore(state), complete: false }
  const cacheKey = `${boardPositionKey(state)}::${depth}`
  const cached = ctx.cache.get(cacheKey)
  if (cached !== undefined) return { score: cached, complete: true }

  const children: BoardState[] = []
  if (state.toMove === 'wolf' && state.chain) {
    const ended = endWolfTurn(state)
    if (ended.ok) children.push(ended.state)
  }
  for (const { action } of orderedActions(state, ctx)) {
    if (!consume(ctx)) break
    const result = applyAction(state, action)
    if (result.ok) children.push(result.state)
  }
  if (children.length === 0) return { score: teacherPositionScore(state), complete: !ctx.exhausted }

  const values = children.map((child) => search(child, depth - 1, ctx))
  const score = state.toMove === 'sheep'
    ? Math.max(...values.map((value) => value.score))
    : Math.min(...values.map((value) => value.score))
  const complete = !ctx.exhausted && values.every((value) => value.complete)
  if (complete) ctx.cache.set(cacheKey, score)
  return { score, complete }
}

/** High-budget offline comparison. It may return unknown and never runs in live play. */
export function judgeSheepAction(
  state: BoardState,
  selectedAction: Action,
  options: TeacherOptions = {},
): TeacherJudgement {
  if (state.status !== 'playing' || state.toMove !== 'sheep') throw new Error('judgeSheepAction requires a playing sheep turn')
  const ctx: SearchContext = {
    depth: options.depth ?? 4,
    maxNodes: options.maxNodes ?? 20_000,
    sheepBranchLimit: options.sheepBranchLimit ?? 14,
    wolfBranchLimit: options.wolfBranchLimit ?? 18,
    nodes: 0,
    exhausted: false,
    cache: new Map(),
  }
  const legalActions = listLegalActions(state)
  const orderedCandidates = [...legalActions].sort((left, right) => {
    if (actionKey(left) === actionKey(selectedAction)) return -1
    if (actionKey(right) === actionKey(selectedAction)) return 1
    const leftResult = applyAction(state, left)
    const rightResult = applyAction(state, right)
    const leftScore = leftResult.ok ? teacherPositionScore(leftResult.state) : -Infinity
    const rightScore = rightResult.ok ? teacherPositionScore(rightResult.state) : -Infinity
    return rightScore - leftScore || actionKey(left).localeCompare(actionKey(right))
  })
  const candidates: TeacherActionScore[] = []
  for (const action of orderedCandidates) {
    if (!consume(ctx)) break
    const result = applyAction(state, action)
    if (!result.ok) continue
    const searched = search(result.state, ctx.depth, ctx)
    candidates.push({ action, score: searched.score, complete: searched.complete })
    if (ctx.exhausted) break
  }
  const bestScore = Math.max(...candidates.map((candidate) => candidate.score), -Infinity)
  const bestActions = candidates.filter((candidate) => candidate.score === bestScore).map((candidate) => candidate.action)
  const selected = candidates.find((candidate) => actionKey(candidate.action) === actionKey(selectedAction))
  const completed = !ctx.exhausted && candidates.length === legalActions.length && candidates.every((candidate) => candidate.complete)
  const regret = selected ? bestScore - selected.score : null
  const tolerance = options.regretTolerance ?? 12
  return {
    verdict: !completed || !selected ? 'unknown' : regret! > tolerance ? 'questionable' : 'supported',
    selectedScore: selected?.score ?? null,
    bestScore,
    regret,
    nodes: ctx.nodes,
    completed,
    bestActions,
    candidates,
  }
}
