'use client'

import { useEffect } from 'react'
import type { ChapterId } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { useClientMessages } from '@/i18n/use-client-locale'

const SEASON_IDS: { id: ChapterId; key: ChapterId }[] = [
  { id: 'spring', key: 'spring' },
  { id: 'summer', key: 'summer' },
  { id: 'autumn', key: 'autumn' },
  { id: 'winter', key: 'winter' },
]

/** Home season grid — unlocked seasons go to levels; locked go to chapters. */
export function HomeSeasonGrid() {
  const hydrate = useSaveStore((s) => s.hydrate)
  const save = useSaveStore((s) => s.save)
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      {SEASON_IDS.map((s) => {
        const open = save.unlockedChapters.includes(s.id)
        return (
          <LocaleLink
            key={s.id}
            href={open ? `/levels/${s.id}` : '/chapters'}
            locale={locale}
            className={`season-${s.id} ${open ? 'season-card shadow-sm' : 'border border-[var(--line)] bg-[var(--panel)] opacity-70'} rounded-xl px-4 py-4 text-sm ${
              open ? '' : 'text-[var(--ink)]'
            }`}
          >
            <span className="block font-serif text-lg capitalize">{s.id}</span>
            <span className={`mt-1 block text-xs ${open ? 'text-white/85' : 'text-[var(--muted)]'}`}>
              {t.home.seasons[s.key]}
              {!open ? ` · ${t.chapters.locked}` : ''}
            </span>
          </LocaleLink>
        )
      })}
    </div>
  )
}
