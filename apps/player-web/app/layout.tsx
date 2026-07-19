import type { Metadata } from 'next'
import { Literata, Nunito_Sans } from 'next/font/google'
import { getT } from '@/i18n/get-locale'
import '../../../packages/web-shared/styles/globals.css'
import { RecoveryNotice } from '@/components/RecoveryNotice'

const display = Literata({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const sans = Nunito_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5001'

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getT()
  const canonicalPath = locale === 'zh' ? '/zh' : '/'
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: canonicalPath, languages: { en: '/', zh: '/zh', 'x-default': '/' } },
    openGraph: {
      title: t.meta.title,
      description: t.meta.og,
      url: canonicalPath,
      siteName: 'Fangrush',
      type: 'website',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Fangrush' }],
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getT()
  return (
    <html lang={locale === 'zh' ? 'zh-CN' : 'en'} className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh font-sans antialiased"><RecoveryNotice />{children}</body>
    </html>
  )
}
