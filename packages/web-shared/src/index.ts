export type WebShell = 'standalone' | 'portal' | 'admin'
export type PlatformTarget = 'standalone' | 'poki' | 'crazygames' | 'admin'
export type AdsProvider = 'none' | 'mock' | 'portal_sdk' | 'native'

export type AdFailureReason = 'cancelled' | 'failed' | 'unavailable' | 'unfilled' | 'cooldown'
export type AdResult = { ok: true } | { ok: false; reason: AdFailureReason }
export type AdPlacement = 'fragment_topup'
export type AdLifecycle = { onStart?: () => void | Promise<void>; onFinish?: () => void | Promise<void> }
export interface AdsContract {
  showInterstitial(lifecycle?: AdLifecycle): Promise<AdResult>
  showRewarded(placement: AdPlacement, lifecycle?: AdLifecycle): Promise<AdResult>
  isRewardedAvailable?(): boolean
  preload?(): void
}

export type PlatformKind = 'standalone' | 'poki' | 'crazygames'

export interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const ACTIVE_GAME_STORAGE_KEY = 'wolf-sheep:active-game:v1'

export const supportedLocales = ['en', 'zh'] as const
export type SupportedLocale = (typeof supportedLocales)[number]
export const defaultLocale: SupportedLocale = 'en'
export const localeLabels: Record<SupportedLocale, string> = { en: 'English', zh: '简体中文' }
export const localeNavbarLabels: Record<SupportedLocale, string> = { en: 'English', zh: '中文' }
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export type LevelReviewStatus = 'unreviewed' | 'passed' | 'needs_changes'
export type ReviewUnderstanding = 'clear' | 'partial' | 'unclear'
export type ReviewDevice = 'mobile' | 'tablet' | 'desktop'
export type PlayerExperience = 'new' | 'casual' | 'strategy'
export type ReviewIssueCategory = 'none' | 'rule' | 'map_opening' | 'sheep_ai' | 'ui_guidance' | 'reward' | 'technical'
export type ReviewSeverity = 'none' | 'p0' | 'p1' | 'p2'
export type LevelReview = { levelId: string; levelVersion: string; status: LevelReviewStatus; difficultyRating?: 1 | 2 | 3 | 4 | 5; device?: ReviewDevice; playerExperience?: PlayerExperience; strategyUnderstanding?: ReviewUnderstanding; teachingUnderstanding?: ReviewUnderstanding; boardReadability?: ReviewUnderstanding; rewardUnderstanding?: ReviewUnderstanding; issueCategory?: ReviewIssueCategory; severity?: ReviewSeverity; reproduction?: string; attempts: number; result?: 'wolf' | 'sheep' | 'draw'; terminalReason?: string; plies?: number; eatenSheep?: number; firstCapturePly?: number | null; durationMs?: number; notes: string; reviewedAt: string }
export type LevelReviewMap = Record<string, LevelReview>
export type PlayAttemptResult = 'playing' | 'wolf' | 'sheep' | 'draw'
export type PlayAttemptMetric = { id: string; levelId: string; attemptNumber: number; startedAt: string; endedAt?: string; durationMs?: number; result: PlayAttemptResult; terminalReason?: string; plies?: number; eatenSheep?: number; firstCapturePly?: number | null }
export type TerminalAttemptDetails = { durationMs: number; firstCapturePly: number | null; attemptNumber: number }

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(value)
}

export function stripLocalePrefix(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const segments = normalized.split('/').filter(Boolean)
  if (segments[0] === 'zh') {
    const rest = segments.slice(1).join('/')
    return rest ? `/${rest}` : '/'
  }
  return normalized
}

export function withLocalePath(path: string, locale: SupportedLocale = defaultLocale): string {
  const stripped = stripLocalePrefix(path)
  const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`
  if (locale === defaultLocale) return normalized
  if (normalized === '/') return '/zh'
  return `/zh${normalized}`
}

export function getLocaleFromHeaders(cookie: string | null | undefined, acceptLanguage: string | null | undefined): SupportedLocale {
  if (cookie && isSupportedLocale(cookie.trim())) return cookie.trim() as SupportedLocale
  if (acceptLanguage) {
    for (const tag of acceptLanguage.split(',').map((part) => part.split(';')[0]?.trim() ?? '')) {
      if (tag.split('-')[0]?.toLowerCase() === 'zh') return 'zh'
    }
  }
  return defaultLocale
}

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
