'use client'

import { useEffect, useState } from 'react'
import {
  equipSkin,
  grantUniversalFragments,
  isSkinUnlocked,
  SKIN_CATALOG,
  unlockSkinWithCost,
} from '@wolf-sheep/game-core'
import { getAds } from '@/lib/ads'
import { useSaveStore } from '@/lib/save-store'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useClientMessages } from '@/i18n/use-client-locale'

const TOPUP_AMOUNT = 10

export default function SkinsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const { locale, t } = useClientMessages()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  async function topUp() {
    setBusy(true)
    const res = await getAds().showRewarded('fragment_topup')
    setBusy(false)
    if (!res.ok) {
      setMsg(locale === 'zh' ? '广告未完成，未发放碎片' : 'Ad not completed')
      return
    }
    replace(grantUniversalFragments(useSaveStore.getState().save, TOPUP_AMOUNT))
    setMsg(locale === 'zh' ? `获得通用碎片 +${TOPUP_AMOUNT}` : `+${TOPUP_AMOUNT} shards`)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="text-sm text-[#5c6b52] hover:underline">
            {t.nav.home}
          </LocaleLink>
          <h1 className="font-serif text-2xl text-[#2c3328]">{t.skins.title}</h1>
          <span className="text-xs text-[#7a8574]">{save.fragments.universal}</span>
        </header>
        <p className="text-sm text-[#5c6b52]">
          <LocaleLink href="/how-to-play" locale={locale} className="hover:underline">
            {t.nav.howToPlay}
          </LocaleLink>
          {' · '}
          <LocaleLink href="/chapters" locale={locale} className="hover:underline">
            {t.nav.chapters}
          </LocaleLink>
        </p>

        {msg ? <p className="text-sm text-[#5c6b52]">{msg}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void topUp()}
          className="rounded-lg border border-[#5c6b52]/40 px-4 py-2 text-sm text-[#2c3328] disabled:opacity-50"
        >
          {locale === 'zh' ? `看广告补通用碎片 (+${TOPUP_AMOUNT})` : `Watch ad (+${TOPUP_AMOUNT} shards)`}
        </button>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#5c6b52]">
            {locale === 'zh' ? '狼套装（含羊）' : 'Wolf sets'}
          </h2>
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
                  <img src={skin.assets.wolf} alt="" className="h-10 w-10 object-contain" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={skin.assets.sheep} alt="" className="h-8 w-8 object-contain opacity-90" />
                  <div>
                    <p className="font-medium text-[#2c3328]">{skin.name}</p>
                    <p className="text-xs text-[#7a8574]">
                      {unlocked
                        ? equipped
                          ? t.skins.equipped
                          : locale === 'zh'
                            ? '已解锁'
                            : 'Unlocked'
                        : skin.unlock.type === 'cost'
                          ? t.skins.cost.replace('{n}', String(skin.unlock.universal))
                          : locale === 'zh'
                            ? '未解锁'
                            : 'Locked'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!unlocked && skin.unlock.type === 'cost' ? (
                    <button
                      type="button"
                      className="rounded bg-[#3d4a3a] px-3 py-1 text-xs text-[#f4f1ea]"
                      onClick={() => {
                        const r = unlockSkinWithCost(save, skin.id)
                        if (!r.ok) {
                          setMsg(locale === 'zh' ? '碎片不足' : 'Not enough shards')
                          return
                        }
                        replace(r.save)
                      }}
                    >
                      {locale === 'zh' ? '兑换' : 'Redeem'}
                    </button>
                  ) : null}
                  {unlocked && !equipped ? (
                    <button
                      type="button"
                      className="rounded border border-[#5c6b52]/40 px-3 py-1 text-xs"
                      onClick={() => {
                        const r = equipSkin(save, skin.id)
                        if (r.ok) replace(r.save)
                      }}
                    >
                      {t.skins.equip}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#5c6b52]">{locale === 'zh' ? '棋盘' : 'Boards'}</h2>
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
                      {unlocked
                        ? equipped
                          ? t.skins.equipped
                          : locale === 'zh'
                            ? '已解锁'
                            : 'Unlocked'
                        : locale === 'zh'
                          ? '通关对应章节解锁'
                          : 'Clear chapter to unlock'}
                    </p>
                  </div>
                </div>
                {unlocked && !equipped ? (
                  <button
                    type="button"
                    className="rounded border border-[#5c6b52]/40 px-3 py-1 text-xs"
                    onClick={() => {
                      const r = equipSkin(save, skin.id)
                      if (r.ok) replace(r.save)
                    }}
                  >
                    {t.skins.equip}
                  </button>
                ) : null}
              </div>
            )
          })}
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}
