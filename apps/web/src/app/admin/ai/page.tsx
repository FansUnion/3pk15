import { AiSimConsole } from '@/components/admin/AiSimConsole'

type Props = {
  searchParams: Promise<{ level?: string; diff?: string }>
}

export default async function AdminAiPage({ searchParams }: Props) {
  const sp = await searchParams
  return (
    <main>
      <h1 className="mb-4 font-serif text-2xl text-[#2c3328]">AI 模拟台</h1>
      <p className="mb-4 text-sm text-[#5c6b52]">
        难度校准与坏局诊断：调用与线上相同的{' '}
        <code className="rounded bg-[#dfe8d8] px-1">pickSheepAction</code>
        ，结果默认不写存档。
      </p>
      <AiSimConsole initialLevel={sp.level} initialDiff={sp.diff} />
    </main>
  )
}
