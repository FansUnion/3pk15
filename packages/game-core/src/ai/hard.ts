import type { Action, AiBehaviorProfile, AiOpponentMemory, AiProfile, AiTargetChangeReason, BoardState } from '../types'
import { applyAction, boardPositionKey, endWolfTurn, listLegalActions } from '../rules'
import { analyzeSheepActions, evaluate, type SheepActionAnalysis } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'
import {
  aiBehaviorStateScore,
  DEFAULT_AI_BEHAVIOR,
  measureAiIntentImpact,
  resolveAiIntent,
  type AiIntentImpact,
  type AiIntentPhase,
} from './intent'

export const SHEEP_AI_ALGORITHM_VERSION = 'sheep-ai-v5'

export type HardBudgets = {
  maxNodes: number
  /** Optional safety stop for diagnostics. Production decisions are node-limited. */
  maxMs?: number
}

export type AiProfileConfig = {
  searchDepth: number
  candidateLimit: number
  scoreSlack: number
  /** Seeded choice may vary inside this searched-score band. */
  selectionSlack: number
  sheepBranchLimit: number
  wolfBranchLimit: number
  budgets: HardBudgets
}

export const AI_PROFILE_CONFIG: Record<AiProfile, AiProfileConfig> = {
  guided: { searchDepth: 0, candidateLimit: 14, scoreSlack: 30, selectionSlack: 30, sheepBranchLimit: 6, wolfBranchLimit: 8, budgets: { maxNodes: 0 } },
  foundation: { searchDepth: 0, candidateLimit: 6, scoreSlack: 8, selectionSlack: 4, sheepBranchLimit: 6, wolfBranchLimit: 10, budgets: { maxNodes: 0 } },
  tactical: { searchDepth: 1, candidateLimit: 12, scoreSlack: 30, selectionSlack: 18, sheepBranchLimit: 10, wolfBranchLimit: 12, budgets: { maxNodes: 340 } },
  strategic: { searchDepth: 2, candidateLimit: 8, scoreSlack: 18, selectionSlack: 3, sheepBranchLimit: 10, wolfBranchLimit: 14, budgets: { maxNodes: 700 } },
  expert: { searchDepth: 3, candidateLimit: 8, scoreSlack: 18, selectionSlack: 0, sheepBranchLimit: 10, wolfBranchLimit: 14, budgets: { maxNodes: 4_000 } },
}

export type HardPickMeta = {
  algorithmVersion: typeof SHEEP_AI_ALGORITHM_VERSION
  profile: AiProfile
  degraded: boolean
  degradedReason: 'none' | 'node-budget' | 'time-budget' | 'no-complete-depth'
  nodes: number
  elapsedMs: number
  completedDepth: number
  candidateCount: number
  /** Compatibility field: true when at least one complete wolf response was evaluated. */
  lookaheadCompleted: boolean
  primaryStyle: AiBehaviorProfile['style']['primary']
  secondaryStyle: AiBehaviorProfile['style']['secondary']
  intentTarget: AiBehaviorProfile['intent']['target']
  intentSummaryZh: string
  targetWolfId: string | null
  intentPhase: AiIntentPhase
  targetChangeReason: AiTargetChangeReason
  nextMemory: AiOpponentMemory
  impact: AiIntentImpact & { beneficialExchange: boolean }
}

type SearchContext = {
  config: AiProfileConfig
  behavior: AiBehaviorProfile
  memory?: AiOpponentMemory
  budgets: HardBudgets
  start: number
  nodes: number
  exhaustedBy: 'node-budget' | 'time-budget' | null
  cache: Map<string, number>
}

function clockNow() {
  return Date.now()
}

function isExhausted(ctx: SearchContext) {
  if (ctx.nodes >= ctx.budgets.maxNodes) {
    ctx.exhaustedBy = 'node-budget'
    return true
  }
  if (ctx.budgets.maxMs !== undefined && clockNow() - ctx.start >= ctx.budgets.maxMs) {
    ctx.exhaustedBy = 'time-budget'
    return true
  }
  return false
}

function consumeNode(ctx: SearchContext) {
  if (isExhausted(ctx)) return false
  ctx.nodes += 1
  return true
}

function actionKey(action: Action) {
  return JSON.stringify(action)
}

function rootStyleActionPreference(state: BoardState, action: Action, behavior: AiBehaviorProfile, targetWolfId: string | null) {
  if (action.type === 'pass') return 0
  const moving = state.pieces.find((piece) => piece.id === action.pieceId && piece.side === 'sheep')
  if (!moving) return 0
  const target = targetWolfId ? state.pieces.find((piece) => piece.id === targetWolfId) : undefined
  const others = state.pieces.filter((piece) => piece.side === 'sheep' && piece.id !== moving.id)
  const distance = (left: { r: number; c: number }, right: { r: number; c: number }) => Math.abs(left.r - right.r) + Math.abs(left.c - right.c)
  const focusDistance = (pos: { r: number; c: number }) => Math.min(...behavior.intent.focusCells.map((cell) => distance(pos, cell)))
  const centroid = others.length === 0
    ? { r: 3.5, c: 3.5 }
    : { r: others.reduce((sum, piece) => sum + piece.r, 0) / others.length, c: others.reduce((sum, piece) => sum + piece.c, 0) / others.length }
  const centroidDistance = (pos: { r: number; c: number }) => Math.abs(pos.r - centroid.r) + Math.abs(pos.c - centroid.c)
  const centerDistance = (pos: { r: number; c: number }) => Math.abs(pos.r - 3.5) + Math.abs(pos.c - 3.5)
  const targetApproach = target ? distance(moving, target) - distance(action.to, target) : 0
  const focusApproach = focusDistance(moving) - focusDistance(action.to)
  const spreadGain = centroidDistance(action.to) - centroidDistance(moving)
  const centerGain = centerDistance(moving) - centerDistance(action.to)
  const alignedWithTarget = target && (action.to.r === target.r || action.to.c === target.c) ? 1 : 0
  switch (behavior.style.primary) {
    case 'blockade': return focusApproach * 5 + targetApproach
    case 'encircle': return targetApproach * 5 + centerGain * 2
    case 'disperse': return spreadGain * 6 - centerGain
    case 'exchange': return targetApproach * 3 + focusApproach - centerGain * 2
    case 'hunter-counter': return targetApproach * 6 + alignedWithTarget * 4 + focusApproach
  }
}

function profileScore(state: BoardState, config: AiProfileConfig, behavior: AiBehaviorProfile, memory?: AiOpponentMemory) {
  const breakdown = evaluate(state)
  const behaviorScore = aiBehaviorStateScore(state, behavior, memory)
  if (config.searchDepth === 0) return breakdown.total + behaviorScore
  const expert = config.searchDepth >= 3
  const strategic = config.searchDepth >= 2
  return breakdown.total + behaviorScore
    - breakdown.persistentHunterRisk * (expert ? 12 : strategic ? 5 : 1.5)
    - breakdown.terminalUrgency * (expert ? 3 : strategic ? 1.4 : 0.35)
    + breakdown.targetPressure * (expert ? 4 : strategic ? 2 : 0.5)
}

function safeAnalyses(state: BoardState, config: AiProfileConfig, behavior: AiBehaviorProfile, memory?: AiOpponentMemory): SheepActionAnalysis[] {
  const analyses = analyzeSheepActions(state)
  const safe = analyses.filter((analysis) => !analysis.dominated)
  const baseline = safe.length > 0 ? safe : analyses
  if (config.searchDepth < 2) return baseline

  const minimumChain = Math.min(...baseline.map((analysis) => analysis.maxCaptureChain))
  const noExtraExposure = baseline.filter((analysis) => analysis.maxCaptureChain === minimumChain)
  if (noExtraExposure.length === 0) return baseline
  const exchangeEnabled = behavior.style.primary === 'exchange'
  if (!exchangeEnabled) return noExtraExposure
  if (state.eatenSheep >= state.targetEaten - 1) return noExtraExposure
  const exchangeCandidates = baseline.filter((analysis) => {
    if (analysis.maxCaptureChain > minimumChain + 1) return false
    const result = applyAction(state, analysis.action)
    if (!result.ok) return false
    const impact = measureAiIntentImpact(state, result.state, behavior, resolveAiIntent(state, behavior, memory).targetWolfId)
    return impact.trappedWolfDelta > 0
  })
  return [...new Map([...noExtraExposure, ...exchangeCandidates].map((analysis) => [actionKey(analysis.action), analysis])).values()]
}

function orderedSheepCandidates(state: BoardState, config: AiProfileConfig, behavior: AiBehaviorProfile, memory?: AiOpponentMemory) {
  const resolved = resolveAiIntent(state, behavior, memory)
  const analyses = safeAnalyses(state, config, behavior, memory).map((analysis) => {
    const result = applyAction(state, analysis.action)
    const impact = result.ok ? measureAiIntentImpact(state, result.state, behavior, resolved.targetWolfId) : null
    const rootStyleScore = (impact?.styleScore ?? 0) + rootStyleActionPreference(state, analysis.action, behavior, resolved.targetWolfId)
    return {
      ...analysis,
      intentImpact: impact,
      rootStyleScore,
      // Safety filtering happens before this point. Within the safe set, style
      // must be strong enough to produce a recognizable opponent personality.
      profiledScore: result.ok ? profileScore(result.state, config, behavior, resolved.nextMemory) + rootStyleScore * 3 : analysis.score,
    }
  }).sort((left, right) =>
    left.maxCaptureChain - right.maxCaptureChain
    || right.trappedWolves - left.trappedWolves
    || left.wolfMobility - right.wolfMobility
    || right.profiledScore - left.profiledScore
    || actionKey(left.action).localeCompare(actionKey(right.action)))
  const bestScore = Math.max(...analyses.map((analysis) => analysis.profiledScore))
  const withinSlack = analyses.filter((analysis) => analysis.profiledScore >= bestScore - config.scoreSlack)
  // Preserve real choice after the safety floor. A one-action root makes deeper
  // search and behavior styles cosmetic, even when several legal safe moves exist.
  const minimumBreadth = Math.min(config.candidateLimit, analyses.length, config.searchDepth === 0 ? 3 : 4)
  return analyses.slice(0, Math.max(withinSlack.length, minimumBreadth, 1)).slice(0, config.candidateLimit)
}

function pickImmediate(state: BoardState, profile: AiProfile, behavior: AiBehaviorProfile, rng: Rng, memory?: AiOpponentMemory) {
  const config = AI_PROFILE_CONFIG[profile]
  const candidates = orderedSheepCandidates(state, config, behavior, memory)
  if (candidates.length === 0) throw new Error(`${profile}: no legal sheep moves`)

  if (profile === 'guided') {
    return candidates[pickIndex(rng, candidates.length)]!.action
  }

  const best = Math.max(...candidates.map((candidate) => candidate.profiledScore))
  const tops = candidates.filter((candidate) => candidate.profiledScore >= best - config.selectionSlack)
  return tops[pickIndex(rng, tops.length)]!.action
}

function orderedWolfActions(state: BoardState, limit: number) {
  return listLegalActions(state)
    .sort((left, right) => Number(right.type === 'jump') - Number(left.type === 'jump')
      || actionKey(left).localeCompare(actionKey(right)))
    .slice(0, limit)
}

function completeWolfTurnOutcomes(state: BoardState, ctx: SearchContext): { states: BoardState[]; complete: boolean } {
  if (state.status !== 'playing' || state.toMove !== 'wolf') return { states: [state], complete: true }
  const outcomes: BoardState[] = []

  if (state.chain) {
    if (!consumeNode(ctx)) return { states: [], complete: false }
    const ended = endWolfTurn(state)
    if (ended.ok) outcomes.push(ended.state)
  }

  for (const action of orderedWolfActions(state, ctx.config.wolfBranchLimit)) {
    if (!consumeNode(ctx)) return { states: outcomes, complete: false }
    const result = applyAction(state, action)
    if (!result.ok) continue
    if (result.state.chain) {
      const continuation = completeWolfTurnOutcomes(result.state, ctx)
      outcomes.push(...continuation.states)
      if (!continuation.complete) return { states: outcomes, complete: false }
    } else {
      outcomes.push(result.state)
    }
  }

  const unique = new Map<string, BoardState>()
  for (const outcome of outcomes) unique.set(boardPositionKey(outcome), outcome)
  return { states: [...unique.values()], complete: true }
}

function searchValue(state: BoardState, depth: number, alpha: number, beta: number, ctx: SearchContext): { score: number; complete: boolean } {
  if (state.status !== 'playing' || depth === 0) return { score: profileScore(state, ctx.config, ctx.behavior, ctx.memory), complete: true }
  if (isExhausted(ctx)) return { score: profileScore(state, ctx.config, ctx.behavior, ctx.memory), complete: false }

  const cacheKey = `${boardPositionKey(state)}::${depth}`
  const cached = ctx.cache.get(cacheKey)
  if (cached !== undefined) return { score: cached, complete: true }

  if (state.toMove === 'wolf') {
    const outcomes = completeWolfTurnOutcomes(state, ctx)
    if (outcomes.states.length === 0) return { score: profileScore(state, ctx.config, ctx.behavior, ctx.memory), complete: outcomes.complete }
    const ordered = outcomes.states.sort((left, right) => profileScore(left, ctx.config, ctx.behavior, ctx.memory) - profileScore(right, ctx.config, ctx.behavior, ctx.memory))
    let best = Infinity
    let complete = outcomes.complete
    for (const outcome of ordered) {
      const child = searchValue(outcome, depth - 1, alpha, beta, ctx)
      best = Math.min(best, child.score)
      complete &&= child.complete
      beta = Math.min(beta, best)
      if (beta <= alpha || isExhausted(ctx)) break
    }
    if (complete) ctx.cache.set(cacheKey, best)
    return { score: best, complete }
  }

  const candidates = orderedSheepCandidates(state, {
    ...ctx.config,
    candidateLimit: ctx.config.sheepBranchLimit,
  }, ctx.behavior, ctx.memory)
  let best = -Infinity
  let complete = true
  for (const candidate of candidates) {
    if (!consumeNode(ctx)) return { score: best === -Infinity ? profileScore(state, ctx.config, ctx.behavior, ctx.memory) : best, complete: false }
    const result = applyAction(state, candidate.action)
    if (!result.ok) continue
    const child = searchValue(result.state, depth - 1, alpha, beta, ctx)
    best = Math.max(best, child.score)
    complete &&= child.complete
    alpha = Math.max(alpha, best)
    if (beta <= alpha || isExhausted(ctx)) break
  }
  if (best === -Infinity) best = profileScore(state, ctx.config, ctx.behavior, ctx.memory)
  if (complete) ctx.cache.set(cacheKey, best)
  return { score: best, complete }
}

export function pickProfiledSheepActionWithMeta(
  state: BoardState,
  profile: AiProfile,
  rng: Rng,
  budgetOverride?: HardBudgets,
  behavior: AiBehaviorProfile = DEFAULT_AI_BEHAVIOR,
  memory?: AiOpponentMemory,
): { action: Action; meta: HardPickMeta } {
  const config = AI_PROFILE_CONFIG[profile]
  const candidates = orderedSheepCandidates(state, config, behavior, memory)
  if (candidates.length === 0) throw new Error(`${profile}: no legal sheep moves`)
  const start = clockNow()

  if (config.searchDepth === 0) {
    const action = pickImmediate(state, profile, behavior, rng, memory)
    return {
      action,
      meta: buildMeta(state, action, profile, behavior, memory, {
        algorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
        degraded: false,
        degradedReason: 'none',
        nodes: 0,
        elapsedMs: clockNow() - start,
        completedDepth: 0,
        candidateCount: candidates.length,
        lookaheadCompleted: false,
      }),
    }
  }

  const ctx: SearchContext = {
    config,
    behavior,
    memory,
    budgets: budgetOverride ?? config.budgets,
    start,
    nodes: 0,
    exhaustedBy: null,
    cache: new Map(),
  }
  let completedDepth = 0
  let bestActions: Action[] = []

  for (let depth = 1; depth <= config.searchDepth; depth += 1) {
    const depthScores: Array<{ action: Action; score: number }> = []
    let depthComplete = true
    for (const candidate of candidates) {
      if (!consumeNode(ctx)) {
        depthComplete = false
        break
      }
      const result = applyAction(state, candidate.action)
      if (!result.ok) continue
      const searched = searchValue(result.state, depth, -Infinity, Infinity, ctx)
      if (!searched.complete) depthComplete = false
      // Root behavior is a bounded personality choice inside the already safe
      // candidate set. Without this weight, generic evaluation erases all five
      // configured styles even though their tactical impact differs.
      depthScores.push({ action: candidate.action, score: searched.score + candidate.rootStyleScore * 12 })
      if (!depthComplete || isExhausted(ctx)) break
    }
    if (!depthComplete || depthScores.length === 0) break
    const bestScore = Math.max(...depthScores.map((candidate) => candidate.score))
    const depthBest = depthScores
      .filter((candidate) => candidate.score >= bestScore - config.selectionSlack)
      .map((candidate) => candidate.action)
    completedDepth = depth
    bestActions = depthBest
  }

  const degraded = completedDepth < config.searchDepth
  const action = bestActions.length > 0
    ? bestActions[pickIndex(rng, bestActions.length)]!
    : pickImmediate(state, profile, behavior, rng, memory)
  return {
    action,
    meta: buildMeta(state, action, profile, behavior, memory, {
      algorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
      degraded,
      degradedReason: degraded ? (ctx.exhaustedBy ?? 'no-complete-depth') : 'none',
      nodes: ctx.nodes,
      elapsedMs: clockNow() - start,
      completedDepth,
      candidateCount: candidates.length,
      lookaheadCompleted: completedDepth > 0,
    }),
  }
}

function buildMeta(
  state: BoardState,
  action: Action,
  profile: AiProfile,
  behavior: AiBehaviorProfile,
  memory: AiOpponentMemory | undefined,
  search: Pick<HardPickMeta, 'algorithmVersion' | 'degraded' | 'degradedReason' | 'nodes' | 'elapsedMs' | 'completedDepth' | 'candidateCount' | 'lookaheadCompleted'>,
): HardPickMeta {
  const resolved = resolveAiIntent(state, behavior, memory)
  const result = applyAction(state, action)
  const impact = result.ok
    ? measureAiIntentImpact(state, result.state, behavior, resolved.targetWolfId)
    : measureAiIntentImpact(state, state, behavior, resolved.targetWolfId)
  const analyses = analyzeSheepActions(state)
  const selected = analyses.find((analysis) => actionKey(analysis.action) === actionKey(action))
  const minimumChain = Math.min(...analyses.map((analysis) => analysis.maxCaptureChain))
  const beneficialExchange = Boolean(selected
    && selected.maxCaptureChain > minimumChain
    && selected.maxCaptureChain <= minimumChain + 1
    && state.eatenSheep < state.targetEaten - 1
    && behavior.style.primary === 'exchange'
    && result.ok
    && impact.trappedWolfDelta > 0)
  return {
    ...search,
    profile,
    primaryStyle: behavior.style.primary,
    secondaryStyle: behavior.style.secondary,
    intentTarget: behavior.intent.target,
    intentSummaryZh: behavior.intent.summaryZh,
    targetWolfId: resolved.targetWolfId,
    intentPhase: resolved.phase,
    targetChangeReason: resolved.targetChangeReason,
    nextMemory: resolved.nextMemory,
    impact: { ...impact, beneficialExchange },
  }
}

export function pickHardWithMeta(
  state: BoardState,
  rng: Rng,
  budgets?: HardBudgets,
): { action: Action; meta: HardPickMeta } {
  return pickProfiledSheepActionWithMeta(state, 'expert', rng, budgets)
}

export function pickHard(state: BoardState, rng: Rng, budgets?: HardBudgets): Action {
  return pickHardWithMeta(state, rng, budgets).action
}
