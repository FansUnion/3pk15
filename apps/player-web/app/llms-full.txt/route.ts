import { NextResponse } from 'next/server'
import { listLlmsFullUrls } from '@/lib/seo/list-llms-full-urls'

export async function GET() {
  const urls = listLlmsFullUrls()
  return new NextResponse(`${urls.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
