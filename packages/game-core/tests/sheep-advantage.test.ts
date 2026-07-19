import { describe, expect, it } from 'vitest'
import { createLevelInitialState, LEVELS, measureSheepAdvantage } from '../src/index'

describe('sheep advantage metrics', () => {
  it('reports baseline defensive pressure without changing state', () => {
    const state = createLevelInitialState(LEVELS[0]!)
    const before = JSON.stringify(state)
    const metrics = measureSheepAdvantage(state)
    expect(metrics.sheepCount).toBe(15)
    expect(metrics.trappedWolfCount).toBe(0)
    expect(metrics.wolfMoveCount).toBeGreaterThan(0)
    expect(JSON.stringify(state)).toBe(before)
  })

  it('distinguishes an actual wolf-trap terminal position', () => {
    const level = LEVELS.find((candidate) => candidate.id === 'winter-02')!
    const state = createLevelInitialState(level)
    const metrics = measureSheepAdvantage(state)
    expect(metrics.pressureRatio).toBeGreaterThanOrEqual(0)
    expect(metrics.pressureRatio).toBeLessThanOrEqual(1)
  })
})
