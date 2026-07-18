import { getBoardSkin, getWolfSet, type ChapterId } from '@wolf-sheep/game-core'

const CHAPTER_BOARD: Record<ChapterId, string> = { spring: 'board-spring', summer: 'board-summer', autumn: 'board-autumn', winter: 'board-winter' }

export function themeForChapter(chapterId: ChapterId) {
  const board = getBoardSkin(CHAPTER_BOARD[chapterId]) ?? getBoardSkin('board-default')!
  const wolf = getWolfSet('wolf-default')!
  const rockWarm = board.id === 'board-autumn' ? 0.55 : board.id === 'board-winter' ? -0.45 : board.id === 'board-summer' ? 0.25 : 0
  return { boardFill: board.boardFill, lineStroke: board.lineStroke, wolfFill: wolf.wolfFill, sheepFill: wolf.sheepFill, wolfSrc: wolf.assets.wolf, sheepSrc: wolf.assets.sheep, boardBgSrc: board.assets.boardBg, rockWarm }
}
