import type { SfxKind } from './sfx'

export type ActionSoundInput = {
  kind: 'step' | 'jump'
  side: 'wolf' | 'sheep'
  chainCount: number
  newlyTrappedWolfCount: number
}

/** One board action produces one primary sound; visual cues carry secondary state. */
export function actionSoundFor(input: ActionSoundInput): SfxKind {
  if (input.kind === 'jump') return input.chainCount >= 2 ? 'chain' : 'jump'
  if (input.newlyTrappedWolfCount > 0) return 'trapped'
  return input.side === 'sheep' ? 'sheepStep' : 'step'
}
