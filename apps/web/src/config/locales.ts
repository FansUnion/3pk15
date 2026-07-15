/**
 * Locale SSOT — aligned with Levelmere as-needed (en unprefixed, zh under /zh).
 */
export const supportedLocales = ['en', 'zh'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const defaultLocale: SupportedLocale = 'en'

export const localeLabels: Record<SupportedLocale, string> = {
  en: 'English',
  zh: '简体中文',
}

export const localeNavbarLabels: Record<SupportedLocale, string> = {
  en: 'English',
  zh: '中文',
}

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(value)
}

export function stripLocalePrefix(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const segments = normalized.split('/').filter(Boolean)
  if (segments[0] === 'zh') {
    const rest = segments.slice(1).join('/')
    return rest ? `/${rest}` : '/'
  }
  return normalized
}

export function withLocalePath(path: string, locale: SupportedLocale = defaultLocale): string {
  const stripped = stripLocalePrefix(path)
  const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`
  if (locale === defaultLocale) return normalized
  if (normalized === '/') return '/zh'
  return `/zh${normalized}`
}

function localePrefix2(tag: string): string {
  return tag.split('-')[0]?.toLowerCase() ?? ''
}

/** Cookie wins; else only zh* → zh; everything else → en. */
export function getLocaleFromHeaders(
  cookie: string | null | undefined,
  acceptLanguage: string | null | undefined,
): SupportedLocale {
  if (cookie && isSupportedLocale(cookie.trim())) {
    return cookie.trim() as SupportedLocale
  }
  if (acceptLanguage) {
    const tags = acceptLanguage.split(',').map((t) => t.split(';')[0]?.trim() ?? '')
    for (const tag of tags) {
      if (localePrefix2(tag) === 'zh') return 'zh'
    }
  }
  return defaultLocale
}

export function setLocaleCookie(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365
  if (locale === defaultLocale) {
    document.cookie = `${LOCALE_COOKIE}=en;path=/;max-age=${maxAge};SameSite=Lax`
    return
  }
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};SameSite=Lax`
}
