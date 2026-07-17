import { createSeededRng, pickSheepAction } from '../ai/index'
import { evaluateScore } from '../ai/evaluate'
import { validateLevel, createLevelInitialState, type LevelConfig } from '../content/levels'
import {
  applyAction,
  boardPositionKey,
  endWolfTurn,
  listLegalActions,
  listWolfActionsAsIfTurn,
} from '../rules'
import type { Action, BoardState } from '../types'

export type CandidateWolfStrategy = 'random' | 'mixed'
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
}

export type CandidateFinding = {
  severity: 'reject' | 'review'
  code: string
  message: string
  evidenceSeeds: number[]
}

export type CandidateAcceptanceReport = {
  levelId: string
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

function chooseWolfAction(state: BoardState, actions: Action[], random: ReturnType<typeof createSeededRng>, strategy: CandidateWolfStrategy) {
  if (strategy === 'random') return actions[Math.floor(random.nextFloat() * actions.length)]!
  const scored = actions.map((action) => {
    const result = applyAction(state, action)
    return { action, score: result.ok ? evaluateScore(result.state) : Infinity }
  })
  const best = Math.min(...scored.map((item) => item.score))
  const candidates = scored.filter((item) => item.score === best)
  if (random.nextFloat() < 0.35) return actions[Math.floor(random.nextFloat() * actions.length)]!
  return candidates[Math.floor(random.nextFloat() * candidates.length)]!.action
}

function actionLabel(action: Action) {
  const through = action.type === 'jump' ? ` via ${action.through.r},${action.through.c}` : ''
  return `${action.type}:${action.pieceId}>${action.to.r},${action.to.c}${through}`
}

function terminalReason(state: BoardState): CandidateGameEvidence['reason'] {
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= 3) return 'repetition'
  return 'unexpected'
}

function runCandidateGame(level: LevelConfig, strategy: CandidateWolfStrategy, seed: number, hardMaxNodes: number): CandidateGameEvidence {
  let state = createLevelInitialState(level)
  const random = createSeededRng(seed)
  const trace: string[] = []
  let firstCapturePly: number | null = null

  while (state.status === 'playing') {
    const actions = listLegalActions(state)
    if (actions.length === 0) break
    const action = state.toMove === 'wolf'
      ? chooseWolfAction(state, actions, random, strategy)
      : pickSheepAction(state, {
        difficulty: level.ai,
        rng: random,
        budgets: level.ai === 'hard' ? { maxNodes: hardMaxNodes } : undefined,
      })
    const eatenBefore = state.eatenSheep
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    trace.push(`${state.plyCount}:${actionLabel(action)}`)
    if (firstCapturePly === null && state.eatenSheep > eatenBefore) firstCapturePly = state.plyCount
    if (state.status === 'playing' && state.chain) {
      const ended = endWolfTurn(state)
      if (!ended.ok) throw new Error(ended.error)
      state = ended.state
      trace.push(`${state.plyCount}:end-chain`)
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
  }
}

export function assessLevelCandidate(level: LevelConfig, options: CandidateAcceptanceOptions = {}): CandidateAcceptanceReport {
  const structuralErrors = validateLevel(level)
  const seeds = options.seeds ?? DEFAULT_SEEDS
  const hardMaxNodes = options.hardMaxNodes ?? 80
  const games = structuralErrors.length === 0
    ? (['random', 'mixed'] as const).flatMap((strategy) => seeds.map((seed) => runCandidateGame(level, strategy, seed, hardMaxNodes)))
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
    }
  }
  const summaries = { random: summarize('random'), mixed: summarize('mixed') }
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
    if (summaries.mixed.firstCaptureCoverage < 0.8) {
      findings.push({ severity: 'reject', code: 'FIRST_CAPTURE_BLOCKED', message: 'mixed strategy fails to capture in more than 20% of games', evidenceSeeds: evidence((game) => game.firstCapturePly === null) })
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
    const unexpected = games.filter((game) => game.reason === 'unexpected')
    if (unexpected.length > 0) {
      findings.push({ severity: 'reject', code: 'UNEXPECTED_TERMINAL', message: 'simulation reached an unclassified terminal state', evidenceSeeds: unexpected.map((game) => game.seed) })
    }
  }

  const verdict: CandidateVerdict = findings.some((finding) => finding.severity === 'reject')
    ? 'reject'
    : findings.some((finding) => finding.severity === 'review') ? 'review' : 'pass'
  return { levelId: level.id, verdict, structuralErrors, findings, games, summaries }
}
