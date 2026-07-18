import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (process.env.ADMIN_ENABLED !== 'true') return NextResponse.rewrite(new URL('/not-found-admin', request.url))
  const key = process.env.ADMIN_ACCESS_KEY
  const isUnlockRoute = request.nextUrl.pathname === '/api/admin/unlock'
  if (!key && !request.nextUrl.pathname.endsWith('/gate')) {
    return NextResponse.rewrite(new URL('/not-found-admin', request.url))
  }
  if (key && !isUnlockRoute && request.cookies.get('ws_admin_gate')?.value !== '1' && !request.nextUrl.pathname.endsWith('/gate')) {
    const url = request.nextUrl.clone()
    url.pathname = '/gate'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] }
