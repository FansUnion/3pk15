import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { getT } from '@/i18n/get-locale'

export default async function PrivacyPage() {
  const { locale, t } = await getT()
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10 text-sm leading-relaxed text-[#2c3328]">
        <h1 className="font-serif text-2xl">{t.privacy.title}</h1>
        <div className="mt-4 space-y-3 text-[#5c6b52]">
          <p>{t.privacy.p1}</p>
          <p>{t.privacy.p2}</p>
          <p>{t.privacy.p3}</p>
          <p>{t.privacy.p4}</p>
          <p>
            Analytics:{' '}
            <a
              href="https://policies.google.com/privacy"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Google Privacy Policy
            </a>
          </p>
        </div>
        <p className="mt-6 text-xs text-[#7a8574]">fangrush.com</p>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
