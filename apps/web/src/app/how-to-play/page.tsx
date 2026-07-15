import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { getT } from '@/i18n/get-locale'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT()
  return {
    title: t.howTo.title,
    description: t.howTo.metaDescription,
  }
}

export default async function HowToPlayPage() {
  const { locale, t } = await getT()
  const h = t.howTo

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.home.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SiteHeader locale={locale} />
      <main className="page-shell flex flex-1 flex-col gap-8 py-8">
        <header className="game-panel p-5">
          <p className="eyebrow">Fangrush field guide</p>
          <h1 className="display-title mt-2 text-4xl">{h.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{h.intro}</p>
        </header>

        {(
          [
            [h.winTitle, h.winBody],
            [h.moveTitle, h.moveBody],
            [h.chainTitle, h.chainBody],
            [h.sheepTitle, h.sheepBody],
            [h.rocksTitle, h.rocksBody],
            [h.saveTitle, h.saveBody],
          ] as const
        ).map(([title, body]) => (
          <section key={title} className="paper-card p-4">
            <h2 className="font-serif text-xl text-[var(--ink)]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
          </section>
        ))}

        <div className="flex flex-col gap-3">
          <LocaleLink
            href="/hunt/spring-01"
            locale={locale}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-[#f4f1ea]"
          >
            {h.ctaSpring}
          </LocaleLink>
          <LocaleLink
            href="/chapters"
            locale={locale}
            className="text-center text-sm text-[var(--muted)] underline-offset-2 hover:underline"
          >
            {h.ctaChapters}
          </LocaleLink>
          <LocaleLink
            href="/skins"
            locale={locale}
            className="text-center text-sm text-[var(--muted)] underline-offset-2 hover:underline"
          >
            {t.nav.skins}
          </LocaleLink>
        </div>

        <section>
          <h2 className="font-serif text-xl text-[var(--ink)]">{h.faqTitle}</h2>
          <dl className="mt-3 space-y-3 text-sm">
            {t.home.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-medium text-[var(--ink)]">{item.q}</dt>
                <dd className="mt-1 text-[var(--muted)]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
