import Link from 'next/link'
import { AdminLogout } from '../components/AdminLogout'
import '../../web/src/app/globals.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [['/skins', '皮肤'], ['/levels', '关卡'], ['/ai', 'AI'], ['/docs', '说明'], ['/economy', '经济'], ['/checklist', '清单'], ['/platform', '平台']]
  return (
    <div className="min-h-dvh bg-[#eef2ea]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#5c6b52]/20 bg-[#f7f5ef] px-4 py-3 text-sm">
        <Link href="/" className="font-serif text-base text-[#2c3328]">Admin</Link>
        <nav className="order-3 flex w-full flex-wrap gap-3 text-[#5c6b52] sm:order-none sm:w-auto">
          {links.map(([href, label]) => <Link key={href} href={href} className="hover:underline">{label}</Link>)}
        </nav>
        <div className="ml-auto flex gap-3 text-[#5c6b52]"><a href="/" target="_blank" rel="noreferrer" className="hover:underline">玩家站</a><AdminLogout /></div>
      </header>
      <div className="px-4 py-6">{children}</div>
    </div>
  )
}
