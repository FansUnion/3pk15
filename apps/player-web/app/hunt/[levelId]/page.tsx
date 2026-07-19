import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  adjacentLevels,
  CHAPTER_LABEL,
  CHAPTER_LABEL_EN,
  getLevel,
  levelBlurb,
  levelDisplayName,
  levelTeachingPoint,
  LEVELS,
} from '@wolf-sheep/game-core'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { fmt, formatRockCount } from '@/i18n/messages'
import { getT } from '@/i18n/get-locale'
import { HuntAccessGate } from '@/components/HuntAccessGate'

export function generateStaticParams() {
  return LEVELS.map((l) => ({ levelId: l.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ levelId: string }>
}): Promise<Metadata> {
  const { levelId } = await params
  const level = getLevel(levelId)
  const { locale } = await getT()
  if (!level) return { title: 'Fangrush' }
  const name = levelDisplayName(level, locale)
  return {
    title: `${name} · Fangrush`,
    description: levelBlurb(level, locale),
    openGraph: { title: `${name} · Fangrush`, description: levelBlurb(level, locale) },
  }
}

export default async function HuntPage({
  params,
}: {
  params: Promise<{ levelId: string }>
}) {
  const { levelId } = await params
  const level = getLevel(levelId)
  if (!level) notFound()

  const { locale, t } = await getT()
  const name = levelDisplayName(level, locale)
  const blurb = levelBlurb(level, locale)
  const season = locale === 'zh' ? CHAPTER_LABEL[level.chapterId] : CHAPTER_LABEL_EN[level.chapterId]
  const { prev, next } = adjacentLevels(level.id)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} />
      <HuntAccessGate level={level}><main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-8">
        <header>
          <p className="text-xs text-[var(--muted)]">
            {fmt(t.hunt.seasonLine, { season, rocks: formatRockCount(level.rocks.length, locale, t) })}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">{name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{locale === 'zh' ? `第 ${LEVELS.findIndex((item) => item.id === level.id) + 1}/24 关 · 难度 ${level.difficulty}/5` : `Hunt ${LEVELS.findIndex((item) => item.id === level.id) + 1}/24 · Difficulty ${level.difficulty}/5`}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {fmt(t.hunt.goalLine, { n: level.targetEaten ?? 8, target: level.expectedPlies?.target ?? 100 })}
          </p>
        </header>

        <p className="text-sm leading-relaxed text-[var(--muted)]">{blurb}</p>
        <section className="paper-card p-4">
          <p className="eyebrow">{t.hunt.teachingLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">{levelTeachingPoint(level, locale)}</p>
        </section>

        <LocaleLink
          href={`/play/${level.id}`}
          locale={locale}
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-[#f4f1ea]"
        >
          {t.hunt.playCta}
        </LocaleLink>

        <nav className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          <LocaleLink href={`/levels/${level.chapterId}`} locale={locale} className="hover:underline">
            {t.hunt.levelsLink}
          </LocaleLink>
          <LocaleLink href="/how-to-play" locale={locale} className="hover:underline">
            {t.hunt.howLink}
          </LocaleLink>
          <div className="mt-2 flex justify-between gap-4">
            {prev ? (
              <LocaleLink href={`/hunt/${prev.id}`} locale={locale} className="hover:underline">
                ← {t.hunt.prev}: {levelDisplayName(prev, locale)}
              </LocaleLink>
            ) : (
              <span />
            )}
            {next ? (
              <LocaleLink href={`/hunt/${next.id}`} locale={locale} className="text-right hover:underline">
                {t.hunt.next}: {levelDisplayName(next, locale)} →
              </LocaleLink>
            ) : null}
          </div>
        </nav>
      </main></HuntAccessGate>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
