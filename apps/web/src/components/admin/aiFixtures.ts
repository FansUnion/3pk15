import { makeState, type BoardState } from '@wolf-sheep/game-core'

export type AiFixture = {
  id: string
  label: string
  expect: string
  /** Prefer hard for surround; block/feed work on normal+hard */
  suggestedDiff: 'normal' | 'hard'
  build: () => BoardState
}

/**
 * Admin 一键坏局。羊回合；用于对照 normal/hard 行为（非完整 Vitest 替代）。
 */
export const AI_FIXTURES: AiFixture[] = [
  {
    id: 'block-eat',
    label: '唯一挡吃',
    expect: 'normal/hard 应挡狼下一跳吃（勿走开）',
    suggestedDiff: 'normal',
    build: () =>
      makeState({
        levelId: 'fixture-block-eat',
        toMove: 'sheep',
        eatenSheep: 0,
        pieces: [
          { id: 'w1', side: 'wolf', r: 4, c: 3 },
          { id: 'w2', side: 'wolf', r: 6, c: 1 },
          { id: 'w3', side: 'wolf', r: 6, c: 6 },
          { id: 's1', side: 'sheep', r: 4, c: 5 },
          { id: 's2', side: 'sheep', r: 3, c: 4 },
          { id: 's3', side: 'sheep', r: 2, c: 2 },
        ],
        rocks: [],
      }),
  },
  {
    id: 'no-feed',
    label: '送吃诱惑',
    expect: 'normal/hard 不应走进狼可隔空吃的点',
    suggestedDiff: 'normal',
    build: () =>
      makeState({
        levelId: 'fixture-no-feed',
        toMove: 'sheep',
        eatenSheep: 2,
        pieces: [
          { id: 'w1', side: 'wolf', r: 5, c: 3 },
          { id: 'w2', side: 'wolf', r: 6, c: 2 },
          { id: 'w3', side: 'wolf', r: 6, c: 5 },
          { id: 's1', side: 'sheep', r: 3, c: 3 },
          { id: 's2', side: 'sheep', r: 2, c: 4 },
          { id: 's3', side: 'sheep', r: 2, c: 2 },
          { id: 's4', side: 'sheep', r: 1, c: 5 },
        ],
        rocks: [{ r: 4, c: 1 }, { r: 4, c: 6 }],
      }),
  },
  {
    id: 'surround',
    label: '冬日合围样',
    expect: 'hard 优先减狼机动 / 抬 surround 分',
    suggestedDiff: 'hard',
    build: () =>
      makeState({
        levelId: 'fixture-surround',
        toMove: 'sheep',
        eatenSheep: 4,
        pieces: [
          { id: 'w1', side: 'wolf', r: 4, c: 3 },
          { id: 'w2', side: 'wolf', r: 4, c: 4 },
          { id: 'w3', side: 'wolf', r: 5, c: 3 },
          { id: 's1', side: 'sheep', r: 3, c: 2 },
          { id: 's2', side: 'sheep', r: 3, c: 3 },
          { id: 's3', side: 'sheep', r: 3, c: 5 },
          { id: 's4', side: 'sheep', r: 2, c: 4 },
          { id: 's5', side: 'sheep', r: 5, c: 5 },
          { id: 's6', side: 'sheep', r: 2, c: 2 },
        ],
        rocks: [],
      }),
  },
  {
    id: 'budget-starve',
    label: '极紧预算（逼降级）',
    expect: 'maxNodes=1 / maxMs=1 时 hard 应 degraded→normal',
    suggestedDiff: 'hard',
    build: () =>
      makeState({
        levelId: 'fixture-budget',
        toMove: 'sheep',
        eatenSheep: 0,
        pieces: [
          { id: 'w1', side: 'wolf', r: 6, c: 2 },
          { id: 'w2', side: 'wolf', r: 6, c: 4 },
          { id: 'w3', side: 'wolf', r: 6, c: 6 },
          { id: 's1', side: 'sheep', r: 3, c: 3 },
          { id: 's2', side: 'sheep', r: 2, c: 2 },
          { id: 's3', side: 'sheep', r: 2, c: 4 },
          { id: 's4', side: 'sheep', r: 1, c: 3 },
          { id: 's5', side: 'sheep', r: 3, c: 5 },
        ],
        rocks: [],
      }),
  },
]
