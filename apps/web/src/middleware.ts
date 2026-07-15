import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getLocaleFromHeaders,
  LOCALE_COOKIE,
  stripLocalePrefix,
  withLocalePath,
  type SupportedLocale,
} from '@/config/locales'

function handleAdmin(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/zh/admin')) {
    return null
  }

  // Normalize /zh/admin → /admin (admin is English-only, unprefixed)
  if (pathname.startsWith('/zh/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/zh/, '') || '/admin'
    return NextResponse.redirect(url)
  }

  const shell = process.env.NEXT_PUBLIC_APP_SHELL ?? 'standalone'
  const enabled = process.env.ADMIN_ENABLED === 'true'
  if (shell === 'portal' || !enabled) {
    return NextResponse.rewrite(new URL('/not-found-admin', request.url))
  }

  const key = process.env.ADMIN_ACCESS_KEY
  if (key && key.length > 0) {
    const unlocked = request.cookies.get('ws_admin_gate')?.value === '1'
    if (!unlocked && !pathname.startsWith('/admin/gate')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/gate'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export function middleware(request: NextRequest) {
  const admin = handleAdmin(request)
  if (admin) return admin

  const { pathname } = request.nextUrl

  // Skip Next internals already excluded by matcher; also skip llm/sitemap handled as routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
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
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', 'zh')
    const url = request.nextUrl.clone()
    url.pathname = stripped
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    if (cookie !== 'zh') {
      res.cookies.set(LOCALE_COOKIE, 'zh', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    }
    return res
  }

  // English (unprefixed) path
  if (preferred === 'zh') {
    const url = request.nextUrl.clone()
    url.pathname = withLocalePath(pathname, 'zh')
    return NextResponse.redirect(url)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', 'en' satisfies SupportedLocale)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
