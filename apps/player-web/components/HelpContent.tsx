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
          <RuleBoard kind="chain" label={locale === 'zh' ? '连吃决策：红圈表示可以继续捕食；也可以结束连吃，保留当前站位。' : 'Chain decision: red rings continue the capture; you may stop to keep the current position.'} />
          <RuleBoard kind="terrain" label={locale === 'zh' ? '羊只能横移或朝狼方前进；岩石不可落脚，也不能作为跳吃中点。' : 'Sheep move sideways or toward the wolves. Rocks are blocked and never serve as leap points.'} />
          <RuleBoard kind="terminal" label={locale === 'zh' ? '三只狼全部无路才会失败；重复局面会先预警，第六次重复时结束挑战。' : 'You lose only when all three wolves have no moves. Repetition warns first and ends on the sixth occurrence.'} />
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

function RuleBoard({ kind, label }: { kind: 'move' | 'capture' | 'chain' | 'terrain' | 'terminal'; label: string }) {
  const state = kind === 'move'
    ? makeState({
        pieces: [{ id: 'wolf-help', side: 'wolf', r: 4, c: 3 }],
        rocks: [{ r: 3, c: 5 }],
      })
    : kind === 'capture' ? makeState({
        pieces: [
          { id: 'wolf-help', side: 'wolf', r: 4, c: 1 },
          { id: 'sheep-help', side: 'sheep', r: 4, c: 3 },
        ],
        rocks: [{ r: 2, c: 5 }],
      }) : kind === 'chain' ? makeState({
        pieces: [
          { id: 'wolf-help', side: 'wolf', r: 4, c: 3 },
          { id: 'sheep-help-1', side: 'sheep', r: 2, c: 3 },
          { id: 'sheep-help-2', side: 'sheep', r: 4, c: 5 },
        ],
      }) : kind === 'terrain' ? makeState({
        pieces: [{ id: 'wolf-help', side: 'wolf', r: 5, c: 3 }, { id: 'sheep-help', side: 'sheep', r: 3, c: 3 }],
        rocks: [{ r: 3, c: 4 }, { r: 4, c: 3 }],
      }) : makeState({
        pieces: [{ id: 'wolf-help', side: 'wolf', r: 1, c: 1 }],
        rocks: [{ r: 1, c: 2 }, { r: 2, c: 1 }],
      })

  return (
    <figure className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
      <div className="mx-auto max-w-48" aria-label={label}>
        <BoardSvg
          state={state}
          selectedWolfId="wolf-help"
          stepHighlights={kind === 'move' ? [{ r: 3, c: 3 }] : []}
          jumpHighlights={kind === 'capture' ? [{ r: 4, c: 3 }] : kind === 'chain' ? [{ r: 2, c: 3 }, { r: 4, c: 5 }] : []}
          jumpThroughs={kind === 'capture' ? [{ r: 4, c: 2 }] : kind === 'chain' ? [{ r: 3, c: 3 }, { r: 4, c: 4 }] : []}
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
