import type { MessageTree } from '@/i18n/messages'
import { WOLF_STRATEGIES } from '@wolf-sheep/game-core'

export function HelpContent({ h, locale, compact = false }: { h: MessageTree['howTo']; locale: 'en' | 'zh'; compact?: boolean }) {
  const ruleSections = [
    [h.winTitle, h.winBody],
    [h.moveTitle, h.moveBody],
    [h.chainTitle, h.chainBody],
    [h.sheepTitle, h.sheepBody],
    [h.rocksTitle, h.rocksBody],
  ] as const

  return (
    <div className="grid gap-6">
      <section>
        <h2 className="font-serif text-xl text-[var(--ink)]">{h.basicsTitle}</h2>
        <div className="mt-3 grid gap-3">
          {ruleSections.map(([title, body]) => (
            <div key={title} className="border-l-2 border-[var(--line)] pl-3">
              <h3 className="font-medium text-[var(--ink)]">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-l-2 border-[var(--accent)] pl-3">
        <h2 className="font-serif text-xl text-[var(--ink)]">{h.controlsTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {locale === 'zh'
            ? '点选一只狼，再点绿色空位移动；点红圈中的羊完成捕食。羊和岩石不能直接操作。'
            : 'Select a wolf, then tap a green empty point to move or a red-ringed sheep to capture. Sheep and rocks are not directly controlled.'}
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-[var(--ink)]">{h.diagramTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <RuleBoard kind="move" label={h.diagramMove} />
          <RuleBoard kind="capture" label={h.diagramCapture} />
        </div>
      </section>

      {!compact && (
        <section>
          <h2 className="font-serif text-xl text-[var(--ink)]">{h.strategyTitle}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {WOLF_STRATEGIES.map((item) => (
              <article key={item.id} className="border-l-2 border-[var(--line)] pl-3">
                <h3 className="font-medium text-[var(--ink)]">{locale === 'zh' ? item.nameZh : item.nameEn}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{locale === 'zh' ? item.summaryZh : item.summaryEn}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function RuleBoard({ kind, label }: { kind: 'move' | 'capture'; label: string }) {
  const cells = kind === 'move'
    ? { wolf: [2, 2], target: [1, 2], sheep: null, rock: [3, 3] }
    : { wolf: [2, 1], target: [2, 3], sheep: [2, 3], rock: [3, 2] }

  return (
    <figure className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
      <div
        className="relative mx-auto aspect-square w-full max-w-48 rounded-lg bg-[#e8f0e4]"
        role="img"
        aria-label={label}
        style={{
          backgroundImage:
            'linear-gradient(to right, transparent 16%, #5c6b52 16%, #5c6b52 17%, transparent 17%, transparent 49%, #5c6b52 49%, #5c6b52 50%, transparent 50%, transparent 82%, #5c6b52 82%, #5c6b52 83%, transparent 83%), linear-gradient(to bottom, transparent 16%, #5c6b52 16%, #5c6b52 17%, transparent 17%, transparent 49%, #5c6b52 49%, #5c6b52 50%, transparent 50%, transparent 82%, #5c6b52 82%, #5c6b52 83%, transparent 83%)',
        }}
      >
        <RulePiece src="/skins/default/wolf.svg" row={cells.wolf[0]!} col={cells.wolf[1]!} />
        {cells.sheep && <RulePiece src="/skins/default/sheep.svg" row={cells.sheep[0]!} col={cells.sheep[1]!} />}
        <span
          aria-hidden
          className={kind === 'move' ? 'absolute h-8 w-8 rounded-full bg-[#46825a]/45 ring-2 ring-[#376847]' : 'absolute h-11 w-11 rounded-full border-4 border-[#c44836]'}
          style={cellPosition(cells.target[0]!, cells.target[1]!)}
        />
        {kind === 'capture' && <span aria-hidden className="absolute left-[23%] top-1/2 h-1 w-[54%] -translate-y-1/2 bg-[#c44836]/60" />}
        <span aria-hidden className="absolute h-8 w-9 rotate-6 rounded-[40%] bg-[#6e665c] shadow-sm" style={cellPosition(cells.rock[0]!, cells.rock[1]!)} />
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{label}</figcaption>
    </figure>
  )
}

function RulePiece({ src, row, col }: { src: string; row: number; col: number }) {
  return <img src={src} alt="" aria-hidden className="absolute z-10 h-12 w-12" style={cellPosition(row, col)} />
}

function cellPosition(row: number, col: number) {
  return {
    left: String(16.5 + (col - 1) * 33) + '%',
    top: String(16.5 + (row - 1) * 33) + '%',
    transform: 'translate(-50%, -50%)',
  }
}
