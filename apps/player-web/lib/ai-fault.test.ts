import { describe, expect, it } from 'vitest'
import { consumeNextAiFailure, setNextAiFailure } from './ai-fault'

describe('AI fault injection', () => {
  it('is consumed once so retry can proceed', () => {
    const data = new Map<string, string>()
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } }
    setNextAiFailure(storage)
    expect(consumeNextAiFailure(storage)).toBe(true)
    expect(consumeNextAiFailure(storage)).toBe(false)
  })
})
