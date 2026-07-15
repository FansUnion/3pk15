import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLevel, levelDisplayName } from '@wolf-sheep/game-core'
import { PlayScreen } from '@/components/PlayScreen'
import { getT } from '@/i18n/get-locale'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ levelId: string }>
}) {
  const { levelId } = await params
  const level = getLevel(levelId)
  if (!level) notFound()
  const { locale } = await getT()
  // Ensure client gets localized title via LevelConfig fields.
  void levelDisplayName(level, locale)
  return <PlayScreen level={level} />
}
