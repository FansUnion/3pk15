import type { MetadataRoute } from 'next'
import { buildSitemapEntries } from '@/lib/seo/build-sitemap-entries'

/** Flatten sitemap entries (canonical + hreflang alternates) for llms-full.txt. */
export function flattenSitemapEntriesToUrls(entries: MetadataRoute.Sitemap): string[] {
  const urls = new Set<string>()
  for (const entry of entries) {
    urls.add(entry.url)
    const langs = entry.alternates?.languages
    if (langs) {
      for (const u of Object.values(langs)) {
        if (u) urls.add(u)
      }
    }
  }
  return [...urls].sort()
}

export function listLlmsFullUrls(): string[] {
  return flattenSitemapEntriesToUrls(buildSitemapEntries())
}
