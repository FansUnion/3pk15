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
import { playSfx } from '@/lib/sfx'

export default function SkinsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [message, setMessage] = useState('')
  const [previewSkinId, setPreviewSkinId] = useState<string>()
  const { locale, t } = useClientMessages()

  useEffect(() => hydrate(), [hydrate])

  function equip(id: string) {
    const result = equipSkin(save, id)
    if (result.ok) {
      replace(result.save)
      if (!save.settings.muted) playSfx('equip')
    }
  }

  function unlock(id: string) {
    const result = unlockSkinWithCost(save, id)
    if (result.ok) {
      replace(result.save)
      setMessage(t.skins.unlockSuccess)
      if (!save.settings.muted) playSfx('unlock')
    } else {
      setMessage(result.error.startsWith('insufficient') ? t.skins.insufficient : t.skins.unavailable)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="page-shell flex flex-1 flex-col gap-6 py-8">
        <header className="grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <LocaleLink href="/" locale={locale} className="quiet-action text-sm">{t.nav.home}</LocaleLink>
          <div className="text-center"><p className="eyebrow">{t.skins.eyebrow}</p><h1 className="display-title text-3xl">{t.skins.title}</h1></div>
          <div className="col-span-2 text-left text-xs text-[var(--muted)] sm:col-span-1 sm:text-right">
            <p className="font-bold">✦ {save.fragments.universal}</p>
            <p className="mt-1">{t.skins.seasonBalances}</p>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 sm:justify-end">
              {CHAPTER_ORDER.map((chapter) => (
                <span key={chapter}>{fmt(t.skins.seasonBalance, {
                  season: locale === 'zh' ? CHAPTER_LABEL[chapter] : CHAPTER_LABEL_EN[chapter],
                  n: save.fragments.season[chapter] ?? 0,
                })}</span>
              ))}
            </div>
          </div>
        </header>

        <SkinPreview save={save} previewLabel={t.skins.preview} activeLabel={t.skins.previewActive} previewSkinId={previewSkinId} />
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
            return <SkinCard key={skin.id} skin={skin} name={skinDisplayName(skin, locale)} unlocked={unlocked} equipped={equipped} previewing={previewSkinId === skin.id} unlockText={skinUnlockText(skin, locale, t.skins)} progressText={skinProgressText(save, skin, t.skins)} purchasable={skin.unlock.type === 'cost'} onPreview={() => setPreviewSkinId(skin.id)} onEquip={() => equip(skin.id)} onUnlock={() => unlock(skin.id)} labels={t.skins} />
          })}
        </SkinSection>

        <SkinSection title={t.skins.boards}>
          {SKIN_CATALOG.filter((skin) => skin.kind === 'board').map((skin) => {
            const unlocked = isSkinUnlocked(save, skin)
            const equipped = save.equipped.boardId === skin.id
            return <SkinCard key={skin.id} skin={skin} name={skinDisplayName(skin, locale)} unlocked={unlocked} equipped={equipped} previewing={previewSkinId === skin.id} unlockText={skinUnlockText(skin, locale, t.skins)} progressText={skinProgressText(save, skin, t.skins)} purchasable={skin.unlock.type === 'cost'} onPreview={() => setPreviewSkinId(skin.id)} onEquip={() => equip(skin.id)} onUnlock={() => unlock(skin.id)} labels={t.skins} />
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

function SkinCard({ skin, name, unlocked, equipped, previewing, unlockText, progressText, purchasable, onPreview, onEquip, onUnlock, labels }: { skin: SkinCatalogItem; name: string; unlocked: boolean; equipped: boolean; previewing: boolean; unlockText: string; progressText: string | null; purchasable: boolean; onPreview: () => void; onEquip: () => void; onUnlock: () => void; labels: SkinLabels }) {
  return <div className="paper-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onPreview} aria-label={`${labels.preview}: ${name}`} aria-pressed={previewing} className={`relative flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-[#e8eee2] ${previewing ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}>
        {skin.kind === 'wolf_set'
          ? <div className="flex items-end gap-1 p-2"><Image src={skin.assets.wolf} alt="" width={64} height={64} className="h-16 w-16 object-contain" unoptimized /><Image src={skin.assets.sheep} alt="" width={54} height={54} className="h-14 w-14 object-contain" unoptimized /></div>
          : <BoardThumbnail skin={skin} />}
      </button>
      <div className="min-w-0 break-words"><p className="font-bold text-[var(--ink)]">{name}</p><p className="mt-1 text-xs text-[var(--muted)]">{equipped ? labels.equipped : unlocked ? labels.unlocked : unlockText}</p>{!unlocked && progressText ? <p className="mt-1 text-xs font-medium text-[var(--ink)]">{progressText}</p> : null}</div>
    </div>
    {!equipped && (unlocked ? <button type="button" className="quiet-action min-h-10 px-3 text-xs sm:ml-auto" onClick={onEquip}>{labels.equip}</button> : purchasable ? <button type="button" className="primary-action min-h-10 px-3 text-xs sm:ml-auto" onClick={onUnlock}>{labels.unlock}</button> : null)}
  </div>
}

function BoardThumbnail({ skin }: { skin: Extract<SkinCatalogItem, { kind: 'board' }> }) {
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: skin.boardFill }}>
      <Image src={skin.assets.boardBg} alt="" fill className="object-cover" unoptimized />
      <div className="absolute inset-3 border border-current opacity-70" style={{ color: skin.lineStroke, backgroundImage: 'linear-gradient(to right, transparent 32%, currentColor 33%, transparent 34%, transparent 65%, currentColor 66%, transparent 67%), linear-gradient(to bottom, transparent 32%, currentColor 33%, transparent 34%, transparent 65%, currentColor 66%, transparent 67%)' }} />
      <Image src="/skins/default/wolf.svg" alt="" width={28} height={28} className="absolute bottom-3 left-3 h-7 w-7" unoptimized />
      <Image src="/skins/default/sheep.svg" alt="" width={24} height={24} className="absolute right-4 top-3 h-6 w-6" unoptimized />
    </div>
  )
}
