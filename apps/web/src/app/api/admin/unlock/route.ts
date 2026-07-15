import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const expected = process.env.ADMIN_ACCESS_KEY ?? ''
  if (!expected) {
    return NextResponse.json({ ok: true })
  }
  let body: { key?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 })
  }
  if (body.key !== expected) {
    return NextResponse.json({ ok: false, error: 'wrong key' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ws_admin_gate', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ws_admin_gate', '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
