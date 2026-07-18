export const NEXT_AI_FAILURE_KEY = 'fangrush:next-ai-failure'

type FaultStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function browserStorage(): FaultStorage | null {
  if (typeof window === 'undefined') return null
  try { return window.localStorage } catch { return null }
}

export function setNextAiFailure(storage: FaultStorage | null = browserStorage()) {
  try { storage?.setItem(NEXT_AI_FAILURE_KEY, '1') } catch { /* development aid only */ }
}

export function consumeNextAiFailure(storage: FaultStorage | null = browserStorage()) {
  try {
    if (storage?.getItem(NEXT_AI_FAILURE_KEY) !== '1') return false
    storage.removeItem(NEXT_AI_FAILURE_KEY)
    return true
  } catch {
    return false
  }
}
