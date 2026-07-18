import { describe, expect, it, vi } from 'vitest'
import { UnavailableAds } from './ads'
import { createGamePlatform } from './platform'

describe('platform lifecycle boundary', () => {
  it('deduplicates loading and consecutive gameplay events', () => {
    const loadingFinished = vi.fn()
    const gameplayStart = vi.fn()
    const gameplayStop = vi.fn()
    const platform = createGamePlatform('poki', new UnavailableAds(), {
      loadingFinished,
      gameplayStart,
      gameplayStop,
    })

    platform.loadingFinished()
    platform.loadingFinished()
    platform.gameplayStart()
    platform.gameplayStart()
    platform.gameplayStop()
    platform.gameplayStop()

    expect(loadingFinished).toHaveBeenCalledOnce()
    expect(gameplayStart).toHaveBeenCalledOnce()
    expect(gameplayStop).toHaveBeenCalledOnce()
  })

  it('uses a platform share URL when the adapter provides one', () => {
    const platform = createGamePlatform('crazygames', new UnavailableAds(), {
      shareUrl: (levelId) => `https://portal.example/play?level=${levelId}`,
    })
    expect(platform.shareUrl('spring-01')).toBe('https://portal.example/play?level=spring-01')
  })
})
