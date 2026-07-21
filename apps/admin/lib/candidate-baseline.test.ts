import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CandidateAcceptanceReport } from '@wolf-sheep/game-core'
import { CANDIDATE_BASELINE, CANDIDATE_BASELINE_DATE } from './candidate-baseline'

describe('Admin candidate baseline', () => {
  it('matches the preserved V5 candidate evidence exactly', () => {
    const path = resolve(process.cwd(), '../../docs/产品核心/验证记录/2026-07-20-ai-v5-候选验收.json')
    const evidence = JSON.parse(readFileSync(path, 'utf8')) as { aiAlgorithmVersion: string; reports: CandidateAcceptanceReport[] }
    expect(CANDIDATE_BASELINE_DATE).toContain(evidence.aiAlgorithmVersion)
    expect(Object.keys(CANDIDATE_BASELINE)).toHaveLength(24)
    for (const report of evidence.reports) {
      expect(CANDIDATE_BASELINE[report.levelId]).toEqual({
        verdict: report.verdict,
        findingCodes: report.findings.map((finding) => finding.code),
      })
    }
  })
})
