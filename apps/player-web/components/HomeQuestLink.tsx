'use client'

import { useEffect } from 'react'
import { claimableQuestCount } from '@wolf-sheep/game-core'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { useSaveStore } from '@/lib/save-store'

export function HomeQuestLink({ locale, label, description }: { locale: 'en' | 'zh'; label: string; description: string }) {
  const save = useSaveStore((state) => state.save)
  const hydrate = useSaveStore((state) => state.hydrate)
  const count = claimableQuestCount(save)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <LocaleLink href="/quests" locale={locale} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3">
      <span className="flex items-center justify-between gap-2 font-medium text-[var(--ink)]">
        <span>{label}</span>
        {count > 0 && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">{count}</span>}
      </span>
      <span className="mt-1 block text-xs text-[var(--muted)]">{description}</span>
    </LocaleLink>
  )
}
