import Link from 'next/link'
import { AdminLogout } from '../components/AdminLogout'
import '../../../packages/web-shared/styles/globals.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [['/admin/skins', '皮肤'], ['/admin/levels', '关卡'], ['/admin/ai', 'AI'], ['/admin/docs', '说明'], ['/admin/economy', '经济'], ['/admin/checklist', '清单'], ['/admin/platform', '平台']]
  return (
    <div className="min-h-dvh bg-[#eef2ea]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#5c6b52]/20 bg-[#f7f5ef] px-4 py-3 text-sm">
        <Link href="/admin" className="font-serif text-base text-[#2c3328]">Admin</Link>
        <nav className="order-3 flex w-full flex-wrap gap-3 text-[#5c6b52] sm:order-none sm:w-auto">
          {links.map(([href, label]) => <Link key={href} href={href} className="hover:underline">{label}</Link>)}
        </nav>
        <div className="ml-auto flex gap-3 text-[#5c6b52]"><a href="https://fangrush.com" target="_blank" rel="noreferrer" className="hover:underline">玩家站</a><AdminLogout /></div>
      </header>
      <div className="px-4 py-6">{children}</div>
    </div>
  )
}
