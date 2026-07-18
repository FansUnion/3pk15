import { AiSimConsole } from '../../../components/AiSimConsole'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关卡模拟验收' }

type Props = {
  searchParams: Promise<{ level?: string; diff?: string; seed?: string; import?: string }>
}

export default async function AdminAiPage({ searchParams }: Props) {
  const sp = await searchParams
  return (
    <main>
      <h1 className="mb-2 font-serif text-2xl text-[#2c3328]">关卡模拟验收</h1>
      <p className="mb-4 text-sm text-[#5c6b52]">
        先批量检查一张关卡是否存在明显的过易、过难、拖延或异常终局，再打开可疑棋谱复盘。模拟结果不会写入玩家存档，也不能代替人工试玩。
      </p>
      <section className="mb-5 grid gap-3 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm text-[#2c3328] md:grid-cols-3">
        <div>
          <h2 className="font-medium">1. 选择关卡</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5c6b52]">默认使用策略型狼和该关正式羊方难度，先跑20或50局。</p>
        </div>
        <div>
          <h2 className="font-medium">2. 阅读判断</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5c6b52]">看胜负、拖延和异常比例；页面会解释当前结果可能意味着什么。</p>
        </div>
        <div>
          <h2 className="font-medium">3. 复盘可疑局</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5c6b52]">打开狼被困、重复、超步或与预期不符的棋谱，再决定检查地图、AI还是规则。</p>
        </div>
      </section>
      <AiSimConsole initialLevel={sp.level} initialDiff={sp.diff} initialSeed={sp.seed} initialImport={sp.import} />
    </main>
  )
}
