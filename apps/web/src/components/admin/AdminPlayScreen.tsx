'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adjacentLevels, boardPositionKey, listWolfActionsAsIfTurn, type BoardState, type LevelConfig } from '@wolf-sheep/game-core'
import { PlayScreen } from '@/components/PlayScreen'
import type { TerminalAttemptDetails } from '@/lib/play-metrics'
import {
  levelVersion,
  loadLevelReviews,
  parseLevelReviewsJson,
  saveLevelReviews,
  type LevelReview,
  type LevelReviewMap,
  type LevelReviewStatus,
} from '@/lib/admin-level-reviews'

export function AdminPlayScreen({ level }: { level: LevelConfig }) {
  const version = useMemo(() => levelVersion(level), [level])
  const [reviews, setReviews] = useState<LevelReviewMap>({})
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState(false)
  const current = reviews[level.id] ?? emptyReview(level.id, version)
  const stale = current.levelVersion !== version
  const { prev, next } = adjacentLevels(level.id)

  useEffect(() => {
    setReviews(loadLevelReviews())
    setReviewsLoaded(true)
  }, [])

  const updateReview = useCallback((patch: Partial<LevelReview>) => {
    setReviews((existing) => {
      const base = existing[level.id] ?? emptyReview(level.id, version)
      const updated = {
        ...base,
        ...patch,
        levelId: level.id,
        levelVersion: version,
        reviewedAt: new Date().toISOString(),
      }
      const nextReviews = { ...existing, [level.id]: updated }
      saveLevelReviews(nextReviews)
      return nextReviews
    })
  }, [level.id, version])

  const recordAttempt = useCallback(() => {
    setReviews((existing) => {
      const base = existing[level.id] ?? emptyReview(level.id, version)
      const updated = { ...base, levelVersion: version, attempts: base.attempts + 1, reviewedAt: new Date().toISOString() }
      const nextReviews = { ...existing, [level.id]: updated }
      saveLevelReviews(nextReviews)
      return nextReviews
    })
  }, [level.id, version])

  const recordTerminal = useCallback((state: BoardState, details: TerminalAttemptDetails) => {
    updateReview({
      result: state.status === 'won' ? 'wolf' : state.status === 'lost' ? 'sheep' : 'draw',
      terminalReason: terminalReason(state),
      plies: state.plyCount,
      eatenSheep: state.eatenSheep,
      firstCapturePly: details.firstCapturePly,
      durationMs: details.durationMs,
    })
  }, [updateReview])

  function importReviews() {
    const parsed = parseLevelReviewsJson(importText)
    if (!parsed) {
      setImportError(true)
      return
    }
    setImportError(false)
    setReviews(parsed)
    saveLevelReviews(parsed)
  }

  function exportReviews() {
    const blob = new Blob([JSON.stringify(reviews, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `fangrush-level-reviews-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <main className="mx-auto max-w-[1180px] pb-8">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#5c6b52]/20 pb-4">
        <Link href="/admin/levels" className="text-sm text-[#3d4a3a] underline">返回关卡台</Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-xl text-[#2c3328]">Admin 试玩 · {level.nameZh}</h1>
          <p className="text-xs text-[#7a8574]">{level.id} · 配置 {version} · 不写玩家奖励与进度</p>
        </div>
        <nav className="flex gap-2 text-sm">
          {prev && <Link href={`/admin/play/${prev.id}`} className="border border-[#5c6b52]/25 px-3 py-2">上一关</Link>}
          {next && <Link href={`/admin/play/${next.id}`} className="border border-[#5c6b52]/25 px-3 py-2">下一关</Link>}
        </nav>
      </header>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
        <section className="border border-[#5c6b52]/20 bg-[#f7f5ef]">
          {reviewsLoaded ? (
            <PlayScreen level={level} adminMode localeOverride="zh" onAdminAttempt={recordAttempt} onAdminTerminal={recordTerminal} />
          ) : (
            <p className="p-6 text-sm text-[#5c6b52]">正在载入试玩记录...</p>
          )}
        </section>
        <aside className="space-y-4">
          <section className="border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
            <h2 className="font-medium text-[#2c3328]">本关试玩反馈</h2>
            {stale && <p className="mt-2 bg-amber-100 p-2 text-xs text-amber-900">关卡配置已变化，旧反馈需要重新确认。</p>}
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-[#7a8574]">尝试次数</dt><dd>{current.attempts}</dd></div>
              <div><dt className="text-[#7a8574]">最近结果</dt><dd>{resultLabel(current)}</dd></div>
              <div><dt className="text-[#7a8574]">最近 plies</dt><dd>{current.plies ?? '-'}</dd></div>
              <div><dt className="text-[#7a8574]">最近吃子</dt><dd>{current.eatenSheep ?? '-'}</dd></div>
              <div><dt className="text-[#7a8574]">首次捕食 ply</dt><dd>{current.firstCapturePly ?? '-'}</dd></div>
              <div><dt className="text-[#7a8574]">最近用时</dt><dd>{current.durationMs == null ? '-' : formatDuration(current.durationMs)}</dd></div>
            </dl>
            <label className="mt-4 grid gap-1 text-xs text-[#5c6b52]">结论
              <select value={current.status} onChange={(event) => updateReview({ status: event.target.value as LevelReviewStatus })} className="h-10 border border-[#5c6b52]/25 bg-white px-3 text-sm text-[#2c3328]">
                <option value="unreviewed">未确认</option><option value="passed">试玩通过</option><option value="needs_changes">待修订</option>
              </select>
            </label>
            <label className="mt-3 grid gap-1 text-xs text-[#5c6b52]">主观难度
              <select value={current.difficultyRating ?? ''} onChange={(event) => updateReview({ difficultyRating: event.target.value ? Number(event.target.value) as 1 | 2 | 3 | 4 | 5 : undefined })} className="h-10 border border-[#5c6b52]/25 bg-white px-3 text-sm text-[#2c3328]">
                <option value="">未评分</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}/5</option>)}
              </select>
            </label>
            <label className="mt-3 grid gap-1 text-xs text-[#5c6b52]">备注
              <textarea value={current.notes} onChange={(event) => updateReview({ notes: event.target.value })} rows={5} placeholder="记录策略是否看懂、卡住的位置和建议修改。" className="border border-[#5c6b52]/25 bg-white p-3 text-sm text-[#2c3328]" />
            </label>
          </section>

          <section className="border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
            <div className="flex items-center justify-between gap-2"><h2 className="font-medium text-[#2c3328]">反馈导入导出</h2><button type="button" onClick={exportReviews} className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]">导出 JSON</button></div>
            <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={4} placeholder="粘贴完整反馈 JSON；验证失败不会覆盖现有记录。" className="mt-3 w-full border border-[#5c6b52]/25 bg-white p-3 font-mono text-xs" />
            {importError && <p className="mt-2 text-xs text-red-700">JSON 格式或字段无效，现有记录未改变。</p>}
            <button type="button" onClick={importReviews} className="mt-2 bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea]">导入并替换</button>
          </section>
        </aside>
      </div>
    </main>
  )
}

function emptyReview(levelId: string, version: string): LevelReview {
  return { levelId, levelVersion: version, status: 'unreviewed', attempts: 0, notes: '', reviewedAt: new Date().toISOString() }
}

function terminalReason(state: BoardState) {
  if (state.eatenSheep >= state.targetEaten) return 'targetEaten'
  if (listWolfActionsAsIfTurn(state).length === 0) return 'wolvesTrapped'
  if (state.plyCount >= state.maxPlies) return 'maxPlies'
  if ((state.repetitionCounts.get(boardPositionKey(state)) ?? 0) >= 3) return 'repetition'
  return state.status
}

function resultLabel(review: LevelReview) {
  if (!review.result) return '-'
  const winner = review.result === 'wolf' ? '狼胜' : review.result === 'sheep' ? '羊胜' : '和棋'
  return `${winner}${review.terminalReason ? ` · ${review.terminalReason}` : ''}`
}

function formatDuration(durationMs: number) {
  const seconds = Math.max(0, Math.round(durationMs / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
