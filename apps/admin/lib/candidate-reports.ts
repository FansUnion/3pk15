'use client'

import type { CandidateAcceptanceReport } from '@wolf-sheep/game-core'

export const CANDIDATE_REPORTS_KEY = 'wolf-sheep:candidate-reports:v1'
export type CandidateReportMap = Record<string, CandidateAcceptanceReport>

export function loadCandidateReports(): CandidateReportMap {
  if (typeof window === 'undefined') return {}
  try {
    return normalizeReports(JSON.parse(window.localStorage.getItem(CANDIDATE_REPORTS_KEY) ?? '{}')) ?? {}
  } catch {
    return {}
  }
}

export function saveCandidateReports(reports: CandidateReportMap): void {
  window.localStorage.setItem(CANDIDATE_REPORTS_KEY, JSON.stringify(reports))
}

export function parseCandidateReports(text: string): CandidateReportMap | null {
  try {
    return normalizeReports(JSON.parse(text))
  } catch {
    return null
  }
}

function normalizeReports(value: unknown): CandidateReportMap | null {
  const candidates = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.values(value)
      : null
  if (!candidates || !candidates.every(isCandidateReport)) return null
  return Object.fromEntries(candidates.map((report) => [report.levelId, report]))
}

function isCandidateReport(value: unknown): value is CandidateAcceptanceReport {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const report = value as Partial<CandidateAcceptanceReport>
  return typeof report.levelId === 'string'
    && ['pass', 'review', 'reject'].includes(report.verdict ?? '')
    && Array.isArray(report.structuralErrors)
    && Array.isArray(report.findings)
    && Array.isArray(report.games)
    && Boolean(report.summaries && typeof report.summaries === 'object')
}
