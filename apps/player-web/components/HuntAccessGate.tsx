'use client'

import { useEffect, type ReactNode } from 'react'
import { isLevelUnlocked, type LevelConfig } from '@wolf-sheep/game-core'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { useClientMessages } from '@/i18n/use-client-locale'
import { useSaveStore } from '@/lib/save-store'

export function HuntAccessGate({ level, children }: { level: LevelConfig; children: ReactNode }) {
  const save = useSaveStore((state) => state.save)
  const hydrated = useSaveStore((state) => state.hydrated)
  const hydrate = useSaveStore((state) => state.hydrate)
  const { locale, t } = useClientMessages()
  useEffect(() => { hydrate() }, [hydrate])
  if (!hydrated) return <main className="grid min-h-[50dvh] place-items-center text-sm text-[var(--muted)]">{t.common.loading}</main>
  if (!isLevelUnlocked(save, level)) return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="font-serif text-3xl text-[var(--ink)]">{t.chapters.locked}</h1>
      <p className="text-sm text-[var(--muted)]">{locale === 'zh' ? '先完成同一季节的上一关，再回来查看本关说明。' : 'Clear the previous hunt in this season before viewing this guide.'}</p>
      <LocaleLink href={`/levels/${level.chapterId}`} locale={locale} className="primary-action">{t.hunt.levelsLink}</LocaleLink>
    </main>
  )
  return children
}
