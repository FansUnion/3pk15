import { describe, expect, it } from 'vitest'
import { auditLevel, LEVELS, type LevelConfig, type OpeningLayout } from '../src/index'

const BASE = LEVELS.find((level) => level.id === 'winter-02')!
const CANDIDATES: Record<string, OpeningLayout['sheep'] | undefined> = {
  current: undefined,
  'right-shift': [
    { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 },
    { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'edge-spread': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
  'split-flank': [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 6 },
    { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 6 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 5 }, { r: 3, c: 6 },
  ],
}

const candidateDescribe = process.env.RUN_WINTER_02_CANDIDATES === '1' ? describe : describe.skip

candidateDescribe('winter-02 opening candidates', () => {
  it('compares sheep openings without changing production configuration', () => {
    const rows = Object.entries(CANDIDATES).map(([candidate, sheep]) => {
      const level = {
        ...BASE,
        opening: sheep ? { ...BASE.opening, sheep } : BASE.opening,
      } satisfies LevelConfig
      const report = auditLevel(level, {
        seeds: [20260717, 20260718, 20260719, 20260720, 20260721],
        hardMaxNodes: 80,
        solveDepth: 4,
        solveMaxNodes: 10_000,
      })
      return {
        candidate,
        verdict: report.verdict,
        reasons: report.reasons.join(','),
        mixed: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
        chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
        firstCapture: report.simulation.summaries['chain-aware'].firstCaptureCoverage,
        solver: report.finite.verdict,
      }
    })
    console.table(rows)
    expect(rows).toHaveLength(4)
    expect(BASE.opening?.sheep).toBeUndefined()
  }, 120_000)

  it('compares wolf openings while preserving the current sheep opening', () => {
    const wolves: Record<string, NonNullable<OpeningLayout['wolves']>> = {
      current: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }],
      'odd-columns': [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }],
      'wide-gap': [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }],
      'right-gap': [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }],
    }
    const rows = Object.entries(wolves).map(([candidate, positions]) => {
      const level = { ...BASE, opening: { ...BASE.opening, wolves: positions } } satisfies LevelConfig
      const report = auditLevel(level, {
        seeds: [20260717, 20260718, 20260719, 20260720, 20260721],
        hardMaxNodes: 80,
        solveDepth: 4,
        solveMaxNodes: 10_000,
      })
      return {
        candidate,
        verdict: report.verdict,
        reasons: report.reasons.join(','),
        mixed: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
        chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
      }
    })
    console.table(rows)
    expect(rows).toHaveLength(4)
  }, 120_000)

  it('compares evidence-backed combined openings', () => {
    const splitSheep = CANDIDATES['split-flank']!
    const candidates: Record<string, OpeningLayout> = {
      'split-current': { wolves: [{ r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: splitSheep },
      'split-odd': { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 5 }], sheep: splitSheep },
      'split-wide': { wolves: [{ r: 6, c: 1 }, { r: 6, c: 3 }, { r: 6, c: 6 }], sheep: splitSheep },
      'split-right': { wolves: [{ r: 6, c: 1 }, { r: 6, c: 4 }, { r: 6, c: 6 }], sheep: splitSheep },
    }
    const rows = Object.entries(candidates).map(([candidate, opening]) => {
      const report = auditLevel({ ...BASE, opening }, {
        seeds: [20260717, 20260718, 20260719, 20260720, 20260721],
        hardMaxNodes: 80,
        solveDepth: 4,
        solveMaxNodes: 10_000,
      })
      return {
        candidate,
        verdict: report.verdict,
        reasons: report.reasons.join(','),
        mixed: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
        chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
      }
    })
    console.table(rows)
    expect(rows).toHaveLength(4)
  }, 120_000)

  it('checks whether additional hard search budget changes the current result', () => {
    const rows = [80, 400, 4_000].map((hardMaxNodes) => {
      const report = auditLevel(BASE, {
        seeds: [20260717, 20260718, 20260719, 20260720, 20260721],
        hardMaxNodes,
        solveDepth: 2,
        solveMaxNodes: 2_000,
      })
      return {
        hardMaxNodes,
        verdict: report.verdict,
        mixed: `${report.simulation.summaries.mixed.wolfWins}/${report.simulation.summaries.mixed.sheepWins}/${report.simulation.summaries.mixed.draws}`,
        chain: `${report.simulation.summaries['chain-aware'].wolfWins}/${report.simulation.summaries['chain-aware'].sheepWins}/${report.simulation.summaries['chain-aware'].draws}`,
      }
    })
    console.table(rows)
    expect(rows).toHaveLength(3)
  }, 120_000)
})
