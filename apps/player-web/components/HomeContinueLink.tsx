'use client'

import { useEffect, useState } from 'react'
import { getLevel, levelDisplayName } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import type { SupportedLocale } from '@/config/locales'
import { resolveHomeContinuation } from '@/lib/home-continuation'

export function HomeContinueLink({
  locale,
  labelTemplate,
  nextTemplate,
  replayTemplate,
  fallbackLabel,
  startFirstLabel,
}: {
  locale: SupportedLocale
  labelTemplate: string
  nextTemplate: string
  replayTemplate: string
  fallbackLabel: string
  startFirstLabel: string
}) {
  const hydrate = useSaveStore((state) => state.hydrate)
  const save = useSaveStore((state) => state.save)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate()
    setReady(true)
  }, [hydrate])

  if (!ready) return <span className="primary-action justify-center opacity-70">{fallbackLabel}</span>

  const continuation = resolveHomeContinuation(save)
  const level = getLevel(continuation.levelId)!
  const template = continuation.mode === 'next'
    ? nextTemplate
    : continuation.mode === 'replay'
      ? replayTemplate
      : continuation.mode === 'continue'
        ? labelTemplate
        : fallbackLabel
  const label = template.replace('{name}', levelDisplayName(level, locale))

  return (
    <>
      <LocaleLink href={`/play/${level.id}`} locale={locale} className="primary-action justify-center">
        {label}
      </LocaleLink>
      {save.lastPlayedLevelId && save.lastPlayedLevelId !== 'spring-01' ? (
        <LocaleLink href="/play/spring-01" locale={locale} className="text-center text-sm text-[#5c6b52] underline-offset-2 hover:underline">
          {startFirstLabel}
        </LocaleLink>
      ) : null}
    </>
  )
}
