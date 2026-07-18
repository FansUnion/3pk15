import { AiSimConsole } from '../../../components/AiSimConsole'

type Props = {
  searchParams: Promise<{ level?: string; diff?: string; seed?: string; import?: string }>
}

export default async function AdminAiPage({ searchParams }: Props) {
  const sp = await searchParams
  return (
    <main>
      <h1 className="mb-4 font-serif text-2xl text-[#2c3328]">AI 模拟台</h1>
      <p className="mb-4 text-sm text-[#5c6b52]">
        这是关卡验收助手，不是自动替代人工试玩的“通关判定器”。它调用与线上相同的{' '}
        <code className="rounded bg-[#dfe8d8] px-1">pickSheepAction</code>
        ，结果默认不写玩家存档。
      </p>
      <section className="mb-5 grid gap-3 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm text-[#2c3328] md:grid-cols-3">
        <div>
          <h2 className="font-medium">先看什么</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5c6b52]">先看狼胜率、羊胜率、回合耗尽和异常局，再决定是否打开棋谱。</p>
        </div>
        <div>
          <h2 className="font-medium">它能帮什么</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5c6b52]">用固定种子重现地图、开局、AI 和终局风险，帮助定位需要人工复盘的对局。</p>
        </div>
        <div>
          <h2 className="font-medium">它不能证明什么</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5c6b52]">模拟通过不等于玩家体验通过；规则数据、棋谱证据和人工试玩仍需一起验收。</p>
        </div>
      </section>
      <details className="mb-5 rounded-lg border border-[#5c6b52]/25 bg-white p-4 text-sm text-[#2c3328]">
        <summary className="cursor-pointer font-medium">指标怎么读</summary>
        <dl className="mt-3 grid gap-2 text-xs text-[#5c6b52] md:grid-cols-2">
          <div><dt className="font-medium text-[#2c3328]">种子</dt><dd>固定随机起点；相同配置和种子可复现同一类对局。</dd></div>
          <div><dt className="font-medium text-[#2c3328]">模拟次数</dt><dd>本次批量运行的局数，不代表真实玩家数量。</dd></div>
          <div><dt className="font-medium text-[#2c3328]">胜率</dt><dd>当前狼策略、羊 AI 和参数下的结果，不是关卡永久评级。</dd></div>
          <div><dt className="font-medium text-[#2c3328]">终局原因</dt><dd>帮助区分目标达成、无路可走、回合耗尽、重复局面和异常。</dd></div>
        </dl>
      </details>
      <AiSimConsole initialLevel={sp.level} initialDiff={sp.diff} initialSeed={sp.seed} initialImport={sp.import} />
    </main>
  )
}
