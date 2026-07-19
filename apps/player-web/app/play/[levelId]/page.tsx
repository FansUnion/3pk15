import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLevel, levelDisplayName, LEVELS } from '@wolf-sheep/game-core'
import { PlayScreen } from '@/components/PlayScreen'
import { getT } from '@/i18n/get-locale'

export function generateStaticParams() {
  return LEVELS.map((level) => ({ levelId: level.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ levelId: string }>
}): Promise<Metadata> {
  const { levelId } = await params
  const level = getLevel(levelId)
  const { locale } = await getT()
  return {
    title: level ? `${levelDisplayName(level, locale)} | Fangrush` : 'Fangrush',
    robots: { index: false, follow: false },
  }
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ levelId: string }>
}) {
  const { levelId } = await params
  const level = getLevel(levelId)
  if (!level) notFound()
  return <PlayScreen level={level} />
}
