export type AiCounterexampleCategory =
  | 'immediate-feed'
  | 'complete-chain'
  | 'serial-hunter'
  | 'terminal-urgency'
  | 'bad-exchange'
  | 'target-switch'
  | 'rock-route'
  | 'close-net'
  | 'repetition'

export type AiCounterexampleContract = {
  id: string
  category: AiCounterexampleCategory
  protects: string
  evidence: string
}

/**
 * Permanent regression taxonomy. Concrete fixtures may evolve, but removing a
 * category requires an explicit product decision and a test update.
 */
export const AI_COUNTEREXAMPLE_CONTRACTS: readonly AiCounterexampleContract[] = [
  { id: 'ce-immediate-feed-v1', category: 'immediate-feed', protects: 'Do not expose a capture when a strictly safer move exists.', evidence: 'ai-profile-quality: non-dominated production choice' },
  { id: 'ce-complete-chain-v1', category: 'complete-chain', protects: 'Evaluate the complete wolf turn, including optional chain continuation.', evidence: 'ai-system-v5: terminal urgency and chain analysis' },
  { id: 'ce-serial-hunter-v1', category: 'serial-hunter', protects: 'Recognize repeated scoring by one wolf across turns.', evidence: 'winter-06 player-report fixture plus persistent opponent memory' },
  { id: 'ce-terminal-urgency-v1', category: 'terminal-urgency', protects: 'Treat a capture as terminal when the wolf needs one more sheep.', evidence: 'ai-system-v5: one-capture-to-win fixture' },
  { id: 'ce-bad-exchange-v1', category: 'bad-exchange', protects: 'Permit sacrifice only when positional compensation survives independent review.', evidence: 'candidate acceptance teacher regret gate' },
  { id: 'ce-target-switch-v1', category: 'target-switch', protects: 'Keep a target unless it is trapped, missing, or a stronger hunter emerges.', evidence: 'ai-system-v5: persisted hunter retarget fixture' },
  { id: 'ce-rock-route-v1', category: 'rock-route', protects: 'Account for map-specific focus cells and reusable rock corridors.', evidence: '24 executable intent and level validation gates' },
  { id: 'ce-close-net-v1', category: 'close-net', protects: 'Convert sheep advantage into mobility or trap progress rather than waiting.', evidence: 'candidate active-pressure and no-progress gates' },
  { id: 'ce-repetition-v1', category: 'repetition', protects: 'Avoid unexplained shuffling and preserve threefold terminal semantics.', evidence: 'rules repetition tests and candidate repetition traces' },
] as const

export function validateAiCounterexampleContracts() {
  const errors: string[] = []
  const ids = new Set<string>()
  const categories = new Set<AiCounterexampleCategory>()
  for (const contract of AI_COUNTEREXAMPLE_CONTRACTS) {
    if (ids.has(contract.id)) errors.push(`duplicate counterexample id: ${contract.id}`)
    if (categories.has(contract.category)) errors.push(`duplicate counterexample category: ${contract.category}`)
    if (!contract.protects.trim() || !contract.evidence.trim()) errors.push(`incomplete counterexample contract: ${contract.id}`)
    ids.add(contract.id)
    categories.add(contract.category)
  }
  if (AI_COUNTEREXAMPLE_CONTRACTS.length !== 9) errors.push('counterexample taxonomy must contain exactly nine required categories')
  return errors
}
