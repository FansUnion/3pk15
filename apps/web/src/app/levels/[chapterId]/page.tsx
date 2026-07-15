import { notFound } from 'next/navigation'
import {
  CHAPTER_LABEL,
  CHAPTER_ORDER,
  levelsForChapter,
  type ChapterId,
} from '@wolf-sheep/game-core'
import { LevelList } from '@/components/LevelList'

export default async function LevelsPage({
  params,
}: {
  params: Promise<{ chapterId: string }>
}) {
  const { chapterId: raw } = await params
  if (!CHAPTER_ORDER.includes(raw as ChapterId)) notFound()
  const chapterId = raw as ChapterId
  const levels = levelsForChapter(chapterId)

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-6 py-10">
      <LevelList
        chapterId={chapterId}
        chapterLabel={CHAPTER_LABEL[chapterId]}
        levels={levels.map((l) => ({
          id: l.id,
          name: l.name,
          rocks: l.rocks.length,
          ai: l.ai,
        }))}
      />
    </main>
  )
}
