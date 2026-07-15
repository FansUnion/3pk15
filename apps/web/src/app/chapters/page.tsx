'use client'

import { useEffect } from 'react'
import {
  CHAPTER_BLURB_EN,
  CHAPTER_BLURB_ZH,
  CHAPTER_LABEL,
  CHAPTER_LABEL_EN,
  CHAPTER_ORDER,
  type ChapterId,
} from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'

const CHAPTER_THEME: Record<
  ChapterId,
  { unlocked: string; locked: string; accent: string }
> = {
  spring: {
    unlocked: 'bg-gradient-to-br from-[#6a9a5a] to-[#3d4a3a]',
    locked: 'bg-[#e4ebe0]/70',
    accent: 'text-[#dfe8d8]',
  },
  summer: {
    unlocked: 'bg-gradient-to-br from-[#c4a035] to-[#6b5a28]',
    locked: 'bg-[#ebe6d8]/70',
    accent: 'text-[#f7f1dc]',
  },
  autumn: {
    unlocked: 'bg-gradient-to-br from-[#c47848] to-[#6b3f28]',
    locked: 'bg-[#ebe0d8]/70',
    accent: 'text-[#f5e6dc]',
  },
  winter: {
    unlocked: 'bg-gradient-to-br from-[#5a7a8a] to-[#2c3a42]',
    locked: 'bg-[#dfe4e8]/70',
    accent: 'text-[#e8eef2]',
  },
}

export default function ChaptersPage() {
  const save = useSaveStore((s) => s.save)
  const hydrate = useSaveStore((s) => s.hydrate)
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="quiet-action text-sm">
            {t.nav.home}
          </LocaleLink>
          <h1 className="display-title text-3xl">{t.chapters.title}</h1>
          <span className="text-xs text-[#7a8574]">{save.fragments.universal}</span>
        </header>

        <LocaleLink href="/how-to-play" locale={locale} className="status-chip text-sm text-[var(--muted)]">
          {t.chapters.howLink}
        </LocaleLink>

        <ul className="flex flex-col gap-3">
          {CHAPTER_ORDER.map((id) => (
            <ChapterCard
              key={id}
              id={id}
              unlocked={save.unlockedChapters.includes(id)}
              locale={locale}
              blurb={locale === 'zh' ? CHAPTER_BLURB_ZH[id] : CHAPTER_BLURB_EN[id]}
              lockedLabel={t.chapters.locked}
            />
          ))}
        </ul>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}

function ChapterCard({
  id,
  unlocked,
  locale,
  blurb,
  lockedLabel,
}: {
  id: ChapterId
  unlocked: boolean
  locale: 'en' | 'zh'
  blurb: string
  lockedLabel: string
}) {
  const label = locale === 'zh' ? CHAPTER_LABEL[id] : CHAPTER_LABEL_EN[id]
  const theme = CHAPTER_THEME[id]
  if (!unlocked) {
    return (
      <li className={`rounded-xl border border-[#5c6b52]/15 ${theme.locked} px-4 py-4 text-[#7a8574]`}>
        <p className="font-serif text-lg text-[#5c6b52]">{label}</p>
        <p className="mt-1 text-sm">{lockedLabel}</p>
        <p className="mt-2 text-xs leading-relaxed opacity-80">{blurb}</p>
      </li>
    )
  }
  return (
    <li>
      <LocaleLink
        href={`/levels/${id}`}
        locale={locale}
        className={`block rounded-xl ${theme.unlocked} px-4 py-4 ${theme.accent} shadow-sm transition hover:brightness-110`}
      >
        <p className="font-serif text-lg">{label}</p>
        <p className="mt-1 text-sm opacity-90">{blurb}</p>
      </LocaleLink>
    </li>
  )
}
