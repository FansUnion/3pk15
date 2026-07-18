import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '管理后台' }

const cards = [
  ['platform', '平台与广告实验台', '平台识别、Mock 广告状态和奖励验证。'],
  ['skins', '皮肤台', '皮肤资源、主题和棋盘预览。'],
  ['levels', '关卡台', '24 关说明、风险和验收状态。'],
  ['ai', '关卡模拟验收', '批量筛查关卡风险，再复盘可疑棋谱。'],
  ['docs', '玩法说明', '与玩家端同源的规则和教学内容。'],
  ['economy', '经济与解锁', '碎片、皮肤和奖励配置估算。'],
  ['checklist', '上线检查清单', '玩家端、奖励和发布回归记录。'],
] as const

export default function AdminEntryPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">内容质量驾驶舱</h1>
      <p className="mt-2 text-sm text-[#5c6b52]">Admin 正式入口统一为 `/admin`；这里不写玩家存档，只用于内容、AI、奖励和发布验收。</p>
      <section className="mt-5 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
        <h2 className="font-medium text-[#2c3328]">当前推荐顺序</h2>
        <ol className="mt-2 grid gap-2 text-xs text-[#5c6b52] sm:grid-cols-3">
          <li><strong className="text-[#2c3328]">1. 关卡台</strong><br />先看说明、风险和验收状态。</li>
          <li><strong className="text-[#2c3328]">2. 模拟验收</strong><br />批量筛查风险，再打开可疑棋谱。</li>
          <li><strong className="text-[#2c3328]">3. 检查清单</strong><br />最后记录回归和发布证据。</li>
        </ol>
      </section>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map(([id, title, desc]) => (
          <li key={id}>
            <Link href={`/admin/${id}`} className="block rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] px-4 py-4 hover:border-[#5c6b52]/50">
              <p className="font-medium text-[#2c3328]">{title}</p>
              <p className="mt-1 text-sm text-[#5c6b52]">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
