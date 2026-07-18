export type WebShell = 'standalone' | 'portal' | 'admin'
export type PlatformTarget = 'standalone' | 'poki' | 'crazygames' | 'admin'
export type AdsProvider = 'none' | 'mock' | 'portal_sdk' | 'native'

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
