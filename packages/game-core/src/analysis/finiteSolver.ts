import { applyAction, boardPositionKey, endWolfTurn, listLegalActions } from '../rules'
import type { Action, BoardState } from '../types'

export type SolverVerdict = 'proven-wolf-win' | 'proven-sheep-win' | 'proven-draw' | 'unknown'

export type FiniteSolveOptions = {
  maxDepth: number
  maxNodes?: number
}

export type FiniteSolveResult = {
  verdict: SolverVerdict
  depth: number
  nodes: number
  truncated: boolean
  principalVariation: string[]
}

type SearchResult = { verdict: SolverVerdict; line: string[] }

function actionLabel(action: Action): string {
  if (action.type === 'pass') return 'pass'
  const through = action.type === 'jump' ? ` via ${action.through.r},${action.through.c}` : ''
  return `${action.type}:${action.pieceId}>${action.to.r},${action.to.c}${through}`
}

function terminalVerdict(state: BoardState): SolverVerdict | null {
  if (state.status === 'won') return 'proven-wolf-win'
  if (state.status === 'lost') return 'proven-sheep-win'
  if (state.status === 'draw') return 'proven-draw'
  return null
}

function children(state: BoardState): Array<{ state: BoardState; label: string }> {
  const actions = listLegalActions(state)
  const next = actions.flatMap((action) => {
    const result = applyAction(state, action)
    return result.ok ? [{ state: result.state, label: actionLabel(action) }] : []
  })
  if (state.toMove === 'wolf' && state.chain && state.status === 'playing') {
    const ended = endWolfTurn(state)
    if (ended.ok) next.push({ state: ended.state, label: 'end-chain' })
  }
  return next.sort((left, right) => {
    const rank = (label: string) => label === 'end-chain' ? 2 : label.startsWith('jump:') ? 0 : 1
    return rank(left.label) - rank(right.label) || left.label.localeCompare(right.label)
  })
}

function chooseWolf(results: SearchResult[]): SearchResult {
  if (results.some((result) => result.verdict === 'proven-wolf-win')) return results.find((result) => result.verdict === 'proven-wolf-win')!
  if (results.length > 0 && results.every((result) => result.verdict === 'proven-sheep-win')) return results[0]!
  if (results.length > 0 && results.every((result) => result.verdict === 'proven-draw')) return results[0]!
  return { verdict: 'unknown', line: results[0]?.line ?? [] }
}

function chooseSheep(results: SearchResult[]): SearchResult {
  if (results.some((result) => result.verdict === 'proven-sheep-win')) return results.find((result) => result.verdict === 'proven-sheep-win')!
  if (results.length > 0 && results.every((result) => result.verdict === 'proven-wolf-win')) return results[0]!
  if (results.length > 0 && results.every((result) => result.verdict === 'proven-draw')) return results[0]!
  return { verdict: 'unknown', line: results[0]?.line ?? [] }
}

export function solveFinitePosition(state: BoardState, options: FiniteSolveOptions): FiniteSolveResult {
  const maxDepth = Math.max(0, Math.floor(options.maxDepth))
  const maxNodes = Math.max(1, Math.floor(options.maxNodes ?? 50_000))
  let nodes = 0
  let truncated = false
  const memo = new Map<string, SearchResult>()

  const search = (position: BoardState, depth: number): SearchResult => {
    const terminal = terminalVerdict(position)
    if (terminal) return { verdict: terminal, line: [] }
    if (depth === 0) return { verdict: 'unknown', line: [] }
    if (nodes >= maxNodes) {
      truncated = true
      return { verdict: 'unknown', line: [] }
    }
    const key = `${boardPositionKey(position)}::${depth}`
    const cached = memo.get(key)
    if (cached) return cached
    nodes += 1
    const next = children(position)
    if (next.length === 0) return { verdict: 'unknown', line: [] }
    const results = next.map((child) => {
      const result = search(child.state, depth - 1)
      return { verdict: result.verdict, line: [child.label, ...result.line] }
    })
    const selected = position.toMove === 'wolf' ? chooseWolf(results) : chooseSheep(results)
    memo.set(key, selected)
    return selected
  }

  const result = search(state, maxDepth)
  return { verdict: result.verdict, depth: maxDepth, nodes, truncated, principalVariation: result.line }
}
