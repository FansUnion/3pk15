import { create } from 'zustand'
import {
  applyAction,
  createInitialState,
  createSeededRng,
  endWolfTurn,
  listLegalActions,
  pickSheepAction,
  listWolfActionsAsIfTurn,
  type Action,
  type AiProfile,
  type BoardState,
  type Difficulty,
  type OpeningLayout,
  type Pos,
} from '@wolf-sheep/game-core'
import { clearActiveGame, loadActiveGame, saveActiveGame, type ActiveGameConfig, type RecordedGameAction } from '@/lib/active-game'
import { consumeNextAiFailure } from '@/lib/ai-fault'
import { newlyTrappedWolfIds } from './wolf-feedback'

/** 商业体验时序标准：docs/游戏创意/产品定位和商业成功/03 */
export const FEEDBACK_MS = 200
export const THINK_MS = 600

export type UiPhase = 'playing' | 'animating' | 'aiThinking' | 'terminal' | 'error'

export type MoveHighlights = {
  steps: Pos[]
  jumps: Pos[]
  throughs: Pos[]
}

/** 吃子/走子反馈高亮（juice） */
export type JuiceFlash = {
  kind: 'step' | 'jump'
  side: 'wolf' | 'sheep'
  from: Pos
  to: Pos
  through?: Pos
  newThreat?: boolean
  newlyTrappedWolfIds?: string[]
} | null

const EMPTY_HIGHLIGHTS: MoveHighlights = { steps: [], jumps: [], throughs: [] }

type PlayStore = {
  state: BoardState
  selectedWolfId: string | null
  highlights: MoveHighlights
  uiPhase: UiPhase
  juice: JuiceFlash
  difficulty: Difficulty
  aiProfile: AiProfile | null
  seed: number
  initialSeed: number
  actionHistory: RecordedGameAction[]
  resumed: boolean
  aiError: string | null
  init: (levelId: string, rocks: Pos[], difficulty: Difficulty, aiProfile: AiProfile, targetEaten?: number, maxPlies?: number, opening?: OpeningLayout, resume?: boolean) => void
  selectWolf: (wolfId: string | null) => void
  clickCell: (pos: Pos) => void
  endChain: () => void
  reset: () => void
  retryAi: () => void
}

function highlightsFor(state: BoardState, wolfId: string | null): MoveHighlights {
  if (!wolfId || state.toMove !== 'wolf' || state.status !== 'playing') {
    return EMPTY_HIGHLIGHTS
  }
  const legal = listLegalActions(state).filter((a) => a.type !== 'pass' && a.pieceId === wolfId)
  return {
    steps: legal.filter((a) => a.type === 'step').map((a) => a.to),
    jumps: legal.filter((a) => a.type === 'jump').map((a) => a.to),
    throughs: legal.filter((a) => a.type === 'jump').map((a) => a.through),
  }
}

function findAction(state: BoardState, wolfId: string, pos: Pos): Action | null {
  const legal = listLegalActions(state).filter((a) => a.type !== 'pass' && a.pieceId === wolfId)
  for (const a of legal) {
    if (a.type === 'jump') {
      if (a.to.r === pos.r && a.to.c === pos.c) return a
      if (a.through.r === pos.r && a.through.c === pos.c) return a
    }
  }
  for (const a of legal) {
    if (a.type === 'step' && a.to.r === pos.r && a.to.c === pos.c) return a
  }
  return null
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

function juiceFromAction(state: BoardState, action: Action): JuiceFlash {
  if (action.type === 'pass') return null
  const piece = state.pieces.find((p) => p.id === action.pieceId)
  if (!piece) return null
  if (action.type === 'jump') {
    return {
      kind: 'jump',
      side: piece.side,
      from: { r: piece.r, c: piece.c },
      through: action.through,
      to: action.to,
    }
  }
  return {
    kind: 'step',
    side: piece.side,
    from: { r: piece.r, c: piece.c },
    to: action.to,
  }
}

function threatenedSheepIds(state: BoardState) {
  return new Set(listWolfActionsAsIfTurn(state)
    .filter((action) => action.type === 'jump')
    .flatMap((action) => state.pieces
      .filter((piece) => piece.side === 'sheep' && piece.r === action.to.r && piece.c === action.to.c)
      .map((piece) => piece.id)))
}

let levelMeta = { levelId: 'spring-01', rocks: [] as Pos[], difficulty: 'easy' as Difficulty, aiProfile: 'guided' as AiProfile, targetEaten: undefined as number | undefined, maxPlies: undefined as number | undefined, opening: undefined as OpeningLayout | undefined, resume: true }
let turnSeq = 0

function activeConfig(): ActiveGameConfig {
  return { levelId: levelMeta.levelId, rocks: levelMeta.rocks, targetEaten: levelMeta.targetEaten, maxPlies: levelMeta.maxPlies, opening: levelMeta.opening, aiProfile: levelMeta.aiProfile }
}

function syncActiveGame(state: BoardState, aiSeed: number, initialAiSeed: number, actions: RecordedGameAction[]) {
  if (!levelMeta.resume) return
  if (state.status === 'playing') saveActiveGame(activeConfig(), { board: state, aiSeed, initialAiSeed, actions })
  else clearActiveGame()
}

export const usePlayStore = create<PlayStore>((set, get) => ({
  state: createInitialState('spring-01'),
  selectedWolfId: null,
  highlights: EMPTY_HIGHLIGHTS,
  uiPhase: 'playing',
  juice: null,
  difficulty: 'easy',
  aiProfile: 'guided',
  seed: 1,
  initialSeed: 1,
  actionHistory: [],
  resumed: false,
  aiError: null,

  init(levelId, rocks, difficulty, aiProfile, targetEaten, maxPlies, opening, resume = true) {
    levelMeta = { levelId, rocks, difficulty, aiProfile, targetEaten, maxPlies, opening, resume }
    turnSeq += 1
    const config = activeConfig()
    const restored = resume ? loadActiveGame(config) : null
    const state = restored?.board ?? createInitialState(levelId, rocks, targetEaten, maxPlies, opening)
    const initialSeed = restored?.initialAiSeed ?? Date.now() % 1_000_000
    const seed = restored?.aiSeed ?? initialSeed
    const actionHistory = restored?.actions ?? []
    syncActiveGame(state, seed, initialSeed, actionHistory)
    const selectedWolfId = state.chain?.wolfId ?? null
    const seq = turnSeq
    set({
      state,
      selectedWolfId,
      highlights: highlightsFor(state, selectedWolfId),
      uiPhase: state.status !== 'playing' ? 'terminal' : state.toMove === 'sheep' ? 'aiThinking' : 'playing',
      juice: null,
      difficulty,
      aiProfile,
      seed,
      initialSeed,
      actionHistory,
      resumed: Boolean(restored),
      aiError: null,
    })
    if (state.status === 'playing' && state.toMove === 'sheep') {
      void (async () => {
        await delay(THINK_MS)
        if (seq !== turnSeq) return
        await runAiTurn(get, set, seq)
      })()
    }
  },

  selectWolf(wolfId) {
    const { state, uiPhase } = get()
    if (uiPhase !== 'playing' || state.toMove !== 'wolf') return
    if (state.chain && wolfId && wolfId !== state.chain.wolfId) return
    set({
      selectedWolfId: wolfId,
      highlights: highlightsFor(state, wolfId),
    })
  },

  clickCell(pos) {
    const { state, selectedWolfId, uiPhase } = get()
    if (uiPhase !== 'playing' || state.toMove !== 'wolf' || !selectedWolfId) return

    const action = findAction(state, selectedWolfId, pos)
    if (!action) {
      const piece = state.pieces.find((p) => p.r === pos.r && p.c === pos.c && p.side === 'wolf')
      if (piece && !state.chain) {
        get().selectWolf(piece.id)
      }
      return
    }

    const juice = juiceFromAction(state, action)
    const result = applyAction(state, action)
    if (!result.ok) return

    const next = result.state
    if (juice) juice.newlyTrappedWolfIds = newlyTrappedWolfIds(state, next)
    if (juice?.kind === 'step' && state.toMove === 'wolf') {
      const before = threatenedSheepIds(state)
      juice.newThreat = [...threatenedSheepIds(next)].some((id) => !before.has(id))
    }
    const actionHistory = [...get().actionHistory, action]
    syncActiveGame(next, get().seed, get().initialSeed, actionHistory)
    const seq = ++turnSeq

    void (async () => {
      set({
        state: next,
        selectedWolfId: next.chain ? next.chain.wolfId : null,
        highlights: EMPTY_HIGHLIGHTS,
        uiPhase: 'animating',
        juice,
        actionHistory,
        aiError: null,
      })

      await delay(FEEDBACK_MS)
      if (seq !== turnSeq) return

      if (next.status !== 'playing') {
        set({
          selectedWolfId: null,
          highlights: EMPTY_HIGHLIGHTS,
          uiPhase: 'terminal',
          juice: null,
        })
        return
      }

      if (next.toMove === 'sheep') {
        set({
          selectedWolfId: null,
          highlights: EMPTY_HIGHLIGHTS,
          uiPhase: 'aiThinking',
          juice: null,
        })
        await delay(THINK_MS)
        if (seq !== turnSeq) return
        await runAiTurn(get, set, seq)
        return
      }

      const selected = next.chain ? next.chain.wolfId : null
      set({
        selectedWolfId: selected,
        highlights: highlightsFor(next, selected),
        uiPhase: 'playing',
        juice: null,
        aiError: null,
      })
    })()
  },

  endChain() {
    const { state, uiPhase } = get()
    if (uiPhase !== 'playing' || state.toMove !== 'wolf') return
    const result = endWolfTurn(state)
    if (!result.ok) return
    const next = result.state
    const actionHistory = [...get().actionHistory, { type: 'end-chain' as const }]
    syncActiveGame(next, get().seed, get().initialSeed, actionHistory)
    const seq = ++turnSeq

    void (async () => {
      if (next.status !== 'playing') {
        set({
          state: next,
          selectedWolfId: null,
          highlights: EMPTY_HIGHLIGHTS,
          uiPhase: 'terminal',
          juice: null,
          actionHistory,
        })
        return
      }
      set({
        state: next,
        selectedWolfId: null,
        highlights: EMPTY_HIGHLIGHTS,
        uiPhase: 'aiThinking',
        juice: null,
        actionHistory,
      })
      await delay(THINK_MS)
      if (seq !== turnSeq) return
      await runAiTurn(get, set, seq)
    })()
  },

  reset() {
    turnSeq += 1
    if (levelMeta.resume) clearActiveGame()
    get().init(levelMeta.levelId, levelMeta.rocks, levelMeta.difficulty, levelMeta.aiProfile, levelMeta.targetEaten, levelMeta.maxPlies, levelMeta.opening, levelMeta.resume)
  },

  retryAi() {
    const { state } = get()
    if (state.status !== 'playing' || state.toMove !== 'sheep') return
    const seq = ++turnSeq
    set({ uiPhase: 'aiThinking', aiError: null, juice: null })
    void (async () => {
      await delay(THINK_MS)
      if (seq !== turnSeq) return
      await runAiTurn(get, set, seq)
    })()
  },
}))

async function runAiTurn(
  get: () => PlayStore,
  set: (partial: Partial<PlayStore>) => void,
  seq: number,
) {
  const { state, difficulty, aiProfile, seed } = get()
  if (seq !== turnSeq) return
  if (state.status !== 'playing' || state.toMove !== 'sheep') {
    set({ uiPhase: state.status === 'playing' ? 'playing' : 'terminal', juice: null })
    return
  }

  try {
    if (consumeNextAiFailure()) throw new Error('Injected sheep AI failure')
    const action = pickSheepAction(state, {
      difficulty,
      profile: aiProfile ?? undefined,
      rng: createSeededRng(seed + state.eatenSheep * 17 + state.pieces.length),
    })
    const juice = juiceFromAction(state, action)
    const result = applyAction(state, action)
    if (!result.ok) {
      set({ uiPhase: 'playing', juice: null })
      return
    }
    const next = result.state
    if (juice) juice.newlyTrappedWolfIds = newlyTrappedWolfIds(state, next)
    const actionHistory = [...get().actionHistory, action]
    const nextSeed = seed + 1
    syncActiveGame(next, nextSeed, get().initialSeed, actionHistory)
    set({
      state: next,
      selectedWolfId: null,
      highlights: EMPTY_HIGHLIGHTS,
      uiPhase: 'animating',
      juice,
      seed: nextSeed,
      actionHistory,
      aiError: null,
    })
    await delay(FEEDBACK_MS)
    if (seq !== turnSeq) return
    set({
      uiPhase: next.status === 'playing' ? 'playing' : 'terminal',
      juice: null,
    })
  } catch (error) {
    if (seq === turnSeq) {
      set({ uiPhase: 'error', juice: null, aiError: error instanceof Error ? error.message : 'AI turn failed' })
    }
  }
}
