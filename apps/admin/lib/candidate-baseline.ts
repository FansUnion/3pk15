import type { CandidateVerdict } from '@wolf-sheep/game-core'

export const CANDIDATE_BASELINE_DATE = '2026-07-20 · sheep-ai-v3'

type BaselineEntry = {
  verdict: CandidateVerdict
  findingCodes: string[]
}

export const CANDIDATE_BASELINE: Record<string, BaselineEntry> = {
  'spring-01': { verdict: 'pass', findingCodes: [] },
  'spring-02': { verdict: 'review', findingCodes: ['LONG_TAIL'] },
  'spring-03': { verdict: 'pass', findingCodes: [] },
  'spring-04': { verdict: 'pass', findingCodes: [] },
  'spring-05': { verdict: 'pass', findingCodes: [] },
  'spring-06': { verdict: 'pass', findingCodes: [] },
  'summer-01': { verdict: 'review', findingCodes: ['LONG_TAIL'] },
  'summer-02': { verdict: 'pass', findingCodes: [] },
  'summer-03': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'summer-04': { verdict: 'pass', findingCodes: [] },
  'summer-05': { verdict: 'pass', findingCodes: [] },
  'summer-06': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'autumn-01': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'autumn-02': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'autumn-03': { verdict: 'pass', findingCodes: [] },
  'autumn-04': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'autumn-05': { verdict: 'pass', findingCodes: [] },
  'autumn-06': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'winter-01': { verdict: 'pass', findingCodes: [] },
  'winter-02': { verdict: 'review', findingCodes: ['LONG_TAIL'] },
  'winter-03': { verdict: 'pass', findingCodes: [] },
  'winter-04': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'winter-05': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'winter-06': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
}
