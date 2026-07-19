import { LocaleLink } from '@/components/LocaleSwitcher'
import { getT } from '@/i18n/get-locale'

export default async function NotFound() {
  const { locale, t } = await getT()
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="eyebrow">404 · Fangrush</p>
      <h1 className="font-serif text-3xl text-[var(--ink)]">{locale === 'zh' ? '没有找到这片猎场' : 'This hunting ground was not found'}</h1>
      <p className="text-sm leading-relaxed text-[var(--muted)]">{locale === 'zh' ? '链接可能已经失效。返回关卡列表，选择一个可用关卡继续。' : 'The link may be outdated. Return to the hunt list and choose an available level.'}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <LocaleLink href="/chapters" locale={locale} className="primary-action">{t.nav.chapters}</LocaleLink>
        <LocaleLink href="/" locale={locale} className="quiet-action">{t.nav.home}</LocaleLink>
      </div>
    </main>
  )
}
