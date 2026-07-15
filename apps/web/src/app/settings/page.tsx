'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSaveStore } from '@/lib/save-store'

export default function SettingsPage() {
  const save = useSaveStore((s) => s.save)
  const replace = useSaveStore((s) => s.replace)
  const hydrate = useSaveStore((s) => s.hydrate)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const muted = save.settings?.muted ?? false

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[#5c6b52] hover:underline">
          首页
        </Link>
        <h1 className="font-serif text-2xl text-[#2c3328]">设置</h1>
        <span className="w-10" />
      </header>

      <label className="flex items-center justify-between rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-3">
        <span>静音</span>
        <input
          type="checkbox"
          checked={muted}
          onChange={(e) => {
            const current = useSaveStore.getState().save
            replace({
              ...current,
              settings: { ...current.settings, muted: e.target.checked },
            })
          }}
        />
      </label>

      <button
        type="button"
        onClick={() => setShowHelp(true)}
        className="rounded-lg bg-[#3d4a3a] px-4 py-3 text-left text-[#f4f1ea]"
      >
        玩法说明
      </button>

      <Link
        href="/privacy"
        className="rounded-lg border border-[#5c6b52]/40 px-4 py-3 text-[#2c3328]"
      >
        隐私说明
      </Link>

      {showHelp && (
        <div className="rounded-lg border border-[#5c6b52]/30 bg-[#f7f5ef] p-4 text-sm leading-relaxed text-[#2c3328]">
          <p className="font-medium font-serif">Fangrush · 三狼连猎</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#5c6b52]">
            <li>操控 3 狼，隔空吃绵羊；吃满 8 只获胜。</li>
            <li>横竖走一格；隔空吃为「狼—空—羊」同线，狼移到羊位。</li>
            <li>连吃最多 5 次，可主动结束连吃。</li>
            <li>羊由电脑走，不能往第 1 行退，不吃子。</li>
            <li>三狼皆无合法步则失败。岩石不可落子。</li>
          </ul>
          <button
            type="button"
            className="mt-3 text-sm text-[#5c6b52] underline"
            onClick={() => setShowHelp(false)}
          >
            关闭
          </button>
        </div>
      )}
    </main>
  )
}
