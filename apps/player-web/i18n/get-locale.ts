import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  getLocaleFromHeaders,
  LOCALE_COOKIE,
  type SupportedLocale,
} from '@/config/locales'
import { getMessages, type MessageTree } from '@/i18n/messages'

export async function getRequestLocale(): Promise<SupportedLocale> {
  if (process.env.NEXT_PUBLIC_APP_SHELL === 'portal') return 'en'
  const h = await headers()
  const fromMw = h.get('x-locale')
  if (fromMw === 'en' || fromMw === 'zh') return fromMw
  const jar = await cookies()
  const cookie = jar.get(LOCALE_COOKIE)?.value
  return getLocaleFromHeaders(cookie, h.get('accept-language'))
}

export async function getT(): Promise<{ locale: SupportedLocale; t: MessageTree }> {
  const locale = await getRequestLocale()
  return { locale, t: getMessages(locale) }
}

export { defaultLocale }
