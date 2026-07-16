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
  indexInChapter: number
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
      <div className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <LocaleLink href="/chapters" locale={locale} className="quiet-action text-sm">
            {t.nav.chapters}
          </LocaleLink>
          <h1 className="display-title text-3xl">{chapterLabel}</h1>
          <span className="w-10" />
        </header>

        {chapterBlurb ? <p className="game-panel p-4 text-sm leading-relaxed text-[var(--muted)]">{chapterBlurb}</p> : null}

        <LocaleLink href="/how-to-play" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
          {t.nav.howToPlay}
        </LocaleLink>

        {!unlocked ? (
          <p className="text-[#5c6b52]">{t.chapters.locked}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {levels.map((level, index) => {
              const cleared = save.clearedLevels.includes(level.id)
              const open = index === 0 || save.clearedLevels.includes(levels[index - 1]!.id)
              return (
                <li
                  key={level.id}
                  className={`flex items-center gap-2 rounded-xl border-l-4 px-3 py-2.5 shadow-sm ring-1 ring-[#5c6b52]/10 ${open ? 'border-l-[var(--accent)] bg-[var(--panel)]' : 'border-l-[#a7b1a0] bg-[#eef1eb]'}`}
                >
                  <LocaleLink
                    href={open ? `/play/${level.id}` : '/chapters'}
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
                    href={open ? `/hunt/${level.id}` : '/chapters'}
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
