'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CHAPTER_LABEL, CHAPTER_LABEL_EN, CHAPTER_ORDER, equipSkin, isSkinUnlocked, skinDisplayName, SKIN_CATALOG, unlockSkinWithCost, type SaveGame, type SkinCatalogItem } from '@wolf-sheep/game-core'
import { SkinPreview } from '@/components/SkinPreview'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { SiteFooter } from '@/components/SiteChrome'
import { useSaveStore } from '@/lib/save-store'
import { useClientMessages } from '@/i18n/use-client-locale'
import { fmt } from '@/i18n/messages'

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
      setMessage(t.skins.unlockSuccess)
    } else {
      setMessage(t.skins.insufficient)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <LocaleLink href="/" locale={locale} className="quiet-action text-sm">{t.nav.home}</LocaleLink>
          <div className="text-center"><p className="eyebrow">Collection</p><h1 className="display-title text-3xl">{t.skins.title}</h1></div>
          <div className="text-right text-xs text-[var(--muted)]">
            <p className="font-bold">✦ {save.fragments.universal}</p>
            <p className="mt-1">{t.skins.seasonBalances}</p>
            <div className="mt-1 flex flex-wrap justify-end gap-x-2 gap-y-0.5">
              {CHAPTER_ORDER.map((chapter) => (
                <span key={chapter}>{fmt(t.skins.seasonBalance, {
                  season: locale === 'zh' ? CHAPTER_LABEL[chapter] : CHAPTER_LABEL_EN[chapter],
                  n: save.fragments.season[chapter] ?? 0,
                })}</span>
              ))}
            </div>
          </div>
        </header>

        <SkinPreview save={save} previewLabel={t.skins.preview} activeLabel={t.skins.previewActive} />
        <LocaleLink href={`/play/${save.lastPlayedLevelId ?? 'spring-01'}`} locale={locale} className="primary-action w-full justify-center">
          {save.lastPlayedLevelId ? t.nav.continue : t.nav.play}
        </LocaleLink>
        <p className="text-center text-sm leading-relaxed text-[var(--muted)]">
          {t.skins.intro}
        </p>
        {message ? <p className="rounded-xl bg-[#f4e5de] px-4 py-3 text-center text-sm text-[#8b2e22]">{message}</p> : null}

        <SkinSection title={t.skins.wolfSets}>
          {SKIN_CATALOG.filter((skin) => skin.kind === 'wolf_set').map((skin) => {
            const unlocked = isSkinUnlocked(save, skin)
            const equipped = save.equipped.wolfSetId === skin.id
            return <SkinCard key={skin.id} name={skinDisplayName(skin, locale)} preview={[skin.assets.wolf, skin.assets.sheep]} unlocked={unlocked} equipped={equipped} unlockText={skinUnlockText(skin, locale, t.skins)} progressText={skinProgressText(save, skin, t.skins)} purchasable={skin.unlock.type === 'cost'} onEquip={() => equip(skin.id)} onUnlock={() => unlock(skin.id)} labels={t.skins} />
          })}
        </SkinSection>

        <SkinSection title={t.skins.boards}>
          {SKIN_CATALOG.filter((skin) => skin.kind === 'board').map((skin) => {
            const unlocked = isSkinUnlocked(save, skin)
            const equipped = save.equipped.boardId === skin.id
            return <SkinCard key={skin.id} name={skinDisplayName(skin, locale)} preview={[skin.assets.boardBg]} unlocked={unlocked} equipped={equipped} unlockText={skinUnlockText(skin, locale, t.skins)} progressText={skinProgressText(save, skin, t.skins)} purchasable={skin.unlock.type === 'cost'} onEquip={() => equip(skin.id)} onUnlock={() => unlock(skin.id)} labels={t.skins} />
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

type SkinLabels = ReturnType<typeof useClientMessages>['t']['skins']

function skinUnlockText(skin: SkinCatalogItem, locale: 'en' | 'zh', labels: SkinLabels): string {
  if (skin.unlock.type === 'default') return labels.unlocked
  if (skin.unlock.type === 'chapter') return labels.chapterUnlock
  if (skin.kind === 'wolf_set') return fmt(labels.universalCost, { n: skin.unlock.universal })
  const season = locale === 'zh' ? CHAPTER_LABEL[skin.unlock.season] : CHAPTER_LABEL_EN[skin.unlock.season]
  return fmt(labels.seasonCost, { n: skin.unlock.amount, season })
}

function skinProgressText(save: SaveGame, skin: SkinCatalogItem, labels: SkinLabels): string | null {
  if (skin.unlock.type !== 'cost') return null
  const current = skin.kind === 'wolf_set'
    ? save.fragments.universal
    : (save.fragments.season[skin.unlock.season] ?? 0)
  const cost = skin.kind === 'wolf_set' ? skin.unlock.universal : skin.unlock.amount
  const state = current >= cost ? labels.readyUnlock : fmt(labels.remaining, { n: cost - current })
  return `${fmt(labels.costProgress, { current, cost })} · ${state}`
}

function SkinCard({ name, preview, unlocked, equipped, unlockText, progressText, purchasable, onEquip, onUnlock, labels }: { name: string; preview: string[]; unlocked: boolean; equipped: boolean; unlockText: string; progressText: string | null; purchasable: boolean; onEquip: () => void; onUnlock: () => void; labels: SkinLabels }) {
  return <div className="paper-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-16 w-28 shrink-0 items-center justify-center gap-1 rounded-xl border border-[var(--line)] bg-[#e8eee2] p-2">{preview.map((src, index) => <Image key={src} src={src} alt={`${name} ${index + 1}`} width={48} height={48} className="h-12 w-12 object-contain" unoptimized />)}</div>
      <div className="min-w-0"><p className="font-bold text-[var(--ink)]">{name}</p><p className="mt-1 text-xs text-[var(--muted)]">{equipped ? labels.equipped : unlocked ? labels.unlocked : unlockText}</p>{!unlocked && progressText ? <p className="mt-1 text-xs font-medium text-[var(--ink)]">{progressText}</p> : null}</div>
    </div>
    {!equipped && (unlocked ? <button type="button" className="quiet-action min-h-10 px-3 text-xs sm:ml-auto" onClick={onEquip}>{labels.equip}</button> : purchasable ? <button type="button" className="primary-action min-h-10 px-3 text-xs sm:ml-auto" onClick={onUnlock}>{labels.unlock}</button> : null)}
  </div>
}
