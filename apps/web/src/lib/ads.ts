export type AdResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'failed' | 'unavailable' }

export type AdPlacement = 'fragment_topup' | 'double_drop'

export interface IAds {
  showInterstitial(): Promise<AdResult>
  showRewarded(placement: AdPlacement): Promise<AdResult>
  preload?(): void
}

function failEnv(): boolean {
  return typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FAIL_ADS === '1'
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Instant mock ads for MVP; FAIL via NEXT_PUBLIC_FAIL_ADS=1 */
export class MockAds implements IAds {
  async showInterstitial(): Promise<AdResult> {
    if (failEnv()) return { ok: false, reason: 'failed' }
    await delay(200)
    return { ok: true }
  }

  async showRewarded(placement: AdPlacement): Promise<AdResult> {
    void placement
    if (failEnv()) return { ok: false, reason: 'failed' }
    await delay(300)
    return { ok: true }
  }
}

/**
 * Portal H5 shell — wire JSBridge when platform docs are available.
 * Until then behaves like Mock (unavailable if FAIL_ADS).
 */
export class PortalAds implements IAds {
  async showInterstitial(): Promise<AdResult> {
    // TODO: call portal SDK interstitial
    return new MockAds().showInterstitial()
  }

  async showRewarded(placement: AdPlacement): Promise<AdResult> {
    void placement
    // TODO: call portal SDK rewarded
    return new MockAds().showRewarded(placement)
  }
}

/**
 * Standalone real-network placeholder.
 * Replace body with AdSense / chosen network; keep IAds surface.
 */
export class AdsenseAds implements IAds {
  async showInterstitial(): Promise<AdResult> {
    // TODO: integrate real web interstitial when account ready
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
  if (provider === 'portal_sdk') adsSingleton = new PortalAds()
  else if (provider === 'adsense') adsSingleton = new AdsenseAds()
  else adsSingleton = new MockAds()
  return adsSingleton
}
