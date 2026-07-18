import Link from 'next/link'

const cards = [
  {
    href: '/admin/platform',
    title: '平台与广告实验台',
    desc: '平台识别 · Mock 广告状态 · 奖励发放验证',
  },
  {
    href: '/admin/skins',
    title: '皮肤台',
    desc: '身份感与资源验收 · 叠盘预览',
  },
  {
    href: '/admin/levels',
    title: '关卡台',
    desc: '关卡质量与 SEO 文案 · 开局盘',
  },
  {
    href: '/admin/ai',
    title: 'AI 模拟台',
    desc: '难度校准与坏局 · 批量胜率',
  },
  {
    href: '/admin/docs',
    title: '玩法说明',
    desc: '与玩家 how-to-play 同源文案',
  },
  {
    href: '/admin/economy',
    title: '经济与解锁',
    desc: '碎片 → 皮肤闭环只读表',
  },
  {
    href: '/admin/checklist',
    title: '上线检查清单',
    desc: '漏斗断点 · 本机冒烟勾选',
  },
]

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">内容质量驾驶舱</h1>
      <p className="mt-2 text-sm text-[#5c6b52]">
        只读配置 + 与线上同一套 game-core AI。不写玩家存档。职责见技术设计{' '}
        <code className="rounded bg-[#dfe8d8] px-1">01-工程契约与红线</code>（Admin 节）。
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
