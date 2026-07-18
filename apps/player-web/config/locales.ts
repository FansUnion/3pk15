export {
  defaultLocale,
  getLocaleFromHeaders,
  isSupportedLocale,
  LOCALE_COOKIE,
  localeLabels,
  localeNavbarLabels,
  stripLocalePrefix,
  supportedLocales,
  withLocalePath,
  type SupportedLocale,
} from '@wolf-sheep/web-shared'

import { defaultLocale, LOCALE_COOKIE, type SupportedLocale } from '@wolf-sheep/web-shared'

export function setLocaleCookie(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${LOCALE_COOKIE}=${locale === defaultLocale ? 'en' : locale};path=/;max-age=${maxAge};SameSite=Lax`
}
