import { createSeededRng, pickSheepActionWithMeta } from '../ai/index'
import { analyzeSheepActions } from '../ai/evaluate'
import { chooseDiagnosticWolfAction, shouldContinueDiagnosticChain, type DiagnosticWolfStrategy } from './diagnosticWolf'
import { measureSheepAdvantage, type SheepAdvantageMetrics } from './sheepAdvantage'
import { validateLevel, createLevelInitialState, levelConfigFingerprint, type LevelConfig } from '../content/levels'
import { SHEEP_AI_ALGORITHM_VERSION } from '../ai/hard'
import {
  applyAction,
  boardPositionKey,
  endWolfTurn,
  listLegalActions,
  listWolfActionsAsIfTurn,
  REPETITION_DRAW_COUNT,
} from '../rules'
import type { Action, BoardState } from '../types'

export type CandidateWolfStrategy = DiagnosticWolfStrategy
export type CandidateVerdict = 'pass' | 'review' | 'reject'

export type CandidateGameEvidence = {
  seed: number
  strategy: CandidateWolfStrategy
  winner: 'wolf' | 'sheep' | 'draw'
  reason: 'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition' | 'unexpected'
  plies: number
  eaten: number
  firstCapturePly: number | null
  trace: string[]
  repetitionCycle?: {
    firstSeenPly: number
    secondSeenPly: number
    terminalPly: number
    actions: string[]
  }
  finalSheepAdvantage: SheepAdvantageMetrics
  sheepDecisionQuality: {
    turns: number
    chosenDominated: number
    avoidableChainExposure: number
    maxCaptureChain: number
    degradedTurns: number
    totalSearchNodes: number
    maxCompletedDepth: number
    suspiciousActions: string[]
  }
}

export type CandidateFinding = {
  severity: 'reject' | 'review'
  code: string
  message: string
  evidenceSeeds: number[]
}

export type CandidateAcceptanceReport = {
  levelId: string
  configFingerprint: string
  aiAlgorithmVersion: typeof SHEEP_AI_ALGORITHM_VERSION
  verdict: CandidateVerdict
  structuralErrors: string[]
  findings: CandidateFinding[]
  games: CandidateGameEvidence[]
  summaries: Record<CandidateWolfStrategy, {
    wolfWins: number
    sheepWins: number
    draws: number
    averagePlies: number
    p95Plies: number
    averageEaten: number
    firstCaptureCoverage: number
    chosenDominated: number
    avoidableChainExposure: number
    degradedTurns: number
    maxCaptureChain: number
  }>
}

export type CandidateAcceptanceOptions = {
  seeds?: number[]
  hardMaxNodes?: number
}

const DEFAULT_SEEDS = Array.from({ length: 10 }, (_, index) => 20260717 + index)

function percentile(values: number[], ratio: number) {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)] ?? 0
}

function actionLabel(action: Action) {
  if (action.type === 'pass') return 'pass'
  const through = action.type === 'jump' ? ` via ${action.through.r},${action.through.c}` : ''
  return `${action.type}:${action.pieceId}>${action.to.r},${action.to.c}${through}`
}

function terminalReason(state: BoardState): CandidateGameEvidence['reason'] {
  if (state.terminalReason) return state.terminalReason
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= REPETITION_DRAW_COUNT) return 'repetition'
  return 'unexpected'
}

function runCandidateGame(level: LevelConfig, strategy: CandidateWolfStrategy, seed: number, hardMaxNodes?: number): CandidateGameEvidence {
  let state = createLevelInitialState(level)
  const wolfRandom = createSeededRng(seed)
  const sheepRandom = createSeededRng(seed ^ 0x5f3759df)
  const trace: string[] = []
  const seenPositions = new Map<string, { ply: number, traceIndex: number }[]>()
  let firstCapturePly: number | null = null
  let repetitionCycle: CandidateGameEvidence['repetitionCycle']
  const sheepDecisionQuality: CandidateGameEvidence['sheepDecisionQuality'] = {
    turns: 0,
    chosenDominated: 0,
    avoidableChainExposure: 0,
    maxCaptureChain: 0,
    degradedTurns: 0,
    totalSearchNodes: 0,
    maxCompletedDepth: 0,
    suspiciousActions: [],
  }

  const observePosition = () => {
    const key = boardPositionKey(state)
    const occurrences = seenPositions.get(key) ?? []
    occurrences.push({ ply: state.plyCount, traceIndex: trace.length })
    seenPositions.set(key, occurrences)
    if (occurrences.length >= 3 && !repetitionCycle) {
      repetitionCycle = {
        firstSeenPly: occurrences[0]!.ply,
        secondSeenPly: occurrences[1]!.ply,
        terminalPly: state.plyCount,
        actions: trace.slice(occurrences[1]!.traceIndex),
      }
    }
  }
  observePosition()

  while (state.status === 'playing') {
    const actions = listLegalActions(state)
    if (actions.length === 0) break
    let action: Action
    if (state.toMove === 'wolf') {
      action = chooseDiagnosticWolfAction(state, actions, wolfRandom, strategy)
    } else {
      const analyses = analyzeSheepActions(state)
      const decision = pickSheepActionWithMeta(state, {
        difficulty: level.ai,
        profile: level.aiProfile,
        rng: sheepRandom,
        budgets: hardMaxNodes === undefined ? undefined : { maxNodes: hardMaxNodes },
      })
      action = decision.action
      const selected = analyses.find((candidate) => actionLabel(candidate.action) === actionLabel(action))
      const safe = analyses.filter((candidate) => !candidate.dominated)
      const minChain = Math.min(...(safe.length > 0 ? safe : analyses).map((candidate) => candidate.maxCaptureChain))
      const lowerChainAlternative = analyses.find((candidate) => !candidate.dominated
        && candidate.maxCaptureChain < (selected?.maxCaptureChain ?? Infinity)
        && candidate.trappedWolves >= (selected?.trappedWolves ?? 0)
        && candidate.wolfMobility <= (selected?.wolfMobility ?? Infinity))
      sheepDecisionQuality.turns += 1
      sheepDecisionQuality.totalSearchNodes += decision.meta.nodes
      sheepDecisionQuality.maxCompletedDepth = Math.max(sheepDecisionQuality.maxCompletedDepth, decision.meta.completedDepth)
      if (decision.meta.degraded) sheepDecisionQuality.degradedTurns += 1
      if (selected) {
        sheepDecisionQuality.maxCaptureChain = Math.max(sheepDecisionQuality.maxCaptureChain, selected.maxCaptureChain)
        if (selected.dominated) sheepDecisionQuality.chosenDominated += 1
        if (selected.maxCaptureChain > minChain && lowerChainAlternative) sheepDecisionQuality.avoidableChainExposure += 1
        if (selected.dominated || (selected.maxCaptureChain > minChain && lowerChainAlternative) || decision.meta.degraded) {
          sheepDecisionQuality.suspiciousActions.push(
            `ply=${state.plyCount + 1} action=${actionLabel(action)} label=${selected.explanation} chain=${selected.maxCaptureChain} minChain=${minChain} profile=${level.aiProfile} depth=${decision.meta.completedDepth} nodes=${decision.meta.nodes} degraded=${decision.meta.degradedReason}`,
          )
        }
      }
    }
    const eatenBefore = state.eatenSheep
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    trace.push(`${state.plyCount}:${actionLabel(action)}`)
    observePosition()
    if (firstCapturePly === null && state.eatenSheep > eatenBefore) firstCapturePly = state.plyCount
    if (state.status === 'playing' && state.chain && (strategy !== 'chain-aware' || !shouldContinueDiagnosticChain(state, wolfRandom))) {
      const ended = endWolfTurn(state)
      if (!ended.ok) throw new Error(ended.error)
      state = ended.state
      trace.push(`${state.plyCount}:end-chain`)
      observePosition()
    }
  }

  return {
    seed,
    strategy,
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: terminalReason(state),
    plies: state.plyCount,
    eaten: state.eatenSheep,
    firstCapturePly,
    trace,
    repetitionCycle,
    finalSheepAdvantage: measureSheepAdvantage(state),
    sheepDecisionQuality,
  }
}

export function assessLevelCandidate(level: LevelConfig, options: CandidateAcceptanceOptions = {}): CandidateAcceptanceReport {
  const structuralErrors = validateLevel(level)
  const seeds = options.seeds ?? DEFAULT_SEEDS
  const hardMaxNodes = options.hardMaxNodes
  const games = structuralErrors.length === 0
    ? (['random', 'mixed', 'chain-aware'] as const).flatMap((strategy) => seeds.map((seed) => runCandidateGame(level, strategy, seed, hardMaxNodes)))
    : []
  const byStrategy = (strategy: CandidateWolfStrategy) => games.filter((game) => game.strategy === strategy)
  const summarize = (strategy: CandidateWolfStrategy) => {
    const selected = byStrategy(strategy)
    return {
      wolfWins: selected.filter((game) => game.winner === 'wolf').length,
      sheepWins: selected.filter((game) => game.winner === 'sheep').length,
      draws: selected.filter((game) => game.winner === 'draw').length,
      averagePlies: selected.reduce((sum, game) => sum + game.plies, 0) / Math.max(1, selected.length),
      p95Plies: percentile(selected.map((game) => game.plies), 0.95),
      averageEaten: selected.reduce((sum, game) => sum + game.eaten, 0) / Math.max(1, selected.length),
      firstCaptureCoverage: selected.filter((game) => game.firstCapturePly !== null).length / Math.max(1, selected.length),
      chosenDominated: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.chosenDominated, 0),
      avoidableChainExposure: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.avoidableChainExposure, 0),
      degradedTurns: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.degradedTurns, 0),
      maxCaptureChain: Math.max(0, ...selected.map((game) => game.sheepDecisionQuality.maxCaptureChain)),
    }
  }
  const summaries = { random: summarize('random'), mixed: summarize('mixed'), 'chain-aware': summarize('chain-aware') }
  const findings: CandidateFinding[] = []
  const mixed = byStrategy('mixed')
  const evidence = (predicate: (game: CandidateGameEvidence) => boolean) => mixed.filter(predicate).map((game) => game.seed)
  const rate = (count: number) => count / Math.max(1, seeds.length)

  if (structuralErrors.length > 0) {
    findings.push({ severity: 'reject', code: 'STRUCTURE_INVALID', message: structuralErrors.join('; '), evidenceSeeds: [] })
  } else {
    if (rate(summaries.mixed.wolfWins) >= 0.9 && summaries.mixed.sheepWins === 0) {
      findings.push({ severity: 'reject', code: 'WOLF_FORCED_WIN_RISK', message: 'mixed wolf strategy wins at least 90% with no sheep wins', evidenceSeeds: evidence((game) => game.winner === 'wolf') })
    }
    const strongestCaptureCoverage = Math.max(summaries.mixed.firstCaptureCoverage, summaries['chain-aware'].firstCaptureCoverage)
    if (strongestCaptureCoverage < 0.5) {
      findings.push({ severity: 'reject', code: 'FIRST_CAPTURE_BLOCKED', message: 'both planning wolf proxies fail to establish a capture in at least half of games', evidenceSeeds: evidence((game) => game.firstCapturePly === null) })
    } else if (summaries.mixed.firstCaptureCoverage < 0.8) {
      findings.push({ severity: 'review', code: 'FIRST_CAPTURE_RISK', message: 'mixed wolf proxy establishes a capture in fewer than 80% of games; inspect the chain-aware route before changing the map', evidenceSeeds: evidence((game) => game.firstCapturePly === null) })
    }
    if (rate(summaries.mixed.draws) >= 0.4) {
      findings.push({ severity: 'review', code: 'DRAW_RATE_HIGH', message: 'mixed strategy draw rate is at least 40%', evidenceSeeds: evidence((game) => game.winner === 'draw') })
    }
    if (summaries.mixed.p95Plies >= (level.maxPlies ?? 300) * 0.75) {
      findings.push({ severity: 'review', code: 'LONG_TAIL', message: 'mixed strategy P95 reaches at least 75% of maxPlies', evidenceSeeds: evidence((game) => game.plies >= (level.maxPlies ?? 300) * 0.75) })
    }
    if (summaries.mixed.wolfWins - summaries.random.wolfWins >= seeds.length * 0.6) {
      findings.push({ severity: 'review', code: 'STRATEGY_SENSITIVE', message: 'mixed strategy gains at least 60 percentage points over random', evidenceSeeds: evidence((game) => game.winner === 'wolf') })
    }
    const dominatedGames = games.filter((game) => game.sheepDecisionQuality.chosenDominated > 0)
    if (dominatedGames.length > 0) {
      findings.push({ severity: 'reject', code: 'AI_CHOSE_DOMINATED', message: 'production sheep AI selected an action with a strictly safer alternative', evidenceSeeds: [...new Set(dominatedGames.map((game) => game.seed))] })
    }
    const degradedGames = games.filter((game) => game.sheepDecisionQuality.degradedTurns > 0)
    if (degradedGames.length > 0) {
      findings.push({ severity: 'review', code: 'AI_SEARCH_DEGRADED', message: 'production sheep AI did not complete its configured search depth', evidenceSeeds: [...new Set(degradedGames.map((game) => game.seed))] })
    }
    const unexpected = games.filter((game) => game.reason === 'unexpected')
    if (unexpected.length > 0) {
      findings.push({ severity: 'reject', code: 'UNEXPECTED_TERMINAL', message: 'simulation reached an unclassified terminal state', evidenceSeeds: unexpected.map((game) => game.seed) })
    }
  }

  const verdict: CandidateVerdict = findings.some((finding) => finding.severity === 'reject')
    ? 'reject'
    : findings.some((finding) => finding.severity === 'review') ? 'review' : 'pass'
  return {
    levelId: level.id,
    configFingerprint: levelConfigFingerprint(level),
    aiAlgorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
    verdict,
    structuralErrors,
    findings,
    games,
    summaries,
  }
}
