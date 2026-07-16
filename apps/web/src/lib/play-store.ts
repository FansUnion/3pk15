import { create } from 'zustand'
import {
  applyAction,
  createInitialState,
  createSeededRng,
  endWolfTurn,
  listLegalActions,
  pickSheepAction,
  type Action,
  type BoardState,
  type Difficulty,
  type OpeningLayout,
  type Pos,
} from '@wolf-sheep/game-core'

/** 商业体验时序标准：docs/游戏创意/产品定位和商业成功/03 */
export const FEEDBACK_MS = 200
export const THINK_MS = 600

export type UiPhase = 'playing' | 'animating' | 'aiThinking' | 'terminal'

export type MoveHighlights = {
  steps: Pos[]
  jumps: Pos[]
  throughs: Pos[]
}

/** 吃子/走子反馈高亮（juice） */
export type JuiceFlash = {
  kind: 'step' | 'jump'
  from: Pos
  to: Pos
  through?: Pos
} | null

const EMPTY_HIGHLIGHTS: MoveHighlights = { steps: [], jumps: [], throughs: [] }

type PlayStore = {
  state: BoardState
  selectedWolfId: string | null
  highlights: MoveHighlights
  uiPhase: UiPhase
  juice: JuiceFlash
  difficulty: Difficulty
  seed: number
  init: (levelId: string, rocks: Pos[], difficulty: Difficulty, targetEaten?: number, maxPlies?: number, opening?: OpeningLayout) => void
  selectWolf: (wolfId: string | null) => void
  clickCell: (pos: Pos) => void
  endChain: () => void
  reset: () => void
}

function highlightsFor(state: BoardState, wolfId: string | null): MoveHighlights {
  if (!wolfId || state.toMove !== 'wolf' || state.status !== 'playing') {
    return EMPTY_HIGHLIGHTS
  }
  const legal = listLegalActions(state).filter((a) => a.pieceId === wolfId)
  return {
    steps: legal.filter((a) => a.type === 'step').map((a) => a.to),
    jumps: legal.filter((a) => a.type === 'jump').map((a) => a.to),
    throughs: legal.filter((a) => a.type === 'jump').map((a) => a.through),
  }
}

function findAction(state: BoardState, wolfId: string, pos: Pos): Action | null {
  const legal = listLegalActions(state).filter((a) => a.pieceId === wolfId)
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
  const piece = state.pieces.find((p) => p.id === action.pieceId)
  if (!piece) return null
  if (action.type === 'jump') {
    return {
      kind: 'jump',
      from: { r: piece.r, c: piece.c },
      through: action.through,
      to: action.to,
    }
  }
  return {
    kind: 'step',
    from: { r: piece.r, c: piece.c },
    to: action.to,
  }
}

let levelMeta = { levelId: 'spring-01', rocks: [] as Pos[], difficulty: 'easy' as Difficulty, targetEaten: undefined as number | undefined, maxPlies: undefined as number | undefined, opening: undefined as OpeningLayout | undefined }
let turnSeq = 0

export const usePlayStore = create<PlayStore>((set, get) => ({
  state: createInitialState('spring-01'),
  selectedWolfId: null,
  highlights: EMPTY_HIGHLIGHTS,
  uiPhase: 'playing',
  juice: null,
  difficulty: 'easy',
  seed: 1,

  init(levelId, rocks, difficulty, targetEaten, maxPlies, opening) {
    levelMeta = { levelId, rocks, difficulty, targetEaten, maxPlies, opening }
    turnSeq += 1
    const state = createInitialState(levelId, rocks, targetEaten, maxPlies, opening)
    set({
      state,
      selectedWolfId: null,
      highlights: EMPTY_HIGHLIGHTS,
      uiPhase: state.status === 'playing' ? 'playing' : 'terminal',
      juice: null,
      difficulty,
      seed: Date.now() % 1_000_000,
    })
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
    const seq = ++turnSeq

    void (async () => {
      set({
        state: next,
        selectedWolfId: next.chain ? next.chain.wolfId : null,
        highlights: EMPTY_HIGHLIGHTS,
        uiPhase: 'animating',
        juice,
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
      })
    })()
  },

  endChain() {
    const { state, uiPhase } = get()
    if (uiPhase !== 'playing' || state.toMove !== 'wolf') return
    const result = endWolfTurn(state)
    if (!result.ok) return
    const next = result.state
    const seq = ++turnSeq

    void (async () => {
      if (next.status !== 'playing') {
        set({
          state: next,
          selectedWolfId: null,
          highlights: EMPTY_HIGHLIGHTS,
          uiPhase: 'terminal',
          juice: null,
        })
        return
      }
      set({
        state: next,
        selectedWolfId: null,
        highlights: EMPTY_HIGHLIGHTS,
        uiPhase: 'aiThinking',
        juice: null,
      })
      await delay(THINK_MS)
      if (seq !== turnSeq) return
      await runAiTurn(get, set, seq)
    })()
  },

  reset() {
    turnSeq += 1
    get().init(levelMeta.levelId, levelMeta.rocks, levelMeta.difficulty, levelMeta.targetEaten, levelMeta.maxPlies, levelMeta.opening)
  },
}))

async function runAiTurn(
  get: () => PlayStore,
  set: (partial: Partial<PlayStore>) => void,
  seq: number,
) {
  const { state, difficulty, seed } = get()
  if (seq !== turnSeq) return
  if (state.status !== 'playing' || state.toMove !== 'sheep') {
    set({ uiPhase: state.status === 'playing' ? 'playing' : 'terminal', juice: null })
    return
  }

  try {
    const action = pickSheepAction(state, {
      difficulty,
      rng: createSeededRng(seed + state.eatenSheep * 17 + state.pieces.length),
    })
    const juice = juiceFromAction(state, action)
    const result = applyAction(state, action)
    if (!result.ok) {
      set({ uiPhase: 'playing', juice: null })
      return
    }
    const next = result.state
    set({
      state: next,
      selectedWolfId: null,
      highlights: EMPTY_HIGHLIGHTS,
      uiPhase: 'animating',
      juice,
      seed: seed + 1,
    })
    await delay(FEEDBACK_MS)
    if (seq !== turnSeq) return
    set({
      uiPhase: next.status === 'playing' ? 'playing' : 'terminal',
      juice: null,
    })
  } catch {
    if (seq === turnSeq) set({ uiPhase: 'playing', juice: null })
  }
}
