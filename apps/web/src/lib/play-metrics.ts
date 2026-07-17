'use client'

export const PLAY_METRICS_KEY = 'wolf-sheep:play-metrics:v1'

export type PlayAttemptResult = 'playing' | 'wolf' | 'sheep' | 'draw'

export type PlayAttemptMetric = {
  id: string
  levelId: string
  attemptNumber: number
  startedAt: string
  endedAt?: string
  durationMs?: number
  result: PlayAttemptResult
  terminalReason?: string
  plies?: number
  eatenSheep?: number
  firstCapturePly?: number | null
}

export type TerminalAttemptDetails = {
  durationMs: number
  firstCapturePly: number | null
  attemptNumber: number
}

export function beginPlayAttempt(levelId: string): PlayAttemptMetric {
  const records = loadPlayMetrics()
  const attemptNumber = records.filter((record) => record.levelId === levelId).length + 1
  const startedAt = new Date()
  const record: PlayAttemptMetric = {
    id: `${startedAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    levelId,
    attemptNumber,
    startedAt: startedAt.toISOString(),
    result: 'playing',
  }
  savePlayMetrics([...records, record])
  return record
}

export function resumePlayAttempt(levelId: string): PlayAttemptMetric | null {
  const records = loadPlayMetrics()
  return [...records].reverse().find((record) => record.levelId === levelId && record.result === 'playing') ?? null
}

export function finishPlayAttempt(
  id: string,
  result: Omit<PlayAttemptMetric, 'id' | 'levelId' | 'attemptNumber' | 'startedAt'>,
): void {
  const records = loadPlayMetrics()
  savePlayMetrics(records.map((record) => record.id === id ? { ...record, ...result } : record))
}

export function loadPlayMetrics(): PlayAttemptMetric[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PLAY_METRICS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isPlayAttemptMetric) : []
  } catch {
    return []
  }
}

function savePlayMetrics(records: PlayAttemptMetric[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PLAY_METRICS_KEY, JSON.stringify(records.slice(-500)))
}

function isPlayAttemptMetric(value: unknown): value is PlayAttemptMetric {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Partial<PlayAttemptMetric>
  return typeof record.id === 'string'
    && typeof record.levelId === 'string'
    && typeof record.attemptNumber === 'number'
    && typeof record.startedAt === 'string'
    && ['playing', 'wolf', 'sheep', 'draw'].includes(record.result ?? '')
}
