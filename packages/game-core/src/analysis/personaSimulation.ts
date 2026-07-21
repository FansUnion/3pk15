import { createAiOpponentMemory, createSeededRng, observeAiOpponentAction, pickSheepActionWithMeta } from '../ai/index'
import { analyzeSheepActions } from '../ai/evaluate'
import type { LevelConfig } from '../content/levels'
import { createLevelInitialState } from '../content/levels'
import { applyAction, endWolfTurn, listLegalActions } from '../rules'
import type { Action } from '../types'
import {
  choosePlayerPersonaAction,
  createPlayerPersonaMemory,
  recordPlayerPersonaAction,
  shouldContinuePlayerPersonaChain,
  type PlayerPersona,
} from './playerPersona'

export type PersonaGameEvidence = {
  levelId: string
  persona: PlayerPersona
  seed: number
  winner: 'wolf' | 'sheep' | 'draw'
  reason: string
  plies: number
  eaten: number
  firstCapturePly: number | null
  capturesByWolf: Record<string, number>
  movesByWolf: Record<string, number>
  dominantWolfShare: number
  sameHunterCaptureStreak: number
  closingCaptureSpan: number | null
  sheepTurns: number
  dominatedSheepTurns: number
  higherChainExposureTurns: number
  degradedSheepTurns: number
  activePressureTurns: number
  targetPersistentTurns: number
  targetSwitches: number
  trapProgressTurns: number
  beneficialExchangeTurns: number
  noProgressTurns: number
  hunterCounterTurns: number
  styleAlignedTurns: number
  trace: string[]
}

export type PersonaMatrixReport = {
  levelId: string
  aiProfile: LevelConfig['aiProfile']
  aiStyle: LevelConfig['aiStyle']
  opponentIntent: LevelConfig['opponentIntent']
  seeds: number[]
  games: PersonaGameEvidence[]
  summaries: Record<PlayerPersona, {
    games: number
    wolfWins: number
    sheepWins: number
    draws: number
    averagePlies: number
    averageEaten: number
    averageDominantWolfShare: number
    maxSameHunterCaptureStreak: number
    dominatedSheepTurns: number
    higherChainExposureTurns: number
    degradedSheepTurns: number
    activePressureRate: number
    targetPersistenceRate: number
    noProgressRate: number
    styleAlignmentRate: number
    beneficialExchangeTurns: number
    trapProgressTurns: number
    hunterCounterTurns: number
  }>
}

const PERSONAS: PlayerPersona[] = ['novice', 'regular', 'skilled', 'expert']

function actionLabel(action: ReturnType<typeof listLegalActions>[number]) {
  if (action.type === 'pass') return 'pass'
  return `${action.type}:${action.pieceId}>${action.to.r},${action.to.c}`
}

export function simulatePersonaGame(level: LevelConfig, persona: PlayerPersona, seed: number): PersonaGameEvidence {
  let state = createLevelInitialState(level)
  const wolfRng = createSeededRng(seed)
  const sheepRng = createSeededRng(seed ^ 0x5f3759df)
  const memory = createPlayerPersonaMemory()
  let opponentMemory = createAiOpponentMemory()
  const captures: Array<{ wolfId: string; ply: number; total: number }> = []
  const trace: string[] = []
  let firstCapturePly: number | null = null
  let sheepTurns = 0
  let dominatedSheepTurns = 0
  let higherChainExposureTurns = 0
  let degradedSheepTurns = 0
  let activePressureTurns = 0
  let targetPersistentTurns = 0
  let targetSwitches = 0
  let trapProgressTurns = 0
  let beneficialExchangeTurns = 0
  let noProgressTurns = 0
  let hunterCounterTurns = 0
  let styleAlignedTurns = 0
  let previousIntentTarget: string | null = null

  while (state.status === 'playing') {
    const actions = listLegalActions(state)
    if (actions.length === 0) break
    const before = state
    let action: Action
    if (state.toMove === 'wolf') {
      action = choosePlayerPersonaAction(state, actions, wolfRng, persona, memory)
    } else {
      const analyses = analyzeSheepActions(state)
      const decision = pickSheepActionWithMeta(state, { profile: level.aiProfile, rng: sheepRng, memory: opponentMemory })
      opponentMemory = decision.meta.nextMemory
      action = decision.action
      const selected = analyses.find((candidate) => actionLabel(candidate.action) === actionLabel(action))
      const minimumChain = Math.min(...analyses.map((candidate) => candidate.maxCaptureChain))
      sheepTurns += 1
      if (selected?.dominated) dominatedSheepTurns += 1
      // This is a broad warning signal, not proof of a blunder: the move may trade
      // immediate chain safety for trapping, mobility or a longer-term objective.
      if (selected && selected.maxCaptureChain > minimumChain) higherChainExposureTurns += 1
      if (decision.meta.degraded) degradedSheepTurns += 1
      if (decision.meta.impact.activePressure) activePressureTurns += 1
      if (decision.meta.impact.trappedWolfDelta > 0) trapProgressTurns += 1
      if (decision.meta.impact.beneficialExchange) beneficialExchangeTurns += 1
      if (decision.meta.impact.noProgress) noProgressTurns += 1
      if (decision.meta.impact.styleAligned) styleAlignedTurns += 1
      if (decision.meta.primaryStyle === 'hunter-counter'
        && (decision.meta.impact.hunterRiskDelta > 0 || decision.meta.impact.captureChainRiskDelta > 0)) hunterCounterTurns += 1
      if (previousIntentTarget && decision.meta.targetWolfId === previousIntentTarget) targetPersistentTurns += 1
      else if (previousIntentTarget && decision.meta.targetWolfId && decision.meta.targetWolfId !== previousIntentTarget) targetSwitches += 1
      previousIntentTarget = decision.meta.targetWolfId
    }
    const result = applyAction(state, action)
    if (!result.ok) throw new Error(result.error)
    state = result.state
    trace.push(`${state.plyCount}:${actionLabel(action)}`)
    if (before.toMove === 'wolf') {
      opponentMemory = observeAiOpponentAction(opponentMemory, before, action, state)
      recordPlayerPersonaAction(before, action, state, memory)
      if (state.eatenSheep > before.eatenSheep && action.type !== 'pass') {
        captures.push({ wolfId: action.pieceId, ply: state.plyCount, total: state.eatenSheep })
        firstCapturePly ??= state.plyCount
      }
      if (state.status === 'playing' && state.chain && !shouldContinuePlayerPersonaChain(state, wolfRng, persona, memory)) {
        const ended = endWolfTurn(state)
        if (!ended.ok) throw new Error(ended.error)
        state = ended.state
        trace.push(`${state.plyCount}:end-chain`)
      }
    }
  }

  const captureCounts = Object.values(memory.capturesByWolf)
  const dominantWolfShare = state.eatenSheep > 0 ? Math.max(0, ...captureCounts) / state.eatenSheep : 0
  let sameHunterCaptureStreak = 0
  let currentStreak = 0
  let previousWolf: string | null = null
  for (const capture of captures) {
    currentStreak = capture.wolfId === previousWolf ? currentStreak + 1 : 1
    sameHunterCaptureStreak = Math.max(sameHunterCaptureStreak, currentStreak)
    previousWolf = capture.wolfId
  }
  const fifth = captures.find((capture) => capture.total >= 5)
  const eighth = captures.find((capture) => capture.total >= state.targetEaten)

  return {
    levelId: level.id,
    persona,
    seed,
    winner: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
    reason: state.terminalReason ?? 'unexpected',
    plies: state.plyCount,
    eaten: state.eatenSheep,
    firstCapturePly,
    capturesByWolf: { ...memory.capturesByWolf },
    movesByWolf: { ...memory.movesByWolf },
    dominantWolfShare,
    sameHunterCaptureStreak,
    closingCaptureSpan: fifth && eighth ? eighth.ply - fifth.ply : null,
    sheepTurns,
    dominatedSheepTurns,
    higherChainExposureTurns,
    degradedSheepTurns,
    activePressureTurns,
    targetPersistentTurns,
    targetSwitches,
    trapProgressTurns,
    beneficialExchangeTurns,
    noProgressTurns,
    hunterCounterTurns,
    styleAlignedTurns,
    trace,
  }
}

export function assessPersonaMatrix(level: LevelConfig, seeds = [20260720, 20260721, 20260722]): PersonaMatrixReport {
  const games = PERSONAS.flatMap((persona) => seeds.map((seed) => simulatePersonaGame(level, persona, seed)))
  const summaries = Object.fromEntries(PERSONAS.map((persona) => {
    const selected = games.filter((game) => game.persona === persona)
    return [persona, {
      games: selected.length,
      wolfWins: selected.filter((game) => game.winner === 'wolf').length,
      sheepWins: selected.filter((game) => game.winner === 'sheep').length,
      draws: selected.filter((game) => game.winner === 'draw').length,
      averagePlies: selected.reduce((sum, game) => sum + game.plies, 0) / Math.max(1, selected.length),
      averageEaten: selected.reduce((sum, game) => sum + game.eaten, 0) / Math.max(1, selected.length),
      averageDominantWolfShare: selected.reduce((sum, game) => sum + game.dominantWolfShare, 0) / Math.max(1, selected.length),
      maxSameHunterCaptureStreak: Math.max(0, ...selected.map((game) => game.sameHunterCaptureStreak)),
      dominatedSheepTurns: selected.reduce((sum, game) => sum + game.dominatedSheepTurns, 0),
      higherChainExposureTurns: selected.reduce((sum, game) => sum + game.higherChainExposureTurns, 0),
      degradedSheepTurns: selected.reduce((sum, game) => sum + game.degradedSheepTurns, 0),
      activePressureRate: selected.reduce((sum, game) => sum + game.activePressureTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + game.sheepTurns, 0)),
      targetPersistenceRate: selected.reduce((sum, game) => sum + game.targetPersistentTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + Math.max(0, game.sheepTurns - 1), 0)),
      noProgressRate: selected.reduce((sum, game) => sum + game.noProgressTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + game.sheepTurns, 0)),
      styleAlignmentRate: selected.reduce((sum, game) => sum + game.styleAlignedTurns, 0) / Math.max(1, selected.reduce((sum, game) => sum + game.sheepTurns, 0)),
      beneficialExchangeTurns: selected.reduce((sum, game) => sum + game.beneficialExchangeTurns, 0),
      trapProgressTurns: selected.reduce((sum, game) => sum + game.trapProgressTurns, 0),
      hunterCounterTurns: selected.reduce((sum, game) => sum + game.hunterCounterTurns, 0),
    }]
  })) as PersonaMatrixReport['summaries']
  return { levelId: level.id, aiProfile: level.aiProfile, aiStyle: level.aiStyle, opponentIntent: level.opponentIntent, seeds, games, summaries }
}
