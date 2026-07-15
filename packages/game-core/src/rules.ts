import { cloneRocks, inBounds, keyOf, ORTHO, posKey } from './board'
import type {
  Action,
  ApplyResult,
  BoardState,
  JumpMove,
  Piece,
  Pos,
  Side,
  StepMove,
} from './types'
import { MAX_CHAIN, OPENING_SHEEP, WIN_EATEN } from './types'

const SHEEP_OPENING: Pos[] = [
  { r: 1, c: 1 },
  { r: 1, c: 2 },
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 5 },
  { r: 2, c: 1 },
  { r: 2, c: 2 },
  { r: 2, c: 3 },
  { r: 2, c: 4 },
  { r: 2, c: 5 },
  { r: 3, c: 1 },
  { r: 3, c: 2 },
  { r: 3, c: 3 },
  { r: 3, c: 4 },
  { r: 3, c: 5 },
]

const WOLF_OPENING: Pos[] = [
  { r: 6, c: 2 },
  { r: 6, c: 3 },
  { r: 6, c: 5 },
]

export function createInitialState(levelId: string, rocks: Pos[] = []): BoardState {
  const rockSet = new Set(rocks.map((p) => keyOf(p)))
  for (const p of [...SHEEP_OPENING, ...WOLF_OPENING]) {
    if (rockSet.has(keyOf(p))) {
      throw new Error(`Rock overlaps opening piece at (${p.r},${p.c})`)
    }
  }

  const pieces: Piece[] = [
    ...WOLF_OPENING.map((p, i) => ({
      id: `wolf-${i + 1}`,
      side: 'wolf' as const,
      r: p.r,
      c: p.c,
    })),
    ...SHEEP_OPENING.map((p, i) => ({
      id: `sheep-${i + 1}`,
      side: 'sheep' as const,
      r: p.r,
      c: p.c,
    })),
  ]

  return refreshStatus({
    pieces,
    rocks: rockSet,
    eatenSheep: 0,
    toMove: 'wolf',
    chain: null,
    status: 'playing',
    levelId,
  })
}

function occupancy(state: BoardState): Map<string, Piece> {
  const map = new Map<string, Piece>()
  for (const p of state.pieces) {
    map.set(posKey(p.r, p.c), p)
  }
  return map
}

function isBlocked(state: BoardState, r: number, c: number, occ: Map<string, Piece>): boolean {
  if (!inBounds(r, c)) return true
  const k = posKey(r, c)
  if (state.rocks.has(k)) return true
  return occ.has(k)
}

function listWolfSteps(state: BoardState, wolf: Piece, occ: Map<string, Piece>): StepMove[] {
  const moves: StepMove[] = []
  for (const d of ORTHO) {
    const nr = wolf.r + d.r
    const nc = wolf.c + d.c
    if (!isBlocked(state, nr, nc, occ)) {
      moves.push({ type: 'step', pieceId: wolf.id, to: { r: nr, c: nc } })
    }
  }
  return moves
}

/** 隔空吃：狼 — 空 — 羊；落到羊位并移除羊 */
function listWolfJumps(state: BoardState, wolf: Piece, occ: Map<string, Piece>): JumpMove[] {
  const moves: JumpMove[] = []
  for (const d of ORTHO) {
    const tr = wolf.r + d.r
    const tc = wolf.c + d.c
    const lr = wolf.r + 2 * d.r
    const lc = wolf.c + 2 * d.c
    if (!inBounds(tr, tc) || !inBounds(lr, lc)) continue
    const midKey = posKey(tr, tc)
    if (state.rocks.has(midKey) || occ.has(midKey)) continue
    const target = occ.get(posKey(lr, lc))
    if (!target || target.side !== 'sheep') continue
    moves.push({
      type: 'jump',
      pieceId: wolf.id,
      through: { r: tr, c: tc },
      to: { r: lr, c: lc },
    })
  }
  return moves
}

function listSheepSteps(state: BoardState, sheep: Piece, occ: Map<string, Piece>): StepMove[] {
  const moves: StepMove[] = []
  for (const d of ORTHO) {
    const nr = sheep.r + d.r
    const nc = sheep.c + d.c
    // Cannot retreat toward row 1 (decreasing r)
    if (nr < sheep.r) continue
    if (!isBlocked(state, nr, nc, occ)) {
      moves.push({ type: 'step', pieceId: sheep.id, to: { r: nr, c: nc } })
    }
  }
  return moves
}

/** Legal actions for current toMove / chain context. */
export function listLegalActions(state: BoardState): Action[] {
  if (state.status !== 'playing') return []

  const occ = occupancy(state)

  if (state.toMove === 'wolf') {
    if (state.chain) {
      const wolf = state.pieces.find((p) => p.id === state.chain!.wolfId)
      if (!wolf || wolf.side !== 'wolf') return []
      return listWolfJumps(state, wolf, occ)
    }
    const wolves = state.pieces.filter((p) => p.side === 'wolf')
    const actions: Action[] = []
    for (const w of wolves) {
      actions.push(...listWolfSteps(state, w, occ), ...listWolfJumps(state, w, occ))
    }
    return actions
  }

  // sheep turn
  const sheep = state.pieces.filter((p) => p.side === 'sheep')
  const actions: Action[] = []
  for (const s of sheep) {
    actions.push(...listSheepSteps(state, s, occ))
  }
  return actions
}

/** Hypothetical wolf legal moves with chain cleared (for loss detection). */
export function listWolfActionsAsIfTurn(state: BoardState): Action[] {
  const probe: BoardState = {
    ...state,
    toMove: 'wolf',
    chain: null,
    status: 'playing',
  }
  return listLegalActions(probe)
}

export function getWolfLegalSummary(
  state: BoardState,
): { wolfId: string; steps: number; jumps: number }[] {
  const probe: BoardState = {
    ...state,
    toMove: 'wolf',
    chain: null,
    status: 'playing',
  }
  const occ = occupancy(probe)
  return probe.pieces
    .filter((p) => p.side === 'wolf')
    .map((w) => ({
      wolfId: w.id,
      steps: listWolfSteps(probe, w, occ).length,
      jumps: listWolfJumps(probe, w, occ).length,
    }))
}

export function evaluateTerminal(state: BoardState): BoardState['status'] {
  if (state.eatenSheep >= WIN_EATEN) return 'won'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'lost'
  return 'playing'
}

export function refreshStatus(state: BoardState): BoardState {
  const status = evaluateTerminal(state)
  if (status === state.status) return state
  return { ...state, status, chain: status === 'playing' ? state.chain : null }
}

function samePos(a: Pos, b: Pos): boolean {
  return a.r === b.r && a.c === b.c
}

function actionEquals(a: Action, b: Action): boolean {
  if (a.type !== b.type || a.pieceId !== b.pieceId) return false
  if (a.type === 'step' && b.type === 'step') return samePos(a.to, b.to)
  if (a.type === 'jump' && b.type === 'jump') {
    return samePos(a.to, b.to) && samePos(a.through, b.through)
  }
  return false
}

function isLegal(state: BoardState, action: Action): boolean {
  return listLegalActions(state).some((a) => actionEquals(a, action))
}

function cloneState(state: BoardState): BoardState {
  return {
    ...state,
    pieces: state.pieces.map((p) => ({ ...p })),
    rocks: cloneRocks(state.rocks),
    chain: state.chain ? { ...state.chain } : null,
  }
}

export function applyAction(state: BoardState, action: Action): ApplyResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'Game already ended' }
  }
  if (!isLegal(state, action)) {
    return { ok: false, error: 'Illegal action' }
  }

  let next = cloneState(state)
  const piece = next.pieces.find((p) => p.id === action.pieceId)
  if (!piece) return { ok: false, error: 'Piece not found' }

  if (action.type === 'step') {
    piece.r = action.to.r
    piece.c = action.to.c
    next.chain = null

    if (next.toMove === 'wolf') {
      next.toMove = 'sheep'
    } else {
      // sheep one step then wolf
      next.toMove = 'wolf'
    }
    return { ok: true, state: refreshStatus(next) }
  }

  // jump / 隔空吃 (wolf only): remove sheep at `to`, wolf lands on `to`
  next.pieces = next.pieces.filter(
    (p) => !(p.side === 'sheep' && p.r === action.to.r && p.c === action.to.c),
  )
  const wolf = next.pieces.find((p) => p.id === action.pieceId)
  if (!wolf) return { ok: false, error: 'Wolf not found after jump' }
  wolf.r = action.to.r
  wolf.c = action.to.c
  next.eatenSheep += 1

  if (next.eatenSheep >= WIN_EATEN) {
    next.chain = null
    next.status = 'won'
    return { ok: true, state: next }
  }

  const newCount = (state.chain?.count ?? 0) + 1
  if (newCount >= MAX_CHAIN) {
    next.chain = null
    next.toMove = 'sheep'
    return { ok: true, state: refreshStatus(next) }
  }

  next.chain = { wolfId: action.pieceId, count: newCount }
  next.toMove = 'wolf'

  const remainingJumps = listLegalActions(next).filter((a) => a.type === 'jump')
  if (remainingJumps.length === 0) {
    next.chain = null
    next.toMove = 'sheep'
  }

  return { ok: true, state: refreshStatus(next) }
}

export function endWolfTurn(state: BoardState): ApplyResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'Game already ended' }
  }
  if (state.toMove !== 'wolf') {
    return { ok: false, error: 'Not wolf turn' }
  }
  const next = cloneState(state)
  next.chain = null
  next.toMove = 'sheep'
  return { ok: true, state: refreshStatus(next) }
}

export function assertInvariants(state: BoardState): void {
  const seen = new Set<string>()
  let sheep = 0
  let wolves = 0
  for (const p of state.pieces) {
    if (!inBounds(p.r, p.c)) throw new Error(`Out of bounds ${p.id}`)
    const k = posKey(p.r, p.c)
    if (seen.has(k)) throw new Error(`Overlap at ${k}`)
    seen.add(k)
    if (state.rocks.has(k)) throw new Error(`Piece on rock ${k}`)
    if (p.side === 'sheep') sheep++
    else wolves++
  }
  if (wolves > 3) throw new Error('Too many wolves')
  if (state.eatenSheep !== OPENING_SHEEP - sheep) {
    throw new Error(
      `eatenSheep mismatch: ${state.eatenSheep} vs ${OPENING_SHEEP - sheep}`,
    )
  }
  if (state.chain) {
    if (state.toMove !== 'wolf') throw new Error('chain while not wolf turn')
    if (state.chain.count < 1 || state.chain.count > MAX_CHAIN) {
      throw new Error('invalid chain count')
    }
  }
  if (state.status !== 'playing' && state.chain !== null) {
    throw new Error('chain after terminal')
  }
}

export function countSide(state: BoardState, side: Side): number {
  return state.pieces.filter((p) => p.side === side).length
}
