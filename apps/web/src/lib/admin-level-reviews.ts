export const ADMIN_LEVEL_REVIEWS_KEY = 'wolf-sheep:admin-level-reviews:v1'

export type LevelReviewStatus = 'unreviewed' | 'passed' | 'needs_changes'

export type LevelReview = {
  levelId: string
  levelVersion: string
  status: LevelReviewStatus
  difficultyRating?: 1 | 2 | 3 | 4 | 5
  attempts: number
  result?: 'wolf' | 'sheep' | 'draw'
  terminalReason?: string
  plies?: number
  eatenSheep?: number
  firstCapturePly?: number | null
  durationMs?: number
  notes: string
  reviewedAt: string
}

export type LevelReviewMap = Record<string, LevelReview>

export function loadLevelReviews(): LevelReviewMap {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ADMIN_LEVEL_REVIEWS_KEY) ?? '{}')
    return isReviewMap(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveLevelReviews(reviews: LevelReviewMap) {
  window.localStorage.setItem(ADMIN_LEVEL_REVIEWS_KEY, JSON.stringify(reviews))
}

export function parseLevelReviewsJson(text: string): LevelReviewMap | null {
  try {
    const parsed = JSON.parse(text)
    return isReviewMap(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function levelVersion(level: { id: string; rocks: unknown; opening?: unknown; ai: string; targetEaten?: number; maxPlies?: number }) {
  const source = JSON.stringify([level.id, level.rocks, level.opening, level.ai, level.targetEaten, level.maxPlies])
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function isReviewMap(value: unknown): value is LevelReviewMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.entries(value).every(([levelId, review]) => {
    if (!review || typeof review !== 'object' || Array.isArray(review)) return false
    const item = review as Partial<LevelReview>
    return item.levelId === levelId
      && ['unreviewed', 'passed', 'needs_changes'].includes(item.status ?? '')
      && typeof item.attempts === 'number'
      && typeof item.notes === 'string'
      && typeof item.reviewedAt === 'string'
  })
}
