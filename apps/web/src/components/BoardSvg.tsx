'use client'

import type { BoardState, Pos } from '@wolf-sheep/game-core'
import { BOARD_MAX } from '@wolf-sheep/game-core'
import type { JuiceFlash } from '@/lib/play-store'

const PAD = 28
const CELL = 56
const SIZE = PAD * 2 + CELL * (BOARD_MAX - 1)
const PIECE = 36

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

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-auto w-full max-w-[min(92vw,420px)] touch-manipulation"
      role="img"
      aria-label="Fangrush board"
    >
      {theme.boardBgSrc ? (
        <image href={theme.boardBgSrc} x={0} y={0} width={SIZE} height={SIZE} preserveAspectRatio="none" />
      ) : (
        <rect x={0} y={0} width={SIZE} height={SIZE} fill={theme.boardFill} rx={8} />
      )}
      <rect
        x={0}
        y={0}
        width={SIZE}
        height={SIZE}
        fill={theme.boardBgSrc ? 'rgba(232,240,228,0.35)' : 'transparent'}
        rx={8}
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
              strokeWidth={1.5}
            />
            <line
              x1={v}
              y1={PAD}
              x2={v}
              y2={PAD + CELL * (BOARD_MAX - 1)}
              stroke={theme.lineStroke}
              strokeWidth={1.5}
            />
          </g>
        )
      })}

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
              fill={isThrough ? 'rgba(196, 72, 54, 0.28)' : 'rgba(70, 130, 90, 0.4)'}
            />
          )
        }),
      )}

      {rocks.map((p) => {
        const { x, y } = xy(p.r, p.c)
        return (
          <rect
            key={`rock-${p.r}-${p.c}`}
            x={x - 14}
            y={y - 14}
            width={28}
            height={28}
            rx={4}
            fill="#6b6358"
            stroke="#3f3a34"
            strokeWidth={1}
          />
        )
      })}

      {state.pieces.map((p) => {
        const { x, y } = xy(p.r, p.c)
        const selected = p.side === 'wolf' && p.id === selectedWolfId
        const src = p.side === 'sheep' ? theme.sheepSrc : theme.wolfSrc
        if (src) {
          return (
            <g
              key={p.id}
              onClick={(e) => {
                e.stopPropagation()
                if (interactive && p.side === 'wolf') onSelectWolf(p.id)
              }}
              style={{ cursor: interactive && p.side === 'wolf' ? 'pointer' : 'default' }}
            >
              <image
                href={src}
                x={x - PIECE / 2}
                y={y - PIECE / 2}
                width={PIECE}
                height={PIECE}
                style={{ pointerEvents: 'none' }}
              />
              {selected && (
                <circle
                  cx={x}
                  cy={y}
                  r={PIECE / 2 + 2}
                  fill="none"
                  stroke="#c9a227"
                  strokeWidth={3}
                  pointerEvents="none"
                />
              )}
            </g>
          )
        }
        if (p.side === 'sheep') {
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={13}
              fill={theme.sheepFill}
              stroke="#8a8478"
              strokeWidth={1.5}
            />
          )
        }
        return (
          <g
            key={p.id}
            onClick={(e) => {
              e.stopPropagation()
              if (interactive) onSelectWolf(p.id)
            }}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <circle
              cx={x}
              cy={y}
              r={15}
              fill={theme.wolfFill}
              stroke={selected ? '#c9a227' : '#1e261c'}
              strokeWidth={selected ? 3 : 1.5}
            />
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
            r={17}
            fill="none"
            stroke="#c44836"
            strokeWidth={3}
            pointerEvents="none"
          />
        )
      })}

      {juice && (
        <g pointerEvents="none">
          {juice.kind === 'jump' && juice.through && (
            <>
              <circle
                cx={xy(juice.through.r, juice.through.c).x}
                cy={xy(juice.through.r, juice.through.c).y}
                r={16}
                fill="rgba(196,72,54,0.25)"
              />
              <circle
                cx={xy(juice.to.r, juice.to.c).x}
                cy={xy(juice.to.r, juice.to.c).y}
                r={20}
                fill="none"
                stroke="#c44836"
                strokeWidth={4}
                opacity={0.9}
              />
            </>
          )}
          {juice.kind === 'step' && (
            <circle
              cx={xy(juice.to.r, juice.to.c).x}
              cy={xy(juice.to.r, juice.to.c).y}
              r={16}
              fill="rgba(70,130,90,0.35)"
            />
          )}
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
  )
}
