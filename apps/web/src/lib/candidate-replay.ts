import {
  applyAction,
  createLevelInitialState,
  endWolfTurn,
  type Action,
  type BoardState,
  type LevelConfig,
} from '@wolf-sheep/game-core'

export type CandidateReplayFrame = {
  label: string
  state: BoardState
}

export type CandidateReplayResult =
  | { ok: true; frames: CandidateReplayFrame[] }
  | { ok: false; error: string; frames: CandidateReplayFrame[] }

export function buildCandidateReplay(level: LevelConfig, trace: string[]): CandidateReplayResult {
  let state = createLevelInitialState(level)
  const frames: CandidateReplayFrame[] = [{ label: '初始局面', state }]

  for (let index = 0; index < trace.length; index += 1) {
    const line = trace[index]!
    const separator = line.indexOf(':')
    const payload = separator >= 0 ? line.slice(separator + 1) : line
    if (payload === 'end-chain') {
      const result = endWolfTurn(state)
      if (!result.ok) return { ok: false, error: `步骤 ${index + 1} 无法结束连吃：${result.error}`, frames }
      state = result.state
      frames.push({ label: line, state })
      continue
    }

    const action = parseTraceAction(payload)
    if (!action) return { ok: false, error: `步骤 ${index + 1} 格式无法识别：${line}`, frames }
    const result = applyAction(state, action)
    if (!result.ok) return { ok: false, error: `步骤 ${index + 1} 与当前规则不一致：${result.error}`, frames }
    state = result.state
    frames.push({ label: line, state })
  }

  return { ok: true, frames }
}

function parseTraceAction(payload: string): Action | null {
  const match = /^(step|jump):([^>]+)>(\d+),(\d+)(?: via (\d+),(\d+))?$/.exec(payload)
  if (!match) return null
  const [, type, pieceId, row, column, throughRow, throughColumn] = match
  const to = { r: Number(row), c: Number(column) }
  if (type === 'step') return { type: 'step', pieceId: pieceId!, to }
  if (throughRow == null || throughColumn == null) return null
  return {
    type: 'jump',
    pieceId: pieceId!,
    to,
    through: { r: Number(throughRow), c: Number(throughColumn) },
  }
}
