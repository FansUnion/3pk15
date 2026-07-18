import { getAds, type IAds } from './ads'
import type { PlatformKind } from '@wolf-sheep/web-shared'

export interface GamePlatform {
  readonly kind: PlatformKind
  readonly ads: IAds
  loadingFinished(): void
  gameplayStart(): void
  gameplayStop(): void
  shareUrl(levelId: string): string
  isAudioMuted(): boolean
  subscribeAudioMuted(listener: (muted: boolean) => void): () => void
}

export interface PlatformLifecyclePort {
  loadingFinished?(): void
  gameplayStart?(): void
  gameplayStop?(): void
  shareUrl?(levelId: string): string | undefined
  isAudioMuted?(): boolean
  subscribeAudioMuted?(listener: (muted: boolean) => void): (() => void) | void
}

class BasePlatform implements GamePlatform {
  private gameplayActive = false
  private loadingComplete = false

  constructor(
    readonly kind: PlatformKind,
    readonly ads: IAds,
    private readonly lifecycle: PlatformLifecyclePort = {},
  ) {}

  loadingFinished() {
    if (this.loadingComplete) return
    this.loadingComplete = true
    this.lifecycle.loadingFinished?.()
  }

  gameplayStart() {
    if (this.gameplayActive) return
    this.gameplayActive = true
    this.lifecycle.gameplayStart?.()
  }

  gameplayStop() {
    if (!this.gameplayActive) return
    this.gameplayActive = false
    this.lifecycle.gameplayStop?.()
  }

  shareUrl(levelId: string) {
    const platformUrl = this.lifecycle.shareUrl?.(levelId)
    if (platformUrl) return platformUrl
    if (typeof window === 'undefined') return `/hunt/${levelId}`
    return new URL(`/hunt/${levelId}`, window.location.origin).toString()
  }

  isAudioMuted() {
    return this.lifecycle.isAudioMuted?.() ?? false
  }

  subscribeAudioMuted(listener: (muted: boolean) => void) {
    return this.lifecycle.subscribeAudioMuted?.(listener) ?? (() => undefined)
  }
}

export function createGamePlatform(
  kind: PlatformKind,
  ads: IAds,
  lifecycle: PlatformLifecyclePort = {},
): GamePlatform {
  return new BasePlatform(kind, ads, lifecycle)
}

let singleton: GamePlatform | null = null

export function getPlatform(): GamePlatform {
  if (singleton) return singleton
  const configured = process.env.NEXT_PUBLIC_PLATFORM
  const kind: PlatformKind =
    configured === 'poki' || configured === 'crazygames' ? configured : 'standalone'
  singleton = createGamePlatform(kind, getAds())
  return singleton
}
