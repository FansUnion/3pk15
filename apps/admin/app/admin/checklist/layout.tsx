import type { Metadata } from 'next'

export const metadata: Metadata = { title: '上线检查' }

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return children
}
