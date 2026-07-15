import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { HomeContinueLink } from '@/components/HomeContinueLink'
import { HomeSeasonGrid } from '@/components/HomeSeasonGrid'
import { getT } from '@/i18n/get-locale'

export default async function HomePage() {
  const { locale, t } = await getT()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Fangrush',
    alternateName: '三狼连猎',
    url: 'https://fangrush.com',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    description: t.meta.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SiteHeader locale={locale} />
      <main className="flex w-full flex-1 flex-col">
        <section className="relative w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 70% 10%, #f5f0e0 0%, transparent 50%), radial-gradient(ellipse at 15% 90%, #c5d4b8 0%, transparent 55%), #dfe8d8',
            }}
          />
          <div className="relative mx-auto flex max-w-lg flex-col px-6 pb-12 pt-8">
            <p className="eyebrow">Three wolves · one moving flock</p>
            <h1 className="display-title mt-3 text-5xl leading-[.92] sm:text-6xl">
              {t.brand.name}
            </h1>
            {t.brand.subtitle ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{t.brand.subtitle}</p>
            ) : null}
            <p className="mt-5 max-w-sm text-base leading-relaxed text-[var(--muted)]">{t.brand.tagline}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/og.png"
              alt="Fangrush — three wolves face the flock"
              width={1536}
              height={1024}
              className="hunter-breathe mt-7 w-full rounded-[1.4rem] border border-white/50 bg-white/20 shadow-[0_24px_50px_rgba(56,76,48,.18)]"
            />
            <div className="mt-7 flex flex-col gap-3">
              <LocaleLink
                href="/play/spring-01"
                locale={locale}
                className="primary-action"
              >
                {t.nav.play}
              </LocaleLink>
              <HomeContinueLink
                locale={locale}
                labelTemplate={t.nav.continueNamed}
                fallbackLabel={t.nav.continue}
              />
            </div>
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-lg flex-col gap-10 px-6 py-10">
          <section className="paper-card p-5">
            <h2 className="font-serif text-xl text-[var(--ink)]">{t.home.howTitle}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--muted)]">
              {t.home.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <LocaleLink
              href="/how-to-play"
              locale={locale}
              className="mt-3 inline-block text-sm text-[var(--muted)] underline-offset-2 hover:underline"
            >
              {t.home.howMore} →
            </LocaleLink>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[var(--ink)]">{t.home.seasonsTitle}</h2>
            <HomeSeasonGrid />
            <LocaleLink
              href="/chapters"
              locale={locale}
              className="mt-3 inline-block text-sm text-[var(--muted)] underline-offset-2 hover:underline"
            >
              {t.nav.chapters} →
            </LocaleLink>
          </section>

          <section className="paper-card flex flex-wrap gap-x-4 gap-y-2 p-4 text-sm text-[var(--muted)]">
            <LocaleLink href="/skins" locale={locale} className="hover:underline">
              {t.nav.skins}
            </LocaleLink>
            <LocaleLink href="/quests" locale={locale} className="hover:underline">
              {t.nav.quests}
            </LocaleLink>
            <LocaleLink href="/settings" locale={locale} className="hover:underline">
              {t.nav.settings}
            </LocaleLink>
            <LocaleLink href="/privacy" locale={locale} className="hover:underline">
              {t.nav.privacy}
            </LocaleLink>
          </section>

          <p className="text-center text-xs text-[#7a8574]">{t.home.trust}</p>

          <section>
            <h2 className="font-serif text-xl text-[var(--ink)]">{t.home.faqTitle}</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {t.home.faq.map((item) => (
                <div key={item.q}>
                  <dt className="font-medium text-[var(--ink)]">{item.q}</dt>
                  <dd className="mt-1 text-[var(--muted)]">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
