'use client'

import { usePathname } from 'next/navigation'
import type { SupportedLocale } from '@/config/locales'
import { getMessages, type MessageTree } from '@/i18n/messages'

export function useClientLocale(): SupportedLocale {
  const pathname = usePathname() || '/'
  return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en'
}

export function useClientMessages(): { locale: SupportedLocale; t: MessageTree } {
  const locale = useClientLocale()
  return { locale, t: getMessages(locale) }
}
