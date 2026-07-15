import Link from 'next/link'

const cards = [
  { href: '/admin/skins', title: '皮肤台', desc: 'Catalog 预览与资源校验' },
  { href: '/admin/levels', title: '关卡台', desc: '四季配置与岩石示意' },
  { href: '/admin/ai', title: 'AI 模拟台', desc: '摆子、单步、导出 fixture' },
  { href: '/admin/docs', title: '玩法说明', desc: '规则预览' },
]

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">简易后台</h1>
      <p className="mt-2 text-sm text-[#5c6b52]">
        只读配置 + 与线上同一套 game-core AI。不写玩家存档。
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-4 hover:border-[#5c6b52]/50"
            >
              <p className="font-medium text-[#2c3328]">{c.title}</p>
              <p className="mt-1 text-sm text-[#5c6b52]">{c.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
