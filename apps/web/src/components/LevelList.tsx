'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { ChapterId, Difficulty } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'

type LevelRow = {
  id: string
  name: string
  rocks: number
  ai: Difficulty
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '轻松',
  normal: '标准',
  hard: '挑战',
}

export function LevelList({
  chapterId,
  chapterLabel,
  levels,
}: {
  chapterId: ChapterId
  chapterLabel: string
  levels: LevelRow[]
}) {
  const save = useSaveStore((s) => s.save)
  const hydrate = useSaveStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const unlocked = save.unlockedChapters.includes(chapterId)

  return (
    <>
      <header className="flex items-center justify-between">
        <Link href="/chapters" className="text-sm text-[#5c6b52] hover:underline">
          章节
        </Link>
        <h1 className="font-serif text-2xl text-[#2c3328]">{chapterLabel}</h1>
        <span className="w-10" />
      </header>

      {!unlocked ? (
        <p className="text-[#5c6b52]">本章尚未解锁。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {levels.map((lv) => {
            const cleared = save.clearedLevels.includes(lv.id)
            return (
              <li key={lv.id}>
                <Link
                  href={`/play/${lv.id}`}
                  className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3 text-[#2c3328] hover:border-[#5c6b52]/50"
                >
                  <span>
                    <span className="font-medium">{lv.name}</span>
                    <span className="ml-2 text-xs text-[#7a8574]">
                      岩石 {lv.rocks} · {DIFFICULTY_LABEL[lv.ai]}
                    </span>
                  </span>
                  <span className="text-xs text-[#5c6b52]">
                    {cleared ? '已通关' : '未通关'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
