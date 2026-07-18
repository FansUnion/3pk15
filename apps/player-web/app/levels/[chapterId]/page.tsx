import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  CHAPTER_BLURB_EN,
  CHAPTER_BLURB_ZH,
  CHAPTER_LABEL,
  CHAPTER_LABEL_EN,
  CHAPTER_ORDER,
  levelDisplayName,
  levelsForChapter,
  type ChapterId,
} from '@wolf-sheep/game-core'
import { LevelList } from '@/components/LevelList'
import { getT } from '@/i18n/get-locale'

export function generateStaticParams() {
  return CHAPTER_ORDER.map((chapterId) => ({ chapterId }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterId: string }>
}): Promise<Metadata> {
  const { chapterId: raw } = await params
  if (!CHAPTER_ORDER.includes(raw as ChapterId)) return {}
  const chapterId = raw as ChapterId
  const { locale } = await getT()
  const label = locale === 'zh' ? CHAPTER_LABEL[chapterId] : CHAPTER_LABEL_EN[chapterId]
  const blurb = locale === 'zh' ? CHAPTER_BLURB_ZH[chapterId] : CHAPTER_BLURB_EN[chapterId]
  return { title: `${label} · Fangrush`, description: blurb }
}

export default async function LevelsPage({
  params,
}: {
  params: Promise<{ chapterId: string }>
}) {
  const { chapterId: raw } = await params
  if (!CHAPTER_ORDER.includes(raw as ChapterId)) notFound()
  const chapterId = raw as ChapterId
  const { locale } = await getT()
  const levels = levelsForChapter(chapterId)
  const chapterLabel = locale === 'zh' ? CHAPTER_LABEL[chapterId] : CHAPTER_LABEL_EN[chapterId]
  const chapterBlurb = locale === 'zh' ? CHAPTER_BLURB_ZH[chapterId] : CHAPTER_BLURB_EN[chapterId]

  return (
    <LevelList
      chapterId={chapterId}
      chapterLabel={chapterLabel}
      chapterBlurb={chapterBlurb}
      levels={levels.map((l) => ({
        id: l.id,
        name: levelDisplayName(l, locale),
        rocks: l.rocks.length,
        indexInChapter: l.indexInChapter,
      }))}
    />
  )
}
