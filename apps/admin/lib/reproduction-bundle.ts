import { AI_PROFILE_CONFIG, SHEEP_AI_ALGORITHM_VERSION, serialize, type AiProfile, type BoardState, type Difficulty } from '@wolf-sheep/game-core'

export function buildPlayerReproductionBundle(input: {
  state: BoardState
  difficulty: Difficulty
  aiProfile: AiProfile
  initialAiSeed: number
  nextAiSeed: number
  actions: unknown[]
  muted: boolean
}) {
  return {
    kind: 'fangrush-player-reproduction' as const,
    schema: 2,
    rulesVersion: 3,
    exportedAt: new Date().toISOString(),
    levelId: input.state.levelId,
    difficulty: input.difficulty,
    aiProfile: input.aiProfile,
    aiAlgorithmVersion: SHEEP_AI_ALGORITHM_VERSION,
    initialAiSeed: input.initialAiSeed,
    nextAiSeed: input.nextAiSeed,
    hardBudget: { maxNodes: AI_PROFILE_CONFIG[input.aiProfile].budgets.maxNodes, maxMs: null },
    board: serialize(input.state),
    actions: input.actions,
    environment: { url: location.href, userAgent: navigator.userAgent, language: navigator.language, viewport: `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio}` },
    audio: { contextState: 'admin-preview', muted: input.muted },
  }
}

export function downloadPlayerReproductionBundle(bundle: ReturnType<typeof buildPlayerReproductionBundle>) {
  const href = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = href
  link.download = `fangrush-admin-report-${bundle.levelId}.json`
  link.click()
  URL.revokeObjectURL(href)
}
