import type { Metadata } from 'next'

export const metadata: Metadata = { title: '后台登录' }

export default function GateLayout({ children }: { children: React.ReactNode }) {
  return children
}
