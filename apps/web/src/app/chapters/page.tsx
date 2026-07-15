'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  CHAPTER_LABEL,
  CHAPTER_ORDER,
  type ChapterId,
} from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'

const CHAPTER_THEME: Record<
  ChapterId,
  { unlocked: string; locked: string; accent: string; blurb: string }
> = {
  spring: {
    unlocked: 'bg-gradient-to-br from-[#6a9a5a] to-[#3d4a3a]',
    locked: 'bg-[#e4ebe0]/70',
    accent: 'text-[#dfe8d8]',
    blurb: '新手猎场 · 轻松入门',
  },
  summer: {
    unlocked: 'bg-gradient-to-br from-[#c4a035] to-[#6b5a28]',
    locked: 'bg-[#ebe6d8]/70',
    accent: 'text-[#f7f1dc]',
    blurb: '高压防线 · 五五开',
  },
  autumn: {
    unlocked: 'bg-gradient-to-br from-[#c47848] to-[#6b3f28]',
    locked: 'bg-[#ebe0d8]/70',
    accent: 'text-[#f5e6dc]',
    blurb: '岩石破阵 · 连吃爽关',
  },
  winter: {
    unlocked: 'bg-gradient-to-br from-[#5a7a8a] to-[#2c3a42]',
    locked: 'bg-[#dfe4e8]/70',
    accent: 'text-[#e8eef2]',
    blurb: '空盘终极 · 大师合围',
  },
}

export default function ChaptersPage() {
  const save = useSaveStore((s) => s.save)
  const hydrate = useSaveStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[#5c6b52] hover:underline">
          首页
        </Link>
        <h1 className="font-serif text-2xl text-[#2c3328]">四季章节</h1>
        <span className="text-xs text-[#7a8574]">碎片 {save.fragments.universal}</span>
      </header>

      <ul className="flex flex-col gap-3">
        {CHAPTER_ORDER.map((id) => (
          <ChapterCard key={id} id={id} unlocked={save.unlockedChapters.includes(id)} />
        ))}
      </ul>
    </main>
  )
}

function ChapterCard({ id, unlocked }: { id: ChapterId; unlocked: boolean }) {
  const label = CHAPTER_LABEL[id]
  const theme = CHAPTER_THEME[id]
  if (!unlocked) {
    return (
      <li className={`rounded-xl border border-[#5c6b52]/15 ${theme.locked} px-4 py-4 text-[#7a8574]`}>
        <p className="font-serif text-lg text-[#5c6b52]">{label}</p>
        <p className="mt-1 text-sm">通关上一章全部关卡后解锁</p>
      </li>
    )
  }
  return (
    <li>
      <Link
        href={`/levels/${id}`}
        className={`block rounded-xl ${theme.unlocked} px-4 py-4 ${theme.accent} shadow-sm transition hover:brightness-110`}
      >
        <p className="font-serif text-lg">{label}</p>
        <p className="mt-1 text-sm opacity-90">{theme.blurb}</p>
      </Link>
    </li>
  )
}
