import type { CandidateVerdict } from '@wolf-sheep/game-core'

export const CANDIDATE_BASELINE_DATE = '2026-07-20 · sheep-ai-v5'

type BaselineEntry = {
  verdict: CandidateVerdict
  findingCodes: string[]
}

export const CANDIDATE_BASELINE: Record<string, BaselineEntry> = {
  'spring-01': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'spring-02': { verdict: 'review', findingCodes: ['LONG_TAIL'] },
  'spring-03': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'spring-04': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'spring-05': { verdict: 'review', findingCodes: ['SERIAL_HUNTER_RISK'] },
  'spring-06': { verdict: 'pass', findingCodes: [] },
  'summer-01': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'summer-02': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'summer-03': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'summer-04': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET', 'SERIAL_HUNTER_RISK'] },
  'summer-05': { verdict: 'pass', findingCodes: [] },
  'summer-06': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'autumn-01': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_BLOCKED', 'AI_TEACHER_REGRET'] },
  'autumn-02': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK'] },
  'autumn-03': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'autumn-04': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_BLOCKED', 'LONG_TAIL', 'AI_TEACHER_REGRET'] },
  'autumn-05': { verdict: 'pass', findingCodes: [] },
  'autumn-06': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'winter-01': { verdict: 'pass', findingCodes: [] },
  'winter-02': { verdict: 'review', findingCodes: ['LONG_TAIL', 'AI_TEACHER_REGRET'] },
  'winter-03': { verdict: 'review', findingCodes: ['AI_TEACHER_REGRET'] },
  'winter-04': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_BLOCKED', 'LONG_TAIL', 'AI_TEACHER_REGRET'] },
  'winter-05': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK', 'AI_TEACHER_REGRET'] },
  'winter-06': { verdict: 'review', findingCodes: ['FIRST_CAPTURE_RISK', 'AI_TEACHER_REGRET'] },
}
