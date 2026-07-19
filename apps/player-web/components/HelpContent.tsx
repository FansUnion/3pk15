'use client'

import type { MessageTree } from '@/i18n/messages'
import { makeState, WOLF_STRATEGIES } from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'

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
  const state = kind === 'move'
    ? makeState({
        pieces: [{ id: 'wolf-help', side: 'wolf', r: 4, c: 3 }],
        rocks: [{ r: 3, c: 5 }],
      })
    : makeState({
        pieces: [
          { id: 'wolf-help', side: 'wolf', r: 4, c: 1 },
          { id: 'sheep-help', side: 'sheep', r: 4, c: 3 },
        ],
        rocks: [{ r: 2, c: 5 }],
      })

  return (
    <figure className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
      <div className="mx-auto max-w-48" aria-label={label}>
        <BoardSvg
          state={state}
          selectedWolfId="wolf-help"
          stepHighlights={kind === 'move' ? [{ r: 3, c: 3 }] : []}
          jumpHighlights={kind === 'capture' ? [{ r: 4, c: 3 }] : []}
          jumpThroughs={kind === 'capture' ? [{ r: 4, c: 2 }] : []}
          interactive={false}
          onSelectWolf={noop}
          onClickCell={noop}
          theme={{
            boardFill: '#e8f0e4',
            lineStroke: '#5c6b52',
            wolfFill: '#3d4a3a',
            sheepFill: '#f4f1ea',
            wolfSrc: '/skins/default/wolf.svg',
            sheepSrc: '/skins/default/sheep.svg',
          }}
        />
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{label}</figcaption>
    </figure>
  )
}

function noop() {}
