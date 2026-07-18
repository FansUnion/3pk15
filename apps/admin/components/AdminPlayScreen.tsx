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
  reviewCompletion,
  saveLevelReviews,
  type LevelReview,
  type LevelReviewMap,
  type PlayerExperience,
  type ReviewDevice,
  type ReviewIssueCategory,
  type ReviewSeverity,
  type ReviewUnderstanding,
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
  const completion = reviewCompletion(current)
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
            <p className={`mt-2 p-2 text-xs ${completion.complete ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>
              验收证据 {completion.completed}/{completion.total} {completion.complete ? '· 字段完整' : '· 尚不能计入正式试玩通过'}
            </p>
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
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ReviewSelect label="验证设备" value={current.device ?? ''} onChange={(value) => updateReview({ device: value as ReviewDevice })} options={DEVICE_OPTIONS} />
              <ReviewSelect label="玩家经验" value={current.playerExperience ?? ''} onChange={(value) => updateReview({ playerExperience: value as PlayerExperience })} options={EXPERIENCE_OPTIONS} />
              <ReviewSelect label="策略理解" value={current.strategyUnderstanding ?? ''} onChange={(value) => updateReview({ strategyUnderstanding: value as ReviewUnderstanding })} options={UNDERSTANDING_OPTIONS} />
              <ReviewSelect label="教学理解" value={current.teachingUnderstanding ?? ''} onChange={(value) => updateReview({ teachingUnderstanding: value as ReviewUnderstanding })} options={UNDERSTANDING_OPTIONS} />
              <ReviewSelect label="棋盘识别" value={current.boardReadability ?? ''} onChange={(value) => updateReview({ boardReadability: value as ReviewUnderstanding })} options={UNDERSTANDING_OPTIONS} />
              <ReviewSelect label="奖励理解" value={current.rewardUnderstanding ?? ''} onChange={(value) => updateReview({ rewardUnderstanding: value as ReviewUnderstanding })} options={UNDERSTANDING_OPTIONS} />
              <ReviewSelect label="问题归因" value={current.issueCategory ?? ''} onChange={(value) => updateReview({ issueCategory: value as ReviewIssueCategory })} options={ISSUE_OPTIONS} />
              <ReviewSelect label="严重性" value={current.severity ?? ''} onChange={(value) => updateReview({ severity: value as ReviewSeverity })} options={SEVERITY_OPTIONS} />
            </div>
            <label className="mt-3 grid gap-1 text-xs text-[#5c6b52]">复现步骤
              <textarea value={current.reproduction ?? ''} onChange={(event) => updateReview({ reproduction: event.target.value })} rows={3} placeholder="有问题时记录：第几次尝试、关键走法、发生位置和预期结果。" className="border border-[#5c6b52]/25 bg-white p-3 text-sm text-[#2c3328]" />
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
  return { levelId, levelVersion: version, status: 'unreviewed', attempts: 0, notes: '', reproduction: '', reviewedAt: new Date().toISOString() }
}

const UNDERSTANDING_OPTIONS = [['', '未记录'], ['clear', '清楚'], ['partial', '部分理解'], ['unclear', '不理解']]
const DEVICE_OPTIONS = [['', '未记录'], ['mobile', '手机'], ['tablet', '平板'], ['desktop', '桌面']]
const EXPERIENCE_OPTIONS = [['', '未记录'], ['new', '首次接触'], ['casual', '休闲玩家'], ['strategy', '策略游戏玩家']]
const ISSUE_OPTIONS = [['', '未记录'], ['none', '无问题'], ['rule', '规则'], ['map_opening', '地图/开局'], ['sheep_ai', '羊 AI'], ['ui_guidance', '界面/教学'], ['reward', '奖励表达'], ['technical', '技术异常']]
const SEVERITY_OPTIONS = [['', '未记录'], ['none', '无问题'], ['p0', 'P0 阻塞'], ['p1', 'P1 重要'], ['p2', 'P2 一般']]

function ReviewSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="grid gap-1 text-xs text-[#5c6b52]">{label}
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 border border-[#5c6b52]/25 bg-white px-3 text-sm text-[#2c3328]">
      {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
    </select>
  </label>
}

function terminalReason(state: BoardState) {
  if (state.terminalReason) return state.terminalReason
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
