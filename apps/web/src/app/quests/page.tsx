'use client'

import { useEffect, useState } from 'react'
import { claimQuest, QUEST_DEFS, refreshQuestPeriod } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'

export default function QuestsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [msg, setMsg] = useState('')
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const quests = refreshQuestPeriod(save.quests)

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
            {t.nav.home}
          </LocaleLink>
          <h1 className="font-serif text-2xl text-[#2c3328]">{t.quests.title}</h1>
          <span className="text-xs text-[#7a8574]">{save.fragments.universal}</span>
        </header>

        {msg && <p className="text-sm text-[#5c6b52]">{msg}</p>}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-[#5c6b52]">{locale === 'zh' ? '每日' : 'Daily'}</h2>
          {QUEST_DEFS.filter((q) => q.period === 'daily').map((q) => {
            const progress = quests.daily.progress[q.id] ?? 0
            const claimed = quests.daily.claimed.includes(q.id)
            const done = progress >= q.target
            return (
              <QuestRow
                key={q.id}
                title={q.title}
                progress={progress}
                target={q.target}
                reward={q.rewardUniversal}
                claimed={claimed}
                done={done}
                claimLabel={t.quests.claim}
                claimedLabel={t.quests.claimed}
                onClaim={() => {
                  const r = claimQuest({ ...save, quests }, q.id)
                  if (!r.ok) {
                    setMsg(r.error)
                    return
                  }
                  replace(r.save)
                  setMsg(
                    locale === 'zh'
                      ? `领取 +${q.rewardUniversal} 通用碎片`
                      : `Claimed +${q.rewardUniversal} shards`,
                  )
                }}
              />
            )
          })}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-[#5c6b52]">{locale === 'zh' ? '每周' : 'Weekly'}</h2>
          {QUEST_DEFS.filter((q) => q.period === 'weekly').map((q) => {
            const progress = quests.weekly.progress[q.id] ?? 0
            const claimed = quests.weekly.claimed.includes(q.id)
            const done = progress >= q.target
            return (
              <QuestRow
                key={q.id}
                title={q.title}
                progress={progress}
                target={q.target}
                reward={q.rewardUniversal}
                claimed={claimed}
                done={done}
                claimLabel={t.quests.claim}
                claimedLabel={t.quests.claimed}
                onClaim={() => {
                  const r = claimQuest({ ...save, quests }, q.id)
                  if (!r.ok) {
                    setMsg(r.error)
                    return
                  }
                  replace(r.save)
                  setMsg(
                    locale === 'zh'
                      ? `领取 +${q.rewardUniversal} 通用碎片`
                      : `Claimed +${q.rewardUniversal} shards`,
                  )
                }}
              />
            )
          })}
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}

function QuestRow({
  title,
  progress,
  target,
  reward,
  claimed,
  done,
  claimLabel,
  claimedLabel,
  onClaim,
}: {
  title: string
  progress: number
  target: number
  reward: number
  claimed: boolean
  done: boolean
  claimLabel: string
  claimedLabel: string
  onClaim: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3">
      <div>
        <p className="font-medium text-[#2c3328]">{title}</p>
        <p className="text-xs text-[#7a8574]">
          {Math.min(progress, target)}/{target} · {reward}
        </p>
      </div>
      {claimed ? (
        <span className="text-xs text-[#7a8574]">{claimedLabel}</span>
      ) : (
        <button
          type="button"
          disabled={!done}
          onClick={onClaim}
          className="rounded bg-[#3d4a3a] px-3 py-1 text-xs text-[#f4f1ea] disabled:opacity-40"
        >
          {claimLabel}
        </button>
      )}
    </div>
  )
}
