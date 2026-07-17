'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  CHAPTER_LABEL,
  CHAPTER_ORDER,
  createLevelInitialState,
  LEVELS,
  validateAllLevels,
  type ChapterId,
  type Difficulty,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { themeForChapter } from '@/components/admin/adminBoardTheme'
import { levelVersion, loadLevelReviews, type LevelReview } from '@/lib/admin-level-reviews'

type ChapterFilter = 'all' | ChapterId
type AiFilter = 'all' | Difficulty

const AI_LABEL: Record<Difficulty, string> = { easy: '简单', normal: '普通', hard: '困难' }

export function AdminLevelWorkbench() {
  const [chapter, setChapter] = useState<ChapterFilter>('all')
  const [ai, setAi] = useState<AiFilter>('all')
  const [difficulty, setDifficulty] = useState('all')
  const [riskOnly, setRiskOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(LEVELS[0]?.id ?? '')
  const [reviews, setReviews] = useState<Record<string, LevelReview>>({})
  useEffect(() => setReviews(loadLevelReviews()), [])
  const allErrors = useMemo(() => validateAllLevels(), [])
  const filtered = useMemo(() => LEVELS.filter((level) => (
    (chapter === 'all' || level.chapterId === chapter)
    && (ai === 'all' || level.ai === ai)
    && (difficulty === 'all' || String(level.difficulty) === difficulty)
    && (!riskOnly || level.riskTags.length > 0)
  )), [ai, chapter, difficulty, riskOnly])
  const selected = LEVELS.find((level) => level.id === selectedId) ?? filtered[0]
  const passedCount = Object.values(reviews).filter((review) => review.status === 'passed').length
  const needsChangesCount = Object.values(reviews).filter((review) => review.status === 'needs_changes').length

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
          <span className="border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">待修订 {needsChangesCount}</span>
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
        <label className="flex h-10 items-center gap-2 border border-[#5c6b52]/25 bg-[#f7f5ef] px-3">
          <input type="checkbox" checked={riskOnly} onChange={(event) => setRiskOnly(event.target.checked)} />
          只看风险关
        </label>
        <button type="button" onClick={() => { setChapter('all'); setAi('all'); setDifficulty('all'); setRiskOnly(false) }} className="h-10 px-3 text-[#3d4a3a] underline">
          重置筛选
        </button>
        <span className="ml-auto text-[#5c6b52]">显示 {filtered.length}/24</span>
      </section>

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((level) => (
            <LevelCard key={level.id} level={level} review={reviews[level.id]} selected={selected?.id === level.id} onSelect={() => setSelectedId(level.id)} />
          ))}
          {filtered.length === 0 && <p className="py-10 text-sm text-[#5c6b52]">没有符合筛选条件的关卡。</p>}
        </section>
        {selected && <LevelDetail level={selected} />}
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

function LevelCard({ level, review, selected, onSelect }: { level: LevelConfig; review?: LevelReview; selected: boolean; onSelect: () => void }) {
  const state = useMemo(() => createLevelInitialState(level), [level])
  const theme = useMemo(() => themeForChapter(level.chapterId), [level.chapterId])
  const stale = Boolean(review && review.levelVersion !== levelVersion(level))
  return (
    <article className={`border bg-[#f7f5ef] ${selected ? 'border-[#3d4a3a] ring-1 ring-[#3d4a3a]' : 'border-[#5c6b52]/20'}`}>
      <button type="button" onClick={onSelect} className="block w-full p-3 text-left">
        <div className="flex items-start justify-between gap-2">
          <div><p className="font-medium text-[#2c3328]">{level.nameZh}</p><p className="font-mono text-[11px] text-[#7a8574]">{level.id}</p></div>
          <span className="bg-[#dfe8d8] px-2 py-1 text-[11px] text-[#3d4a3a]">{level.difficulty}/5</span>
        </div>
        <div className="mx-auto mt-2 max-w-[180px] pointer-events-none"><BoardSvg state={state} selectedWolfId={null} stepHighlights={[]} jumpHighlights={[]} jumpThroughs={[]} interactive={false} onSelectWolf={() => undefined} onClickCell={() => undefined} theme={theme} /></div>
        <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
          <span className="border border-[#5c6b52]/20 px-1.5 py-0.5">AI {AI_LABEL[level.ai]}</span>
          <span className="border border-[#5c6b52]/20 px-1.5 py-0.5">岩石 {level.rocks.length}</span>
          {level.riskTags.slice(0, 2).map((tag) => <span key={tag} className="bg-amber-100 px-1.5 py-0.5 text-amber-900">{tag}</span>)}
          {review?.status === 'passed' && !stale && <span className="bg-green-100 px-1.5 py-0.5 text-green-800">试玩通过</span>}
          {review?.status === 'needs_changes' && !stale && <span className="bg-red-100 px-1.5 py-0.5 text-red-800">待修订</span>}
          {stale && <span className="bg-amber-100 px-1.5 py-0.5 text-amber-900">需复核</span>}
        </div>
      </button>
    </article>
  )
}

function LevelDetail({ level }: { level: LevelConfig }) {
  return (
    <aside className="sticky top-4 border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <p className="text-xs text-[#7a8574]">{CHAPTER_LABEL[level.chapterId]}第 {level.indexInChapter} 关 · {level.id}</p>
      <h2 className="mt-1 font-serif text-2xl text-[#2c3328]">{level.nameZh}</h2>
      <p className="mt-3 leading-relaxed text-[#5c6b52]">{level.blurbZh}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 border-y border-[#5c6b52]/15 py-3 text-xs">
        <div><dt className="text-[#7a8574]">羊 AI</dt><dd>{AI_LABEL[level.ai]} ({level.ai})</dd></div>
        <div><dt className="text-[#7a8574]">操作难度</dt><dd>{level.difficulty}/5</dd></div>
        <div><dt className="text-[#7a8574]">胜利目标</dt><dd>吃 {level.targetEaten} 羊</dd></div>
        <div><dt className="text-[#7a8574]">回合上限</dt><dd>{level.maxPlies} plies</dd></div>
      </dl>
      <DetailText label="名称含义" text={level.nameMeaningZh} />
      <DetailText label="设计理念" text={level.designConceptZh} />
      <DetailText label="玩家体验目标" text={level.playerGoalZh} />
      <DetailText label="狼方策略" text={level.wolfStrategyZh} />
      <DetailText label="羊方防守" text={level.sheepDefenseZh} />
      <DetailText label="前台教学说明" text={level.teachingPoint ?? ''} />
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/admin/ai?level=${encodeURIComponent(level.id)}&diff=${level.ai}`} className="bg-[#3d4a3a] px-3 py-2 text-[#f4f1ea]">AI 诊断</Link>
        <Link href={`/hunt/${level.id}`} target="_blank" className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]">前台说明</Link>
        <Link href={`/admin/play/${level.id}`} className="border border-[#3d4a3a] px-3 py-2 text-[#3d4a3a]">Admin 试玩</Link>
      </div>
      <p className="mt-2 text-xs text-green-800">Admin 试玩复用正式规则与羊 AI，但不写玩家奖励、解锁或任务进度。</p>
    </aside>
  )
}

function DetailText({ label, text }: { label: string; text: string }) {
  return <div className="mt-4"><h3 className="text-xs font-medium text-[#7a8574]">{label}</h3><p className="mt-1 leading-relaxed text-[#2c3328]">{text}</p></div>
}
