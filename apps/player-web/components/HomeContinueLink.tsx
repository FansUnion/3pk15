'use client'

import { useEffect, useState } from 'react'
import { adjacentLevels, getLevel, isLevelCleared, levelDisplayName } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import type { SupportedLocale } from '@/config/locales'

export function HomeContinueLink({
  locale,
  labelTemplate,
  fallbackLabel,
}: {
  locale: SupportedLocale
  labelTemplate: string
  fallbackLabel: string
}) {
  const hydrate = useSaveStore((s) => s.hydrate)
  const save = useSaveStore((s) => s.save)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate()
    setReady(true)
  }, [hydrate])

  const lastLevelId = save.lastPlayedLevelId ?? 'spring-01'
  const lastLevel = getLevel(lastLevelId)
  const levelId = lastLevel && isLevelCleared(save, lastLevel.id)
    ? adjacentLevels(lastLevel.id).next?.id ?? lastLevel.id
    : lastLevelId
  const level = getLevel(levelId) ?? getLevel('spring-01')
  const href = `/play/${level?.id ?? 'spring-01'}`
  const label = level
    ? labelTemplate.replace('{name}', levelDisplayName(level, locale))
    : fallbackLabel

  if (!ready) {
    return <span className="text-center text-sm text-[#5c6b52]/60">{fallbackLabel} · …</span>
  }

  return (
    <LocaleLink
      href={href}
      locale={locale}
      className="text-center text-sm text-[#5c6b52] underline-offset-2 hover:underline"
    >
      {label}
    </LocaleLink>
  )
}
