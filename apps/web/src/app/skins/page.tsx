'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { equipSkin, isSkinUnlocked, SKIN_CATALOG, unlockSkinWithCost } from '@wolf-sheep/game-core'
import { SkinPreview } from '@/components/SkinPreview'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useSaveStore } from '@/lib/save-store'
import { useClientMessages } from '@/i18n/use-client-locale'

export default function SkinsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [message, setMessage] = useState('')
  const { locale, t } = useClientMessages()

  useEffect(() => hydrate(), [hydrate])

  function equip(id: string) {
    const result = equipSkin(save, id)
    if (result.ok) replace(result.save)
  }

  function unlock(id: string) {
    const result = unlockSkinWithCost(save, id)
    if (result.ok) {
      replace(result.save)
      setMessage(locale === 'zh' ? '已解锁，可立即装备。' : 'Unlocked and ready to equip.')
    } else {
      setMessage(locale === 'zh' ? '碎片不足，先完成更多猎场。' : 'Not enough shards. Clear more hunts first.')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="quiet-action text-sm">{t.nav.home}</LocaleLink>
          <div className="text-center"><p className="eyebrow">Collection</p><h1 className="display-title text-3xl">{t.skins.title}</h1></div>
          <span className="min-w-16 text-right text-sm font-bold text-[var(--muted)]">✦ {save.fragments.universal}</span>
        </header>

        <SkinPreview save={save} />
        <LocaleLink href={`/play/${save.lastPlayedLevelId ?? 'spring-01'}`} locale={locale} className="primary-action w-full justify-center">
          {save.lastPlayedLevelId ? t.nav.continue : t.nav.play}
        </LocaleLink>
        <p className="text-center text-sm leading-relaxed text-[var(--muted)]">
          {locale === 'zh' ? '选择皮肤后，猎场预览会立即更新。狼、羊与棋盘应属于同一个主题。' : 'The field preview updates immediately. Wolf, sheep, and board belong to one theme.'}
        </p>
        {message ? <p className="rounded-xl bg-[#f4e5de] px-4 py-3 text-center text-sm text-[#8b2e22]">{message}</p> : null}

        <SkinSection title={locale === 'zh' ? '狼群套装' : 'Wolf sets'}>
          {SKIN_CATALOG.filter((skin) => skin.kind === 'wolf_set').map((skin) => {
            const unlocked = isSkinUnlocked(save, skin)
            const equipped = save.equipped.wolfSetId === skin.id
            return <SkinCard key={skin.id} name={skin.name} preview={[skin.assets.wolf, skin.assets.sheep]} unlocked={unlocked} equipped={equipped} cost={skin.unlock.type === 'cost' ? skin.unlock.universal : null} onEquip={() => equip(skin.id)} onUnlock={() => unlock(skin.id)} labels={t.skins} locale={locale} />
          })}
        </SkinSection>

        <SkinSection title={locale === 'zh' ? '猎场棋盘' : 'Field boards'}>
          {SKIN_CATALOG.filter((skin) => skin.kind === 'board').map((skin) => {
            const unlocked = isSkinUnlocked(save, skin)
            const equipped = save.equipped.boardId === skin.id
            return <SkinCard key={skin.id} name={skin.name} preview={[skin.assets.boardBg]} unlocked={unlocked} equipped={equipped} cost={null} onEquip={() => equip(skin.id)} onUnlock={() => undefined} labels={t.skins} locale={locale} />
          })}
        </SkinSection>
      </main>
      <SiteFooter locale={locale} t={t} />
    </div>
  )
}

function SkinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="flex flex-col gap-3"><h2 className="font-serif text-xl text-[var(--ink)]">{title}</h2>{children}</section>
}

function SkinCard({ name, preview, unlocked, equipped, cost, onEquip, onUnlock, labels, locale }: { name: string; preview: string[]; unlocked: boolean; equipped: boolean; cost: number | null; onEquip: () => void; onUnlock: () => void; labels: { equip: string; equipped: string; cost: string }; locale: 'en' | 'zh' }) {
  return <div className="paper-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-16 w-28 shrink-0 items-center justify-center gap-1 rounded-xl border border-[var(--line)] bg-[#e8eee2] p-2">{preview.map((src) => <Image key={src} src={src} alt="" width={48} height={48} className="h-12 w-12 object-contain" unoptimized />)}</div>
      <div><p className="font-bold text-[var(--ink)]">{name}</p><p className="mt-1 text-xs text-[var(--muted)]">{equipped ? labels.equipped : unlocked ? (locale === 'zh' ? '已解锁' : 'Unlocked') : cost !== null ? labels.cost.replace('{n}', String(cost)) : (locale === 'zh' ? '通关对应猎场解锁' : 'Clear its hunt to unlock')}</p></div>
    </div>
    {!equipped && (unlocked ? <button type="button" className="quiet-action min-h-10 px-3 text-xs sm:ml-auto" onClick={onEquip}>{labels.equip}</button> : cost !== null ? <button type="button" className="primary-action min-h-10 px-3 text-xs sm:ml-auto" onClick={onUnlock}>{locale === 'zh' ? '兑换' : 'Unlock'}</button> : null)}
  </div>
}
