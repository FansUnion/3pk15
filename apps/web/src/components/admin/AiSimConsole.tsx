'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  applyAction,
  BOARD_MAX,
  createInitialState,
  createSeededRng,
  deserialize,
  endWolfTurn,
  evaluate,
  getLevel,
  LEVELS,
  listLegalActions,
  makeState,
  OPENING_SHEEP,
  pickSheepAction,
  posKey,
  serialize,
  type BoardState,
  type Difficulty,
  type Piece,
  type Pos,
  type Side,
} from '@wolf-sheep/game-core'

type PlaceMode = 'cycle' | 'empty' | 'wolf' | 'sheep' | 'rock'

const CYCLE: Array<'empty' | 'wolf' | 'sheep' | 'rock'> = ['empty', 'wolf', 'sheep', 'rock']

export function AiSimConsole() {
  const [state, setState] = useState<BoardState>(() => createInitialState('spring-01'))
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [seed, setSeed] = useState(42)
  const [placeMode, setPlaceMode] = useState<PlaceMode>('cycle')
  const [strict, setStrict] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [importText, setImportText] = useState('')
  const stopRef = useRef(false)

  const breakdown = useMemo(() => evaluate(state), [state])

  const pushLog = useCallback((line: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 80))
  }, [])

  function loadLevel(id: string) {
    const level = getLevel(id)
    if (!level) return
    setState(createInitialState(level.id, level.rocks))
    pushLog(`loaded level ${id} ai=${level.ai}`)
    setDifficulty(level.ai)
  }

  function setTurn(toMove: Side, clearChain = true) {
    setState((s) => ({
      ...s,
      toMove,
      chain: clearChain ? null : s.chain,
      status: 'playing',
    }))
  }

  function clickCell(pos: Pos) {
    setState((prev) => {
      const next = editCell(prev, pos, placeMode, strict)
      return next
    })
  }

  function sheepStep() {
    setBusy(true)
    try {
      let s = state
      if (s.toMove !== 'sheep') {
        s = { ...s, toMove: 'sheep', chain: null, status: 'playing' }
      }
      if (s.status !== 'playing') {
        pushLog('game not playing')
        return
      }
      const action = pickSheepAction(s, {
        difficulty,
        rng: createSeededRng(seed),
      })
      const res = applyAction(s, action)
      if (!res.ok) {
        pushLog(`apply failed: ${res.error}`)
        return
      }
      setState(res.state)
      setSeed((x) => x + 1)
      const ev = evaluate(res.state)
      pushLog(
        `[sheep ${difficulty}] ${JSON.stringify(action)} score=${ev.total.toFixed(1)}`,
      )
    } catch (e) {
      pushLog(`AI error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  async function autoRun(maxSteps: number) {
    stopRef.current = false
    setBusy(true)
    let s = state
    let localSeed = seed
    for (let i = 0; i < maxSteps; i++) {
      if (stopRef.current) {
        pushLog('auto-run stopped')
        break
      }
      if (s.status !== 'playing') {
        pushLog(`terminal: ${s.status}`)
        break
      }
      if (s.toMove === 'wolf') {
        const legal = listLegalActions(s)
        if (legal.length === 0) {
          pushLog('wolves have no moves')
          break
        }
        const rng = createSeededRng(localSeed++)
        const pick = legal[Math.floor(rng.nextFloat() * legal.length)]!
        const res = applyAction(s, pick)
        if (!res.ok) break
        s = res.state
        if (s.chain) {
          const end = endWolfTurn(s)
          if (end.ok) s = end.state
        }
        pushLog(`[wolf random] ${JSON.stringify(pick)}`)
      } else {
        try {
          const action = pickSheepAction(s, {
            difficulty,
            rng: createSeededRng(localSeed++),
          })
          const res = applyAction(s, action)
          if (!res.ok) break
          s = res.state
          pushLog(`[sheep ${difficulty}] ${JSON.stringify(action)}`)
        } catch (e) {
          pushLog(`AI error: ${e instanceof Error ? e.message : String(e)}`)
          break
        }
      }
      setState(s)
      setSeed(localSeed)
      await new Promise((r) => setTimeout(r, 30))
    }
    setBusy(false)
  }

  function exportJson() {
    const json = JSON.stringify(serialize(state), null, 2)
    void navigator.clipboard.writeText(json)
    pushLog('copied board JSON to clipboard')
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `board-${state.levelId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJson() {
    try {
      const data = JSON.parse(importText)
      const next = deserialize(data)
      setState(next)
      pushLog('imported board JSON')
    } catch (e) {
      pushLog(`import fail: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[240px_1fr_280px]">
      <aside className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1">
          AI 档位
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
          >
            <option value="easy">easy</option>
            <option value="normal">normal</option>
            <option value="hard">hard</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Seed
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          加载关卡
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) loadLevel(e.target.value)
            }}
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
          >
            <option value="">选择…</option>
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          摆子模式
          <select
            value={placeMode}
            onChange={(e) => setPlaceMode(e.target.value as PlaceMode)}
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
          >
            <option value="cycle">循环 空→狼→羊→岩</option>
            <option value="empty">清空点</option>
            <option value="wolf">放狼</option>
            <option value="sheep">放羊</option>
            <option value="rock">放岩</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} />
          严格模式（禁重叠）
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
            onClick={() => setTurn('wolf')}
          >
            轮到狼
          </button>
          <button
            type="button"
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
            onClick={() => setTurn('sheep')}
          >
            轮到羊
          </button>
          <button
            type="button"
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
            onClick={() => setState(createInitialState('sim'))}
          >
            标准开局
          </button>
        </div>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea] disabled:opacity-50"
          onClick={sheepStep}
        >
          {busy ? '计算中…' : '羊单步 AI'}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            className="flex-1 rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs disabled:opacity-50"
            onClick={() => void autoRun(50)}
          >
            自动跑 50
          </button>
          <button
            type="button"
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
            onClick={() => {
              stopRef.current = true
            }}
          >
            停止
          </button>
        </div>
        <button
          type="button"
          className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
          onClick={exportJson}
        >
          导出 JSON
        </button>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="粘贴局面 JSON"
          className="h-24 rounded border border-[#5c6b52]/40 bg-[#f7f5ef] p-2 font-mono text-xs"
        />
        <button
          type="button"
          className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
          onClick={importJson}
        >
          导入 JSON
        </button>
      </aside>

      <section className="flex flex-col items-center gap-2">
        <p className="text-sm text-[#5c6b52]">
          {state.toMove} · {state.status} · eaten {state.eatenSheep}
          {state.chain ? ` · chain ${state.chain.count}` : ''}
        </p>
        <SimBoard state={state} onClickCell={clickCell} />
      </section>

      <aside className="flex flex-col gap-3 text-sm">
        <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-3">
          <p className="font-medium">evaluate</p>
          <p className="mt-1 font-mono text-xs">total {breakdown.total.toFixed(2)}</p>
          <ul className="mt-2 space-y-0.5 font-mono text-xs text-[#5c6b52]">
            <li>material {breakdown.material.toFixed(2)}</li>
            <li>wolfMobility {breakdown.wolfMobility.toFixed(2)}</li>
            <li>cluster {breakdown.cluster.toFixed(2)}</li>
            <li>advance {breakdown.advance.toFixed(2)}</li>
            <li>surround {breakdown.surround.toFixed(2)}</li>
          </ul>
        </div>
        <div className="max-h-[420px] overflow-auto rounded-lg border border-[#5c6b52]/25 bg-[#1e261c] p-3 font-mono text-xs text-[#dfe8d8]">
          {logs.length === 0 ? <p className="opacity-60">日志空</p> : logs.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      </aside>
    </div>
  )
}

function SimBoard({
  state,
  onClickCell,
}: {
  state: BoardState
  onClickCell: (p: Pos) => void
}) {
  const PAD = 24
  const CELL = 48
  const SIZE = PAD * 2 + CELL * (BOARD_MAX - 1)
  const occ = new Map(state.pieces.map((p) => [posKey(p.r, p.c), p]))

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-md touch-manipulation">
      <rect width={SIZE} height={SIZE} fill="#e8f0e4" rx={8} />
      {Array.from({ length: BOARD_MAX }, (_, i) => {
        const v = PAD + i * CELL
        return (
          <g key={i}>
            <line x1={PAD} y1={v} x2={PAD + CELL * 5} y2={v} stroke="#5c6b52" strokeWidth={1.5} />
            <line x1={v} y1={PAD} x2={v} y2={PAD + CELL * 5} stroke="#5c6b52" strokeWidth={1.5} />
          </g>
        )
      })}
      {[...state.rocks].map((k) => {
        const [r, c] = k.split(',').map(Number)
        const x = PAD + (c! - 1) * CELL
        const y = PAD + (r! - 1) * CELL
        return (
          <rect key={`r-${k}`} x={x - 12} y={y - 12} width={24} height={24} rx={3} fill="#6b6358" />
        )
      })}
      {state.pieces.map((p) => {
        const x = PAD + (p.c - 1) * CELL
        const y = PAD + (p.r - 1) * CELL
        return (
          <circle
            key={p.id}
            cx={x}
            cy={y}
            r={p.side === 'wolf' ? 13 : 11}
            fill={p.side === 'wolf' ? '#3d4a3a' : '#f4f1ea'}
            stroke="#1e261c"
            strokeWidth={1}
          />
        )
      })}
      {Array.from({ length: BOARD_MAX }, (_, ri) =>
        Array.from({ length: BOARD_MAX }, (_, ci) => {
          const r = ri + 1
          const c = ci + 1
          const x = PAD + (c - 1) * CELL
          const y = PAD + (r - 1) * CELL
          void occ
          return (
            <circle
              key={`h-${r}-${c}`}
              cx={x}
              cy={y}
              r={16}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onClickCell({ r, c })}
            />
          )
        }),
      )}
    </svg>
  )
}

function editCell(
  state: BoardState,
  pos: Pos,
  mode: PlaceMode,
  strict: boolean,
): BoardState {
  const k = posKey(pos.r, pos.c)
  const piece = state.pieces.find((p) => p.r === pos.r && p.c === pos.c)
  const hasRock = state.rocks.has(k)

  let kind: 'empty' | 'wolf' | 'sheep' | 'rock'
  if (mode === 'cycle') {
    const cur = hasRock ? 'rock' : piece ? piece.side : 'empty'
    const idx = CYCLE.indexOf(cur as 'empty' | 'wolf' | 'sheep' | 'rock')
    kind = CYCLE[(idx + 1) % CYCLE.length]!
  } else {
    kind = mode
  }

  let pieces = state.pieces.filter((p) => !(p.r === pos.r && p.c === pos.c))
  const rocks = new Set(state.rocks)
  rocks.delete(k)

  if (kind === 'rock') {
    if (strict && piece) return state
    rocks.add(k)
  } else if (kind === 'wolf' || kind === 'sheep') {
    if (strict && rocks.has(k)) return state
    const wolves = pieces.filter((p) => p.side === 'wolf')
    if (kind === 'wolf' && wolves.length >= 3 && !piece) {
      // replace oldest wolf slot
      pieces = pieces.filter((p) => p.id !== wolves[0]!.id)
    }
    const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const np: Piece = { id, side: kind, r: pos.r, c: pos.c }
    pieces = [...pieces, np]
  }

  const sheep = pieces.filter((p) => p.side === 'sheep').length
  const eatenSheep = Math.max(0, OPENING_SHEEP - sheep)

  return makeState({
    pieces,
    rocks: [...rocks].map((key) => {
      const [r, c] = key.split(',').map(Number)
      return { r: r!, c: c! }
    }),
    eatenSheep,
    toMove: state.toMove,
    chain: null,
    status: 'playing',
    levelId: state.levelId,
  })
}
