import type { PlayerPersona } from './playerPersona'
import type { PersonaMatrixReport } from './personaSimulation'
import { getLevel } from '../content/levels'
import { learningStageForLevel, type LearningStageId } from '../content/learningCurve'

const PERSONAS: readonly PlayerPersona[] = ['novice', 'regular', 'skilled', 'expert']

export type LearningCurveFinding = {
  severity: 'reject' | 'review'
  code: string
  message: string
  levels: string[]
}

export type LearningCurveAssessment = {
  passed: boolean
  complete: boolean
  globalWolfWinRates: Record<PlayerPersona, number>
  stageSkillGain: Record<LearningStageId, number>
  findings: LearningCurveFinding[]
}

function winRate(reports: PersonaMatrixReport[], persona: PlayerPersona) {
  const games = reports.reduce((sum, report) => sum + report.summaries[persona].games, 0)
  const wins = reports.reduce((sum, report) => sum + report.summaries[persona].wolfWins, 0)
  return wins / Math.max(1, games)
}

/** Product curve gate: skill must matter globally and within each two-level stage.
 * Seasons are not required to be monotonically harder because map concepts differ.
 */
export function assessLearningCurve(reports: PersonaMatrixReport[]): LearningCurveAssessment {
  const findings: LearningCurveFinding[] = []
  const complete = reports.length === 24 && new Set(reports.map((report) => report.levelId)).size === 24
  if (!complete) findings.push({ severity: 'reject', code: 'CURVE_MATRIX_INCOMPLETE', message: 'learning-curve evidence must include all 24 unique production levels', levels: reports.map((report) => report.levelId) })
  const globalWolfWinRates = Object.fromEntries(PERSONAS.map((persona) => [persona, winRate(reports, persona)])) as Record<PlayerPersona, number>
  for (let index = 1; index < PERSONAS.length; index += 1) {
    const previous = PERSONAS[index - 1]!
    const current = PERSONAS[index]!
    if (globalWolfWinRates[current] + 0.02 < globalWolfWinRates[previous]) {
      findings.push({ severity: 'reject', code: 'GLOBAL_SKILL_INVERSION', message: `${current} performs materially worse than ${previous}`, levels: reports.map((report) => report.levelId) })
    }
  }

  const grouped = new Map<LearningStageId, PersonaMatrixReport[]>()
  for (const report of reports) {
    const level = getLevel(report.levelId)
    if (!level) continue
    const stage = learningStageForLevel(level).id
    grouped.set(stage, [...(grouped.get(stage) ?? []), report])
  }
  const stageSkillGain = {} as Record<LearningStageId, number>
  for (const [stage, selected] of grouped) {
    const gain = winRate(selected, 'expert') - winRate(selected, 'novice')
    stageSkillGain[stage] = gain
    if (selected.length !== 2) findings.push({ severity: 'reject', code: 'STAGE_PAIR_INCOMPLETE', message: `${stage} must contain exactly two levels`, levels: selected.map((report) => report.levelId) })
    if (gain < -0.05) findings.push({ severity: 'review', code: 'STAGE_SKILL_INVERSION', message: `${stage} rewards the novice proxy more than the expert proxy`, levels: selected.map((report) => report.levelId) })
  }

  const spring = reports.filter((report) => report.levelId.startsWith('spring-'))
  const winter = reports.filter((report) => report.levelId.startsWith('winter-'))
  if (spring.length > 0 && winRate(spring, 'novice') < 0.2) findings.push({ severity: 'review', code: 'SPRING_ENTRY_TOO_HARD', message: 'novice proxy wins fewer than 20% of spring games', levels: spring.map((report) => report.levelId) })
  if (winter.length > 0 && winRate(winter, 'novice') > 0.8) findings.push({ severity: 'review', code: 'WINTER_NOVICE_TOO_EASY', message: 'novice proxy wins more than 80% of winter games', levels: winter.map((report) => report.levelId) })
  if (winter.length > 0 && winRate(winter, 'expert') < 0.25) findings.push({ severity: 'reject', code: 'WINTER_ROUTE_CLOSED', message: 'expert proxy wins fewer than 25% of winter games; wolf routes may be closed', levels: winter.map((report) => report.levelId) })
  if (winter.length > 0 && winRate(winter, 'expert') > 0.98) findings.push({ severity: 'review', code: 'WINTER_EXPERT_UNCHALLENGED', message: 'expert proxy wins more than 98% of winter games', levels: winter.map((report) => report.levelId) })

  return {
    passed: !findings.some((finding) => finding.severity === 'reject'),
    complete,
    globalWolfWinRates,
    stageSkillGain,
    findings,
  }
}
