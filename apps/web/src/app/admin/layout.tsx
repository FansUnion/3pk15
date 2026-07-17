import Link from 'next/link'
import { AdminLogout } from '@/components/admin/AdminLogout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#eef2ea]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#5c6b52]/20 bg-[#f7f5ef] px-4 py-3 text-sm">
        <Link href="/admin" className="font-serif text-base text-[#2c3328]">
          Admin
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-3 text-[#5c6b52] sm:order-none sm:w-auto">
          <Link href="/admin/skins" className="hover:underline">
            皮肤
          </Link>
          <Link href="/admin/levels" className="hover:underline">
            关卡
          </Link>
          <Link href="/admin/ai" className="hover:underline">
            AI
          </Link>
          <Link href="/admin/docs" className="hover:underline">
            说明
          </Link>
          <Link href="/admin/economy" className="hover:underline">
            经济
          </Link>
          <Link href="/admin/checklist" className="hover:underline">
            清单
          </Link>
          <Link href="/admin/platform" className="hover:underline">
            平台
          </Link>
        </nav>
        <div className="ml-auto flex gap-3 text-[#5c6b52]">
          <a href="/" target="_blank" rel="noreferrer" className="hover:underline">
            玩家站
          </a>
          <AdminLogout />
        </div>
      </header>
      <div className="px-4 py-6">{children}</div>
    </div>
  )
}
