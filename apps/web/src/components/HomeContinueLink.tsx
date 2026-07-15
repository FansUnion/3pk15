'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLevel } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'

export function HomeContinueLink() {
  const hydrate = useSaveStore((s) => s.hydrate)
  const save = useSaveStore((s) => s.save)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate()
    setReady(true)
  }, [hydrate])

  const levelId = save.lastPlayedLevelId ?? 'spring-01'
  const level = getLevel(levelId) ?? getLevel('spring-01')
  const href = `/play/${level?.id ?? 'spring-01'}`
  const label = level ? `继续 · ${level.name}` : '继续 · 春日第 1 关'

  if (!ready) {
    return (
      <span className="text-center text-sm text-[#5c6b52]/60">继续 · …</span>
    )
  }

  return (
    <Link href={href} className="text-center text-sm text-[#5c6b52] underline-offset-2 hover:underline">
      {label}
    </Link>
  )
}
