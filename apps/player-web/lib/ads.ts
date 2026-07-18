import type { AdFailureReason, AdPlacement, AdResult, AdsContract, AdLifecycle } from '@wolf-sheep/web-shared'
export type { AdFailureReason, AdPlacement, AdResult, AdLifecycle } from '@wolf-sheep/web-shared'
export type MockAdOutcome = 'success' | AdFailureReason
export type IAds = AdsContract

export const MOCK_AD_OUTCOME_KEY = 'fangrush:mock-ad-outcome'
export const MOCK_AD_OUTCOMES: readonly MockAdOutcome[] = [
  'success',
  'failed',
  'cancelled',
  'unavailable',
  'unfilled',
  'cooldown',
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getMockAdOutcome(): MockAdOutcome {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(MOCK_AD_OUTCOME_KEY)
    if (MOCK_AD_OUTCOMES.includes(stored as MockAdOutcome)) return stored as MockAdOutcome
  }
  if (process.env.NEXT_PUBLIC_FAIL_ADS === '1') return 'failed'
  const configured = process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME
  return MOCK_AD_OUTCOMES.includes(configured as MockAdOutcome)
    ? (configured as MockAdOutcome)
    : 'success'
}

export function setMockAdOutcome(outcome: MockAdOutcome) {
  if (typeof window !== 'undefined') window.localStorage.setItem(MOCK_AD_OUTCOME_KEY, outcome)
}

async function runMock(lifecycle?: AdLifecycle): Promise<AdResult> {
  const outcome = getMockAdOutcome()
  if (outcome === 'failed' || outcome === 'unavailable' || outcome === 'unfilled' || outcome === 'cooldown') {
    await delay(120)
    return { ok: false, reason: outcome }
  }

  await lifecycle?.onStart?.()
  try {
    await delay(300)
    return outcome === 'success' ? { ok: true } : { ok: false, reason: 'cancelled' }
  } finally {
    await lifecycle?.onFinish?.()
  }
}

export class MockAds implements IAds {
  showInterstitial(lifecycle?: AdLifecycle): Promise<AdResult> {
    return runMock(lifecycle)
  }

  showRewarded(placement: AdPlacement, lifecycle?: AdLifecycle): Promise<AdResult> {
    void placement
    return runMock(lifecycle)
  }
}

export class UnavailableAds implements IAds {
  async showInterstitial(): Promise<AdResult> {
    return { ok: false, reason: 'unavailable' }
  }

  async showRewarded(placement: AdPlacement): Promise<AdResult> {
    void placement
    return { ok: false, reason: 'unavailable' }
  }
}

let adsSingleton: IAds | null = null

export function getAds(): IAds {
  if (adsSingleton) return adsSingleton
  const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER ?? 'mock'
  adsSingleton = provider === 'mock' ? new MockAds() : new UnavailableAds()
  return adsSingleton
}
