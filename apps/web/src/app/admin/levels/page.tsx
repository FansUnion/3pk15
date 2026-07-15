'use client'

import { useMemo, useState } from 'react'
import {
  BOARD_MAX,
  CHAPTER_LABEL,
  CHAPTER_ORDER,
  LEVELS,
  validateLevel,
  type ChapterId,
  type LevelConfig,
} from '@wolf-sheep/game-core'

export default function AdminLevelsPage() {
  const [selectedId, setSelectedId] = useState(LEVELS[0]?.id ?? '')
  const level = LEVELS.find((l) => l.id === selectedId)
  const errors = level ? validateLevel(level) : []

  return (
    <main className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">关卡台</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {CHAPTER_ORDER.map((ch) => (
            <ChapterBlock
              key={ch}
              chapterId={ch}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
        {level && (
          <div>
            <h2 className="font-medium text-[#2c3328]">{level.name}</h2>
            <p className="mt-1 text-sm text-[#5c6b52]">
              AI {level.ai} · 岩石 {level.rocks.length}
            </p>
            {errors.length > 0 ? (
              <ul className="mt-2 text-sm text-red-700">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-green-700">配置校验通过</p>
            )}
            <LevelPreview level={level} />
          </div>
        )}
      </div>
    </main>
  )
}

function ChapterBlock({
  chapterId,
  selectedId,
  onSelect,
}: {
  chapterId: ChapterId
  selectedId: string
  onSelect: (id: string) => void
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
                {l.name}
                <span className={`ml-2 text-xs ${bad ? 'text-red-700' : 'text-green-700'}`}>
                  {bad ? '违规' : 'OK'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function LevelPreview({ level }: { level: LevelConfig }) {
  const rockSet = new Set(level.rocks.map((p) => `${p.r},${p.c}`))
  const cell = 28
  const pad = 16
  const size = pad * 2 + cell * (BOARD_MAX - 1)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mt-4 w-full max-w-sm rounded bg-[#e8f0e4]">
      {Array.from({ length: BOARD_MAX }, (_, i) => {
        const v = pad + i * cell
        return (
          <g key={i}>
            <line x1={pad} y1={v} x2={pad + cell * 5} y2={v} stroke="#5c6b52" strokeWidth={1} />
            <line x1={v} y1={pad} x2={v} y2={pad + cell * 5} stroke="#5c6b52" strokeWidth={1} />
          </g>
        )
      })}
      {Array.from({ length: BOARD_MAX }, (_, ri) =>
        Array.from({ length: BOARD_MAX }, (_, ci) => {
          const r = ri + 1
          const c = ci + 1
          const x = pad + (c - 1) * cell
          const y = pad + (r - 1) * cell
          if (!rockSet.has(`${r},${c}`)) return null
          return (
            <rect
              key={`${r}-${c}`}
              x={x - 8}
              y={y - 8}
              width={16}
              height={16}
              rx={2}
              fill="#3f3a34"
            />
          )
        }),
      )}
    </svg>
  )
}
