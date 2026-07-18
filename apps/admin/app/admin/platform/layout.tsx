import type { Metadata } from 'next'

export const metadata: Metadata = { title: '平台实验' }

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children
}
