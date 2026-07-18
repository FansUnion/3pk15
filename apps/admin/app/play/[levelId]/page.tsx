import { notFound } from 'next/navigation'
import { getLevel, LEVELS } from '@wolf-sheep/game-core'
import { AdminPlayScreen } from '../../../components/AdminPlayScreen'

export function generateStaticParams() {
  return LEVELS.map((level) => ({ levelId: level.id }))
}

export default async function AdminPlayPage({ params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = await params
  const level = getLevel(levelId)
  if (!level) notFound()
  return <AdminPlayScreen level={level} />
}
