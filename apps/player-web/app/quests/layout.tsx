import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function QuestsLayout({ children }: { children: React.ReactNode }) {
  return children
}
