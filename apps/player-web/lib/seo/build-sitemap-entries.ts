import type { MetadataRoute } from 'next'
import { LEVELS } from '@wolf-sheep/game-core'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fangrush.com'

const EN_PATHS = ['/', '/how-to-play', '/chapters', '/skins', '/privacy'] as const
const CHAPTERS = ['spring', 'summer', 'autumn', 'winter'] as const

function pushPair(entries: MetadataRoute.Sitemap, path: string) {
  const enUrl = `${siteUrl}${path === '/' ? '' : path}`
  const zhUrl = `${siteUrl}${path === '/' ? '/zh' : `/zh${path}`}`
  entries.push({
    url: enUrl,
    lastModified: new Date(),
    alternates: {
      languages: {
        en: enUrl,
        zh: zhUrl,
      },
    },
  })
  entries.push({
    url: zhUrl,
    lastModified: new Date(),
  })
}

/** URL SSOT for sitemap.xml and llms-full.txt. */
export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  for (const path of EN_PATHS) {
    pushPair(entries, path)
  }
  for (const id of CHAPTERS) {
    pushPair(entries, `/levels/${id}`)
  }
  for (const level of LEVELS) {
    pushPair(entries, `/hunt/${level.id}`)
  }
  return entries
}
