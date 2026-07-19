'use client'

import { useEffect, useState } from 'react'
import { claimQuest, questDisplayTitle, QUEST_DEFS, refreshQuestPeriod } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'
import { fmt } from '@/i18n/messages'

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
  const ordered = (period: 'daily' | 'weekly') => QUEST_DEFS.filter((quest) => quest.period === period).sort((a, b) => {
    const state = (quest: typeof a) => {
      const bucket = quests[period]
      if (bucket.claimed.includes(quest.id)) return 2
      return (bucket.progress[quest.id] ?? 0) >= quest.target ? 0 : 1
    }
    return state(a) - state(b)
  })

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
            {t.nav.home}
          </LocaleLink>
          <h1 className="font-serif text-2xl text-[#2c3328]">{t.quests.title}</h1>
          <span className="text-xs text-[#7a8574]">{fmt(t.quests.balance, { n: save.fragments.universal })}</span>
        </header>

        {msg && <p className="text-sm text-[#5c6b52]">{msg}</p>}
        <p className="rounded-lg bg-[#eef1eb] px-4 py-3 text-sm leading-relaxed text-[#5c6b52]">{locale === 'zh' ? '游玩、通关和获得碎片会自动累计进度；达到目标后需要在这里手动领取奖励。' : 'Playing, clearing hunts, and earning shards update progress automatically. Claim completed rewards here.'}</p>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-[#5c6b52]">{t.quests.daily}</h2>
          {ordered('daily').map((q) => {
            const progress = quests.daily.progress[q.id] ?? 0
            const claimed = quests.daily.claimed.includes(q.id)
            const done = progress >= q.target
            return (
              <QuestRow
                key={q.id}
                title={questDisplayTitle(q, locale)}
                progress={progress}
                target={q.target}
                rewardLabel={fmt(t.quests.reward, { n: q.rewardUniversal })}
                claimed={claimed}
                done={done}
                claimLabel={t.quests.claim}
                claimedLabel={t.quests.claimed}
                onClaim={() => {
                  const r = claimQuest({ ...save, quests }, q.id)
                  if (!r.ok) {
                    setMsg(t.quests.error)
                    return
                  }
                  replace(r.save)
                  setMsg(fmt(t.quests.claimSuccess, { n: q.rewardUniversal }))
                }}
              />
            )
          })}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-[#5c6b52]">{t.quests.weekly}</h2>
          {ordered('weekly').map((q) => {
            const progress = quests.weekly.progress[q.id] ?? 0
            const claimed = quests.weekly.claimed.includes(q.id)
            const done = progress >= q.target
            return (
              <QuestRow
                key={q.id}
                title={questDisplayTitle(q, locale)}
                progress={progress}
                target={q.target}
                rewardLabel={fmt(t.quests.reward, { n: q.rewardUniversal })}
                claimed={claimed}
                done={done}
                claimLabel={t.quests.claim}
                claimedLabel={t.quests.claimed}
                onClaim={() => {
                  const r = claimQuest({ ...save, quests }, q.id)
                  if (!r.ok) {
                    setMsg(t.quests.error)
                    return
                  }
                  replace(r.save)
                  setMsg(fmt(t.quests.claimSuccess, { n: q.rewardUniversal }))
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
  rewardLabel,
  claimed,
  done,
  claimLabel,
  claimedLabel,
  onClaim,
}: {
  title: string
  progress: number
  target: number
  rewardLabel: string
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
          {Math.min(progress, target)}/{target} · {rewardLabel}
        </p>
      </div>
      {claimed ? (
        <span className="text-xs text-[#7a8574]">{claimedLabel}</span>
      ) : (
        <button
          type="button"
          disabled={!done}
          onClick={onClaim}
          className="min-h-11 shrink-0 rounded bg-[#3d4a3a] px-4 py-2 text-xs font-medium text-[#f4f1ea] disabled:opacity-40"
        >
          {claimLabel}
        </button>
      )}
    </div>
  )
}
