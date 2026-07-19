'use client'

import { useEffect } from 'react'
import { isLevelUnlocked, type LevelConfig } from '@wolf-sheep/game-core'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { PlayScreen } from '@/components/PlayScreen'
import { useClientMessages } from '@/i18n/use-client-locale'
import { useSaveStore } from '@/lib/save-store'

export function LevelAccessGate({ level }: { level: LevelConfig }) {
  const save = useSaveStore((state) => state.save)
  const hydrated = useSaveStore((state) => state.hydrated)
  const hydrate = useSaveStore((state) => state.hydrate)
  const { locale, t } = useClientMessages()

  useEffect(() => { hydrate() }, [hydrate])

  if (!hydrated) {
    return <main className="grid min-h-dvh place-items-center text-sm text-[var(--muted)]">{t.common.loading}</main>
  }

  if (!isLevelUnlocked(save, level)) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="eyebrow">Fangrush</p>
        <h1 className="font-serif text-3xl text-[var(--ink)]">{t.chapters.locked}</h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {locale === 'zh' ? '先完成同一季节的上一关，再回来挑战这一关。' : 'Clear the previous hunt in this season before starting this one.'}
        </p>
        <LocaleLink href={`/levels/${level.chapterId}`} locale={locale} className="primary-action justify-center">{t.hunt.levelsLink}</LocaleLink>
      </main>
    )
  }

  return <PlayScreen level={level} />
}
