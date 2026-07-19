'use client'

import { useEffect } from 'react'
import { CHAPTER_LABEL, CHAPTER_LABEL_EN, CHAPTER_ORDER, getLevel, isLevelUnlocked, type ChapterId } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { formatRockCount } from '@/i18n/messages'
import { useClientMessages } from '@/i18n/use-client-locale'

type LevelRow = { id: string; name: string; rocks: number; indexInChapter: number }

export function LevelList({ chapterId, chapterLabel, chapterBlurb, levels }: {
  chapterId: ChapterId
  chapterLabel: string
  chapterBlurb?: string
  levels: LevelRow[]
}) {
  const save = useSaveStore((state) => state.save)
  const hydrate = useSaveStore((state) => state.hydrate)
  const { locale, t } = useClientMessages()

  useEffect(() => { hydrate() }, [hydrate])
  const chapterUnlocked = save.unlockedChapters.includes(chapterId)

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <LocaleLink href="/chapters" locale={locale} className="quiet-action text-sm">{t.nav.chapters}</LocaleLink>
          <h1 className="display-title text-3xl">{chapterLabel}</h1>
          <span className="w-10" />
        </header>

        {chapterBlurb ? <p className="game-panel p-4 text-sm leading-relaxed text-[var(--muted)]">{chapterBlurb}</p> : null}
        <LocaleLink href="/how-to-play" locale={locale} className="text-sm text-[#5c6b52] hover:underline">{t.nav.howToPlay}</LocaleLink>

        {!chapterUnlocked ? <p className="text-[#5c6b52]">{t.chapters.locked}</p> : (
          <ul className="flex flex-col gap-2">
            {levels.map((level) => {
              const cleared = save.clearedLevels.includes(level.id)
              const config = getLevel(level.id)
              const open = Boolean(config && isLevelUnlocked(save, config))
              return (
                <li key={level.id} className={`flex items-center gap-2 rounded-xl border-l-4 px-3 py-2.5 shadow-sm ring-1 ring-[#5c6b52]/10 ${open ? 'border-l-[var(--accent)] bg-[var(--panel)]' : 'border-l-[#a7b1a0] bg-[#eef1eb]'}`}>
                  {open ? (
                    <>
                      <LocaleLink href={`/play/${level.id}`} locale={locale} className="min-w-0 flex-1 font-medium text-[var(--ink)] hover:underline">
                        {level.name}<span className="ml-2 text-xs font-normal text-[#7a8574]">{formatRockCount(level.rocks, locale, t)}{cleared ? ' · ✓' : ''}</span>
                      </LocaleLink>
                      <LocaleLink href={`/hunt/${level.id}`} locale={locale} className="shrink-0 text-xs text-[var(--muted)] underline-offset-2 hover:underline">{t.hunt.guideLink}</LocaleLink>
                    </>
                  ) : (
                    <div className="min-w-0 flex-1" aria-label={t.chapters.locked}>
                      <span className="font-medium text-[#6f786b]">{level.name}</span>
                      <span className="ml-2 text-xs text-[#7a8574]">{formatRockCount(level.rocks, locale, t)} · 🔒</span>
                      <p className="mt-1 text-xs text-[var(--muted)]">{t.chapters.locked}</p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <nav aria-label={locale === 'zh' ? '切换季节' : 'Switch season'} className="mt-2 border-t border-[var(--line)] pt-5">
          <p className="mb-3 text-sm font-medium text-[var(--ink)]">{locale === 'zh' ? '四季猎场' : 'Seasons'}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CHAPTER_ORDER.map((id) => {
              const current = id === chapterId
              const unlocked = save.unlockedChapters.includes(id)
              const label = locale === 'zh' ? CHAPTER_LABEL[id] : CHAPTER_LABEL_EN[id]
              const className = `min-h-11 rounded-lg border px-3 py-2 text-center text-sm ${current ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : unlocked ? 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--accent)]' : 'border-[var(--line)] bg-[#eef1eb] text-[#7a8574]'}`
              if (current) return <span key={id} aria-current="page" className={className}>{label}</span>
              if (unlocked) return <LocaleLink key={id} href={`/levels/${id}`} locale={locale} className={className}>{label}</LocaleLink>
              return <span key={id} aria-disabled="true" className={className}>{label} · {t.chapters.locked}</span>
            })}
          </div>
        </nav>
      </div>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
