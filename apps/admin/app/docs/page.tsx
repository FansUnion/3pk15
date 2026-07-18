'use client'

import { useState } from 'react'
import { getMessages } from '@/i18n/messages'

export default function AdminDocsPage() {
  const [locale, setLocale] = useState<'en' | 'zh'>('zh')
  const t = getMessages(locale)
  const h = t.howTo
  const [devOpen, setDevOpen] = useState(true)

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">玩法说明</h1>
      <p className="mt-1 text-sm text-[#5c6b52]">
        与玩家 <code className="rounded bg-[#dfe8d8] px-1">/how-to-play</code> 同源（i18n messages），避免两套真理。
      </p>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          type="button"
          className={`rounded border px-3 py-1 ${
            locale === 'en' ? 'border-[#3d4a3a] bg-[#dfe8d8]' : 'border-[#5c6b52]/30 bg-[#f7f5ef]'
          }`}
          onClick={() => setLocale('en')}
        >
          EN（默认站）
        </button>
        <button
          type="button"
          className={`rounded border px-3 py-1 ${
            locale === 'zh' ? 'border-[#3d4a3a] bg-[#dfe8d8]' : 'border-[#5c6b52]/30 bg-[#f7f5ef]'
          }`}
          onClick={() => setLocale('zh')}
        >
          中文 /zh
        </button>
        <a
          href={locale === 'zh' ? '/zh/how-to-play' : '/how-to-play'}
          target="_blank"
          rel="noreferrer"
          className="ml-auto self-center text-[#3d4a3a] underline"
        >
          打开玩家页
        </a>
      </div>

      <div className="mt-6 space-y-4">
        <header className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
          <h2 className="font-serif text-xl text-[#2c3328]">{h.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5c6b52]">{h.intro}</p>
        </header>

        {(
          [
            [h.winTitle, h.winBody],
            [h.moveTitle, h.moveBody],
            [h.chainTitle, h.chainBody],
            [h.sheepTitle, h.sheepBody],
            [h.rocksTitle, h.rocksBody],
            [h.saveTitle, h.saveBody],
          ] as const
        ).map(([title, body]) => (
          <section key={title} className="rounded-lg border border-[#5c6b52]/20 bg-[#f7f5ef] p-4">
            <h3 className="font-serif text-lg text-[#2c3328]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5c6b52]">{body}</p>
          </section>
        ))}

        <section className="rounded-lg border border-[#5c6b52]/20 bg-[#f7f5ef] p-4">
          <h3 className="font-serif text-lg text-[#2c3328]">{h.faqTitle}</h3>
          <dl className="mt-3 space-y-3 text-sm">
            {t.home.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-medium text-[#2c3328]">{item.q}</dt>
                <dd className="mt-1 text-[#5c6b52]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <details
        open={devOpen}
        onToggle={(e) => setDevOpen((e.target as HTMLDetailsElement).open)}
        className="mt-8 rounded-lg border border-dashed border-[#5c6b52]/40 bg-[#eef2ea] p-4 text-sm"
      >
        <summary className="cursor-pointer font-medium text-[#2c3328]">开发者注（不进玩家页）</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[#5c6b52]">
          <li>坐标系：(行 1–6, 列 1–6)；交点制。</li>
          <li>章节 AI：春 easy / 夏秋 normal / 冬 hard；章内关卡不换档。</li>
          <li>吃子几何：隔空吃「狼—空—羊」，与 game-core 规则一致。</li>
          <li>文案源：apps/player-web/i18n/messages.ts → howTo / home.faq</li>
        </ul>
      </details>
    </main>
  )
}
