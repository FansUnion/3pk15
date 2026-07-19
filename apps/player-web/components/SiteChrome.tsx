import { LocaleLink, LocaleSwitcher } from '@/components/LocaleSwitcher'
import type { SupportedLocale } from '@/config/locales'
import type { MessageTree } from '@/i18n/messages'

export function SiteFooter({ locale, t }: { locale: SupportedLocale; t: MessageTree }) {
  return (
    <footer className="mt-auto border-t border-[#5c6b52]/15 px-6 py-6">
      <div className="mx-auto flex max-w-lg flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5c6b52]">
        <LocaleLink href="/how-to-play" locale={locale} className="hover:underline">{t.nav.howToPlay}</LocaleLink>
        <LocaleLink href="/chapters" locale={locale} className="hover:underline">{t.nav.chapters}</LocaleLink>
        <LocaleLink href="/skins" locale={locale} className="hover:underline">{t.nav.skins}</LocaleLink>
        <LocaleLink href="/quests" locale={locale} className="hover:underline">{t.nav.quests}</LocaleLink>
        <LocaleLink href="/privacy" locale={locale} className="hover:underline">{t.nav.privacy}</LocaleLink>
        <LocaleLink href="/settings" locale={locale} className="hover:underline">{t.nav.settings}</LocaleLink>
        <LocaleSwitcher locale={locale} variant="footer" />
        <span className="text-[#7a8574]">© Fangrush</span>
      </div>
      <details className="mx-auto mt-3 max-w-lg text-xs text-[#7a8574]">
        <summary className="cursor-pointer select-none hover:underline">{locale === 'zh' ? '站点技术文件' : 'Technical site files'}</summary>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 pl-3">
          <a href="/sitemap.xml" className="hover:underline">Sitemap</a>
          <a href="/llms.txt" className="hover:underline">llms.txt</a>
          <a href="/llms-full.txt" className="hover:underline">llms-full.txt</a>
        </div>
      </details>
    </footer>
  )
}

export function SiteHeader({ locale, brand = 'Fangrush' }: { locale: SupportedLocale; brand?: string }) {
  return (
    <header className="mx-auto flex max-w-lg items-center justify-between px-6 pt-6">
      <LocaleLink href="/" locale={locale} className="font-serif text-lg tracking-wide text-[#2c3328]">{brand}</LocaleLink>
      <LocaleSwitcher locale={locale} variant="navbar" />
    </header>
  )
}
