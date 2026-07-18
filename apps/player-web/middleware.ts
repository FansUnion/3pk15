import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getLocaleFromHeaders,
  LOCALE_COOKIE,
  stripLocalePrefix,
  withLocalePath,
  type SupportedLocale,
} from './config/locales'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  const preferred = getLocaleFromHeaders(cookie, request.headers.get('accept-language'))
  const hasZhPrefix = pathname === '/zh' || pathname.startsWith('/zh/')
  const stripped = stripLocalePrefix(pathname)

  if (hasZhPrefix) {
    if (preferred === 'en' && cookie === 'en') {
      const url = request.nextUrl.clone()
      url.pathname = stripped
      return NextResponse.redirect(url)
    }
    const headers = new Headers(request.headers)
    headers.set('x-locale', 'zh')
    const url = request.nextUrl.clone()
    url.pathname = stripped
    const response = NextResponse.rewrite(url, { request: { headers } })
    if (cookie !== 'zh') response.cookies.set(LOCALE_COOKIE, 'zh', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    return response
  }

  if (preferred === 'zh') {
    const url = request.nextUrl.clone()
    url.pathname = withLocalePath(pathname, 'zh')
    return NextResponse.redirect(url)
  }

  const headers = new Headers(request.headers)
  headers.set('x-locale', 'en' satisfies SupportedLocale)
  return NextResponse.next({ request: { headers } })
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] }
