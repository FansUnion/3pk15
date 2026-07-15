'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  equipSkin,
  grantUniversalFragments,
  isSkinUnlocked,
  SKIN_CATALOG,
  unlockSkinWithCost,
} from '@wolf-sheep/game-core'
import { getAds } from '@/lib/ads'
import { useSaveStore } from '@/lib/save-store'

const TOPUP_AMOUNT = 10

export default function SkinsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  async function topUp() {
    setBusy(true)
    const res = await getAds().showRewarded('fragment_topup')
    setBusy(false)
    if (!res.ok) {
      setMsg('广告未完成，未发放碎片')
      return
    }
    replace(grantUniversalFragments(useSaveStore.getState().save, TOPUP_AMOUNT))
    setMsg(`获得通用碎片 +${TOPUP_AMOUNT}`)
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[#5c6b52] hover:underline">
          首页
        </Link>
        <h1 className="font-serif text-2xl text-[#2c3328]">皮肤图鉴</h1>
        <span className="text-xs text-[#7a8574]">{save.fragments.universal}</span>
      </header>

      {msg && <p className="text-sm text-[#5c6b52]">{msg}</p>}

      <button
        type="button"
        disabled={busy}
        onClick={() => void topUp()}
        className="rounded-lg border border-[#5c6b52]/40 px-4 py-2 text-sm text-[#2c3328] disabled:opacity-50"
      >
        看广告补通用碎片 (+{TOPUP_AMOUNT})
      </button>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[#5c6b52]">狼套装（含羊）</h2>
        {SKIN_CATALOG.filter((s) => s.kind === 'wolf_set').map((skin) => {
          const unlocked = isSkinUnlocked(save, skin)
          const equipped = save.equipped.wolfSetId === skin.id
          return (
            <div
              key={skin.id}
              className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={skin.assets.wolf}
                  alt=""
                  className="h-10 w-10 object-contain"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={skin.assets.sheep}
                  alt=""
                  className="h-8 w-8 object-contain opacity-90"
                />
                <div>
                  <p className="font-medium text-[#2c3328]">{skin.name}</p>
                  <p className="text-xs text-[#7a8574]">
                    {unlocked
                      ? equipped
                        ? '穿戴中'
                        : '已解锁'
                      : skin.unlock.type === 'cost'
                        ? `需 ${skin.unlock.universal} 通用碎片`
                        : '未解锁'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!unlocked && skin.unlock.type === 'cost' && (
                  <button
                    type="button"
                    className="rounded bg-[#3d4a3a] px-3 py-1 text-xs text-[#f4f1ea]"
                    onClick={() => {
                      const r = unlockSkinWithCost(save, skin.id)
                      if (!r.ok) {
                        setMsg(
                          r.error === 'insufficient_universal'
                            ? '碎片不足，可看广告补齐'
                            : r.error,
                        )
                        return
                      }
                      replace(r.save)
                      setMsg(`已解锁 ${skin.name}`)
                    }}
                  >
                    兑换
                  </button>
                )}
                {unlocked && !equipped && (
                  <button
                    type="button"
                    className="rounded border border-[#5c6b52]/40 px-3 py-1 text-xs"
                    onClick={() => {
                      const r = equipSkin(save, skin.id)
                      if (r.ok) {
                        replace(r.save)
                        setMsg(`已穿戴 ${skin.name}`)
                      }
                    }}
                  >
                    穿戴
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[#5c6b52]">棋盘</h2>
        {SKIN_CATALOG.filter((s) => s.kind === 'board').map((skin) => {
          const unlocked = isSkinUnlocked(save, skin)
          const equipped = save.equipped.boardId === skin.id
          return (
            <div
              key={skin.id}
              className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={skin.assets.boardBg}
                  alt=""
                  className="h-10 w-10 rounded border border-[#5c6b52]/20 object-cover"
                />
                <div>
                  <p className="font-medium text-[#2c3328]">{skin.name}</p>
                  <p className="text-xs text-[#7a8574]">
                    {unlocked ? (equipped ? '使用中' : '已解锁') : '通关对应章节解锁'}
                  </p>
                </div>
              </div>
              {unlocked && !equipped && (
                <button
                  type="button"
                  className="rounded border border-[#5c6b52]/40 px-3 py-1 text-xs"
                  onClick={() => {
                    const r = equipSkin(save, skin.id)
                    if (r.ok) {
                      replace(r.save)
                      setMsg(`已切换 ${skin.name}`)
                    }
                  }}
                >
                  使用
                </button>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}
