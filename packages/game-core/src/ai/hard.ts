import type { Action, AiProfile, BoardState } from '../types'
import { applyAction, boardPositionKey, endWolfTurn, listLegalActions } from '../rules'
import { analyzeSheepActions, evaluate, type SheepActionAnalysis } from './evaluate'
import type { Rng } from './rng'
import { pickIndex } from './rng'

export const SHEEP_AI_ALGORITHM_VERSION = 'sheep-ai-v3'

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
}

type SearchContext = {
  config: AiProfileConfig
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

function profileScore(state: BoardState, config: AiProfileConfig) {
  const breakdown = evaluate(state)
  if (config.searchDepth === 0) return breakdown.total
  const expert = config.searchDepth >= 3
  const strategic = config.searchDepth >= 2
  return breakdown.total
    - breakdown.persistentHunterRisk * (expert ? 12 : strategic ? 5 : 1.5)
    - breakdown.terminalUrgency * (expert ? 3 : strategic ? 1.4 : 0.35)
    + breakdown.targetPressure * (expert ? 4 : strategic ? 2 : 0.5)
}

function safeAnalyses(state: BoardState, config: AiProfileConfig): SheepActionAnalysis[] {
  const analyses = analyzeSheepActions(state)
  const safe = analyses.filter((analysis) => !analysis.dominated)
  const baseline = safe.length > 0 ? safe : analyses
  if (config.searchDepth < 2) return baseline

  const minimumChain = Math.min(...baseline.map((analysis) => analysis.maxCaptureChain))
  const noExtraExposure = baseline.filter((analysis) => analysis.maxCaptureChain === minimumChain)
  if (noExtraExposure.length === 0) return baseline
  return noExtraExposure
}

function orderedSheepCandidates(state: BoardState, config: AiProfileConfig) {
  const analyses = safeAnalyses(state, config).map((analysis) => {
    const result = applyAction(state, analysis.action)
    return { ...analysis, profiledScore: result.ok ? profileScore(result.state, config) : analysis.score }
  }).sort((left, right) =>
    left.maxCaptureChain - right.maxCaptureChain
    || right.trappedWolves - left.trappedWolves
    || left.wolfMobility - right.wolfMobility
    || right.profiledScore - left.profiledScore
    || actionKey(left.action).localeCompare(actionKey(right.action)))
  const bestScore = Math.max(...analyses.map((analysis) => analysis.profiledScore))
  const withinSlack = analyses.filter((analysis) => analysis.profiledScore >= bestScore - config.scoreSlack)
  return withinSlack.slice(0, config.candidateLimit)
}

function pickImmediate(state: BoardState, profile: AiProfile, rng: Rng) {
  const config = AI_PROFILE_CONFIG[profile]
  const candidates = orderedSheepCandidates(state, config)
  if (candidates.length === 0) throw new Error(`${profile}: no legal sheep moves`)

  if (profile === 'guided') {
    return candidates[pickIndex(rng, candidates.length)]!.action
  }

  const best = Math.max(...candidates.map((candidate) => candidate.score))
  const tops = candidates.filter((candidate) => candidate.score >= best - config.selectionSlack)
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
  if (state.status !== 'playing' || depth === 0) return { score: profileScore(state, ctx.config), complete: true }
  if (isExhausted(ctx)) return { score: profileScore(state, ctx.config), complete: false }

  const cacheKey = `${boardPositionKey(state)}::${depth}`
  const cached = ctx.cache.get(cacheKey)
  if (cached !== undefined) return { score: cached, complete: true }

  if (state.toMove === 'wolf') {
    const outcomes = completeWolfTurnOutcomes(state, ctx)
    if (outcomes.states.length === 0) return { score: profileScore(state, ctx.config), complete: outcomes.complete }
    const ordered = outcomes.states.sort((left, right) => profileScore(left, ctx.config) - profileScore(right, ctx.config))
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
  })
  let best = -Infinity
  let complete = true
  for (const candidate of candidates) {
    if (!consumeNode(ctx)) return { score: best === -Infinity ? profileScore(state, ctx.config) : best, complete: false }
    const result = applyAction(state, candidate.action)
    if (!result.ok) continue
    const child = searchValue(result.state, depth - 1, alpha, beta, ctx)
    best = Math.max(best, child.score)
    complete &&= child.complete
    alpha = Math.max(alpha, best)
    if (beta <= alpha || isExhausted(ctx)) break
  }
  if (best === -Infinity) best = profileScore(state, ctx.config)
  if (complete) ctx.cache.set(cacheKey, best)
  return { score: best, complete }
}

export function pickProfiledSheepActionWithMeta(
  state: BoardState,
  profile: AiProfile,
  rng: Rng,
  budgetOverride?: HardBudgets,
): { action: Action; meta: HardPickMeta } {
  const config = AI_PROFILE_CONFIG[profile]
  const candidates = orderedSheepCandidates(state, config)
  if (candidates.length === 0) throw new Error(`${profile}: no legal sheep moves`)
  const start = clockNow()

  if (config.searchDepth === 0) {
    return {
      action: pickImmediate(state, profile, rng),
      meta: {
        algorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
        profile,
        degraded: false,
        degradedReason: 'none',
        nodes: 0,
        elapsedMs: clockNow() - start,
        completedDepth: 0,
        candidateCount: candidates.length,
        lookaheadCompleted: false,
      },
    }
  }

  const ctx: SearchContext = {
    config,
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
      depthScores.push({ action: candidate.action, score: searched.score })
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
    : pickImmediate(state, profile, rng)
  return {
    action,
    meta: {
      algorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
      profile,
      degraded,
      degradedReason: degraded ? (ctx.exhaustedBy ?? 'no-complete-depth') : 'none',
      nodes: ctx.nodes,
      elapsedMs: clockNow() - start,
      completedDepth,
      candidateCount: candidates.length,
      lookaheadCompleted: completedDepth > 0,
    },
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
