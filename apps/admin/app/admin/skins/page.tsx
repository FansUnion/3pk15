'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CHAPTER_LABEL,
  SKIN_CATALOG,
  validateSkinCatalog,
  type BoardSkin,
  type SkinCatalogItem,
  type WolfSetSkin,
} from '@wolf-sheep/game-core'
import { SkinBoardPreview } from '../../../components/SkinBoardPreview'

export default function AdminSkinsPage() {
  const wolfSets = useMemo(
    () => SKIN_CATALOG.filter((s): s is WolfSetSkin => s.kind === 'wolf_set'),
    [],
  )
  const boards = useMemo(
    () => SKIN_CATALOG.filter((s): s is BoardSkin => s.kind === 'board'),
    [],
  )

  const [previewWolfId, setPreviewWolfId] = useState(wolfSets[0]?.id ?? 'wolf-default')
  const [previewBoardId, setPreviewBoardId] = useState(boards[0]?.id ?? 'board-default')
  const [selected, setSelected] = useState(SKIN_CATALOG[0]?.id ?? '')
  const [assetOk, setAssetOk] = useState<Record<string, boolean>>({})
  const catalogErrors = validateSkinCatalog()
  const skin = SKIN_CATALOG.find((s) => s.id === selected)

  useEffect(() => {
    void (async () => {
      const map: Record<string, boolean> = {}
      for (const s of SKIN_CATALOG) {
        if (s.kind === 'wolf_set') {
          map[`${s.id}:wolf`] = await headOk(s.assets.wolf)
          map[`${s.id}:sheep`] = await headOk(s.assets.sheep)
        } else {
          map[`${s.id}:board`] = await headOk(s.assets.boardBg)
        }
      }
      setAssetOk(map)
    })()
  }, [])

  function selectRow(id: string) {
    setSelected(id)
    const item = SKIN_CATALOG.find((s) => s.id === id)
    if (!item) return
    if (item.kind === 'wolf_set') setPreviewWolfId(item.id)
    else setPreviewBoardId(item.id)
  }

  return (
    <main className="mx-auto max-w-6xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">皮肤台</h1>
      <p className="mt-1 text-sm text-[#5c6b52]">
        身份感与投放验收：图鉴资源 = 对局叠盘。只读 Catalog，不写回。
      </p>
      <p className="mt-1 text-xs text-[#7a8574]">
        <Link href="/admin/economy" className="underline">
          经济台
        </Link>
        {' · '}
        <a href="https://fangrush.com/skins" target="_blank" rel="noreferrer" className="underline">
          玩家图鉴 fangrush.com/skins
        </a>
      </p>
      {catalogErrors.length > 0 && (
        <ul className="mt-2 text-sm text-red-700">
          {catalogErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(280px,380px)]">
        <div className="flex flex-col gap-6">
          <SkinGroup
            title="狼羊套装"
            items={wolfSets}
            selected={selected}
            assetOk={assetOk}
            onSelect={selectRow}
          />
          <SkinGroup
            title="棋盘"
            items={boards}
            selected={selected}
            assetOk={assetOk}
            onSelect={selectRow}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-3 text-sm">
            <p className="font-medium text-[#2c3328]">叠盘混看（独立双选）</p>
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex flex-col gap-1 text-xs text-[#5c6b52]">
                狼羊套
                <select
                  value={previewWolfId}
                  onChange={(e) => {
                    setPreviewWolfId(e.target.value)
                    setSelected(e.target.value)
                  }}
                  className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1 text-sm text-[#2c3328]"
                >
                  {wolfSets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[#5c6b52]">
                棋盘
                <select
                  value={previewBoardId}
                  onChange={(e) => {
                    setPreviewBoardId(e.target.value)
                    setSelected(e.target.value)
                  }}
                  className="rounded border border-[#5c6b52]/40 bg-white px-2 py-1 text-sm text-[#2c3328]"
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <SkinBoardPreview wolfSetId={previewWolfId} boardId={previewBoardId} />
          {skin && <DeployCard skin={skin} assetOk={assetOk} />}
        </div>
      </div>
    </main>
  )
}

function SkinGroup({
  title,
  items,
  selected,
  assetOk,
  onSelect,
}: {
  title: string
  items: SkinCatalogItem[]
  selected: string
  assetOk: Record<string, boolean>
  onSelect: (id: string) => void
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-[#5c6b52]">{title}</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#5c6b52]/30 text-[#5c6b52]">
              <th className="py-2 pr-2">名称</th>
              <th className="py-2 pr-2">id</th>
              <th className="py-2 pr-2">解锁</th>
              <th className="py-2 pr-2">路径</th>
              <th className="py-2">资源</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => {
              const ok = assetsOk(s, assetOk)
              const paths = assetPaths(s)
              return (
                <tr
                  key={s.id}
                  className={`cursor-pointer border-b border-[#5c6b52]/15 ${
                    selected === s.id ? 'bg-[#dfe8d8]' : ''
                  }`}
                  onClick={() => onSelect(s.id)}
                >
                  <td className="py-2 pr-2 font-medium">{s.name}</td>
                  <td className="py-2 pr-2 font-mono text-xs">{s.id}</td>
                  <td className="py-2 pr-2">{formatUnlock(s)}</td>
                  <td
                    className="max-w-[180px] truncate py-2 pr-2 font-mono text-xs text-[#7a8574]"
                    title={paths}
                  >
                    {paths}
                  </td>
                  <td className="py-2">
                    <span className={ok ? 'text-green-700' : 'text-red-700'}>
                      {ok ? 'OK' : '缺文件'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function DeployCard({
  skin,
  assetOk,
}: {
  skin: SkinCatalogItem
  assetOk: Record<string, boolean>
}) {
  const ok = assetsOk(skin, assetOk)
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
      <p className="font-medium text-[#2c3328]">投放卡片</p>
      <dl className="mt-3 space-y-2 text-[#5c6b52]">
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-70">显示名</dt>
          <dd className="text-[#2c3328]">{skin.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-70">解锁条件</dt>
          <dd className="text-[#2c3328]">{formatUnlock(skin)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-70">估价提示</dt>
          <dd>{pricingHint(skin)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-70">资源</dt>
          <dd className={ok ? 'text-green-700' : 'text-red-700'}>
            {ok ? 'HEAD 全部可用' : '有路径 404，上线前补齐'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-70">路径</dt>
          <dd className="break-all font-mono text-xs">{assetPaths(skin)}</dd>
        </div>
      </dl>
    </div>
  )
}

function formatUnlock(s: SkinCatalogItem): string {
  if (s.unlock.type === 'default') return '默认解锁'
  if (s.unlock.type === 'chapter') return `通关章节 · ${CHAPTER_LABEL[s.unlock.chapterId]}`
  if (s.kind === 'wolf_set') {
    if (s.unlock.type === 'cost') return `通用碎片 × ${s.unlock.universal}`
  } else if (s.unlock.type === 'cost') {
    return `${CHAPTER_LABEL[s.unlock.season]}碎片 × ${s.unlock.amount}`
  }
  return JSON.stringify(s.unlock)
}

function pricingHint(s: SkinCatalogItem): string {
  if (s.unlock.type === 'default') return '免费默认皮 — 身份感基线'
  if (s.unlock.type === 'chapter') return '章节奖励 — 驱动通关四季'
  if (s.kind === 'wolf_set' && s.unlock.type === 'cost') {
    return `通用 × ${s.unlock.universal} — 详算见经济台`
  }
  if (s.kind === 'board' && s.unlock.type === 'cost') {
    return `季节碎片门槛 — 刷 ${CHAPTER_LABEL[s.unlock.season]} · 见经济台`
  }
  return '—'
}

function assetPaths(s: SkinCatalogItem): string {
  if (s.kind === 'wolf_set') return `${s.assets.wolf} · ${s.assets.sheep}`
  return s.assets.boardBg
}

function assetsOk(s: SkinCatalogItem, assetOk: Record<string, boolean>): boolean {
  if (s.kind === 'wolf_set') {
    return assetOk[`${s.id}:wolf`] !== false && assetOk[`${s.id}:sheep`] !== false
  }
  return assetOk[`${s.id}:board`] !== false
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}
