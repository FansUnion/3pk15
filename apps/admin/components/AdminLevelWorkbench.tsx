'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  CHAPTER_LABEL,
  CHAPTER_ORDER,
  createLevelInitialState,
  getWolfStrategy,
  LEVELS,
  validateAllLevels,
  type ChapterId,
  type Difficulty,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { themeForChapter } from './adminBoardTheme'
import { levelVersion, loadLevelReviews, reviewCompletion, type LevelReview } from '@/lib/admin-level-reviews'
import {
  loadCandidateReports,
  parseCandidateReports,
  saveCandidateReports,
  type CandidateReportMap,
} from '@/lib/candidate-reports'
import type { CandidateAcceptanceReport, CandidateVerdict } from '@wolf-sheep/game-core'
import { CANDIDATE_BASELINE, CANDIDATE_BASELINE_DATE } from '@/lib/candidate-baseline'
import { buildCandidateReplay } from '@/lib/candidate-replay'
import { saveCandidateHandoff } from '@/lib/candidate-handoff'
import {
  archiveCandidateCounterexample,
  loadCandidateCounterexamples,
  saveCandidateCounterexamples,
  type CandidateCounterexample,
} from '@/lib/candidate-counterexamples'

type ChapterFilter = 'all' | ChapterId
type AiFilter = 'all' | Difficulty
type VerdictFilter = 'all' | CandidateVerdict | 'missing'
type ReviewFilter = 'all' | 'unreviewed' | 'passed' | 'needs_changes' | 'incomplete'

const AI_LABEL: Record<Difficulty, string> = { easy: '简单', normal: '普通', hard: '困难' }

/** Product tags that mark a level as high-risk for triage (not every descriptive tag). */
const HIGH_RISK_TAGS = new Set([
  'Hard AI',
  '困狼',
  '策略敏感',
  '高难',
  '死角',
  '偏狼风险',
  '高压',
])

function effectiveVerdict(
  levelId: string,
  reports: CandidateReportMap,
): CandidateVerdict | undefined {
  return reports[levelId]?.verdict ?? CANDIDATE_BASELINE[levelId]?.verdict
}

function hasHighRiskTag(level: LevelConfig) {
  return level.riskTags.some((tag) => HIGH_RISK_TAGS.has(tag))
}

export function AdminLevelWorkbench() {
  const [chapter, setChapter] = useState<ChapterFilter>('all')
  const [ai, setAi] = useState<AiFilter>('all')
  const [difficulty, setDifficulty] = useState('all')
  const [riskOnly, setRiskOnly] = useState(false)
  const [verdict, setVerdict] = useState<VerdictFilter>('all')
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all')
  const [selectedId, setSelectedId] = useState(LEVELS[0]?.id ?? '')
  const [reviews, setReviews] = useState<Record<string, LevelReview>>({})
  const [reports, setReports] = useState<CandidateReportMap>({})
  const [reportText, setReportText] = useState('')
  const [reportError, setReportError] = useState(false)
  const [candidateText, setCandidateText] = useState('')
  const [candidateBusy, setCandidateBusy] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [lastCandidateReport, setLastCandidateReport] = useState<CandidateAcceptanceReport | null>(null)
  const [counterexamples, setCounterexamples] = useState<CandidateCounterexample[]>([])
  useEffect(() => {
    setReviews(loadLevelReviews())
    setReports(loadCandidateReports())
    setCounterexamples(loadCandidateCounterexamples())
  }, [])
  const allErrors = useMemo(() => validateAllLevels(), [])
  const filtered = useMemo(() => LEVELS.filter((level) => {
    const gate = effectiveVerdict(level.id, reports)
    return (chapter === 'all' || level.chapterId === chapter)
      && (ai === 'all' || level.ai === ai)
      && (difficulty === 'all' || String(level.difficulty) === difficulty)
      && (!riskOnly || hasHighRiskTag(level))
      && (verdict === 'all' || (verdict === 'missing' ? !gate : gate === verdict))
      && (reviewFilter === 'all'
        || (reviewFilter === 'unreviewed' && (!reviews[level.id] || reviews[level.id]?.status === 'unreviewed'))
        || (reviewFilter === 'incomplete' && !reviewCompletion(reviews[level.id]).complete)
        || reviews[level.id]?.status === reviewFilter)
  }).sort(playerOrderCompare), [ai, chapter, difficulty, reports, reviewFilter, reviews, riskOnly, verdict])
  const selected = filtered.find((level) => level.id === selectedId) ?? filtered[0]
  const passedCount = LEVELS.filter((level) => {
    const review = reviews[level.id]
    return review?.status === 'passed' && review.levelVersion === levelVersion(level) && reviewCompletion(review).complete
  }).length
  const evidenceCount = LEVELS.filter((level) => reviewCompletion(reviews[level.id]).complete && reviews[level.id]?.levelVersion === levelVersion(level)).length
  const needsChangesCount = Object.values(reviews).filter((review) => review.status === 'needs_changes').length
  const verdictCounts = LEVELS.reduce((counts, level) => {
    const current = effectiveVerdict(level.id, reports)
    if (current) counts[current] += 1
    return counts
  }, { pass: 0, review: 0, reject: 0 })

  function importReports() {
    const parsed = parseCandidateReports(reportText)
    if (!parsed) {
      setReportError(true)
      return
    }
    setReportError(false)
    setReports(parsed)
    saveCandidateReports(parsed)
  }

  function exportReports() {
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `fangrush-candidate-reports-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  function loadSelectedCandidate() {
    if (!selected) return
    setCandidateText(JSON.stringify(selected, null, 2))
    setCandidateError('')
  }

  async function runCandidate() {
    if (!selected) return
    setCandidateBusy(true)
    setCandidateError('')
    try {
      const candidate = JSON.parse(candidateText)
      const response = await fetch('/api/admin/candidate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseLevelId: selected.id, candidate }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? '验收失败')
      const report = payload.report as CandidateAcceptanceReport
      setLastCandidateReport(report)
      if (LEVELS.some((level) => level.id === report.levelId)) {
        const nextReports = { ...reports, [report.levelId]: report }
        setReports(nextReports)
        saveCandidateReports(nextReports)
      }
      if (report.verdict !== 'pass') {
        setCounterexamples(archiveCandidateCounterexample(payload.candidate as LevelConfig, report))
      }
    } catch (error) {
      setCandidateError(error instanceof Error ? error.message : '候选 JSON 或验收请求失败')
    } finally {
      setCandidateBusy(false)
    }
  }

  function exportCounterexamples() {
    const blob = new Blob([JSON.stringify(counterexamples, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `fangrush-counterexamples-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <main className="mx-auto max-w-[1480px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#2c3328]">24 关生产与试玩工作台</h1>
          <p className="mt-1 text-sm text-[#5c6b52]">查看全部真实开局、产品说明、难度和风险；不受玩家解锁进度限制。</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="border border-[#5c6b52]/25 bg-[#f7f5ef] px-3 py-2">生产通过 {LEVELS.filter((l) => l.productionStatus === 'approved').length}/24</span>
          <span className="border border-green-300 bg-green-50 px-3 py-2 text-green-800">试玩通过 {passedCount}/24</span>
          <span className="border border-[#5c6b52]/25 bg-[#f7f5ef] px-3 py-2">证据完整 {evidenceCount}/24</span>
          <span className="border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">待修订 {needsChangesCount}</span>
          <span className="border border-[#5c6b52]/25 bg-[#f7f5ef] px-3 py-2">候选 {verdictCounts.pass}/{verdictCounts.review}/{verdictCounts.reject}</span>
          <span className={`border px-3 py-2 ${allErrors.length ? 'border-red-300 bg-red-50 text-red-800' : 'border-green-300 bg-green-50 text-green-800'}`}>
            配置问题 {allErrors.length}
          </span>
        </div>
      </div>

      <section className="mt-5 flex flex-wrap items-end gap-3 border-y border-[#5c6b52]/20 py-4 text-sm">
        <Filter label="季节" value={chapter} onChange={(value) => setChapter(value as ChapterFilter)} options={[
          ['all', '全部季节'], ...CHAPTER_ORDER.map((id) => [id, CHAPTER_LABEL[id]]),
        ]} />
        <Filter label="羊 AI" value={ai} onChange={(value) => setAi(value as AiFilter)} options={[
          ['all', '全部 AI'], ['easy', '简单'], ['normal', '普通'], ['hard', '困难'],
        ]} />
        <Filter label="操作难度" value={difficulty} onChange={setDifficulty} options={[
          ['all', '全部难度'], ['1', '1/5'], ['2', '2/5'], ['3', '3/5'], ['4', '4/5'], ['5', '5/5'],
        ]} />
        <Filter label="候选门禁" value={verdict} onChange={(value) => setVerdict(value as VerdictFilter)} options={[
          ['all', '全部状态'], ['pass', 'pass'], ['review', 'review'], ['reject', 'reject'], ['missing', '无门禁结果'],
        ]} />
        <Filter label="人工验收" value={reviewFilter} onChange={(value) => setReviewFilter(value as ReviewFilter)} options={[
          ['all', '全部状态'], ['incomplete', '证据未完整'], ['unreviewed', '尚未记录'], ['passed', '标记通过'], ['needs_changes', '待修订'],
        ]} />
        <label className="flex h-10 items-center gap-2 border border-[#5c6b52]/25 bg-[#f7f5ef] px-3" title="Hard AI / 困狼 / 策略敏感 / 高难 / 死角 / 偏狼风险 / 高压">
          <input type="checkbox" checked={riskOnly} onChange={(event) => setRiskOnly(event.target.checked)} />
          只看高风险关
        </label>
        <button type="button" onClick={() => { setChapter('all'); setAi('all'); setDifficulty('all'); setVerdict('all'); setReviewFilter('all'); setRiskOnly(false) }} className="h-10 px-3 text-[#3d4a3a] underline">
          重置筛选
        </button>
        <span className="ml-auto text-[#5c6b52]">显示 {filtered.length}/24</span>
      </section>

      <details className="mt-4 border border-[#5c6b52]/20 bg-[#f7f5ef] p-4 text-sm">
        <summary className="cursor-pointer font-medium text-[#2c3328]">候选报告导入导出 · 已载入 {Object.keys(reports).length}/24</summary>
        <p className="mt-2 text-xs text-[#5c6b52]">粘贴 `assessLevelCandidate` 报告数组或以 levelId 为键的对象。验证失败不会覆盖现有报告。</p>
        <textarea value={reportText} onChange={(event) => setReportText(event.target.value)} rows={5} className="mt-3 w-full border border-[#5c6b52]/25 bg-white p-3 font-mono text-xs" placeholder="粘贴候选验收 JSON" />
        {reportError && <p className="mt-2 text-xs text-red-700">报告格式无效，现有数据未改变。</p>}
        <div className="mt-2 flex gap-2"><button type="button" onClick={importReports} className="bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea]">导入并替换</button><button type="button" onClick={exportReports} className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]">导出报告</button></div>
      </details>

      <details className="mt-4 border border-[#5c6b52]/20 bg-[#f7f5ef] p-4 text-sm">
        <summary className="cursor-pointer font-medium text-[#2c3328]">候选配置运行与反例库 · {counterexamples.length} 条</summary>
        <p className="mt-2 text-xs text-[#5c6b52]">以当前选中关卡为基线。建议每次只改一个主要变量；验收在服务端运行，不阻塞浏览器主线程。</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={loadSelectedCandidate} className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]">载入当前配置</button>
          <button type="button" disabled={candidateBusy || !candidateText.trim()} onClick={() => void runCandidate()} className="bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea] disabled:opacity-40">{candidateBusy ? '验收运行中...' : '运行候选验收'}</button>
          <button type="button" disabled={counterexamples.length === 0} onClick={exportCounterexamples} className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a] disabled:opacity-40">导出反例库</button>
        </div>
        <textarea value={candidateText} onChange={(event) => setCandidateText(event.target.value)} rows={10} className="mt-3 w-full border border-[#5c6b52]/25 bg-white p-3 font-mono text-xs" placeholder="先载入当前配置，再只修改一个变量" />
        {candidateError && <p className="mt-2 bg-red-50 p-2 text-xs text-red-800">{candidateError}</p>}
        {lastCandidateReport && <p className="mt-2 text-xs text-[#2c3328]">最近结果：<VerdictBadge verdict={lastCandidateReport.verdict} /> · findings {lastCandidateReport.findings.map((finding) => finding.code).join(', ') || 'none'}</p>}
        {counterexamples.slice(-5).reverse().map((record) => <div key={record.id} className="mt-2 flex items-center justify-between gap-3 border-t border-[#5c6b52]/15 pt-2 text-xs"><span>{record.candidate.id} · {record.report.verdict} · {record.report.findings.map((finding) => finding.code).join(', ')}</span><button type="button" onClick={() => { const next = counterexamples.filter((item) => item.id !== record.id); setCounterexamples(next); saveCandidateCounterexamples(next) }} className="underline">删除</button></div>)}
      </details>

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((level) => (
            <LevelCard key={level.id} level={level} review={reviews[level.id]} report={reports[level.id]} baselineVerdict={CANDIDATE_BASELINE[level.id]?.verdict} selected={selected?.id === level.id} onSelect={() => setSelectedId(level.id)} />
          ))}
          {filtered.length === 0 && <p className="py-10 text-sm text-[#5c6b52]">没有符合筛选条件的关卡。</p>}
        </section>
        {selected && <LevelDetail level={selected} report={reports[selected.id]} baseline={CANDIDATE_BASELINE[selected.id]} />}
      </div>
    </main>
  )
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <label className="grid gap-1 text-xs text-[#5c6b52]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 border border-[#5c6b52]/25 bg-[#f7f5ef] px-3 text-sm text-[#2c3328]">
        {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
      </select>
    </label>
  )
}

function LevelCard({ level, review, report, baselineVerdict, selected, onSelect }: { level: LevelConfig; review?: LevelReview; report?: CandidateAcceptanceReport; baselineVerdict?: CandidateVerdict; selected: boolean; onSelect: () => void }) {
  const state = useMemo(() => createLevelInitialState(level), [level])
  const theme = useMemo(() => themeForChapter(level.chapterId), [level.chapterId])
  const stale = Boolean(review && review.levelVersion !== levelVersion(level))
  const playHref = `/admin/play/${level.id}`
  const aiHref = `/admin/ai?level=${encodeURIComponent(level.id)}&diff=${level.ai}`
  return (
    <article className={`border bg-[#f7f5ef] ${selected ? 'border-[#3d4a3a] ring-1 ring-[#3d4a3a]' : 'border-[#5c6b52]/20'}`}>
      <button type="button" onClick={onSelect} className="block w-full p-3 text-left">
        <div className="flex items-start justify-between gap-2">
          <div><p className="font-medium text-[#2c3328]">{level.nameZh}</p><p className="font-mono text-[11px] text-[#7a8574]">{level.id}</p></div>
          <span className="bg-[#dfe8d8] px-2 py-1 text-[11px] text-[#3d4a3a]">操作难度 {level.difficulty}/5</span>
        </div>
        <div className="mx-auto mt-2 max-w-[180px] pointer-events-none"><BoardSvg state={state} selectedWolfId={null} stepHighlights={[]} jumpHighlights={[]} jumpThroughs={[]} interactive={false} onSelectWolf={() => undefined} onClickCell={() => undefined} theme={theme} /></div>
        <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
          <span className="border border-[#5c6b52]/20 px-1.5 py-0.5">羊防守 {AI_LABEL[level.ai]}</span>
          <span className="border border-[#5c6b52]/20 px-1.5 py-0.5">岩石 {level.rocks.length}</span>
          {level.riskTags.slice(0, 2).map((tag) => <span key={tag} className="bg-amber-100 px-1.5 py-0.5 text-amber-900">{tag}</span>)}
          {review?.status === 'passed' && !stale && <span className="bg-green-100 px-1.5 py-0.5 text-green-800">试玩通过</span>}
          {review?.status === 'needs_changes' && !stale && <span className="bg-red-100 px-1.5 py-0.5 text-red-800">待修订</span>}
          {stale && <span className="bg-amber-100 px-1.5 py-0.5 text-amber-900">需复核</span>}
          {review && !reviewCompletion(review).complete && <span className="bg-amber-100 px-1.5 py-0.5 text-amber-900">证据 {reviewCompletion(review).completed}/{reviewCompletion(review).total}</span>}
          {(report?.verdict ?? baselineVerdict) && <VerdictBadge verdict={(report?.verdict ?? baselineVerdict)!} />}
        </div>
      </button>
      <div className="flex gap-2 border-t border-[#5c6b52]/15 px-3 py-2 text-xs" onClick={(event) => event.stopPropagation()}>
        <Link href={playHref} className="bg-[#3d4a3a] px-2.5 py-1.5 text-[#f4f1ea]" onClick={(event) => event.stopPropagation()}>Admin 试玩</Link>
        <Link href={aiHref} className="border border-[#3d4a3a] px-2.5 py-1.5 text-[#3d4a3a]" onClick={(event) => event.stopPropagation()}>AI 诊断</Link>
      </div>
    </article>
  )
}

function playerOrderCompare(a: LevelConfig, b: LevelConfig) {
  const chapterDelta = CHAPTER_ORDER.indexOf(a.chapterId) - CHAPTER_ORDER.indexOf(b.chapterId)
  if (chapterDelta !== 0) return chapterDelta
  const indexDelta = a.indexInChapter - b.indexInChapter
  if (indexDelta !== 0) return indexDelta
  return a.id.localeCompare(b.id)
}

function LevelDetail({ level, report, baseline }: { level: LevelConfig; report?: CandidateAcceptanceReport; baseline?: { verdict: CandidateVerdict; findingCodes: string[] } }) {
  const [replaySeed, setReplaySeed] = useState<number | null>(null)
  const replayGame = report?.games.find((game) => game.strategy === 'mixed' && game.seed === replaySeed)
  const replay = useMemo(() => replayGame ? buildCandidateReplay(level, replayGame.trace) : null, [level, replayGame])
  const [replayIndex, setReplayIndex] = useState(0)
  const primaryStrategy = getWolfStrategy(level.strategy.primary)
  const secondaryStrategy = getWolfStrategy(level.strategy.secondary)

  useEffect(() => setReplayIndex(0), [replaySeed])

  return (
    <aside className="sticky top-4 border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <p className="text-xs text-[#7a8574]">{CHAPTER_LABEL[level.chapterId]}第 {level.indexInChapter} 关 · {level.id}</p>
      <h2 className="mt-1 font-serif text-2xl text-[#2c3328]">{level.nameZh}</h2>
      <p className="mt-2 leading-relaxed text-[#5c6b52]">{level.blurbZh}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 border-y border-[#5c6b52]/15 py-3 text-xs">
        <div><dt className="text-[#7a8574]">羊方防守强度</dt><dd>{AI_LABEL[level.ai]} ({level.ai})</dd></div>
        <div><dt className="text-[#7a8574]">玩家操作难度</dt><dd>{level.difficulty}/5</dd></div>
        <div><dt className="text-[#7a8574]">狼方胜利目标</dt><dd>累计捕获 {level.targetEaten ?? 8} 只羊</dd></div>
        <div><dt className="text-[#7a8574]">行动上限</dt><dd>{level.maxPlies ?? 300} 次单方行动</dd></div>
      </dl>
      <p className="mt-2 text-xs leading-relaxed text-[#5c6b52]">操作难度评价玩家找出并执行获胜路线的难度；羊方防守强度表示线上 AI 档位。两者不是同一个指标。</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/admin/play/${level.id}`} className="bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea]">Admin 试玩</Link>
        <Link href={`/admin/ai?level=${encodeURIComponent(level.id)}&diff=${level.ai}`} className="bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea]">AI 诊断</Link>
        <Link href={`/hunt/${level.id}`} target="_blank" className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]">前台说明</Link>
      </div>
      <p className="mt-2 text-xs text-green-800">Admin 试玩复用正式规则与羊 AI，但不写玩家奖励、解锁或任务进度。</p>

      {report && (
        <section className="mt-4 border-t border-[#5c6b52]/15 pt-4">
          <div className="flex items-center justify-between"><h3 className="text-xs font-medium text-[#7a8574]">自动代理检查</h3><VerdictBadge verdict={report.verdict} /></div>
          <p className="mt-2 text-xs leading-relaxed text-[#5c6b52]">较优狼策略代理：狼胜 {report.summaries.mixed.wolfWins} / 羊胜 {report.summaries.mixed.sheepWins} / 和局 {report.summaries.mixed.draws} · 95% 对局在 {report.summaries.mixed.p95Plies} 次行动内结束。</p>
          <p className="mt-1 text-xs text-amber-900">这是固定种子自动排雷结果，不是玩家胜率，也不能代替人工试玩。</p>
          {report.findings.length === 0 ? <p className="mt-2 text-xs text-green-800">未命中自动风险规则。</p> : report.findings.map((finding) => (
            <div key={finding.code} className="mt-2 border border-amber-300 bg-amber-50 p-2 text-xs text-amber-950">
              <p className="font-medium">{finding.code}</p><p>{finding.message}</p>
              {finding.evidenceSeeds.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{finding.evidenceSeeds.map((seed) => (
                <span key={seed} className="inline-flex gap-2">
                  <button type="button" onClick={() => setReplaySeed(seed)} className="underline">播放 seed {seed}</button>
                  <Link href={`/admin/ai?level=${encodeURIComponent(level.id)}&diff=${level.ai}&seed=${seed}`} className="underline">AI 诊断</Link>
                </span>
              ))}</div>}
            </div>
          ))}
          {replay && replayGame && (
            <div className="mt-3 border border-[#5c6b52]/25 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-medium text-[#2c3328]">较优狼策略棋谱 · 种子 {replayGame.seed}</p><p className="text-[11px] text-[#7a8574]">{replayGame.winner} · {replayGame.reason} · {replayGame.plies} 次行动</p></div>
                <button type="button" onClick={() => setReplaySeed(null)} className="text-xs underline">关闭</button>
              </div>
              {!replay.ok && <p className="mt-2 bg-red-50 p-2 text-xs text-red-800">{replay.error}</p>}
              <div className="mx-auto mt-3 max-w-[260px]"><BoardSvg state={replay.frames[Math.min(replayIndex, replay.frames.length - 1)]!.state} selectedWolfId={null} stepHighlights={[]} jumpHighlights={[]} jumpThroughs={[]} interactive={false} onSelectWolf={() => undefined} onClickCell={() => undefined} theme={themeForChapter(level.chapterId)} /></div>
              <p className="mt-2 min-h-8 break-all font-mono text-[11px] text-[#5c6b52]">{replay.frames[Math.min(replayIndex, replay.frames.length - 1)]!.label}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <button type="button" disabled={replayIndex === 0} onClick={() => setReplayIndex((index) => Math.max(0, index - 1))} className="border border-[#3d4a3a] px-3 py-2 disabled:opacity-30">上一步</button>
                <span>{replayIndex}/{replay.frames.length - 1}</span>
                <button type="button" disabled={replayIndex >= replay.frames.length - 1} onClick={() => setReplayIndex((index) => Math.min(replay.frames.length - 1, index + 1))} className="border border-[#3d4a3a] px-3 py-2 disabled:opacity-30">下一步</button>
              </div>
              <button
                type="button"
                disabled={replay.frames[Math.min(replayIndex, replay.frames.length - 1)]!.state.status !== 'playing'}
                onClick={() => {
                  saveCandidateHandoff(replay.frames[Math.min(replayIndex, replay.frames.length - 1)]!.state)
                  window.location.assign(`/admin/ai?level=${encodeURIComponent(level.id)}&diff=${level.ai}&seed=${replayGame.seed}&import=candidate-replay`)
                }}
                className="mt-2 w-full bg-[#3d4a3a] px-3 py-2 text-sm text-[#f4f1ea] disabled:opacity-40"
              >
                从此步人工接管
              </button>
            </div>
          )}
        </section>
      )}
      {!report && baseline && (
        <section className="mt-4 border-t border-[#5c6b52]/15 pt-4">
          <div className="flex items-center justify-between"><h3 className="text-xs font-medium text-[#7a8574]">自动代理检查摘要</h3><VerdictBadge verdict={baseline.verdict} /></div>
          <p className="mt-2 text-xs text-[#5c6b52]">生成于 {CANDIDATE_BASELINE_DATE} · {baseline.findingCodes.length ? baseline.findingCodes.join('、') : '未发现自动风险'}。</p>
          <p className="mt-1 text-xs text-amber-900">这里只保存当前判定摘要。导入对应完整报告后，才可核对样本数、固定种子、策略、指标和棋谱；摘要不能当作玩家胜率。</p>
        </section>
      )}

      <details className="mt-4 border-t border-[#5c6b52]/15 pt-3">
        <summary className="cursor-pointer text-xs font-medium text-[#3d4a3a]">产品说明与策略</summary>
        <DetailText label="名称含义" text={level.nameMeaningZh} />
        <DetailText label="设计理念" text={level.designConceptZh} />
        <DetailText label="玩家体验目标" text={level.playerGoalZh} />
        <DetailText label="狼方策略" text={level.wolfStrategyZh} />
        <DetailText label="主策略" text={`${primaryStrategy.nameZh}：${primaryStrategy.summaryZh}`} />
        <DetailText label="辅助策略" text={`${secondaryStrategy.nameZh}：${secondaryStrategy.summaryZh}`} />
        <DetailText label="盘面信号" text={primaryStrategy.signalZh} />
        <DetailText label="常见错误" text={primaryStrategy.mistakeZh} />
        <DetailText label="羊方防守" text={level.sheepDefenseZh} />
        <DetailText label="前台教学说明" text={level.teachingPoint ?? ''} />
      </details>
    </aside>
  )
}

function VerdictBadge({ verdict }: { verdict: CandidateVerdict }) {
  const style = verdict === 'pass' ? 'bg-green-100 text-green-800' : verdict === 'review' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'
  return <span className={`${style} px-1.5 py-0.5 text-[11px]`}>{verdict}</span>
}

function DetailText({ label, text }: { label: string; text: string }) {
  return <div className="mt-4"><h3 className="text-xs font-medium text-[#7a8574]">{label}</h3><p className="mt-1 leading-relaxed text-[#2c3328]">{text}</p></div>
}
