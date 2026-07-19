import { assessLevelCandidate, type CandidateAcceptanceReport } from './candidateAcceptance'
import { solveFinitePosition, type FiniteSolveResult } from './finiteSolver'
import { analyzeLevelTopology, type LevelTopology } from './topology'
import { createLevelInitialState } from '../content/levels'
import type { LevelConfig } from '../content/levels'

export type LevelAuditVerdict = 'pass' | 'review' | 'reject'

export type LevelAuditReport = {
  levelId: string
  verdict: LevelAuditVerdict
  reasons: string[]
  topology: LevelTopology
  simulation: CandidateAcceptanceReport
  finite: FiniteSolveResult
}

export type LevelAuditOptions = {
  seeds?: number[]
  hardMaxNodes?: number
  solveDepth?: number
  solveMaxNodes?: number
}

export function auditLevel(level: LevelConfig, options: LevelAuditOptions = {}): LevelAuditReport {
  const topology = analyzeLevelTopology(level)
  const simulation = assessLevelCandidate(level, {
    seeds: options.seeds,
    hardMaxNodes: options.hardMaxNodes,
  })
  const finite = solveFinitePosition(createLevelInitialState(level), {
    maxDepth: options.solveDepth ?? 4,
    maxNodes: options.solveMaxNodes ?? 10_000,
  })
  const reasons: string[] = []
  if (simulation.verdict === 'reject') reasons.push(...simulation.findings.filter((finding) => finding.severity === 'reject').map((finding) => finding.code))
  if (simulation.verdict === 'review') reasons.push(...simulation.findings.filter((finding) => finding.severity === 'review').map((finding) => finding.code))
  if (topology.traversableComponents > 1) reasons.push('TOPOLOGY_DISCONNECTED')
  if (topology.deadEnds.length >= 3) reasons.push('DEAD_END_PRESSURE')
  if (topologySignatureRisk(topology)) reasons.push('REPEATED_ROCK_TOPOLOGY')
  const gameCount = simulation.games.filter((game) => game.strategy === 'mixed').length
  if (Math.abs(simulation.summaries['chain-aware'].wolfWins - simulation.summaries.mixed.wolfWins) >= Math.max(2, Math.ceil(gameCount * 0.4))) {
    reasons.push('CHAIN_POLICY_SENSITIVE')
  }
  const verdict: LevelAuditVerdict = reasons.some((reason) => ['TOPOLOGY_DISCONNECTED', 'WOLF_FORCED_WIN_RISK', 'FIRST_CAPTURE_BLOCKED', 'UNEXPECTED_TERMINAL'].includes(reason))
    ? 'reject'
    : reasons.length > 0 || finite.verdict !== 'unknown' ? 'review' : 'pass'
  return { levelId: level.id, verdict, reasons: [...new Set(reasons)], topology, simulation, finite }
}

function topologySignatureRisk(topology: LevelTopology): boolean {
  return topology.rockCount >= 4 && (topology.articulationPoints.length >= 3 || topology.alignedRockGaps.length >= 2)
}

export function auditLevels(levels: LevelConfig[], options: LevelAuditOptions = {}): LevelAuditReport[] {
  return levels.map((level) => auditLevel(level, options))
}
