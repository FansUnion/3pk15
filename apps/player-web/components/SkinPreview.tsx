'use client'

import { createInitialState, resolveSkin, type SaveGame } from '@wolf-sheep/game-core'
import { BoardSvg } from '@/components/BoardSvg'

export function SkinPreview({ save, previewLabel, activeLabel }: { save: SaveGame; previewLabel: string; activeLabel: string }) {
  const skin = resolveSkin(save)
  return (
    <div className="paper-card overflow-hidden p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="eyebrow">{previewLabel}</span>
        <span className="text-xs text-[var(--muted)]">{activeLabel}</span>
      </div>
      <BoardSvg
        state={createInitialState('spring-01')}
        selectedWolfId={null}
        stepHighlights={[]}
        jumpHighlights={[]}
        jumpThroughs={[]}
        interactive={false}
        onSelectWolf={() => undefined}
        onClickCell={() => undefined}
        theme={{
          boardFill: skin.board.boardFill,
          lineStroke: skin.board.lineStroke,
          wolfFill: skin.wolfSet.wolfFill,
          sheepFill: skin.wolfSet.sheepFill,
          wolfSrc: skin.wolfSet.assets.wolf,
          sheepSrc: skin.wolfSet.assets.sheep,
          boardBgSrc: skin.board.assets.boardBg,
        }}
      />
    </div>
  )
}
