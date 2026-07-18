'use client'

import { serialize, type BoardState, type Difficulty } from '@wolf-sheep/game-core'
import type { RecordedGameAction } from './active-game'
import { getAudioDiagnostics } from './sfx'

export const REPRODUCTION_SCHEMA = 1

export type PlayerReproductionBundle = {
  kind: 'fangrush-player-reproduction'
  schema: number
  rulesVersion: 2
  exportedAt: string
  levelId: string
  difficulty: Difficulty
  initialAiSeed: number
  nextAiSeed: number
  hardBudget: { maxNodes: 80; maxMs: null }
  board: ReturnType<typeof serialize>
  actions: RecordedGameAction[]
  environment: { url: string; userAgent: string; language: string; viewport: string }
  audio: ReturnType<typeof getAudioDiagnostics> & { muted: boolean }
}

export function buildPlayerReproductionBundle(input: {
  state: BoardState
  difficulty: Difficulty
  initialAiSeed: number
  nextAiSeed: number
  actions: RecordedGameAction[]
  muted: boolean
}): PlayerReproductionBundle {
  return {
    kind: 'fangrush-player-reproduction',
    schema: REPRODUCTION_SCHEMA,
    rulesVersion: 2,
    exportedAt: new Date().toISOString(),
    levelId: input.state.levelId,
    difficulty: input.difficulty,
    initialAiSeed: input.initialAiSeed,
    nextAiSeed: input.nextAiSeed,
    hardBudget: { maxNodes: 80, maxMs: null },
    board: serialize(input.state),
    actions: input.actions,
    environment: {
      url: typeof location === 'undefined' ? '' : location.href,
      userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
      language: typeof navigator === 'undefined' ? '' : navigator.language,
      viewport: typeof window === 'undefined' ? '' : `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio}`,
    },
    audio: { ...getAudioDiagnostics(), muted: input.muted },
  }
}

export function downloadPlayerReproductionBundle(bundle: PlayerReproductionBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = `fangrush-report-${bundle.levelId}-${bundle.exportedAt.replaceAll(':', '-').slice(0, 19)}.json`
  link.click()
  URL.revokeObjectURL(href)
}
