import type { CandidateVerdict } from '@wolf-sheep/game-core'

export const CANDIDATE_BASELINE_DATE = '2026-07-17'

type BaselineEntry = {
  verdict: CandidateVerdict
  findingCodes: string[]
}

const REVIEW_STRATEGY = ['STRATEGY_SENSITIVE']

export const CANDIDATE_BASELINE: Record<string, BaselineEntry> = {
  'spring-01': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'spring-02': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'spring-03': { verdict: 'review', findingCodes: ['LONG_TAIL', 'STRATEGY_SENSITIVE'] },
  'spring-04': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'spring-05': { verdict: 'pass', findingCodes: [] },
  'spring-06': { verdict: 'pass', findingCodes: [] },
  'summer-01': { verdict: 'pass', findingCodes: [] },
  'summer-02': { verdict: 'pass', findingCodes: [] },
  'summer-03': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'summer-04': { verdict: 'pass', findingCodes: [] },
  'summer-05': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'summer-06': { verdict: 'pass', findingCodes: [] },
  'autumn-01': { verdict: 'pass', findingCodes: [] },
  'autumn-02': { verdict: 'pass', findingCodes: [] },
  'autumn-03': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'autumn-04': { verdict: 'pass', findingCodes: [] },
  'autumn-05': { verdict: 'pass', findingCodes: [] },
  'autumn-06': { verdict: 'pass', findingCodes: [] },
  'winter-01': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'winter-02': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'winter-03': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'winter-04': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
  'winter-05': { verdict: 'review', findingCodes: ['LONG_TAIL', 'STRATEGY_SENSITIVE'] },
  'winter-06': { verdict: 'review', findingCodes: REVIEW_STRATEGY },
}
