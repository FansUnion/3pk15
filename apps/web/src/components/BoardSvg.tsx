'use client'

import type { CSSProperties } from 'react'
import type { BoardState, Pos } from '@wolf-sheep/game-core'
import { BOARD_MAX } from '@wolf-sheep/game-core'
import type { JuiceFlash } from '@/lib/play-store'

const PAD = 28
const CELL = 56
const SIZE = PAD * 2 + CELL * (BOARD_MAX - 1)
const PIECE = 46

type Props = {
  state: BoardState
  selectedWolfId: string | null
  stepHighlights: Pos[]
  jumpHighlights: Pos[]
  jumpThroughs: Pos[]
  juice?: JuiceFlash
  interactive: boolean
  onSelectWolf: (id: string) => void
  onClickCell: (pos: Pos) => void
  theme?: {
    boardFill: string
    lineStroke: string
    wolfFill: string
    sheepFill: string
    wolfSrc?: string
    sheepSrc?: string
    boardBgSrc?: string
    rockWarm?: number
  }
}

function xy(r: number, c: number) {
  return {
    x: PAD + (c - 1) * CELL,
    y: PAD + (r - 1) * CELL,
  }
}

function hasPos(list: Pos[], r: number, c: number) {
  return list.some((p) => p.r === r && p.c === c)
}

function RockShape({
  x,
  y,
  variant,
  warm = 0,
}: {
  x: number
  y: number
  variant: number
  warm?: number
}) {
  const shapes = [
    `${x - 13},${y + 2} ${x - 8},${y - 12} ${x + 4},${y - 14} ${x + 13},${y - 4} ${x + 10},${y + 10} ${x - 4},${y + 13}`,
    `${x - 12},${y - 4} ${x - 2},${y - 14} ${x + 11},${y - 10} ${x + 14},${y + 2} ${x + 6},${y + 12} ${x - 10},${y + 10}`,
    `${x - 14},${y + 4} ${x - 10},${y - 10} ${x + 2},${y - 13} ${x + 12},${y - 6} ${x + 12},${y + 8} ${x - 2},${y + 13}`,
  ]
  const pts = shapes[variant % shapes.length]!
  const base = warm > 0.3 ? '#7a6a58' : warm < -0.2 ? '#5a6270' : '#6e665c'
  const lite = warm > 0.3 ? '#a09078' : warm < -0.2 ? '#8a949e' : '#8a8278'
  const dark = warm > 0.3 ? '#4a3a28' : warm < -0.2 ? '#2a3440' : '#3f3a34'
  return (
    <g>
      <ellipse cx={x + 1} cy={y + 12} rx={12} ry={3.5} fill="#1a1f18" opacity={0.28} />
      <polygon points={pts} fill={base} stroke={dark} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={pts.split(' ').slice(0, 3).join(' ')} fill={lite} opacity={0.65} />
      <path
        d={`M${x - 5} ${y - 1} L${x + 1} ${y + 5} M${x + 1} ${y - 7} L${x + 7} ${y - 1}`}
        stroke={dark}
        strokeWidth={1.1}
        opacity={0.5}
        strokeLinecap="round"
      />
    </g>
  )
}

export function BoardSvg({
  state,
  selectedWolfId,
  stepHighlights,
  jumpHighlights,
  jumpThroughs,
  juice,
  interactive,
  onSelectWolf,
  onClickCell,
  theme = {
    boardFill: '#e8f0e4',
    lineStroke: '#5c6b52',
    wolfFill: '#3d4a3a',
    sheepFill: '#f4f1ea',
  },
}: Props) {
  const rocks = [...state.rocks].map((k) => {
    const [r, c] = k.split(',').map(Number)
    return { r: r!, c: c! }
  })

  const selectedWolf = selectedWolfId
    ? state.pieces.find((p) => p.id === selectedWolfId && p.side === 'wolf')
    : undefined

  const fromXy = juice ? xy(juice.from.r, juice.from.c) : null
  const toXy = juice ? xy(juice.to.r, juice.to.c) : null
  const dx = fromXy && toXy ? fromXy.x - toXy.x : 0
  const dy = fromXy && toXy ? fromXy.y - toXy.y : 0

  return (
    <div className="game-board-frame w-full max-w-[min(92vw,420px)]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full touch-manipulation"
        role="img"
        aria-label="Fangrush board"
      >
      {theme.boardBgSrc ? (
        <image href={theme.boardBgSrc} x={0} y={0} width={SIZE} height={SIZE} preserveAspectRatio="none" />
      ) : (
        <rect x={0} y={0} width={SIZE} height={SIZE} fill={theme.boardFill} rx={12} />
      )}
      {/* light wash only — keep meadow readable */}
      <rect
        x={0}
        y={0}
        width={SIZE}
        height={SIZE}
        fill={theme.boardBgSrc ? 'rgba(255,255,255,0.08)' : 'transparent'}
        rx={12}
      />

      {Array.from({ length: BOARD_MAX }, (_, i) => {
        const v = PAD + i * CELL
        return (
          <g key={`line-${i}`}>
            <line
              x1={PAD}
              y1={v}
              x2={PAD + CELL * (BOARD_MAX - 1)}
              y2={v}
              stroke={theme.lineStroke}
              strokeWidth={2.25}
              opacity={0.9}
            />
            <line
              x1={v}
              y1={PAD}
              x2={v}
              y2={PAD + CELL * (BOARD_MAX - 1)}
              stroke={theme.lineStroke}
              strokeWidth={2.25}
              opacity={0.9}
            />
          </g>
        )
      })}

      {Array.from({ length: BOARD_MAX }, (_, ri) =>
        Array.from({ length: BOARD_MAX }, (_, ci) => {
          const { x, y } = xy(ri + 1, ci + 1)
          return (
            <circle
              key={`dot-${ri}-${ci}`}
              cx={x}
              cy={y}
              r={3.6}
              fill={theme.lineStroke}
              opacity={0.7}
            />
          )
        }),
      )}

      {selectedWolf &&
        jumpThroughs.map((mid, i) => {
          const to = jumpHighlights[i]
          if (!to) return null
          const a = xy(selectedWolf.r, selectedWolf.c)
          const b = xy(mid.r, mid.c)
          const c = xy(to.r, to.c)
          return (
            <polyline
              key={`path-${mid.r}-${mid.c}-${to.r}-${to.c}`}
              points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
              fill="none"
              stroke="rgba(196, 72, 54, 0.55)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )
        })}

      {Array.from({ length: BOARD_MAX }, (_, ri) =>
        Array.from({ length: BOARD_MAX }, (_, ci) => {
          const r = ri + 1
          const c = ci + 1
          const { x, y } = xy(r, c)
          const isStep = hasPos(stepHighlights, r, c)
          const isThrough = hasPos(jumpThroughs, r, c)
          if (!isStep && !isThrough) return null
          return (
            <circle
              key={`hl-${r}-${c}`}
              cx={x}
              cy={y}
              r={14}
              className="juice-pulse"
              fill={isThrough ? 'rgba(196, 72, 54, 0.28)' : 'rgba(70, 130, 90, 0.4)'}
            />
          )
        }),
      )}

      {rocks.map((p, i) => {
        const { x, y } = xy(p.r, p.c)
        return (
          <RockShape
            key={`rock-${p.r}-${p.c}`}
            x={x}
            y={y}
            variant={i + p.r + p.c}
            warm={theme.rockWarm ?? 0}
          />
        )
      })}

      {/* captured sheep ghost */}
      {juice?.kind === 'jump' && toXy && theme.sheepSrc && (
        <image
          href={theme.sheepSrc}
          x={toXy.x - PIECE / 2}
          y={toXy.y - PIECE / 2}
          width={PIECE}
          height={PIECE}
          className="piece-capture-fade"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {state.pieces.map((p) => {
        const { x, y } = xy(p.r, p.c)
        const selected = p.side === 'wolf' && p.id === selectedWolfId
        const src = p.side === 'sheep' ? theme.sheepSrc : theme.wolfSrc
        const isMover =
          Boolean(juice) && juice!.to.r === p.r && juice!.to.c === p.c
        const scale = selected ? 1.1 : 1

        const body = src ? (
          <image
            href={src}
            x={x - (PIECE * scale) / 2}
            y={y - (PIECE * scale) / 2 - (selected ? 2 : 0)}
            width={PIECE * scale}
            height={PIECE * scale}
            style={{
              pointerEvents: 'none',
              filter: selected ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' : undefined,
            }}
          />
        ) : p.side === 'sheep' ? (
          <circle cx={x} cy={y} r={13} fill={theme.sheepFill} stroke="#8a8478" strokeWidth={1.5} />
        ) : (
          <circle
            cx={x}
            cy={y}
            r={15}
            fill={theme.wolfFill}
            stroke={selected ? '#c9a227' : '#1e261c'}
            strokeWidth={selected ? 3 : 1.5}
          />
        )

        const moveStyle = isMover
          ? ({
              cursor: interactive && p.side === 'wolf' ? 'pointer' : 'default',
              ['--slide-x' as string]: `${dx}px`,
              ['--slide-y' as string]: `${dy}px`,
            } as CSSProperties)
          : ({
              cursor: interactive && p.side === 'wolf' ? 'pointer' : 'default',
            } as CSSProperties)

        return (
          <g
            key={p.id}
            onClick={(e) => {
              e.stopPropagation()
              if (interactive && p.side === 'wolf') onSelectWolf(p.id)
            }}
            style={moveStyle}
            className={isMover ? 'piece-slide' : 'piece-idle'}
          >
            {p.side === 'sheep' && !selected && <title>Sheep</title>}
            {p.side === 'wolf' && !selected && <title>Wolf</title>}
            {selected && (
              <>
                <circle
                  cx={x}
                  cy={y + 2}
                  r={PIECE / 2 + 4}
                  fill="#c9a227"
                  opacity={0.2}
                  className="juice-pulse"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={PIECE / 2 + 3}
                  fill="none"
                  stroke="#c9a227"
                  strokeWidth={3}
                  pointerEvents="none"
                />
              </>
            )}
            {body}
          </g>
        )
      })}

      {jumpHighlights.map((p) => {
        const { x, y } = xy(p.r, p.c)
        return (
          <circle
            key={`sheep-hl-${p.r}-${p.c}`}
            cx={x}
            cy={y}
            r={18}
            fill="none"
            stroke="#c44836"
            strokeWidth={3}
            className="juice-pulse danger-ring"
            pointerEvents="none"
          />
        )
      })}

      {juice && toXy && (
        <g pointerEvents="none" className="juice-flash">
          {juice.kind === 'jump' && juice.through && (
            <circle
              cx={xy(juice.through.r, juice.through.c).x}
              cy={xy(juice.through.r, juice.through.c).y}
              r={16}
              fill="rgba(196,72,54,0.3)"
            />
          )}
          <circle
            cx={toXy.x}
            cy={toXy.y}
            r={juice.kind === 'jump' ? 22 : 18}
            fill={juice.kind === 'jump' ? 'none' : 'rgba(70,130,90,0.35)'}
            stroke={juice.kind === 'jump' ? '#c44836' : undefined}
            strokeWidth={juice.kind === 'jump' ? 4 : undefined}
          />
          {juice.kind === 'jump' && [0, 1, 2, 3, 4, 5].map((i) => {
            const angle = i * 60
            const radius = 26
            const x = toXy.x + Math.cos((angle * Math.PI) / 180) * radius
            const y = toXy.y + Math.sin((angle * Math.PI) / 180) * radius
            return <circle key={`spark-${i}`} cx={x} cy={y} r={2.5} fill="#f4d37b" className="impact-spark" />
          })}
        </g>
      )}

      {Array.from({ length: BOARD_MAX }, (_, ri) =>
        Array.from({ length: BOARD_MAX }, (_, ci) => {
          const r = ri + 1
          const c = ci + 1
          const { x, y } = xy(r, c)
          return (
            <circle
              key={`hit-${r}-${c}`}
              cx={x}
              cy={y}
              r={18}
              fill="transparent"
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={() => {
                if (!interactive) return
                const piece = state.pieces.find((p) => p.r === r && p.c === c)
                if (piece?.side === 'wolf') {
                  onSelectWolf(piece.id)
                  return
                }
                onClickCell({ r, c })
              }}
            />
          )
        }),
      )}
      </svg>
    </div>
  )
}
