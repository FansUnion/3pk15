'use client'

import type { CandidateAcceptanceReport, LevelConfig } from '@wolf-sheep/game-core'

export const CANDIDATE_COUNTEREXAMPLES_KEY = 'wolf-sheep:candidate-counterexamples:v1'

export type CandidateCounterexample = {
  id: string
  createdAt: string
  candidate: LevelConfig
  report: CandidateAcceptanceReport
}

export function loadCandidateCounterexamples(): CandidateCounterexample[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CANDIDATE_COUNTEREXAMPLES_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isCounterexample) : []
  } catch {
    return []
  }
}

export function archiveCandidateCounterexample(candidate: LevelConfig, report: CandidateAcceptanceReport): CandidateCounterexample[] {
  const existing = loadCandidateCounterexamples()
  const createdAt = new Date().toISOString()
  const record = { id: `${candidate.id}-${Date.now()}`, createdAt, candidate, report }
  const next = [...existing, record].slice(-100)
  window.localStorage.setItem(CANDIDATE_COUNTEREXAMPLES_KEY, JSON.stringify(next))
  return next
}

export function saveCandidateCounterexamples(records: CandidateCounterexample[]): void {
  window.localStorage.setItem(CANDIDATE_COUNTEREXAMPLES_KEY, JSON.stringify(records.slice(-100)))
}

function isCounterexample(value: unknown): value is CandidateCounterexample {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Partial<CandidateCounterexample>
  return typeof record.id === 'string'
    && typeof record.createdAt === 'string'
    && Boolean(record.candidate && typeof record.candidate === 'object')
    && Boolean(record.report && typeof record.report === 'object')
}
