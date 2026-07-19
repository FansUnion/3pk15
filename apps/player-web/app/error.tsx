'use client'

import { useEffect } from 'react'
import { LocaleLink } from '@/components/LocaleSwitcher'
import { useClientMessages } from '@/i18n/use-client-locale'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale, t } = useClientMessages()
  useEffect(() => { console.error(error) }, [error])
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="eyebrow">Fangrush</p>
      <h1 className="font-serif text-3xl text-[var(--ink)]">{locale === 'zh' ? '本次加载没有完成' : 'This screen did not finish loading'}</h1>
      <p className="text-sm leading-relaxed text-[var(--muted)]">{locale === 'zh' ? '你的本地进度不会因此被清除。可以重试，或先返回关卡列表。' : 'Your local progress is not cleared by this error. Try again or return to the hunt list.'}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="primary-action">{locale === 'zh' ? '重试' : 'Try again'}</button>
        <LocaleLink href="/chapters" locale={locale} className="quiet-action">{t.nav.chapters}</LocaleLink>
      </div>
    </main>
  )
}
