import Link from 'next/link'
import type { Metadata } from 'next'
import {
  CHAPTER_LABEL,
  LEVELS,
  QUEST_DEFS,
  SKIN_CATALOG,
  type ChapterId,
  type SkinCatalogItem,
} from '@wolf-sheep/game-core'

export const metadata: Metadata = { title: '奖励与经济' }

export default function AdminEconomyPage() {
  const wolfSets = SKIN_CATALOG.filter((s) => s.kind === 'wolf_set')
  const boards = SKIN_CATALOG.filter((s) => s.kind === 'board')
  const avgFirst = avgFirstClearUniversal()
  const dailyQuestU = QUEST_DEFS.filter((q) => q.period === 'daily').reduce(
    (n, q) => n + q.rewardUniversal,
    0,
  )
  const estimates = SKIN_CATALOG.filter(
    (s) => s.unlock.type === 'cost',
  ).map((s) => estimateSkin(s, avgFirst, dailyQuestU))

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">经济与解锁</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5c6b52]">
        闭环：通关拿碎片 → 攒够解锁皮肤 → 穿上皮再开一局。只读 game-core；改价改{' '}
        <code className="rounded bg-[#dfe8d8] px-1">packages/game-core/src/content</code> 后部署。
      </p>

      <section className="mt-6 rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4 text-sm">
        <p className="font-medium text-[#2c3328]">闭环估算（由 Catalog / LEVELS / QUEST 动态算）</p>
        <p className="mt-2 text-[#5c6b52]">
          平均首通通用碎片 ≈ <strong className="text-[#2c3328]">{avgFirst.toFixed(1)}</strong>
          ；每日任务合计可领通用 ≈ <strong className="text-[#2c3328]">{dailyQuestU}</strong>
          。下表按「只刷首通」粗算次数（不含重复掉落期望）。
        </p>
        {estimates.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-[#2c3328]">
            {estimates.map((e) => (
              <li key={e.id}>
                <span className="font-medium">{e.name}</span>
                <span className="text-[#5c6b52]"> · {e.line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[#5c6b52]">无付费碎片皮（全默认/章节解锁）</p>
        )}
        <p className="mt-3 text-xs text-[#7a8574]">
          叠盘见 <Link href="/admin/skins" className="underline">皮肤台</Link>
          {' · '}
          玩家图鉴 <a href="https://fangrush.com/skins" target="_blank" rel="noreferrer" className="underline">fangrush.com/skins</a>
        </p>
        <p className="mt-3 border-t border-[#5c6b52]/15 pt-3 text-xs leading-relaxed text-[#7a8574]">
          这里是规则和配置的静态估算：它能说明碎片是否有兑换目标、目标距离和奖励来源，不能证明玩家一定愿意收藏或观看广告。商业化结论需要真实试玩数据。
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-[#5c6b52]">皮肤解锁成本</h2>
        <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
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
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-[#5c6b52]">任务奖励（QUEST_DEFS）</h2>
        <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
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
        </div>
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
                      ? `${(l.repeatDrop.chance * 100).toFixed(0)}% U${l.repeatDrop.universal ?? 0}${
                          l.repeatDrop.season
                            ? ` · ${Object.entries(l.repeatDrop.season)
                                .map(([k, v]) => `${k}:${v}`)
                                .join(' ')}`
                            : ''
                        }`
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

function avgFirstClearUniversal(): number {
  if (LEVELS.length === 0) return 0
  const sum = LEVELS.reduce((n, l) => n + (l.firstClearReward.universal ?? 0), 0)
  return sum / LEVELS.length
}

function avgFirstSeason(season: ChapterId): number {
  const levels = LEVELS.filter((l) => l.chapterId === season)
  if (levels.length === 0) return 0
  const sum = levels.reduce((n, l) => n + (l.firstClearReward.season?.[season] ?? 0), 0)
  return sum / levels.length
}

function estimateSkin(
  s: SkinCatalogItem,
  avgFirstU: number,
  dailyQuestU: number,
): { id: string; name: string; line: string } {
  if (s.unlock.type !== 'cost') {
    return { id: s.id, name: s.name, line: formatUnlock(s) }
  }
  if (s.kind === 'wolf_set') {
    const need = s.unlock.universal
    const clears = avgFirstU > 0 ? Math.ceil(need / avgFirstU) : Infinity
    const daysIfQuestOnly =
      dailyQuestU > 0 ? Math.ceil(need / dailyQuestU) : Infinity
    return {
      id: s.id,
      name: s.name,
      line: `需通用 ${need} ≈ 首通 ${clears === Infinity ? '?' : clears} 次（均 U${avgFirstU.toFixed(1)}）· 仅每日任务约 ${daysIfQuestOnly === Infinity ? '?' : daysIfQuestOnly} 天`,
    }
  }
  const season = s.unlock.season
  const need = s.unlock.amount
  const per = avgFirstSeason(season)
  const clears = per > 0 ? Math.ceil(need / per) : Infinity
  return {
    id: s.id,
    name: s.name,
    line: `需 ${CHAPTER_LABEL[season]}碎片 ${need} ≈ 该章首通 ${clears === Infinity ? '?' : clears} 次（章均季碎 ${per.toFixed(1)}）`,
  }
}

function formatUnlock(s: SkinCatalogItem): string {
  if (s.unlock.type === 'default') return '默认'
  if (s.unlock.type === 'chapter') return `章节 ${CHAPTER_LABEL[s.unlock.chapterId]}`
  if (s.kind === 'wolf_set' && s.unlock.type === 'cost') return `通用 × ${s.unlock.universal}`
  if (s.kind === 'board' && s.unlock.type === 'cost') {
    return `${CHAPTER_LABEL[s.unlock.season]}碎片 × ${s.unlock.amount}`
  }
  return JSON.stringify(s.unlock)
}
