export default function AdminDocsPage() {
  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-[#2c3328]">玩法说明（开发预览）</h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#2c3328]">
        <p>
          <strong>目标：</strong>操纵 3 狼隔空吃绵羊，吃满 <strong>8</strong> 只获胜。
        </p>
        <p>
          <strong>移动：</strong>横竖一格；不可斜；不可进岩石/棋子。
        </p>
        <p>
          <strong>隔空吃：</strong>同线「狼—空—羊」，狼移到羊位并移除羊（紧贴不可吃）。
        </p>
        <p>
          <strong>连吃：</strong>同一只狼同回合最多 <strong>5</strong> 次；可主动结束连吃。
        </p>
        <p>
          <strong>羊：</strong>电脑走；不能往第 1 行退；不吃子；每回合一只一步。
        </p>
        <p>
          <strong>失败：</strong>三只狼都无合法走/吃。
        </p>
        <p className="text-[#5c6b52]">
          开发者注：坐标系 (行1–6, 列1–6)；春 easy / 夏秋 normal / 冬 hard；章内 AI 不换档。吃子几何对齐原始「隔空吃」基线。
        </p>
      </div>
    </main>
  )
}
