import type { MessageTree } from '@/i18n/messages'

export function HelpContent({ h, compact = false }: { h: MessageTree['howTo']; compact?: boolean }) {
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

      <section>
        <h2 className="font-serif text-xl text-[var(--ink)]">{h.diagramTitle}</h2>
        <p className="mt-2 text-xs text-[var(--muted)]">{h.diagramLegend}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Diagram art={'W . .\n. . .'} label={h.diagramMove} />
          <Diagram art={'W . S\n. # .'} label={h.diagramCapture} />
        </div>
      </section>

      {!compact && (
        <section>
          <h2 className="font-serif text-xl text-[var(--ink)]">{h.strategyTitle}</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--muted)]">
            {h.strategyBody.map((item) => <li key={item} className="border-l-2 border-[var(--line)] pl-3">{item}</li>)}
          </ul>
        </section>
      )}
    </div>
  )
}

function Diagram({ art, label }: { art: string; label: string }) {
  return (
    <figure className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
      <pre className="font-mono text-base leading-7 text-[var(--ink)]" aria-hidden>{art}</pre>
      <figcaption className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{label}</figcaption>
    </figure>
  )
}
