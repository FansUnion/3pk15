'use client'

import { useEffect, useState } from 'react'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'
import { playSfx, prepareSfx, SFX_KINDS } from '@/lib/sfx'

export default function SettingsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [soundStatus, setSoundStatus] = useState<'ready' | 'blocked' | null>(null)
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

        <section className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
          <h2 className="font-serif text-xl text-[#2c3328]">{t.settings.soundTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#5c6b52]">{t.settings.soundBody}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SFX_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className="flex min-h-11 items-center justify-between rounded-lg border border-[#5c6b52]/30 px-3 py-2 text-left text-sm"
                onClick={async () => {
                  if (muted) {
                    const current = useSaveStore.getState().save
                    replace({ ...current, settings: { ...current.settings, muted: false } })
                  }
                  const ready = await prepareSfx()
                  const mode = ready ? await playSfx(kind) : 'blocked'
                  setSoundStatus(mode === 'blocked' ? 'blocked' : 'ready')
                }}
              >
                <span>{t.settings.soundLabels[kind]}</span>
                <span className="text-xs text-[#5c6b52]">{t.settings.soundPlay}</span>
              </button>
            ))}
          </div>
          {soundStatus && <p role="status" className="mt-3 text-sm text-[#5c6b52]">{soundStatus === 'ready' ? t.settings.soundReady : t.settings.soundBlocked}</p>}
        </section>

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

        <LocaleLink
          href="/privacy"
          locale={locale}
          className="rounded-lg border border-[#5c6b52]/40 px-4 py-3 text-[#2c3328]"
        >
          {t.settings.privacy}
        </LocaleLink>

      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
