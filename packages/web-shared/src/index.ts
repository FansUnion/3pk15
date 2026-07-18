export type WebShell = 'standalone' | 'portal' | 'admin'
export type PlatformTarget = 'standalone' | 'poki' | 'crazygames' | 'admin'
export type AdsProvider = 'none' | 'mock' | 'portal_sdk' | 'native'

export type AdFailureReason = 'cancelled' | 'failed' | 'unavailable' | 'unfilled' | 'cooldown'
export type AdResult = { ok: true } | { ok: false; reason: AdFailureReason }
export type AdPlacement = 'fragment_topup' | 'double_drop'
export type AdLifecycle = { onStart?: () => void | Promise<void>; onFinish?: () => void | Promise<void> }
export interface AdsContract {
  showInterstitial(lifecycle?: AdLifecycle): Promise<AdResult>
  showRewarded(placement: AdPlacement, lifecycle?: AdLifecycle): Promise<AdResult>
  preload?(): void
}

export type PlatformKind = 'standalone' | 'poki' | 'crazygames'

export interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const ACTIVE_GAME_STORAGE_KEY = 'wolf-sheep:active-game:v1'

export type WebTargetConfig = {
  shell: WebShell
  platform: PlatformTarget
  ads: AdsProvider
  adminEnabled: boolean
}

export const PLAYER_TARGETS: readonly PlatformTarget[] = ['standalone', 'poki', 'crazygames']

export function isPlayerTarget(platform: PlatformTarget): boolean {
  return PLAYER_TARGETS.includes(platform)
}

export function getPlayerTargetConfig(platform: Exclude<PlatformTarget, 'admin'>): WebTargetConfig {
  return {
    shell: platform === 'standalone' ? 'standalone' : 'portal',
    platform,
    ads: platform === 'standalone' ? 'none' : 'portal_sdk',
    adminEnabled: false,
  }
}

export function getAdminTargetConfig(): WebTargetConfig {
  return { shell: 'admin', platform: 'admin', ads: 'mock', adminEnabled: true }
}
