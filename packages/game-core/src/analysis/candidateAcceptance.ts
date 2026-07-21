import { createAiOpponentMemory, createSeededRng, observeAiOpponentAction, pickSheepActionWithMeta } from '../ai/index'
import { analyzeSheepActions } from '../ai/evaluate'
import { chooseDiagnosticWolfAction, shouldContinueDiagnosticChain, type DiagnosticWolfStrategy } from './diagnosticWolf'
import { measureSheepAdvantage, type SheepAdvantageMetrics } from './sheepAdvantage'
import { judgeSheepAction } from './sheepTeacher'
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
/** Automated risk-screening status. `pass` never means player or product approval. */
export type CandidateVerdict = 'pass' | 'review' | 'reject'

export type CandidateGameEvidence = {
  seed: number
  strategy: CandidateWolfStrategy
  winner: 'wolf' | 'sheep' | 'draw'
  reason: 'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition' | 'unexpected'
  plies: number
  eaten: number
  firstCapturePly: number | null
  capturesByWolf: Record<string, number>
  movesByWolf: Record<string, number>
  dominantWolfShare: number
  sameHunterCaptureStreak: number
  closingCaptureSpan: number | null
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
    activePressureTurns: number
    targetPersistentTurns: number
    targetSwitches: number
    trapProgressTurns: number
    beneficialExchangeTurns: number
    noProgressTurns: number
    hunterCounterTurns: number
    styleAlignedTurns: number
    teacherAuditedTurns: number
    teacherQuestionableTurns: number
    teacherUnknownTurns: number
    maxTeacherRegret: number
    teacherFindings: string[]
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
    averageDominantWolfShare: number
    maxSameHunterCaptureStreak: number
    activePressureRate: number
    targetPersistenceRate: number
    noProgressRate: number
    styleAlignmentRate: number
    beneficialExchangeTurns: number
    trapProgressTurns: number
    hunterCounterTurns: number
    teacherAuditedTurns: number
    teacherQuestionableTurns: number
    teacherUnknownTurns: number
    maxTeacherRegret: number
  }>
}

export type CandidateAcceptanceOptions = {
  seeds?: number[]
  hardMaxNodes?: number
  strategies?: CandidateWolfStrategy[]
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

/**
 * Reproducible proxy match used to expose structural, tactical and long-tail risks.
 * Diagnostic wolf policies are deliberately cheap and do not represent player skill tiers.
 */
function runCandidateGame(level: LevelConfig, strategy: CandidateWolfStrategy, seed: number, hardMaxNodes?: number): CandidateGameEvidence {
  let state = createLevelInitialState(level)
  let opponentMemory = createAiOpponentMemory()
  const wolfRandom = createSeededRng(seed)
  const sheepRandom = createSeededRng(seed ^ 0x5f3759df)
  const trace: string[] = []
  const seenPositions = new Map<string, { ply: number, traceIndex: number }[]>()
  let firstCapturePly: number | null = null
  const capturesByWolf: Record<string, number> = {}
  const movesByWolf: Record<string, number> = {}
  const captureEvents: Array<{ wolfId: string; ply: number; total: number }> = []
  let repetitionCycle: CandidateGameEvidence['repetitionCycle']
  const sheepDecisionQuality: CandidateGameEvidence['sheepDecisionQuality'] = {
    turns: 0,
    chosenDominated: 0,
    avoidableChainExposure: 0,
    maxCaptureChain: 0,
    degradedTurns: 0,
    totalSearchNodes: 0,
    maxCompletedDepth: 0,
    activePressureTurns: 0,
    targetPersistentTurns: 0,
    targetSwitches: 0,
    trapProgressTurns: 0,
    beneficialExchangeTurns: 0,
    noProgressTurns: 0,
    hunterCounterTurns: 0,
    styleAlignedTurns: 0,
    teacherAuditedTurns: 0,
    teacherQuestionableTurns: 0,
    teacherUnknownTurns: 0,
    maxTeacherRegret: 0,
    teacherFindings: [],
    suspiciousActions: [],
  }
  let previousIntentTarget: string | null = null

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
        profile: level.aiProfile,
        rng: sheepRandom,
        budgets: hardMaxNodes === undefined ? undefined : { maxNodes: hardMaxNodes },
        memory: opponentMemory,
      })
      opponentMemory = decision.meta.nextMemory
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
      if (decision.meta.impact.activePressure) sheepDecisionQuality.activePressureTurns += 1
      if (decision.meta.impact.trappedWolfDelta > 0) sheepDecisionQuality.trapProgressTurns += 1
      if (decision.meta.impact.beneficialExchange) sheepDecisionQuality.beneficialExchangeTurns += 1
      if (decision.meta.impact.noProgress) sheepDecisionQuality.noProgressTurns += 1
      if (decision.meta.impact.styleAligned) sheepDecisionQuality.styleAlignedTurns += 1
      if (decision.meta.primaryStyle === 'hunter-counter'
        && (decision.meta.impact.hunterRiskDelta > 0 || decision.meta.impact.captureChainRiskDelta > 0)) {
        sheepDecisionQuality.hunterCounterTurns += 1
      }
      const targetBeforeDecision: string | null = previousIntentTarget
      if (targetBeforeDecision && decision.meta.targetWolfId === targetBeforeDecision) {
        sheepDecisionQuality.targetPersistentTurns += 1
      } else if (targetBeforeDecision && decision.meta.targetWolfId && decision.meta.targetWolfId !== targetBeforeDecision) {
        sheepDecisionQuality.targetSwitches += 1
      }
      previousIntentTarget = decision.meta.targetWolfId
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
      const targetSwitchRisk = targetBeforeDecision !== null
        && decision.meta.targetWolfId !== null
        && decision.meta.targetWolfId !== targetBeforeDecision
        && decision.meta.targetChangeReason === 'better-opportunity'
      const lateNoProgressRisk = decision.meta.impact.noProgress && state.plyCount >= state.maxPlies / 2
      const shouldAudit = hardMaxNodes === undefined
        && sheepDecisionQuality.teacherAuditedTurns < 1
        && Boolean(selected?.dominated || lowerChainAlternative || decision.meta.degraded || targetSwitchRisk || lateNoProgressRisk)
      if (shouldAudit) {
        // This bounded independent search audits suspicious production choices; it
        // never runs in live play and is not treated as an infallible oracle.
        const judgement = judgeSheepAction(state, action, { depth: 2, maxNodes: 8_000, regretTolerance: 12 })
        sheepDecisionQuality.teacherAuditedTurns += 1
        if (judgement.verdict === 'questionable') sheepDecisionQuality.teacherQuestionableTurns += 1
        if (judgement.verdict === 'unknown') sheepDecisionQuality.teacherUnknownTurns += 1
        sheepDecisionQuality.maxTeacherRegret = Math.max(sheepDecisionQuality.maxTeacherRegret, judgement.regret ?? 0)
        if (judgement.verdict !== 'supported') {
          sheepDecisionQuality.teacherFindings.push(
            `ply=${state.plyCount + 1} verdict=${judgement.verdict} regret=${judgement.regret ?? 'unknown'} nodes=${judgement.nodes} action=${actionLabel(action)}`,
          )
        }
      }
    }
    const eatenBefore = state.eatenSheep
    const beforeMove = state
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    if (beforeMove.toMove === 'wolf') opponentMemory = observeAiOpponentAction(opponentMemory, beforeMove, action, state)
    if (beforeMove.toMove === 'wolf' && action.type !== 'pass') {
      movesByWolf[action.pieceId] = (movesByWolf[action.pieceId] ?? 0) + 1
    }
    trace.push(`${state.plyCount}:${actionLabel(action)}`)
    observePosition()
    if (state.eatenSheep > eatenBefore && action.type === 'jump') {
      firstCapturePly ??= state.plyCount
      const captured = state.eatenSheep - eatenBefore
      capturesByWolf[action.pieceId] = (capturesByWolf[action.pieceId] ?? 0) + captured
      captureEvents.push({ wolfId: action.pieceId, ply: state.plyCount, total: state.eatenSheep })
    }
    if (state.status === 'playing' && state.chain && (strategy !== 'chain-aware' || !shouldContinueDiagnosticChain(state, wolfRandom))) {
      const ended = endWolfTurn(state)
      if (!ended.ok) throw new Error(ended.error)
      state = ended.state
      trace.push(`${state.plyCount}:end-chain`)
      observePosition()
    }
  }

  let previousWolf: string | null = null
  let currentStreak = 0
  let sameHunterCaptureStreak = 0
  for (const capture of captureEvents) {
    currentStreak = capture.wolfId === previousWolf ? currentStreak + 1 : 1
    sameHunterCaptureStreak = Math.max(sameHunterCaptureStreak, currentStreak)
    previousWolf = capture.wolfId
  }
  const fifth = captureEvents.find((capture) => capture.total >= 5)
  const final = captureEvents.find((capture) => capture.total >= state.targetEaten)
  return {
    seed,
    strategy,
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: terminalReason(state),
    plies: state.plyCount,
    eaten: state.eatenSheep,
    firstCapturePly,
    capturesByWolf,
    movesByWolf,
    dominantWolfShare: state.eatenSheep > 0 ? Math.max(0, ...Object.values(capturesByWolf)) / state.eatenSheep : 0,
    sameHunterCaptureStreak,
    closingCaptureSpan: fifth && final ? final.ply - fifth.ply : null,
    trace,
    repetitionCycle,
    finalSheepAdvantage: measureSheepAdvantage(state),
    sheepDecisionQuality,
  }
}

/**
 * Screens a level against the currently encoded red flags. Absence of findings only
 * means no encoded rule fired; it does not prove balance, fun or expert AI quality.
 */
export function buildCandidateAcceptanceReport(
  level: LevelConfig,
  games: CandidateGameEvidence[],
  seeds: number[],
): CandidateAcceptanceReport {
  const structuralErrors = validateLevel(level)
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
      averageDominantWolfShare: selected.reduce((sum, game) => sum + game.dominantWolfShare, 0) / Math.max(1, selected.length),
      maxSameHunterCaptureStreak: Math.max(0, ...selected.map((game) => game.sameHunterCaptureStreak)),
      activePressureRate: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.activePressureTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + game.sheepDecisionQuality.turns, 0)),
      targetPersistenceRate: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.targetPersistentTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + Math.max(0, game.sheepDecisionQuality.turns - 1), 0)),
      noProgressRate: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.noProgressTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + game.sheepDecisionQuality.turns, 0)),
      styleAlignmentRate: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.styleAlignedTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + game.sheepDecisionQuality.turns, 0)),
      beneficialExchangeTurns: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.beneficialExchangeTurns, 0),
      trapProgressTurns: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.trapProgressTurns, 0),
      hunterCounterTurns: selected.reduce((sum, game) => sum + game.sheepDecisionQuality.hunterCounterTurns, 0),
      teacherAuditedTurns: selected.reduce((sum, game) => sum + (game.sheepDecisionQuality.teacherAuditedTurns ?? 0), 0),
      teacherQuestionableTurns: selected.reduce((sum, game) => sum + (game.sheepDecisionQuality.teacherQuestionableTurns ?? 0), 0),
      teacherUnknownTurns: selected.reduce((sum, game) => sum + (game.sheepDecisionQuality.teacherUnknownTurns ?? 0), 0),
      maxTeacherRegret: Math.max(0, ...selected.map((game) => game.sheepDecisionQuality.maxTeacherRegret ?? 0)),
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
      findings.push({ severity: 'review', code: 'FIRST_CAPTURE_BLOCKED', message: 'both diagnostic wolf proxies fail to establish a capture in at least half of games; stronger player personas must decide whether a real wolf route remains', evidenceSeeds: evidence((game) => game.firstCapturePly === null) })
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
    const teacherQuestionableGames = games.filter((game) => (game.sheepDecisionQuality.teacherQuestionableTurns ?? 0) > 0)
    const teacherAuditedGames = games.filter((game) => (game.sheepDecisionQuality.teacherAuditedTurns ?? 0) > 0)
    const systematicTeacherDisagreement = teacherQuestionableGames.length >= Math.max(2, Math.ceil(teacherAuditedGames.length * 0.2))
      && Math.max(0, ...teacherQuestionableGames.map((game) => game.sheepDecisionQuality.maxTeacherRegret ?? 0)) >= 24
    if (systematicTeacherDisagreement) {
      findings.push({
        severity: 'review',
        code: 'AI_TEACHER_REGRET',
        message: 'independent bounded search repeatedly found a materially better sheep action across at least 20% of audited risk turns',
        evidenceSeeds: [...new Set(teacherQuestionableGames.map((game) => game.seed))],
      })
    }
    const serialHunterGames = mixed.filter((game) => game.winner === 'wolf'
      && game.dominantWolfShare >= 0.75
      && game.sameHunterCaptureStreak >= 4)
    if (serialHunterGames.length >= Math.max(2, Math.ceil(seeds.length * 0.2))) {
      findings.push({ severity: 'review', code: 'SERIAL_HUNTER_RISK', message: 'one wolf repeatedly accounts for most captures; inspect whether the other wolves created real control or the sheep missed a reusable route', evidenceSeeds: serialHunterGames.map((game) => game.seed) })
    }
    if (summaries.mixed.noProgressRate >= 0.7) {
      findings.push({ severity: 'review', code: 'AI_NO_PROGRESS_HIGH', message: 'at least 70% of sheep actions make no measured progress toward pressure, trapping or the configured style', evidenceSeeds: mixed.filter((game) => game.sheepDecisionQuality.noProgressTurns >= game.sheepDecisionQuality.turns * 0.7).map((game) => game.seed) })
    }
    if (level.aiProfile !== 'guided' && summaries.mixed.targetPersistenceRate < 0.35) {
      findings.push({ severity: 'review', code: 'AI_INTENT_UNSTABLE', message: 'the configured target persists across fewer than 35% of consecutive sheep decisions', evidenceSeeds: mixed.filter((game) => game.sheepDecisionQuality.targetPersistentTurns < Math.max(1, game.sheepDecisionQuality.turns - 1) * 0.35).map((game) => game.seed) })
    }
    if (summaries.mixed.styleAlignmentRate < 0.15) {
      findings.push({ severity: 'review', code: 'AI_STYLE_WEAK', message: 'fewer than 15% of sheep actions visibly advance the configured primary style', evidenceSeeds: mixed.filter((game) => game.sheepDecisionQuality.styleAlignedTurns < game.sheepDecisionQuality.turns * 0.15).map((game) => game.seed) })
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

export function assessLevelCandidate(level: LevelConfig, options: CandidateAcceptanceOptions = {}): CandidateAcceptanceReport {
  const seeds = options.seeds ?? DEFAULT_SEEDS
  const structuralErrors = validateLevel(level)
  const strategies = options.strategies ?? (['random', 'mixed', 'chain-aware'] as const)
  const games = structuralErrors.length === 0
    ? strategies.flatMap((strategy) => seeds.map((seed) => runCandidateGame(level, strategy, seed, options.hardMaxNodes)))
    : []
  return buildCandidateAcceptanceReport(level, games, seeds)
}
