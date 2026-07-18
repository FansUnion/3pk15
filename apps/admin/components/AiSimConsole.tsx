'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  applyAction,
  analyzeSheepActions,
  boardPositionKey,
  chooseDiagnosticWolfAction,
  createLevelInitialState,
  createInitialState,
  createSeededRng,
  deserialize,
  endWolfTurn,
  evaluate,
  getLevel,
  LEVELS,
  listLegalActions,
  listWolfActionsAsIfTurn,
  makeState,
  OPENING_SHEEP,
  pickHardWithMeta,
  pickSheepAction,
  posKey,
  serialize,
  type BoardState,
  type Action,
  type Difficulty,
  type DiagnosticWolfStrategy,
  type HardBudgets,
  type LevelConfig,
  type Piece,
  type Pos,
  type Side,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { themeForChapter } from './adminBoardTheme'
import { AI_FIXTURES } from './aiFixtures'
import { consumeCandidateHandoff } from '@/lib/candidate-handoff'

type PlaceMode = 'cycle' | 'empty' | 'wolf' | 'sheep' | 'rock'

const CYCLE: Array<'empty' | 'wolf' | 'sheep' | 'rock'> = ['empty', 'wolf', 'sheep', 'rock']

type BatchResult = {
  wolfWins: number
  sheepWins: number
  timeout: number
  games: number
  avgPlies: number
  elapsedMs: number
  lastSerialize: string | null
  csv: string
  records: BatchGameRecord[]
  wolfStrategy: DiagnosticWolfStrategy
  sheepDifficulty: Difficulty
}

type TerminalReason = 'targetEaten' | 'wolvesTrapped' | 'maxPlies' | 'repetition' | 'stepLimit' | 'unexpected'

type BatchGameRecord = {
  index: number
  levelId: string
  seed: number
  outcome: 'wolf_win' | 'sheep_win' | 'timeout'
  reason: TerminalReason
  plies: number
  eatenSheep: number
  firstCapturePly: number | null
  wolfStrategy: DiagnosticWolfStrategy
  sheepDifficulty: Difficulty
}

type ReplayData = {
  record: BatchGameRecord
  states: string[]
  actions: string[]
}

type Props = {
  initialLevel?: string
  initialDiff?: string
  initialSeed?: string
  initialImport?: string
}

export function AiSimConsole({ initialLevel, initialDiff, initialSeed, initialImport }: Props) {
  const [state, setState] = useState(() => {
    const level = initialLevel ? getLevel(initialLevel) : undefined
    if (level) return createLevelInitialState(level)
    return createInitialState('spring-01')
  })
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    if (initialDiff === 'easy' || initialDiff === 'normal' || initialDiff === 'hard') {
      return initialDiff
    }
    const level = initialLevel ? getLevel(initialLevel) : undefined
    return level?.ai ?? 'easy'
  })
  const [seed, setSeed] = useState(() => {
    const parsed = Number(initialSeed)
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 42
  })
  const [placeMode, setPlaceMode] = useState<PlaceMode>('cycle')
  const [strict, setStrict] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [importText, setImportText] = useState('')
  const [batchN, setBatchN] = useState(50)
  const [batchLevelId, setBatchLevelId] = useState(
    initialLevel && getLevel(initialLevel) ? initialLevel : 'spring-01',
  )
  const [batchDiff, setBatchDiff] = useState<Difficulty>(difficulty)
  const [batchWolfStrategy, setBatchWolfStrategy] = useState<DiagnosticWolfStrategy>('mixed')
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null)
  const [batchProgress, setBatchProgress] = useState(0)
  const [reasonFilter, setReasonFilter] = useState<'all' | TerminalReason>('all')
  const [replay, setReplay] = useState<ReplayData | null>(null)
  const [replayIndex, setReplayIndex] = useState(0)
  const [takeover, setTakeover] = useState(false)
  const [selectedWolfId, setSelectedWolfId] = useState<string | null>(null)
  const [maxNodes, setMaxNodes] = useState(80)
  const [maxMs, setMaxMs] = useState(0)
  const [lastHardMeta, setLastHardMeta] = useState<{
    degraded: boolean
    nodes: number
    elapsedMs: number
    lookaheadCompleted: boolean
  } | null>(null)
  const stopRef = useRef(false)
  const appliedUrl = useRef(false)

  const hardBudgets: HardBudgets = useMemo(
    () => maxMs > 0 ? ({ maxNodes: Math.max(1, maxNodes), maxMs }) : ({ maxNodes: Math.max(1, maxNodes) }),
    [maxNodes, maxMs],
  )

  const breakdown = useMemo(() => evaluate(state), [state])
  const sheepCandidates = useMemo(() => state.status === 'playing' && state.toMove === 'sheep'
    ? analyzeSheepActions(state).sort((left, right) => Number(left.dominated) - Number(right.dominated) || right.score - left.score)
    : [], [state])
  const takeoverActions = useMemo(() => takeover && selectedWolfId && state.toMove === 'wolf'
    ? listLegalActions(state).filter((action): action is Exclude<Action, { type: 'pass' }> => action.type !== 'pass' && action.pieceId === selectedWolfId)
    : [], [selectedWolfId, state, takeover])

  const pushLog = useCallback((line: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 80))
  }, [])

  useEffect(() => {
    if (initialImport !== 'candidate-replay') return
    const imported = consumeCandidateHandoff()
    if (!imported) {
      pushLog('candidate replay handoff missing or invalid')
      return
    }
    setState(imported)
    setTakeover(true)
    setSelectedWolfId(imported.chain?.wolfId ?? null)
    pushLog(`candidate replay takeover level=${imported.levelId} ply=${imported.plyCount}`)
  }, [initialImport, pushLog])

  useEffect(() => {
    if (appliedUrl.current) return
    if (!initialLevel) return
    const level = getLevel(initialLevel)
    if (!level) return
    appliedUrl.current = true
    if (initialImport !== 'candidate-replay') setState(createLevelInitialState(level))
    setBatchLevelId(level.id)
    const d =
      initialDiff === 'easy' || initialDiff === 'normal' || initialDiff === 'hard'
        ? initialDiff
        : level.ai
    setDifficulty(d)
    setBatchDiff(d)
    pushLog(`deep-link level=${level.id} diff=${d}`)
  }, [initialLevel, initialDiff, initialImport, pushLog])

  function loadLevel(id: string) {
    const level = getLevel(id)
    if (!level) return
    setState(createLevelInitialState(level))
    pushLog(`loaded level ${id} ai=${level.ai}`)
    setDifficulty(level.ai)
    setBatchLevelId(id)
    setBatchDiff(level.ai)
  }

  function setTurn(toMove: Side, clearChain = true) {
    setState((s) => ({
      ...s,
      toMove,
      chain: clearChain ? null : s.chain,
      status: 'playing',
      terminalReason: null,
    }))
  }

  function clickCell(pos: Pos) {
    if (takeover) {
      wolfTakeoverClick(pos)
      return
    }
    setState((prev) => editCell(prev, pos, placeMode, strict))
  }

  function wolfTakeoverClick(pos: Pos) {
    if (state.status !== 'playing' || state.toMove !== 'wolf') return
    const wolf = state.pieces.find((piece) => piece.side === 'wolf' && piece.r === pos.r && piece.c === pos.c)
    if (wolf && !state.chain) {
      setSelectedWolfId(wolf.id)
      return
    }
    if (!selectedWolfId) return
    const action = takeoverActions.find((candidate) => candidate.to.r === pos.r && candidate.to.c === pos.c)
      ?? takeoverActions.find((candidate) => candidate.type === 'jump' && candidate.through.r === pos.r && candidate.through.c === pos.c)
    if (!action) return
    const result = applyAction(state, action)
    if (!result.ok) return
    setState(result.state)
    setSelectedWolfId(result.state.chain?.wolfId ?? null)
    pushLog(`[human wolf] ${JSON.stringify(action)}`)
  }

  function loadReplayForTakeover() {
    if (!replay) return
    setState(deserialize(JSON.parse(replay.states[replayIndex]!)))
    setTakeover(true)
    setSelectedWolfId(null)
    pushLog(`human takeover replay game=${replay.record.index} step=${replayIndex}`)
  }

  function sheepStep() {
    setBusy(true)
    try {
      let s = state
      if (s.toMove !== 'sheep') {
        s = { ...s, toMove: 'sheep', chain: null, status: 'playing', terminalReason: null }
      }
      if (s.status !== 'playing') {
        pushLog('game not playing')
        return
      }
      const rng = createSeededRng(seed)
      let action
      if (difficulty === 'hard') {
        const { action: a, meta } = pickHardWithMeta(s, rng, hardBudgets)
        action = a
        setLastHardMeta(meta)
        pushLog(
          `[hard] degraded=${meta.degraded} lookahead=${meta.lookaheadCompleted} nodes=${meta.nodes} ms=${meta.elapsedMs.toFixed(1)} budgets=${JSON.stringify(hardBudgets)}`,
        )
      } else {
        setLastHardMeta(null)
        action = pickSheepAction(s, { difficulty, rng, budgets: hardBudgets })
      }
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

  function loadFixture(id: string) {
    const fx = AI_FIXTURES.find((f) => f.id === id)
    if (!fx) return
    const next = fx.build()
    setState(next)
    setDifficulty(fx.suggestedDiff)
    setBatchDiff(fx.suggestedDiff)
    if (fx.id === 'budget-starve') {
      setMaxNodes(1)
      setMaxMs(1)
    }
    pushLog(`fixture ${fx.id}: ${fx.expect}`)
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
          const rng = createSeededRng(localSeed++)
          let action
          if (difficulty === 'hard') {
            const { action: a, meta } = pickHardWithMeta(s, rng, hardBudgets)
            action = a
            if (meta.degraded) {
              pushLog(`[hard degraded] nodes=${meta.nodes} ms=${meta.elapsedMs.toFixed(1)}`)
            }
          } else {
            action = pickSheepAction(s, {
              difficulty,
              rng,
              budgets: hardBudgets,
            })
          }
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

  async function runBatch() {
    const level = getLevel(batchLevelId)
    if (!level) {
      pushLog(`batch: unknown level ${batchLevelId}`)
      return
    }
    const n = Math.min(200, Math.max(1, batchN))
    stopRef.current = false
    setBusy(true)
    setBatchProgress(0)
    setBatchResult(null)
    pushLog(
      `batch start n=${n} level=${level.id} sheep=${batchDiff} wolf=${batchWolfStrategy}`,
    )

    const t0 = performance.now()
    let wolfWins = 0
    let sheepWins = 0
    let timeout = 0
    let pliesSum = 0
    let lastSerialize: string | null = null
    let localSeed = seed
    const records: BatchGameRecord[] = []

    for (let g = 0; g < n; g++) {
      if (stopRef.current) {
        pushLog(`batch stopped at ${g}/${n}`)
        break
      }
      const gameSeed = localSeed
      const sim = simulateOneGame(level, batchDiff, batchWolfStrategy, gameSeed, 400, hardBudgets)
      localSeed += 10007
      pliesSum += sim.plies
      if (sim.outcome === 'wolf_win') wolfWins++
      else if (sim.outcome === 'sheep_win') sheepWins++
      else timeout++
      lastSerialize = sim.serialized
      records.push({ index: g + 1, levelId: level.id, seed: gameSeed, outcome: sim.outcome, reason: sim.reason, plies: sim.plies, eatenSheep: sim.eatenSheep, firstCapturePly: sim.firstCapturePly, wolfStrategy: batchWolfStrategy, sheepDifficulty: batchDiff })
      if (g % 5 === 0 || g === n - 1) {
        setBatchProgress(g + 1)
        await new Promise((r) => setTimeout(r, 0))
      }
    }

    const games = wolfWins + sheepWins + timeout
    const elapsedMs = Math.round(performance.now() - t0)
    const avgPlies = games > 0 ? pliesSum / games : 0
    const csv = [
      level.id,
      batchDiff,
      batchWolfStrategy,
      games,
      wolfWins,
      sheepWins,
      timeout,
      (gameRate(wolfWins, games) * 100).toFixed(1),
      avgPlies.toFixed(1),
      elapsedMs,
      seed,
    ].join(',')

    const result: BatchResult = {
      wolfWins,
      sheepWins,
      timeout,
      games,
      avgPlies,
      elapsedMs,
      lastSerialize,
      csv: `level,diff,wolfStrategy,games,wolfWins,sheepWins,timeout,wolfWinPct,avgPlies,ms,seedBase\n${csv}`,
      records,
      wolfStrategy: batchWolfStrategy,
      sheepDifficulty: batchDiff,
    }
    setBatchResult(result)
    setSeed(localSeed)
    pushLog(
      `batch done wolf=${wolfWins} sheep=${sheepWins} timeout=${timeout} avgPlies=${avgPlies.toFixed(1)} ${elapsedMs}ms`,
    )
    setBusy(false)
  }

  function openReplay(record: BatchGameRecord) {
    const level = getLevel(record.levelId)
    if (!level) return
    const sim = simulateOneGame(level, record.sheepDifficulty, record.wolfStrategy, record.seed, 400, hardBudgets, true)
    setReplay({ record, states: sim.states, actions: sim.actions })
    setReplayIndex(0)
    pushLog(`replay game=${record.index} seed=${record.seed} reason=${record.reason}`)
  }

  function exportReproduction(record: BatchGameRecord) {
    const level = getLevel(record.levelId)
    if (!level) return
    const payload = {
      schemaVersion: 1,
      levelId: level.id,
      level,
      sheepDifficulty: record.sheepDifficulty,
      wolfStrategy: record.wolfStrategy,
      seed: record.seed,
      hardBudgets,
      result: record,
      command: `level=${level.id} diff=${record.sheepDifficulty} wolf=${record.wolfStrategy} seed=${record.seed} maxNodes=${hardBudgets.maxNodes} maxMs=${hardBudgets.maxMs}`,
    }
    downloadJson(payload, `repro-${level.id}-${record.seed}.json`)
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

  function importJsonText(text = importText) {
    try {
      const data = JSON.parse(text)
      const reproduction = data?.kind === 'fangrush-player-reproduction' ? data : null
      const next = deserialize(reproduction?.board ?? data)
      setState(next)
      if (reproduction) {
        if (reproduction.difficulty === 'easy' || reproduction.difficulty === 'normal' || reproduction.difficulty === 'hard') setDifficulty(reproduction.difficulty)
        if (Number.isSafeInteger(reproduction.nextAiSeed)) setSeed(reproduction.nextAiSeed)
        if (Number.isSafeInteger(reproduction.hardBudget?.maxNodes)) setMaxNodes(reproduction.hardBudget.maxNodes)
        if (reproduction.hardBudget?.maxMs === null) setMaxMs(0)
        else if (Number.isSafeInteger(reproduction.hardBudget?.maxMs)) setMaxMs(reproduction.hardBudget.maxMs)
        const importedReplay = buildPlayerReportReplay(reproduction)
        if (importedReplay) {
          setReplay(importedReplay)
          setReplayIndex(importedReplay.states.length - 1)
        }
        pushLog(`imported player report level=${reproduction.levelId} actions=${reproduction.actions?.length ?? 0} seed=${reproduction.nextAiSeed} terminal=${next.terminalReason ?? '-'}`)
      } else {
        pushLog('imported board JSON')
      }
    } catch (e) {
      pushLog(`import fail: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <details className="order-2 rounded-lg border border-[#5c6b52]/25 bg-white p-4">
        <summary className="cursor-pointer font-medium text-[#2c3328]">高级诊断：复现具体局面或检查羊 AI 决策</summary>
        <p className="mt-2 text-xs leading-relaxed text-[#5c6b52]">
          仅在发现送子、错误走法、循环或异常局面时使用。这里可以编辑棋盘、让羊走一步、导入复现数据并查看内部评分；日常关卡检查不需要操作本区。
        </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr_280px]">
        <aside className="flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            羊方防守难度
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
            >
              <option value="easy">简单</option>
              <option value="normal">标准</option>
              <option value="hard">困难</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            随机种子
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            载入预设问题局面
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  loadFixture(e.target.value)
                  e.target.value = ''
                }
              }}
              className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
            >
              <option value="">选择坏局…</option>
              {AI_FIXTURES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded border border-[#5c6b52]/25 bg-[#f7f5ef] p-2 text-xs text-[#5c6b52]">
            <p className="font-medium text-[#2c3328]">困难 AI 计算上限</p>
            <label className="mt-1 flex items-center gap-2">
              最多比较节点
              <input
                type="number"
                min={1}
                value={maxNodes}
                onChange={(e) => setMaxNodes(Number(e.target.value) || 1)}
                className="w-20 rounded border border-[#5c6b52]/40 bg-white px-1 py-0.5"
              />
            </label>
            <label className="mt-1 flex items-center gap-2">
              时间截断（毫秒，0=关闭）
              <input
                type="number"
                min={0}
                value={maxMs}
                onChange={(e) => setMaxMs(Math.max(0, Number(e.target.value) || 0))}
                className="w-20 rounded border border-[#5c6b52]/40 bg-white px-1 py-0.5"
              />
            </label>
            {lastHardMeta ? (
              <p
                className={`mt-1 ${lastHardMeta.degraded ? 'text-amber-800' : 'text-green-800'}`}
              >
                上次困难 AI：{lastHardMeta.degraded ? '预算不足，已用标准防守' : '完成候选比较'} · 节点
                {lastHardMeta.nodes} · {lastHardMeta.elapsedMs.toFixed(1)}ms
              </p>
            ) : (
              <p className="mt-1 opacity-70">跑 hard 单步后显示降级观测</p>
            )}
          </div>
          <label className="flex flex-col gap-1">
            加载关卡
            <select
              value={LEVELS.some((l) => l.id === state.levelId) ? state.levelId : ''}
              onChange={(e) => {
                if (e.target.value) loadLevel(e.target.value)
              }}
              className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1"
            >
              <option value="">（fixture / 自定义）</option>
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
          <label className="flex items-center gap-2 border border-[#5c6b52]/25 bg-[#f7f5ef] p-2">
            <input type="checkbox" checked={takeover} onChange={(event) => { setTakeover(event.target.checked); setSelectedWolfId(null) }} />
            人工接管狼方
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
            {busy ? '计算中…' : '让羊 AI 走一步'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              className="flex-1 rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs disabled:opacity-50"
              onClick={() => void autoRun(50)}
            >
              从当前局面演示50步
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
            导出当前局面
          </button>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="粘贴别人发来的局面数据"
            className="h-24 rounded border border-[#5c6b52]/40 bg-[#f7f5ef] p-2 font-mono text-xs"
          />
          <label className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-2 text-center text-xs">
            选择玩家问题记录
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                void file.text().then((text) => {
                  setImportText(text)
                  importJsonText(text)
                })
                event.currentTarget.value = ''
              }}
            />
          </label>
          <button
            type="button"
            className="rounded border border-[#5c6b52]/40 bg-[#f7f5ef] px-2 py-1 text-xs"
            onClick={() => importJsonText()}
          >
            导入并复现局面
          </button>
        </aside>

        <section className="flex flex-col items-center gap-2">
          <p className="text-sm text-[#5c6b52]">
            {sideLabel(state.toMove)} · {statusLabel(state.status)} · 已捕食 {state.eatenSheep} 只羊
            {state.chain ? ` · 连吃 ${state.chain.count} 次` : ''}
          </p>
          <BoardSvg
            state={state}
            selectedWolfId={takeover ? selectedWolfId : null}
            stepHighlights={takeoverActions.filter((action) => action.type === 'step').map((action) => action.to)}
            jumpHighlights={takeoverActions.filter((action) => action.type === 'jump').map((action) => action.to)}
            jumpThroughs={takeoverActions.filter((action): action is Extract<Action, { type: 'jump' }> => action.type === 'jump').map((action) => action.through)}
            interactive
            theme={themeForChapter(getLevel(state.levelId)?.chapterId ?? 'spring')}
            onSelectWolf={(id) => {
              if (takeover) {
                setSelectedWolfId(id)
                return
              }
              const piece = state.pieces.find((p) => p.id === id)
              if (piece) clickCell({ r: piece.r, c: piece.c })
            }}
            onClickCell={clickCell}
          />
        </section>

        <aside className="flex flex-col gap-3 text-sm">
          <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-3">
            <p className="font-medium">羊方局面评分（仅用于比较候选走法）</p>
            <p className="mt-1 text-xs text-[#5c6b52]">总分越高通常越有利于羊；不能用它判断关卡是否合格。</p>
            <p className="mt-2 font-mono text-xs">综合分 {breakdown.total.toFixed(2)}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-[#5c6b52]">
              <li>剩余羊数 {breakdown.material.toFixed(0)}</li>
              <li>狼方合法行动 {breakdown.wolfMobility.toFixed(0)}</li>
              <li>羊群紧密程度 {breakdown.cluster.toFixed(2)}</li>
              <li>羊群推进程度 {breakdown.advance.toFixed(2)}</li>
              <li>狼周围占位压力 {breakdown.surround.toFixed(0)}</li>
              <li>狼方直接捕食威胁 {Math.abs(breakdown.safety).toFixed(0)}</li>
              <li>羊方合法行动 {breakdown.sheepMobility.toFixed(0)}</li>
            </ul>
          </div>
          {sheepCandidates.length > 0 && <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-3">
            <p className="font-medium">羊为什么这样走？</p>
            <p className="mt-1 text-xs text-[#5c6b52]">比较当前全部合法动作。标记“疑似送子”的动作同时比另一动作暴露更多捕食，并且战略评分不更好。</p>
            <div className="mt-2 max-h-64 space-y-2 overflow-auto">
              {sheepCandidates.slice(0, 8).map((candidate, index) => <div key={`${candidate.action.type}-${index}`} className={`border p-2 text-xs ${candidate.dominated ? 'border-red-200 bg-red-50' : 'border-[#5c6b52]/15 bg-white'}`}>
                <p className="font-medium">{sheepExplanation(candidate.explanation)} · {actionText(candidate.action)}</p>
                <p className="mt-1 text-[#5c6b52]">直接捕食机会 {candidate.directCaptures} · 局面分 {candidate.score.toFixed(1)}{candidate.movedThreatenedSheep ? ' · 移动了受威胁羊' : ''}</p>
              </div>)}
            </div>
          </div>}
          <div className="max-h-[420px] overflow-auto rounded-lg border border-[#5c6b52]/25 bg-[#1e261c] p-3 font-mono text-xs text-[#dfe8d8]">
            {logs.length === 0 ? <p className="opacity-60">日志空</p> : logs.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        </aside>
      </div>
      </details>

      <section className="order-1 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
        <h2 className="font-medium text-[#2c3328]">关卡批量检查</h2>
        <p className="mt-1 text-xs text-[#5c6b52]">
          选择一个狼方基准与正式羊 AI 重复对局，用来发现过易、过难、拖延和异常棋谱。结果是自动模拟基准，不是玩家真实胜率。
          最多200局。可分享链接：
          <code className="ml-1 rounded bg-[#dfe8d8] px-1">/admin/ai?level=spring-01&amp;diff=hard</code>
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1">
            关卡
            <select
              value={batchLevelId}
              onChange={(e) => setBatchLevelId(e.target.value)}
              className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1"
            >
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            狼方基准
            <select
              value={batchWolfStrategy}
              onChange={(e) => setBatchWolfStrategy(e.target.value as DiagnosticWolfStrategy)}
              className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1"
            >
              <option value="mixed">策略型狼（推荐）</option>
              <option value="random">随机狼（最低基准）</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            羊方防守难度
            <select
              value={batchDiff}
              onChange={(e) => setBatchDiff(e.target.value as Difficulty)}
              className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1"
            >
              <option value="easy">简单</option>
              <option value="normal">标准</option>
              <option value="hard">困难</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            模拟局数
            <select
              value={batchN}
              onChange={(e) => setBatchN(Number(e.target.value))}
              className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </label>
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-[#3d4a3a] px-4 py-2 text-[#f4f1ea] disabled:opacity-50"
            onClick={() => void runBatch()}
          >
            {busy ? `检查中 ${batchProgress}/${batchN}` : '开始检查'}
          </button>
          <button
            type="button"
            className="rounded border border-[#5c6b52]/40 px-3 py-2 text-xs"
            onClick={() => {
              stopRef.current = true
            }}
          >
            停止
          </button>
        </div>
        {batchResult && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="grid gap-2 sm:grid-cols-4">
              <ResultMetric label="完成局数" value={String(batchResult.games)} />
              <ResultMetric label="狼方获胜" value={`${batchResult.wolfWins}（${(gameRate(batchResult.wolfWins, batchResult.games) * 100).toFixed(1)}%）`} />
              <ResultMetric label="羊方守住" value={String(batchResult.sheepWins)} />
              <ResultMetric label="拖延或超步" value={String(batchResult.timeout)} />
            </div>
            <p className="text-xs text-[#5c6b52]">
              当前基准：{wolfStrategyLabel(batchResult.wolfStrategy)} · 羊方：{difficultyLabel(batchResult.sheepDifficulty)} · 平均 {batchResult.avgPlies.toFixed(1)} 步 · 用时 {batchResult.elapsedMs}ms
            </p>
            <div className="rounded border border-[#5c6b52]/20 bg-white p-3">
              <p className="font-medium text-[#2c3328]">初步判断</p>
              <p className="mt-1 text-sm leading-relaxed text-[#5c6b52]">{batchInterpretation(batchResult)}</p>
              <p className="mt-1 text-xs text-[#7a8574]">这只是自动筛查。请优先回放拖延、狼被困或与预期不符的对局，再决定是否调整关卡或 AI。</p>
            </div>
            <p className="sr-only">
              局数 {batchResult.games} · 狼胜 {batchResult.wolfWins}（
              {(gameRate(batchResult.wolfWins, batchResult.games) * 100).toFixed(1)}%）· 羊胜{' '}
              {batchResult.sheepWins} · 超步 {batchResult.timeout} · 平均步数{' '}
              {batchResult.avgPlies.toFixed(1)} · {batchResult.elapsedMs}ms
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1 text-xs"
                onClick={() => {
                  void navigator.clipboard.writeText(batchResult.csv)
                  pushLog('batch CSV copied')
                }}
              >
                复制 CSV
              </button>
              {batchResult.lastSerialize && (
                <button
                  type="button"
                  className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1 text-xs"
                  onClick={() => {
                    const blob = new Blob([batchResult.lastSerialize!], {
                      type: 'application/json',
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `batch-last-${batchLevelId}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  下载最后一局 serialize
                </button>
              )}
            </div>
            <pre className="overflow-x-auto rounded bg-[#1e261c] p-2 font-mono text-xs text-[#dfe8d8]">
              {batchResult.csv}
            </pre>
            <div className="flex flex-wrap items-end gap-3 border-t border-[#5c6b52]/20 pt-3">
              <label className="grid gap-1 text-xs text-[#5c6b52]">终局筛选
                <select value={reasonFilter} onChange={(event) => setReasonFilter(event.target.value as 'all' | TerminalReason)} className="border border-[#5c6b52]/30 bg-white px-2 py-1 text-sm">
                  <option value="all">全部</option><option value="targetEaten">狼达成目标</option><option value="wolvesTrapped">狼无行动</option><option value="repetition">重复局面</option><option value="maxPlies">回合耗尽</option><option value="stepLimit">模拟步数上限</option><option value="unexpected">异常</option>
                </select>
              </label>
              <span className="text-xs text-[#5c6b52]">显示 {batchResult.records.filter((record) => reasonFilter === 'all' || record.reason === reasonFilter).length}/{batchResult.records.length}</span>
            </div>
            <div className="max-h-72 overflow-auto border border-[#5c6b52]/20 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#eef2ea]"><tr><th className="p-2">局</th><th>种子</th><th>终局</th><th>总步数</th><th>首次捕食</th><th>操作</th></tr></thead>
                <tbody>{batchResult.records.filter((record) => reasonFilter === 'all' || record.reason === reasonFilter).map((record) => (
                  <tr key={record.index} className="border-t border-[#5c6b52]/10"><td className="p-2">{record.index}</td><td>{record.seed}</td><td>{terminalReasonLabel(record.reason)}</td><td>{record.plies}</td><td>{record.firstCapturePly ?? '-'}</td><td className="space-x-2"><button type="button" onClick={() => openReplay(record)} className="underline">回放</button><button type="button" onClick={() => exportReproduction(record)} className="underline">导出复现包</button></td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {replay && (
        <section className="order-3 border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium text-[#2c3328]">棋谱回放 · 第 {replay.record.index} 局</h2><p className="text-xs text-[#5c6b52]">种子 {replay.record.seed} · {terminalReasonLabel(replay.record.reason)} · 步骤 {replayIndex}/{replay.states.length - 1}</p></div><button type="button" onClick={() => setReplay(null)} className="text-sm underline">关闭回放</button></div>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-[minmax(0,480px)_1fr]">
            <BoardSvg state={deserialize(JSON.parse(replay.states[replayIndex]!))} selectedWolfId={null} stepHighlights={[]} jumpHighlights={[]} jumpThroughs={[]} interactive={false} theme={themeForChapter(getLevel(replay.record.levelId)?.chapterId ?? 'spring')} onSelectWolf={() => undefined} onClickCell={() => undefined} />
            <div>
              <input aria-label="回放步骤" type="range" min={0} max={replay.states.length - 1} value={replayIndex} onChange={(event) => setReplayIndex(Number(event.target.value))} className="w-full" />
              <div className="mt-2 flex gap-2"><button type="button" disabled={replayIndex === 0} onClick={() => setReplayIndex((value) => Math.max(0, value - 1))} className="border px-3 py-2 disabled:opacity-40">上一步</button><button type="button" disabled={replayIndex >= replay.states.length - 1} onClick={() => setReplayIndex((value) => Math.min(replay.states.length - 1, value + 1))} className="border px-3 py-2 disabled:opacity-40">下一步</button></div>
              <button type="button" onClick={loadReplayForTakeover} className="mt-2 bg-[#3d4a3a] px-3 py-2 text-sm text-[#f4f1ea]">从此步人工接管</button>
              <p className="mt-3 break-all font-mono text-xs text-[#5c6b52]">{replayIndex === 0 ? '初始局面' : replay.actions[replayIndex - 1]}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#5c6b52]/20 bg-white p-3">
      <p className="text-xs text-[#5c6b52]">{label}</p>
      <p className="mt-1 font-medium text-[#2c3328]">{value}</p>
    </div>
  )
}

function wolfStrategyLabel(strategy: DiagnosticWolfStrategy) {
  return strategy === 'mixed' ? '策略型狼（近似懂规则的玩家）' : '随机狼（最低能力基准）'
}

function difficultyLabel(difficulty: Difficulty) {
  return difficulty === 'easy' ? '简单防守' : difficulty === 'normal' ? '标准防守' : '困难防守'
}

function terminalReasonLabel(reason: TerminalReason) {
  const labels: Record<TerminalReason, string> = {
    targetEaten: '狼达成目标',
    wolvesTrapped: '狼无合法行动',
    maxPlies: '回合耗尽',
    repetition: '重复局面',
    stepLimit: '模拟步数上限',
    unexpected: '异常终局',
  }
  return labels[reason]
}

function sheepExplanation(explanation: 'pass' | 'escape' | 'block' | 'sacrifice' | 'equivalent' | 'blunder') {
  return {
    pass: '全体无路，跳过',
    escape: '受威胁羊脱险',
    block: '封锁且无直接损失',
    sacrifice: '可能的战术牺牲',
    equivalent: '近似等价选择',
    blunder: '疑似送子',
  }[explanation]
}

function actionText(action: Action) {
  if (action.type === 'pass') return '跳过行动'
  return `${action.pieceId} → (${action.to.r},${action.to.c})`
}

function buildPlayerReportReplay(data: any): ReplayData | null {
  const level = getLevel(data.levelId)
  if (!level || !Array.isArray(data.actions)) return null
  let current = createLevelInitialState(level)
  const states = [JSON.stringify(serialize(current))]
  const actions: string[] = []
  for (const action of data.actions) {
    const result = action?.type === 'end-chain' ? endWolfTurn(current) : applyAction(current, action as Action)
    if (!result.ok) return null
    current = result.state
    actions.push(JSON.stringify(action))
    states.push(JSON.stringify(serialize(current)))
  }
  const reason = current.terminalReason ?? 'unexpected'
  return {
    record: {
      index: 0,
      levelId: level.id,
      seed: Number.isSafeInteger(data.initialAiSeed) ? data.initialAiSeed : 0,
      outcome: current.status === 'won' ? 'wolf_win' : current.status === 'lost' ? 'sheep_win' : 'timeout',
      reason,
      plies: current.plyCount,
      eatenSheep: current.eatenSheep,
      firstCapturePly: null,
      wolfStrategy: 'mixed',
      sheepDifficulty: data.difficulty ?? level.ai,
    },
    states,
    actions,
  }
}

function batchInterpretation(result: BatchResult) {
  const wolfRate = gameRate(result.wolfWins, result.games)
  const unresolved = result.records.filter((record) => ['maxPlies', 'repetition', 'stepLimit'].includes(record.reason)).length
  const unexpected = result.records.filter((record) => record.reason === 'unexpected').length
  if (unexpected > 0) return `发现 ${unexpected} 局异常终局。先打开这些棋谱检查规则、状态恢复或模拟入口，不应继续做平衡结论。`
  if (gameRate(unresolved, result.games) >= 0.2) return `有 ${unresolved} 局拖到回合耗尽、重复或模拟上限，比例偏高。优先检查是否只有拖延、没有有效攻防进展。`
  if (result.wolfStrategy === 'random' && wolfRate >= 0.8) return '随机走法也经常获胜，说明关卡可能过松，或当前羊 AI 防守压力不足。建议再用“策略型狼”运行，并复盘羊是否明显送子。'
  if (result.wolfStrategy === 'mixed' && wolfRate >= 0.9 && result.sheepWins === 0) return '策略型狼几乎稳定获胜，存在关卡偏易或强制胜风险。请复盘最快胜局，确认获胜是否需要真实策略。'
  if (result.wolfStrategy === 'mixed' && wolfRate <= 0.2) return '策略型狼仍很难获胜，存在关卡偏难或获胜路径不清晰风险。请复盘狼方失败局和首次捕食时间。'
  return '当前基准没有显示单一的极端风险。下一步应查看代表性胜负棋谱，并由人工试玩确认策略是否清楚、操作是否合理。'
}

function sideLabel(side: Side) {
  return side === 'wolf' ? '轮到狼方' : '轮到羊方'
}

function statusLabel(status: BoardState['status']) {
  return status === 'playing' ? '对局进行中' : status === 'won' ? '狼方已获胜' : status === 'lost' ? '羊方已守住' : '和局'
}

function gameRate(n: number, total: number) {
  return total > 0 ? n / total : 0
}

function simulateOneGame(
  level: LevelConfig,
  difficulty: Difficulty,
  wolfStrategy: DiagnosticWolfStrategy,
  seed: number,
  maxSteps = 400,
  budgets?: HardBudgets,
  captureReplay = false,
): { outcome: 'wolf_win' | 'sheep_win' | 'timeout'; reason: TerminalReason; plies: number; eatenSheep: number; firstCapturePly: number | null; serialized: string; states: string[]; actions: string[] } {
  let s = createLevelInitialState(level)
  let localSeed = seed
  let plies = 0
  let firstCapturePly: number | null = null
  const states = captureReplay ? [JSON.stringify(serialize(s))] : []
  const actions: string[] = []
  while (s.status === 'playing' && plies < maxSteps) {
    plies++
    const beforeEaten = s.eatenSheep
    if (s.toMove === 'wolf') {
      const legal = listLegalActions(s)
      if (legal.length === 0) break
      const rng = createSeededRng(localSeed++)
      const pick = chooseDiagnosticWolfAction(s, legal, rng, wolfStrategy)
      const res = applyAction(s, pick)
      if (!res.ok) break
      s = res.state
      actions.push(`wolf:${JSON.stringify(pick)}`)
      if (s.chain) {
        const end = endWolfTurn(s)
        if (end.ok) s = end.state
      }
    } else {
      const action = pickSheepAction(s, {
        difficulty,
        rng: createSeededRng(localSeed++),
        budgets,
      })
      const res = applyAction(s, action)
      if (!res.ok) break
      s = res.state
      actions.push(`sheep:${JSON.stringify(action)}`)
    }
    if (firstCapturePly === null && s.eatenSheep > beforeEaten) firstCapturePly = s.plyCount
    if (captureReplay) states.push(JSON.stringify(serialize(s)))
  }
  let outcome: 'wolf_win' | 'sheep_win' | 'timeout' = 'timeout'
  if (s.status === 'won') outcome = 'wolf_win'
  else if (s.status === 'lost') outcome = 'sheep_win'
  return {
    outcome,
    reason: terminalReason(s, plies >= maxSteps),
    plies,
    eatenSheep: s.eatenSheep,
    firstCapturePly,
    serialized: JSON.stringify(serialize(s), null, 2),
    states,
    actions,
  }
}

function terminalReason(state: BoardState, hitStepLimit: boolean): TerminalReason {
  if (state.terminalReason) return state.terminalReason
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= 3) return 'repetition'
  if (hitStepLimit) return 'stepLimit'
  return 'unexpected'
}

function downloadJson(value: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
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
