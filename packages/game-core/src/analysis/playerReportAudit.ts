import { createAiOpponentMemory, createSeededRng, observeAiOpponentAction, pickSheepActionWithMeta } from '../ai/index'
import { analyzeSheepActions } from '../ai/evaluate'
import { createLevelInitialState, getLevel, levelConfigFingerprint } from '../content/levels'
import { applyAction, endWolfTurn, listLegalActions } from '../rules'
import type { Action, AiOpponentMemory, AiProfile, AiTargetChangeReason, BoardState } from '../types'
import { judgeSheepAction, type TeacherJudgement } from './sheepTeacher'

export type ReportAction = Action | { type: 'end-chain' }

export type PlayerReportInput = {
  kind?: string
  schema?: number
  rulesVersion?: number
  levelId: string
  aiProfile?: AiProfile
  aiAlgorithmVersion?: string
  initialAiSeed?: number
  nextAiSeed?: number
  hardBudget?: { maxNodes?: number; maxMs?: number | null }
  aiMemory?: AiOpponentMemory
  actions: ReportAction[]
}

export type AuditedSheepDecision = {
  actionIndex: number
  plyBefore: number
  action: Action
  legalActions: number
  reproducible: boolean
  dominated: boolean
  explanation: string
  selectedCaptureChain: number
  minimumCaptureChain: number
  avoidableImmediateExposure: boolean
  completedDepth: number
  degradedReason: string
  terminalUrgency: number
  targetWolfId: string | null
  targetChangeReason: AiTargetChangeReason
  focusControlDelta: number
  teacher?: TeacherJudgement
}

export type PlayerReportAudit = {
  ok: boolean
  error?: string
  levelId: string
  aiProfile: AiProfile
  configFingerprint: string
  final: { status: BoardState['status']; reason: BoardState['terminalReason']; plies: number; eaten: number }
  sheepTurns: number
  reproducibleTurns: number
  dominatedTurns: number
  avoidableImmediateExposureTurns: number
  captures: Array<{ actionIndex: number; ply: number; wolfId: string; total: number }>
  capturesByWolf: Record<string, number>
  dominantWolfShare: number
  sameHunterCaptureStreak: number
  closingCaptureSpan: number | null
  decisions: AuditedSheepDecision[]
}

function actionKey(action: Action) {
  return JSON.stringify(action)
}

function sanitizedBudget(input: PlayerReportInput) {
  const maxNodes = input.hardBudget?.maxNodes
  if (!Number.isSafeInteger(maxNodes) || maxNodes! < 1) return undefined
  const maxMs = input.hardBudget?.maxMs
  return typeof maxMs === 'number' && Number.isFinite(maxMs) && maxMs > 0
    ? { maxNodes: maxNodes!, maxMs }
    : { maxNodes: maxNodes! }
}

/** Replays a player problem package against canonical level rules and production AI. */
export function auditPlayerReport(input: PlayerReportInput, options: { teacher?: boolean } = {}): PlayerReportAudit {
  const level = getLevel(input.levelId)
  if (!level) throw new Error(`Unknown report level ${input.levelId}`)
  const canonicalLevel = level
  const profile = input.aiProfile ?? level.aiProfile
  let state = createLevelInitialState(level)
  let aiSeed = Number.isSafeInteger(input.initialAiSeed) ? input.initialAiSeed! : 0
  let opponentMemory = createAiOpponentMemory()
  const decisions: AuditedSheepDecision[] = []
  const captures: PlayerReportAudit['captures'] = []
  const capturesByWolf: Record<string, number> = {}

  for (const [index, rawAction] of input.actions.entries()) {
    if (state.status !== 'playing') return failed(`action ${index + 1} occurs after terminal state`)
    if (rawAction.type === 'end-chain') {
      const ended = endWolfTurn(state)
      if (!ended.ok) return failed(`action ${index + 1}: ${ended.error}`)
      state = ended.state
      continue
    }
    const action = rawAction
    if (state.toMove === 'sheep') {
      const analyses = analyzeSheepActions(state)
      const selected = analyses.find((candidate) => actionKey(candidate.action) === actionKey(action))
      if (!selected) return failed(`action ${index + 1}: recorded sheep action is not legal`)
      const nonDominated = analyses.filter((candidate) => !candidate.dominated)
      const comparison = nonDominated.length > 0 ? nonDominated : analyses
      const minimumCaptureChain = Math.min(...comparison.map((candidate) => candidate.maxCaptureChain))
      const replayed = pickSheepActionWithMeta(state, {
        profile,
        rng: createSeededRng(aiSeed + state.eatenSheep * 17 + state.pieces.length),
        budgets: sanitizedBudget(input),
        memory: opponentMemory,
      })
      opponentMemory = replayed.meta.nextMemory
      const avoidableImmediateExposure = selected.maxCaptureChain > minimumCaptureChain
      const decision: AuditedSheepDecision = {
        actionIndex: index + 1,
        plyBefore: state.plyCount,
        action,
        legalActions: analyses.length,
        reproducible: actionKey(replayed.action) === actionKey(action),
        dominated: selected.dominated,
        explanation: selected.explanation,
        selectedCaptureChain: selected.maxCaptureChain,
        minimumCaptureChain,
        avoidableImmediateExposure,
        completedDepth: replayed.meta.completedDepth,
        degradedReason: replayed.meta.degradedReason,
        terminalUrgency: state.eatenSheep / Math.max(1, state.targetEaten),
        targetWolfId: replayed.meta.targetWolfId,
        targetChangeReason: replayed.meta.targetChangeReason,
        focusControlDelta: replayed.meta.impact.focusControlDelta,
      }
      if (options.teacher && (selected.dominated || avoidableImmediateExposure)) {
        decision.teacher = judgeSheepAction(state, action)
      }
      decisions.push(decision)
      aiSeed += 1
    }

    const beforeEaten = state.eatenSheep
    const before = state
    const result = applyAction(state, action)
    if (!result.ok) return failed(`action ${index + 1}: ${result.error}`)
    state = result.state
    if (before.toMove === 'wolf') opponentMemory = observeAiOpponentAction(opponentMemory, before, action, state)
    if (state.eatenSheep > beforeEaten && action.type === 'jump') {
      const amount = state.eatenSheep - beforeEaten
      capturesByWolf[action.pieceId] = (capturesByWolf[action.pieceId] ?? 0) + amount
      captures.push({ actionIndex: index + 1, ply: state.plyCount, wolfId: action.pieceId, total: state.eatenSheep })
    }
  }

  return buildResult()

  function failed(error: string): PlayerReportAudit {
    return { ...buildResult(), ok: false, error }
  }

  function buildResult(): PlayerReportAudit {
    const dominantWolfShare = state.eatenSheep > 0 ? Math.max(0, ...Object.values(capturesByWolf)) / state.eatenSheep : 0
    let previous: string | null = null
    let current = 0
    let sameHunterCaptureStreak = 0
    for (const capture of captures) {
      current = previous === capture.wolfId ? current + 1 : 1
      sameHunterCaptureStreak = Math.max(sameHunterCaptureStreak, current)
      previous = capture.wolfId
    }
    const fifth = captures.find((capture) => capture.total >= 5)
    const final = captures.find((capture) => capture.total >= state.targetEaten)
    return {
      ok: true,
      levelId: canonicalLevel.id,
      aiProfile: profile,
      configFingerprint: levelConfigFingerprint(canonicalLevel),
      final: { status: state.status, reason: state.terminalReason, plies: state.plyCount, eaten: state.eatenSheep },
      sheepTurns: decisions.length,
      reproducibleTurns: decisions.filter((decision) => decision.reproducible).length,
      dominatedTurns: decisions.filter((decision) => decision.dominated).length,
      avoidableImmediateExposureTurns: decisions.filter((decision) => decision.avoidableImmediateExposure).length,
      captures,
      capturesByWolf,
      dominantWolfShare,
      sameHunterCaptureStreak,
      closingCaptureSpan: fifth && final ? final.ply - fifth.ply : null,
      decisions,
    }
  }
}
