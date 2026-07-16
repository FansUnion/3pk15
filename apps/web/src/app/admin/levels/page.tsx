'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CHAPTER_BLURB_EN,
  CHAPTER_BLURB_ZH,
  CHAPTER_LABEL,
  CHAPTER_ORDER,
  createInitialState,
  LEVELS,
  validateAllLevels,
  validateLevel,
  type ChapterId,
  type LevelConfig,
} from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'
import { themeForChapter } from '@/components/admin/adminBoardTheme'

const AI_COLOR: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-800',
  normal: 'bg-amber-100 text-amber-900',
  hard: 'bg-rose-100 text-rose-900',
}

export default function AdminLevelsPage() {
  const [selectedId, setSelectedId] = useState(LEVELS[0]?.id ?? '')
  const level = LEVELS.find((l) => l.id === selectedId)
  const errors = level ? validateLevel(level) : []
  const allErrors = useMemo(() => validateAllLevels(), [])
  const blurbIssues = useMemo(() => collectBlurbIssues(), [])
  const blurbIssueIds = useMemo(() => new Set(blurbIssues.map((i) => i.id)), [blurbIssues])

  return (
    <main className="mx-auto max-w-6xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">关卡台</h1>
      <p className="mt-1 text-sm text-[#5c6b52]">
        关卡质量与 SEO 文案验收：开局可读、校验合法、双语 blurb 成品感。
      </p>

      <section className="mt-4 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
        <p className="font-medium text-[#2c3328]">全关健康总览</p>
        <p className="mt-1 text-[#5c6b52]">
          配置校验：{' '}
          {allErrors.length === 0 ? (
            <span className="text-green-700">全部 {LEVELS.length} 关通过</span>
          ) : (
            <span className="text-red-700">{allErrors.length} 条问题</span>
          )}
          {' · '}
          文案质检：{' '}
          {blurbIssues.length === 0 ? (
            <span className="text-green-700">无明显异常</span>
          ) : (
            <span className="text-amber-800">{blurbIssues.length} 条提示</span>
          )}
        </p>
        {allErrors.length > 0 && (
          <ul className="mt-2 max-h-28 overflow-auto text-xs text-red-700">
            {allErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {blurbIssues.length > 0 && (
          <ul className="mt-2 max-h-28 overflow-auto text-xs text-amber-900">
            {blurbIssues.map((e) => (
              <li key={e.id + e.msg}>
                <button
                  type="button"
                  className="underline"
                  onClick={() => setSelectedId(e.id)}
                >
                  {e.id}
                </button>
                : {e.msg}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-4">
          {CHAPTER_ORDER.map((ch) => (
            <ChapterBlock
              key={ch}
              chapterId={ch}
              selectedId={selectedId}
              onSelect={setSelectedId}
              blurbIssueIds={blurbIssueIds}
            />
          ))}
        </div>
        {level && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-medium text-[#2c3328]">{level.nameZh}</h2>
                <p className="mt-1 font-mono text-xs text-[#7a8574]">{level.id}</p>
              </div>
              <Link
                href={`/admin/ai?level=${encodeURIComponent(level.id)}&diff=${level.ai}`}
                className="rounded-lg bg-[#3d4a3a] px-3 py-2 text-sm text-[#f4f1ea] hover:opacity-90"
              >
                在 AI 台打开此关
              </Link>
            </div>
            {errors.length > 0 ? (
              <ul className="text-sm text-red-700">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700">配置校验通过</p>
            )}
            <LevelOpeningPreview level={level} />
            <MetaPanel level={level} />
            <ChapterSeoPanel chapterId={level.chapterId} />
            <BlurbPanel level={level} />
            <RocksPanel level={level} />
            <RewardPanel level={level} />
          </div>
        )}
      </div>
    </main>
  )
}

function collectBlurbIssues(): { id: string; msg: string }[] {
  const out: { id: string; msg: string }[] = []
  for (const l of LEVELS) {
    if (!l.blurbEn.trim()) out.push({ id: l.id, msg: 'blurbEn 为空' })
    else if (l.blurbEn.trim().length < 40) out.push({ id: l.id, msg: 'blurbEn 过短（<40）' })
    if (!l.blurbZh.trim()) out.push({ id: l.id, msg: 'blurbZh 为空' })
    else if (l.blurbZh.trim().length < 20) out.push({ id: l.id, msg: 'blurbZh 过短（<20）' })
    if (l.blurbEn.trim() && l.blurbZh.trim()) {
      const ratio = l.blurbEn.length / Math.max(1, l.blurbZh.length)
      if (ratio > 4 || ratio < 0.4) {
        out.push({ id: l.id, msg: `双语长度比异常 (${ratio.toFixed(1)})` })
      }
    }
  }
  return out
}

function ChapterBlock({
  chapterId,
  selectedId,
  onSelect,
  blurbIssueIds,
}: {
  chapterId: ChapterId
  selectedId: string
  onSelect: (id: string) => void
  blurbIssueIds: Set<string>
}) {
  const levels = useMemo(
    () => LEVELS.filter((l) => l.chapterId === chapterId),
    [chapterId],
  )
  return (
    <section>
      <h2 className="text-sm font-medium text-[#5c6b52]">{CHAPTER_LABEL[chapterId]}</h2>
      <ul className="mt-2 flex flex-col gap-1">
        {levels.map((l) => {
          const bad = validateLevel(l).length > 0
          const blurbBad = blurbIssueIds.has(l.id)
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onSelect(l.id)}
                className={`w-full rounded border px-3 py-2 text-left text-sm ${
                  selectedId === l.id
                    ? 'border-[#3d4a3a] bg-[#dfe8d8]'
                    : 'border-[#5c6b52]/20 bg-[#f7f5ef]'
                }`}
              >
                <span className="font-medium">{l.nameZh}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded px-1.5 py-0.5 ${AI_COLOR[l.ai] ?? ''}`}>{l.ai}</span>
                  <span className="text-[#5c6b52]">岩 {l.rocks.length}</span>
                  <span className={bad ? 'text-red-700' : 'text-green-700'}>
                    {bad ? '违规' : 'OK'}
                  </span>
                  {blurbBad && <span className="text-amber-800">文案</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function LevelOpeningPreview({ level }: { level: LevelConfig }) {
  const state = useMemo(
    () => createInitialState(level.id, level.rocks),
    [level.id, level.rocks],
  )
  const theme = useMemo(() => themeForChapter(level.chapterId), [level.chapterId])
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
      <p className="mb-2 text-sm font-medium text-[#2c3328]">
        开局盘（3 狼 / 15 羊 + 岩石 · 章节季节皮）
      </p>
      <BoardSvg
        state={state}
        selectedWolfId={null}
        stepHighlights={[]}
        jumpHighlights={[]}
        jumpThroughs={[]}
        interactive={false}
        onSelectWolf={() => undefined}
        onClickCell={() => undefined}
        theme={theme}
      />
    </div>
  )
}

function MetaPanel({ level }: { level: LevelConfig }) {
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <p className="font-medium text-[#2c3328]">元数据</p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[#7a8574]">chapter</dt>
          <dd>
            {CHAPTER_LABEL[level.chapterId]} ({level.chapterId})
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#7a8574]">ai</dt>
          <dd>
            <span className={`rounded px-1.5 py-0.5 text-xs ${AI_COLOR[level.ai]}`}>{level.ai}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#7a8574]">nameZh</dt>
          <dd>{level.nameZh}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#7a8574]">nameEn</dt>
          <dd>{level.nameEn}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#7a8574]">indexInChapter</dt>
          <dd>{level.indexInChapter}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#7a8574]">rocks</dt>
          <dd>{level.rocks.length}</dd>
        </div>
      </dl>
    </div>
  )
}

function ChapterSeoPanel({ chapterId }: { chapterId: ChapterId }) {
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <p className="font-medium text-[#2c3328]">章节 SEO（CHAPTER_BLURB）</p>
      <p className="mt-2 text-xs text-[#7a8574]">EN</p>
      <p className="text-[#2c3328]">{CHAPTER_BLURB_EN[chapterId]}</p>
      <p className="mt-2 text-xs text-[#7a8574]">ZH</p>
      <p className="text-[#2c3328]">{CHAPTER_BLURB_ZH[chapterId]}</p>
    </div>
  )
}

function BlurbPanel({ level }: { level: LevelConfig }) {
  const issues = collectBlurbIssues().filter((i) => i.id === level.id)
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-[#2c3328]">SEO 文案（/hunt）</p>
        <div className="flex gap-3 text-xs">
          <a
            href={`/hunt/${level.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#3d4a3a] underline"
          >
            /hunt/{level.id}
          </a>
          <a
            href={`/zh/hunt/${level.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#3d4a3a] underline"
          >
            /zh/hunt/{level.id}
          </a>
        </div>
      </div>
      {issues.length > 0 && (
        <ul className="mt-2 text-xs text-amber-800">
          {issues.map((i) => (
            <li key={i.msg}>{i.msg}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 space-y-3">
        <div>
          <p className="text-xs text-[#7a8574]">blurbEn · {level.blurbEn.length} chars</p>
          <p className="mt-1 leading-relaxed text-[#2c3328]">{level.blurbEn || '（空）'}</p>
        </div>
        <div>
          <p className="text-xs text-[#7a8574]">blurbZh · {level.blurbZh.length} 字</p>
          <p className="mt-1 leading-relaxed text-[#2c3328]">{level.blurbZh || '（空）'}</p>
        </div>
      </div>
    </div>
  )
}

function RocksPanel({ level }: { level: LevelConfig }) {
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <p className="font-medium text-[#2c3328]">岩石坐标</p>
      {level.rocks.length === 0 ? (
        <p className="mt-2 text-[#5c6b52]">无岩石</p>
      ) : (
        <ol className="mt-2 list-decimal space-y-0.5 pl-5 font-mono text-xs text-[#2c3328]">
          {level.rocks.map((r) => (
            <li key={`${r.r}-${r.c}`}>
              r{r.r} c{r.c}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function RewardPanel({ level }: { level: LevelConfig }) {
  const first = level.firstClearReward
  const drop = level.repeatDrop
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-[#2c3328]">奖励 / 掉落</p>
        <Link href="/admin/economy" className="text-xs text-[#3d4a3a] underline">
          经济台总览
        </Link>
      </div>
      <ul className="mt-2 space-y-1 text-[#5c6b52]">
        <li>
          首通：通用 {first.universal ?? 0}
          {first.season
            ? ` · 季节 ${Object.entries(first.season)
                .map(([k, v]) => `${k}:${v}`)
                .join(', ')}`
            : ''}
        </li>
        <li>
          重复掉落：
          {drop
            ? `概率 ${(drop.chance * 100).toFixed(0)}% · 通用 ${drop.universal ?? 0}${
                drop.season
                  ? ` · 季节 ${Object.entries(drop.season)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(', ')}`
                  : ''
              }`
            : '无（见 LevelConfig.repeatDrop）'}
        </li>
      </ul>
    </div>
  )
}
