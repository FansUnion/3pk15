'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { claimQuest, QUEST_DEFS, refreshQuestPeriod } from '@wolf-sheep/game-core'
import { useSaveStore } from '@/lib/save-store'

export default function QuestsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const quests = refreshQuestPeriod(save.quests)

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[#5c6b52] hover:underline">
          首页
        </Link>
        <h1 className="font-serif text-2xl text-[#2c3328]">任务</h1>
        <span className="text-xs text-[#7a8574]">{save.fragments.universal}</span>
      </header>

      {msg && <p className="text-sm text-[#5c6b52]">{msg}</p>}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-[#5c6b52]">每日</h2>
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
              onClaim={() => {
                const r = claimQuest({ ...save, quests }, q.id)
                if (!r.ok) {
                  setMsg(r.error)
                  return
                }
                replace(r.save)
                setMsg(`领取 +${q.rewardUniversal} 通用碎片`)
              }}
            />
          )
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-[#5c6b52]">每周</h2>
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
              onClaim={() => {
                const r = claimQuest({ ...save, quests }, q.id)
                if (!r.ok) {
                  setMsg(r.error)
                  return
                }
                replace(r.save)
                setMsg(`领取 +${q.rewardUniversal} 通用碎片`)
              }}
            />
          )
        })}
      </section>
    </main>
  )
}

function QuestRow({
  title,
  progress,
  target,
  reward,
  claimed,
  done,
  onClaim,
}: {
  title: string
  progress: number
  target: number
  reward: number
  claimed: boolean
  done: boolean
  onClaim: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3">
      <div>
        <p className="font-medium text-[#2c3328]">{title}</p>
        <p className="text-xs text-[#7a8574]">
          {Math.min(progress, target)}/{target} · 奖励 {reward}
        </p>
      </div>
      {claimed ? (
        <span className="text-xs text-[#7a8574]">已领</span>
      ) : (
        <button
          type="button"
          disabled={!done}
          onClick={onClaim}
          className="rounded bg-[#3d4a3a] px-3 py-1 text-xs text-[#f4f1ea] disabled:opacity-40"
        >
          领取
        </button>
      )}
    </div>
  )
}
