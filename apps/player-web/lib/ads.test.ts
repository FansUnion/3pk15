import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMockAdOutcome, MockAds, setMockAdOutcome } from './ads'

describe('MockAds', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME
    vi.restoreAllMocks()
  })

  it('runs lifecycle and grants only after a successful display', async () => {
    process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME = 'success'
    const events: string[] = []
    const result = await new MockAds().showRewarded('double_drop', {
      onStart: () => { events.push('start') },
      onFinish: () => { events.push('finish') },
    })
    expect(result).toEqual({ ok: true })
    expect(events).toEqual(['start', 'finish'])
  })

  it.each(['failed', 'unavailable', 'unfilled', 'cooldown'] as const)('does not grant on %s', async (outcome) => {
    process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME = outcome
    const result = await new MockAds().showRewarded('double_drop')
    expect(result).toEqual({ ok: false, reason: outcome })
  })

  it('finishes lifecycle when the viewer cancels', async () => {
    process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME = 'cancelled'
    const finish = vi.fn()
    const result = await new MockAds().showRewarded('double_drop', { onFinish: finish })
    expect(result).toEqual({ ok: false, reason: 'cancelled' })
    expect(finish).toHaveBeenCalledOnce()
  })

  it('does not report a successful reward more than once per display', async () => {
    process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME = 'success'
    const finish = vi.fn()
    const result = await new MockAds().showRewarded('double_drop', { onFinish: finish })
    expect(result).toEqual({ ok: true })
    expect(finish).toHaveBeenCalledOnce()
  })

  it('falls back safely when browser storage is unavailable', () => {
    process.env.NEXT_PUBLIC_MOCK_AD_OUTCOME = 'unfilled'
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => { throw new Error('blocked') },
        setItem: () => { throw new Error('blocked') },
      },
    })
    expect(getMockAdOutcome()).toBe('unfilled')
    expect(() => setMockAdOutcome('success')).not.toThrow()
    vi.unstubAllGlobals()
  })
})
