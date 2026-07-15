'use client'

import { useEffect } from 'react'
import type { ChapterId } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { fmt } from '@/i18n/messages'
import { useClientMessages } from '@/i18n/use-client-locale'

type LevelRow = {
  id: string
  name: string
  rocks: number
}

export function LevelList({
  chapterId,
  chapterLabel,
  chapterBlurb,
  levels,
}: {
  chapterId: ChapterId
  chapterLabel: string
  chapterBlurb?: string
  levels: LevelRow[]
}) {
  const save = useSaveStore((s) => s.save)
  const hydrate = useSaveStore((s) => s.hydrate)
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const unlocked = save.unlockedChapters.includes(chapterId)

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <LocaleLink href="/chapters" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
            {t.nav.chapters}
          </LocaleLink>
          <h1 className="font-serif text-2xl text-[#2c3328]">{chapterLabel}</h1>
          <span className="w-10" />
        </header>

        {chapterBlurb ? <p className="text-sm leading-relaxed text-[#5c6b52]">{chapterBlurb}</p> : null}

        <LocaleLink href="/how-to-play" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
          {t.nav.howToPlay}
        </LocaleLink>

        {!unlocked ? (
          <p className="text-[#5c6b52]">{t.chapters.locked}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {levels.map((level) => {
              const cleared = save.clearedLevels.includes(level.id)
              return (
                <li
                  key={level.id}
                  className="flex items-center gap-2 rounded-xl border-l-4 border-l-[var(--accent)] bg-[var(--panel)] px-3 py-2.5 shadow-sm ring-1 ring-[#5c6b52]/10"
                >
                  <LocaleLink
                    href={`/play/${level.id}`}
                    locale={locale}
                    className="min-w-0 flex-1 font-medium text-[var(--ink)] hover:underline"
                  >
                    {level.name}
                    <span className="ml-2 text-xs font-normal text-[#7a8574]">
                      {fmt(t.hunt.rocksLabel, { n: level.rocks })}
                      {cleared ? ' · ✓' : ''}
                    </span>
                  </LocaleLink>
                  <LocaleLink
                    href={`/hunt/${level.id}`}
                    locale={locale}
                    className="shrink-0 text-xs text-[var(--muted)] underline-offset-2 hover:underline"
                  >
                    {t.hunt.guideLink}
                  </LocaleLink>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
