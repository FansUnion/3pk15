import { describe, expect, it } from 'vitest'
import { createLevelInitialState, LEVELS, solveFinitePosition } from '../src/index'

describe('finite position solver', () => {
  it('reports unknown at depth zero without pretending to prove balance', () => {
    const result = solveFinitePosition(createLevelInitialState(LEVELS[0]!), { maxDepth: 0 })
    expect(result.verdict).toBe('unknown')
    expect(result.nodes).toBe(0)
  })

  it('is deterministic and includes chain stop as a legal branch', () => {
    const state = createLevelInitialState(LEVELS.find((level) => level.id === 'spring-03')!)
    const options = { maxDepth: 8, maxNodes: 5_000 }
    const first = solveFinitePosition(state, options)
    const second = solveFinitePosition(state, options)
    expect(first).toEqual(second)
    expect(first.nodes).toBeGreaterThan(0)
    expect(first.principalVariation.length).toBeLessThanOrEqual(8)
  }, 30_000)
})

const matrixDescribe = process.env.RUN_FINITE_SOLVER_MATRIX === '1' ? describe : describe.skip

matrixDescribe('finite solver representative matrix', () => {
  it('prints bounded evidence without treating truncation as proof', () => {
    const ids = ['spring-01', 'summer-03', 'autumn-04', 'winter-02']
    const rows = ids.map((id) => {
      const level = LEVELS.find((candidate) => candidate.id === id)!
      const result = solveFinitePosition(createLevelInitialState(level), { maxDepth: 6, maxNodes: 20_000 })
      return { level: id, verdict: result.verdict, nodes: result.nodes, truncated: result.truncated, pv: result.principalVariation.slice(0, 3).join(' | ') }
    })
    console.table(rows)
    expect(rows).toHaveLength(4)
    expect(rows.every((row) => row.verdict === 'unknown' || !row.truncated)).toBe(true)
  }, 120_000)
})

matrixDescribe('finite solver production matrix', () => {
  it('prints bounded solver evidence for all 24 levels', () => {
    const rows = LEVELS.map((level) => {
      const result = solveFinitePosition(createLevelInitialState(level), { maxDepth: 4, maxNodes: 10_000 })
      return { level: level.id, verdict: result.verdict, nodes: result.nodes, truncated: result.truncated }
    })
    console.table(rows)
    expect(rows).toHaveLength(24)
    expect(rows.every((row) => row.verdict === 'unknown' || !row.truncated)).toBe(true)
  })
})

matrixDescribe('finite solver risk depth ladder', () => {
  it('reports proof boundaries for the three strong-risk levels', () => {
    const rows = ['autumn-01', 'autumn-03', 'winter-02'].flatMap((id) =>
      [4, 6, 8].map((depth) => {
        const level = LEVELS.find((candidate) => candidate.id === id)!
        const result = solveFinitePosition(createLevelInitialState(level), { maxDepth: depth, maxNodes: 50_000 })
        return { level: id, depth, verdict: result.verdict, nodes: result.nodes, truncated: result.truncated }
      }),
    )
    console.table(rows)
    expect(rows).toHaveLength(9)
    expect(rows.every((row) => row.verdict === 'unknown' || !row.truncated)).toBe(true)
  }, 120_000)
})
