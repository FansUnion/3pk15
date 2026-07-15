import type { Metadata } from 'next'
import { Literata, Nunito_Sans } from 'next/font/google'
import './globals.css'

const display = Literata({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Fangrush · 三狼连猎',
  description: 'Command 3 wolves. Gap-rush the flock in chains — seasonal hunts on a 6×6 board.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  )
}
