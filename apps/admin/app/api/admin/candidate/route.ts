import { NextResponse, type NextRequest } from 'next/server'
import {
  assessLevelCandidate,
  getLevel,
  type LevelConfig,
} from '@wolf-sheep/game-core'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const denied = checkAdminAccess(request)
  if (denied) return denied

  try {
    const body = await request.json() as { baseLevelId?: unknown; candidate?: unknown }
    if (typeof body.baseLevelId !== 'string' || !body.candidate || typeof body.candidate !== 'object' || Array.isArray(body.candidate)) {
      return NextResponse.json({ ok: false, error: 'baseLevelId and candidate object are required' }, { status: 400 })
    }
    const base = getLevel(body.baseLevelId)
    if (!base) return NextResponse.json({ ok: false, error: 'base level not found' }, { status: 404 })

    const candidate = { ...base, ...(body.candidate as Partial<LevelConfig>) } as LevelConfig
    const report = assessLevelCandidate(candidate)
    return NextResponse.json({ ok: true, candidate, report })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'candidate assessment failed' }, { status: 400 })
  }
}

function checkAdminAccess(request: NextRequest): NextResponse | null {
  if (process.env.ADMIN_ENABLED !== 'true' || (process.env.NEXT_PUBLIC_APP_SHELL ?? 'standalone') === 'portal') {
    return NextResponse.json({ ok: false, error: 'admin disabled' }, { status: 404 })
  }
  const key = process.env.ADMIN_ACCESS_KEY
  if (key && request.cookies.get('ws_admin_gate')?.value !== '1') {
    return NextResponse.json({ ok: false, error: 'admin access required' }, { status: 401 })
  }
  return null
}
