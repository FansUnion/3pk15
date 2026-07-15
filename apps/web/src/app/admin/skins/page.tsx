'use client'

import { useEffect, useState } from 'react'
import { SKIN_CATALOG, validateSkinCatalog } from '@wolf-sheep/game-core'

export default function AdminSkinsPage() {
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

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">皮肤台</h1>
      {catalogErrors.length > 0 && (
        <ul className="mt-2 text-sm text-red-700">
          {catalogErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#5c6b52]/30 text-[#5c6b52]">
              <th className="py-2 pr-3">id</th>
              <th className="py-2 pr-3">kind</th>
              <th className="py-2 pr-3">unlock</th>
              <th className="py-2">资源</th>
            </tr>
          </thead>
          <tbody>
            {SKIN_CATALOG.map((s) => {
              const ok =
                s.kind === 'wolf_set'
                  ? assetOk[`${s.id}:wolf`] !== false && assetOk[`${s.id}:sheep`] !== false
                  : assetOk[`${s.id}:board`] !== false
              return (
                <tr
                  key={s.id}
                  className={`cursor-pointer border-b border-[#5c6b52]/15 ${
                    selected === s.id ? 'bg-[#dfe8d8]' : ''
                  }`}
                  onClick={() => setSelected(s.id)}
                >
                  <td className="py-2 pr-3 font-medium">{s.id}</td>
                  <td className="py-2 pr-3">{s.kind}</td>
                  <td className="py-2 pr-3">{JSON.stringify(s.unlock)}</td>
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

      {skin && (
        <div className="mt-6 flex flex-wrap gap-6 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
          {skin.kind === 'wolf_set' ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={skin.assets.wolf} alt="wolf" className="h-24 w-24" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={skin.assets.sheep} alt="sheep" className="h-24 w-24" />
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={skin.assets.boardBg} alt="board" className="h-24 w-24" />
          )}
          <div>
            <p className="font-medium">{skin.name}</p>
            <p className="mt-1 text-xs text-[#7a8574]">{skin.id}</p>
          </div>
        </div>
      )}
    </main>
  )
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}
