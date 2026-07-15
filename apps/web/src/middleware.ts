import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
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

export const config = {
  matcher: ['/admin/:path*'],
}
