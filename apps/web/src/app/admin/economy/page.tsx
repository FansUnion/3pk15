import Link from 'next/link'
import {
  CHAPTER_LABEL,
  LEVELS,
  QUEST_DEFS,
  SKIN_CATALOG,
} from '@wolf-sheep/game-core'

export default function AdminEconomyPage() {
  const wolfSets = SKIN_CATALOG.filter((s) => s.kind === 'wolf_set')
  const boards = SKIN_CATALOG.filter((s) => s.kind === 'board')

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">经济与解锁</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5c6b52]">
        闭环：通关拿碎片 → 攒够解锁皮肤 → 穿上皮再开一局。只读 game-core；改价改{' '}
        <code className="rounded bg-[#dfe8d8] px-1">packages/game-core/src/content</code> 后部署。
      </p>

      <section className="mt-6 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
        <p className="font-medium text-[#2c3328]">闭环一句话</p>
        <p className="mt-2 text-[#5c6b52]">
          首通约 10 通用 + 2 季节碎片；重复关约 30% 掉 2 通用。霜狼 50 / Night Watch 80
          通用；Moonlit Field 需冬日季节碎片 30。任务补通用碎片，驱动回访。
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-[#5c6b52]">皮肤解锁成本</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#5c6b52]/30 text-[#5c6b52]">
              <th className="py-2 pr-2">id</th>
              <th className="py-2 pr-2">名称</th>
              <th className="py-2 pr-2">kind</th>
              <th className="py-2">解锁</th>
            </tr>
          </thead>
          <tbody>
            {[...wolfSets, ...boards].map((s) => (
              <tr key={s.id} className="border-b border-[#5c6b52]/15">
                <td className="py-2 pr-2 font-mono text-xs">{s.id}</td>
                <td className="py-2 pr-2">{s.name}</td>
                <td className="py-2 pr-2">{s.kind}</td>
                <td className="py-2">{formatUnlock(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-[#7a8574]">
          叠盘预览见 <Link href="/admin/skins" className="underline">皮肤台</Link>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-[#5c6b52]">任务奖励（QUEST_DEFS）</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#5c6b52]/30 text-[#5c6b52]">
              <th className="py-2 pr-2">id</th>
              <th className="py-2 pr-2">周期</th>
              <th className="py-2 pr-2">标题</th>
              <th className="py-2 pr-2">目标</th>
              <th className="py-2">奖励通用</th>
            </tr>
          </thead>
          <tbody>
            {QUEST_DEFS.map((q) => (
              <tr key={q.id} className="border-b border-[#5c6b52]/15">
                <td className="py-2 pr-2 font-mono text-xs">{q.id}</td>
                <td className="py-2 pr-2">{q.period}</td>
                <td className="py-2 pr-2">{q.title}</td>
                <td className="py-2 pr-2">
                  {q.metric} × {q.target}
                </td>
                <td className="py-2">{q.rewardUniversal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-[#5c6b52]">关卡掉落摘要（LEVELS）</h2>
        <div className="mt-2 max-h-80 overflow-auto rounded border border-[#5c6b52]/20">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#eef2ea]">
              <tr className="border-b border-[#5c6b52]/30 text-[#5c6b52]">
                <th className="px-2 py-2">id</th>
                <th className="px-2 py-2">章</th>
                <th className="px-2 py-2">首通</th>
                <th className="px-2 py-2">重复</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((l) => (
                <tr key={l.id} className="border-b border-[#5c6b52]/10">
                  <td className="px-2 py-1.5 font-mono text-xs">{l.id}</td>
                  <td className="px-2 py-1.5">{CHAPTER_LABEL[l.chapterId]}</td>
                  <td className="px-2 py-1.5 text-xs">
                    U{l.firstClearReward.universal ?? 0}
                    {l.firstClearReward.season
                      ? ` · ${Object.entries(l.firstClearReward.season)
                          .map(([k, v]) => `${k}:${v}`)
                          .join(' ')}`
                      : ''}
                  </td>
                  <td className="px-2 py-1.5 text-xs">
                    {l.repeatDrop
                      ? `${(l.repeatDrop.chance * 100).toFixed(0)}% U${l.repeatDrop.universal ?? 0}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[#7a8574]">
          单关详情见 <Link href="/admin/levels" className="underline">关卡台</Link>
        </p>
      </section>
    </main>
  )
}

function formatUnlock(
  s: (typeof SKIN_CATALOG)[number],
): string {
  if (s.unlock.type === 'default') return '默认'
  if (s.unlock.type === 'chapter') return `章节 ${CHAPTER_LABEL[s.unlock.chapterId]}`
  if (s.kind === 'wolf_set' && s.unlock.type === 'cost') return `通用 × ${s.unlock.universal}`
  if (s.kind === 'board' && s.unlock.type === 'cost') {
    return `${CHAPTER_LABEL[s.unlock.season]}碎片 × ${s.unlock.amount}`
  }
  return JSON.stringify(s.unlock)
}
