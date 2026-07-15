import { AiSimConsole } from '@/components/admin/AiSimConsole'

export default function AdminAiPage() {
  return (
    <main>
      <h1 className="mb-4 font-serif text-2xl text-[#2c3328]">AI 模拟台</h1>
      <p className="mb-4 text-sm text-[#5c6b52]">
        调用与线上相同的 <code className="rounded bg-[#dfe8d8] px-1">pickSheepAction</code>
        ，结果默认不写存档。
      </p>
      <AiSimConsole />
    </main>
  )
}
