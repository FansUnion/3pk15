import { getAds, type IAds } from './ads'

export type PlatformKind = 'standalone' | 'poki' | 'crazygames'

export interface GamePlatform {
  readonly kind: PlatformKind
  readonly ads: IAds
  loadingFinished(): void
  gameplayStart(): void
  gameplayStop(): void
  shareUrl(levelId: string): string
}

class BasePlatform implements GamePlatform {
  private gameplayActive = false

  constructor(
    readonly kind: PlatformKind,
    readonly ads: IAds,
  ) {}

  loadingFinished() {}

  gameplayStart() {
    if (this.gameplayActive) return
    this.gameplayActive = true
  }

  gameplayStop() {
    if (!this.gameplayActive) return
    this.gameplayActive = false
  }

  shareUrl(levelId: string) {
    if (typeof window === 'undefined') return `/hunt/${levelId}`
    return new URL(`/hunt/${levelId}`, window.location.origin).toString()
  }
}

let singleton: GamePlatform | null = null

export function getPlatform(): GamePlatform {
  if (singleton) return singleton
  const configured = process.env.NEXT_PUBLIC_PLATFORM
  const kind: PlatformKind =
    configured === 'poki' || configured === 'crazygames' ? configured : 'standalone'
  singleton = new BasePlatform(kind, getAds())
  return singleton
}
