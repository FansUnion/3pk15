import { notFound } from 'next/navigation'
import { getLevel } from '@wolf-sheep/game-core'
import { PlayScreen } from '@/components/PlayScreen'

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
