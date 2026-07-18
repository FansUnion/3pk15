import { NextResponse } from 'next/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fangrush.com'

function url(path: string): string {
  return `${siteUrl}${path === '/' ? '' : path}`
}

export async function GET() {
  const lines = [
    '# Fangrush',
    '',
    '> Browser strategy board game: three wolves hunt sheep on a grid with gap-rush chain captures. Short sessions, local save, no forced account.',
    '',
    'Fangrush (三狼连猎) is an original abstract strategy game you play in the browser. Control three wolves, use gap-rush rules to chain-capture sheep, and progress through seasonal chapters.',
    '',
    '## Product',
    `- [Home](${url('/')}): Play Fangrush in the browser.`,
    `- [How to play](${url('/how-to-play')}): Rules and beginner guide.`,
    `- [Chapters](${url('/chapters')}): Seasonal difficulty chapters.`,
    `- [Skins](${url('/skins')}): Board and piece skins.`,
    `- [Privacy](${url('/privacy')}): Privacy policy.`,
    '',
    '## Localized entry points',
    `- [zh home](${url('/zh')}): Chinese landing page.`,
    `- [zh how to play](${url('/zh/how-to-play')}): Chinese rules page.`,
    `- [zh chapters](${url('/zh/chapters')}): Chinese chapters page.`,
    `- [zh privacy](${url('/zh/privacy')}): Chinese privacy policy.`,
    '',
    '## Full URL index',
    `- [llms-full.txt](${siteUrl}/llms-full.txt): Complete list of indexable URLs.`,
    '',
  ]

  return new NextResponse(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
