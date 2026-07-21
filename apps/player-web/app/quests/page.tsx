'use client'

import { useEffect, useState } from 'react'
import {
  claimAllQuests,
  claimableQuestCount,
  claimQuest,
  nextUniversalSkinTarget,
  questDisplayTitle,
  QUEST_DEFS,
  settleQuestPeriods,
  type SaveGame,
} from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'
import { fmt, type MessageTree } from '@/i18n/messages'

export default function QuestsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [msg, setMsg] = useState('')
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const viewSave = settleQuestPeriods(save).save
  const quests = viewSave.quests
  const claimable = claimableQuestCount(viewSave)
  const ordered = (period: 'daily' | 'weekly') => QUEST_DEFS.filter((quest) => quest.period === period).sort((a, b) => {
    const state = (quest: typeof a) => {
      const bucket = quests[period]
      if (bucket.claimed.includes(quest.id)) return 2
      return (bucket.progress[quest.id] ?? 0) >= quest.target ? 0 : 1
    }
    return state(a) - state(b)
  })

  function finishClaim(next: SaveGame, reward: number, count = 1) {
    replace(next)
    const prefix = count > 1
      ? fmt(t.quests.claimAllSuccess, { count, n: reward })
      : fmt(t.quests.claimSuccess, { n: reward })
    setMsg(`${prefix} · ${targetMessage(next, locale, t)}`)
  }

  function claimOne(id: string) {
    const result = claimQuest(viewSave, id)
    if (!result.ok) {
      setMsg(t.quests.error)
      return
    }
    finishClaim(result.save, result.rewardUniversal)
  }

  function claimAll() {
    const result = claimAllQuests(viewSave)
    if (!result.ok) {
      setMsg(t.quests.error)
      return
    }
    finishClaim(result.save, result.rewardUniversal, result.claimedCount)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between gap-3">
          <LocaleLink href="/" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
            {t.nav.home}
          </LocaleLink>
          <h1 className="font-serif text-2xl text-[#2c3328]">{t.quests.title}</h1>
          <span className="text-xs text-[#7a8574]">{fmt(t.quests.balance, { n: viewSave.fragments.universal })}</span>
        </header>

        {msg && <p role="status" className="rounded-lg bg-[#eef1eb] px-4 py-3 text-sm leading-relaxed text-[#40513c]">{msg}</p>}
        <p className="rounded-lg bg-[#eef1eb] px-4 py-3 text-sm leading-relaxed text-[#5c6b52]">{t.quests.intro}</p>

        {claimable > 0 && (
          <button type="button" onClick={claimAll} className="primary-action w-full justify-center">
            {t.quests.claimAll} · {claimable}
          </button>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-[#5c6b52]">{t.quests.daily}</h2>
          {ordered('daily').map((quest) => (
            <QuestRow
              key={quest.id}
              title={questDisplayTitle(quest, locale)}
              progress={quests.daily.progress[quest.id] ?? 0}
              target={quest.target}
              rewardLabel={fmt(t.quests.reward, { n: quest.rewardUniversal })}
              claimed={quests.daily.claimed.includes(quest.id)}
              claimLabel={t.quests.claim}
              claimedLabel={t.quests.claimed}
              onClaim={() => claimOne(quest.id)}
            />
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-[#5c6b52]">{t.quests.weekly}</h2>
          {ordered('weekly').map((quest) => (
            <QuestRow
              key={quest.id}
              title={questDisplayTitle(quest, locale)}
              progress={quests.weekly.progress[quest.id] ?? 0}
              target={quest.target}
              rewardLabel={fmt(t.quests.reward, { n: quest.rewardUniversal })}
              claimed={quests.weekly.claimed.includes(quest.id)}
              claimLabel={t.quests.claim}
              claimedLabel={t.quests.claimed}
              onClaim={() => claimOne(quest.id)}
            />
          ))}
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}

function targetMessage(save: SaveGame, locale: 'en' | 'zh', t: MessageTree): string {
  const target = nextUniversalSkinTarget(save)
  if (!target) return t.quests.allCollected
  const name = locale === 'zh' ? target.nameZh : target.nameEn
  const remaining = Math.max(0, target.cost - save.fragments.universal)
  return remaining === 0
    ? fmt(t.quests.targetReady, { name })
    : fmt(t.quests.targetRemaining, { name, n: remaining })
}

function QuestRow({ title, progress, target, rewardLabel, claimed, claimLabel, claimedLabel, onClaim }: {
  title: string
  progress: number
  target: number
  rewardLabel: string
  claimed: boolean
  claimLabel: string
  claimedLabel: string
  onClaim: () => void
}) {
  const done = progress >= target
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium text-[#2c3328]">{title}</p>
        <p className="text-xs text-[#7a8574]">{Math.min(progress, target)}/{target} · {rewardLabel}</p>
      </div>
      {claimed ? (
        <span className="shrink-0 text-xs text-[#7a8574]">{claimedLabel}</span>
      ) : (
        <button type="button" disabled={!done} onClick={onClaim} className="min-h-11 shrink-0 rounded bg-[#3d4a3a] px-4 py-2 text-xs font-medium text-[#f4f1ea] disabled:opacity-40">
          {claimLabel}
        </button>
      )}
    </div>
  )
}
