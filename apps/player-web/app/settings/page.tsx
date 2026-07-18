'use client'

import { useEffect, useState } from 'react'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'

export default function SettingsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [showHelp, setShowHelp] = useState(false)
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const muted = save.settings?.muted ?? false

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
            {t.nav.home}
          </LocaleLink>
          <h1 className="font-serif text-2xl text-[#2c3328]">{t.settings.title}</h1>
          <span className="w-10" />
        </header>

        <label className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3">
          <span>{t.settings.mute}</span>
          <input
            type="checkbox"
            checked={muted}
            onChange={(e) => {
              const current = useSaveStore.getState().save
              replace({
                ...current,
                settings: { ...current.settings, muted: e.target.checked },
              })
            }}
          />
        </label>

        <LocaleLink href={`/play/${save.lastPlayedLevelId ?? 'spring-01'}`} locale={locale} className="primary-action w-full justify-center">
          {save.lastPlayedLevelId ? t.nav.continue : t.nav.play}
        </LocaleLink>

        <LocaleLink
          href="/how-to-play"
          locale={locale}
          className="rounded-lg bg-[#3d4a3a] px-4 py-3 text-left text-[#f4f1ea]"
        >
          {t.settings.help}
        </LocaleLink>

        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="rounded-lg border border-[#5c6b52]/40 px-4 py-3 text-left text-[#2c3328]"
        >
          {t.settings.quickTips}
        </button>

        <LocaleLink
          href="/privacy"
          locale={locale}
          className="rounded-lg border border-[#5c6b52]/40 px-4 py-3 text-[#2c3328]"
        >
          {t.settings.privacy}
        </LocaleLink>

        {showHelp && (
          <div className="rounded-lg border border-[#5c6b52]/30 bg-[#f7f5ef] p-4 text-sm leading-relaxed text-[#2c3328]">
            <p className="font-medium font-serif">Fangrush</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[#5c6b52]">
              {t.settings.helpBody.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 text-sm text-[#5c6b52] underline"
              onClick={() => setShowHelp(false)}
            >
              {t.settings.close}
            </button>
          </div>
        )}
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
