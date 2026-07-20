import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { auditPlayerReport, type PlayerReportInput } from '../src/index'

const reportPath = process.env.PLAYER_REPORT_PATH
const enabled = reportPath ? describe : describe.skip

enabled('player report audit command', () => {
  it('replays and explains the supplied player report', () => {
    const input = JSON.parse(readFileSync(reportPath!, 'utf8')) as PlayerReportInput
    const audit = auditPlayerReport(input, { teacher: true })
    console.log(JSON.stringify({
      ok: audit.ok,
      levelId: audit.levelId,
      recordedAiAlgorithmVersion: input.aiAlgorithmVersion ?? 'unknown',
      currentReplayProfile: audit.aiProfile,
      final: audit.final,
      reproducedSheepActions: `${audit.reproducibleTurns}/${audit.sheepTurns}`,
      capturesByWolf: audit.capturesByWolf,
      dominantWolfShare: audit.dominantWolfShare,
      sameHunterCaptureStreak: audit.sameHunterCaptureStreak,
      dominatedTurns: audit.dominatedTurns,
      avoidableImmediateExposureTurns: audit.avoidableImmediateExposureTurns,
      degradedTurns: audit.decisions.filter((decision) => decision.degradedReason !== 'none').length,
      teacherFindings: audit.decisions
        .filter((decision) => decision.teacher && decision.teacher.verdict !== 'supported')
        .map((decision) => ({ plyBefore: decision.plyBefore, action: decision.action, teacher: decision.teacher })),
      error: audit.error,
    }, null, 2))
    expect(audit.ok).toBe(true)
  }, 120_000)
})
