'use client'

import { useMemo, useState } from 'react'
import { createInitialState, getBoardSkin, getWolfSet, type BoardSkin, type WolfSetSkin } from '@wolf-sheep/game-core'
import { BoardSvg } from '../../web/src/components/BoardSvg'

const DEFAULT_WOLF = 'wolf-default'
const DEFAULT_BOARD = 'board-default'

export function SkinBoardPreview({ wolfSetId, boardId }: { wolfSetId: string; boardId: string }) {
  const [compareDefault, setCompareDefault] = useState(false)
  const state = useMemo(() => createInitialState('spring-01'), [])
  const wolf: WolfSetSkin = getWolfSet(compareDefault ? DEFAULT_WOLF : wolfSetId) ?? getWolfSet(DEFAULT_WOLF)!
  const board: BoardSkin = getBoardSkin(compareDefault ? DEFAULT_BOARD : boardId) ?? getBoardSkin(DEFAULT_BOARD)!
  return (
    <div className="rounded-lg border border-[#5c6b52]/25 bg-[#f7f5ef] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-[#2c3328]">对局叠盘预览</p><label className="flex items-center gap-2 text-xs text-[#5c6b52]"><input type="checkbox" checked={compareDefault} onChange={(e) => setCompareDefault(e.target.checked)} />对比默认皮</label></div>
      <p className="mb-2 font-mono text-xs text-[#7a8574]">wolf={wolf.id} · board={board.id}</p>
      <BoardSvg state={state} selectedWolfId={null} stepHighlights={[]} jumpHighlights={[]} jumpThroughs={[]} interactive={false} onSelectWolf={() => undefined} onClickCell={() => undefined} theme={{ boardFill: board.boardFill, lineStroke: board.lineStroke, wolfFill: wolf.wolfFill, sheepFill: wolf.sheepFill, wolfSrc: wolf.assets.wolf, sheepSrc: wolf.assets.sheep, boardBgSrc: board.assets.boardBg }} />
    </div>
  )
}
