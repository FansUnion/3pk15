import type { Metadata } from 'next'

export const metadata: Metadata = { title: '玩法说明' }

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
