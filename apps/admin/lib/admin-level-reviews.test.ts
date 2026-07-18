import { describe, expect, it } from 'vitest'
import { parseLevelReviewsJson, reviewCompletion, type LevelReview } from './admin-level-reviews'

const complete: LevelReview = {
  levelId: 'spring-01', levelVersion: 'abc', status: 'passed', attempts: 2,
  result: 'wolf', difficultyRating: 2, device: 'mobile', playerExperience: 'casual',
  strategyUnderstanding: 'clear', teachingUnderstanding: 'clear', boardReadability: 'clear',
  rewardUnderstanding: 'clear', issueCategory: 'none', severity: 'none', notes: '',
  reproduction: '', reviewedAt: '2026-07-17T00:00:00.000Z',
}

describe('admin level reviews', () => {
  it('recognizes a complete evidence record', () => {
    expect(reviewCompletion(complete)).toEqual({ complete: true, completed: 10, total: 10 })
  })

  it('keeps old review exports compatible but incomplete', () => {
    const legacy = { 'spring-01': { levelId: 'spring-01', levelVersion: 'abc', status: 'unreviewed', attempts: 0, notes: '', reviewedAt: '2026-07-17T00:00:00.000Z' } }
    const parsed = parseLevelReviewsJson(JSON.stringify(legacy))
    expect(parsed).not.toBeNull()
    expect(reviewCompletion(parsed?.['spring-01']).complete).toBe(false)
  })
})
