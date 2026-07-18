'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  setLocaleCookie,
  stripLocalePrefix,
  withLocalePath,
  type SupportedLocale,
  localeLabels,
  localeNavbarLabels,
} from '@/config/locales'
import { useMemo, useState, useRef, useEffect } from 'react'

export function LocaleSwitcher({
  locale,
  variant = 'navbar',
}: {
  locale: SupportedLocale
  variant?: 'navbar' | 'footer'
}) {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const switchTo = (next: SupportedLocale) => {
    if (next === locale) {
      setOpen(false)
      return
    }
    setLocaleCookie(next)
    const stripped =
      typeof window !== 'undefined'
        ? stripLocalePrefix(window.location.pathname)
        : stripLocalePrefix(pathname)
    const target = withLocalePath(stripped, next)
    const qs = typeof window !== 'undefined' ? window.location.search : ''
    window.location.assign(`${target}${qs}`)
  }

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen((v) => !v)}
        className={
          variant === 'navbar'
            ? 'inline-flex min-h-9 w-[6.5rem] items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[#2c3328] hover:bg-[#dfe8d8]/80 sm:w-[7rem]'
            : 'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#5c6b52] hover:bg-[#dfe8d8]/60'
        }
      >
        <span aria-hidden className="text-sm">
          🌐
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{localeNavbarLabels[locale]}</span>
        <span aria-hidden className="text-[10px] text-[#5c6b52]">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute right-0 z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] py-1 shadow-md"
        >
          {(['en', 'zh'] as SupportedLocale[]).map((loc) => (
            <li key={loc} role="none">
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm text-[#2c3328] hover:bg-[#dfe8d8]"
                onClick={() => switchTo(loc)}
              >
                <span>{localeLabels[loc]}</span>
                {loc === locale ? <span className="text-[#3d4a3a]">✓</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function LocaleLink({
  href,
  locale,
  className,
  children,
}: {
  href: string
  locale: SupportedLocale
  className?: string
  children: React.ReactNode
}) {
  const target = useMemo(() => withLocalePath(href, locale), [href, locale])
  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  )
}
