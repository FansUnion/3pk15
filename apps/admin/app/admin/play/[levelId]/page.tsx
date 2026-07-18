import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLevel, LEVELS } from '@wolf-sheep/game-core'
import { AdminPlayScreen } from '../../../../components/AdminPlayScreen'

export function generateStaticParams() {
  return LEVELS.map((level) => ({ levelId: level.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ levelId: string }> }): Promise<Metadata> {
  const { levelId } = await params
  const level = getLevel(levelId)
  return { title: level ? `${level.nameZh} · 试玩验收` : '关卡试玩' }
}

export default async function AdminPlayPage({ params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = await params
  const level = getLevel(levelId)
  if (!level) notFound()
  return <AdminPlayScreen level={level} />
}
