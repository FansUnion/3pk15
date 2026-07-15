import type { ChapterId } from './levels'
import type { SaveGame } from './save'

export type WolfSetSkin = {
  id: string
  kind: 'wolf_set'
  name: string
  unlock:
    | { type: 'default' }
    | { type: 'chapter'; chapterId: ChapterId }
    | { type: 'cost'; universal: number }
  assets: { wolf: string; sheep: string; thumb?: string }
  /** CSS fill for placeholder / SVG tint */
  wolfFill: string
  sheepFill: string
}

export type BoardSkin = {
  id: string
  kind: 'board'
  name: string
  unlock:
    | { type: 'default' }
    | { type: 'chapter'; chapterId: ChapterId }
    | { type: 'cost'; season: ChapterId; amount: number }
  assets: { boardBg: string; thumb?: string }
  boardFill: string
  lineStroke: string
}

export type SkinCatalogItem = WolfSetSkin | BoardSkin

export const SKIN_CATALOG: SkinCatalogItem[] = [
  {
    id: 'wolf-default',
    kind: 'wolf_set',
    name: '原野狼',
    unlock: { type: 'default' },
    assets: {
      wolf: '/skins/default/wolf.svg',
      sheep: '/skins/default/sheep.svg',
    },
    wolfFill: '#3d4a3a',
    sheepFill: '#f4f1ea',
  },
  {
    id: 'wolf-frost',
    kind: 'wolf_set',
    name: '霜狼',
    unlock: { type: 'cost', universal: 50 },
    assets: {
      wolf: '/skins/frost/wolf.svg',
      sheep: '/skins/frost/sheep.svg',
    },
    wolfFill: '#4a6b7c',
    sheepFill: '#e8eef2',
  },
  {
    id: 'board-default',
    kind: 'board',
    name: '原野棋盘',
    unlock: { type: 'default' },
    assets: { boardBg: '/skins/boards/default.svg' },
    boardFill: '#e4f0d8',
    lineStroke: '#4a5c3e',
  },
  {
    id: 'board-spring',
    kind: 'board',
    name: '春日棋盘',
    unlock: { type: 'chapter', chapterId: 'spring' },
    assets: { boardBg: '/skins/boards/spring.svg' },
    boardFill: '#e8f6d8',
    lineStroke: '#4a7a3a',
  },
  {
    id: 'board-summer',
    kind: 'board',
    name: '夏日棋盘',
    unlock: { type: 'chapter', chapterId: 'summer' },
    assets: { boardBg: '/skins/boards/summer.svg' },
    boardFill: '#f2e8c0',
    lineStroke: '#6a5a28',
  },
  {
    id: 'board-autumn',
    kind: 'board',
    name: '秋日棋盘',
    unlock: { type: 'chapter', chapterId: 'autumn' },
    assets: { boardBg: '/skins/boards/autumn.svg' },
    boardFill: '#f2dcb8',
    lineStroke: '#7a4020',
  },
  {
    id: 'board-winter',
    kind: 'board',
    name: '冬日棋盘',
    unlock: { type: 'chapter', chapterId: 'winter' },
    assets: { boardBg: '/skins/boards/winter.svg' },
    boardFill: '#e8f0f6',
    lineStroke: '#3a5566',
  },
]

export function getSkin(id: string): SkinCatalogItem | undefined {
  return SKIN_CATALOG.find((s) => s.id === id)
}

export function getWolfSet(id: string): WolfSetSkin | undefined {
  const s = getSkin(id)
  return s?.kind === 'wolf_set' ? s : undefined
}

export function getBoardSkin(id: string): BoardSkin | undefined {
  const s = getSkin(id)
  return s?.kind === 'board' ? s : undefined
}

export function resolveSkin(save: SaveGame): {
  wolfSet: WolfSetSkin
  board: BoardSkin
} {
  const wolf =
    getWolfSet(save.equipped.wolfSetId) ?? getWolfSet('wolf-default')!
  const board =
    getBoardSkin(save.equipped.boardId) ?? getBoardSkin('board-default')!
  return { wolfSet: wolf, board }
}

export function isSkinUnlocked(save: SaveGame, skin: SkinCatalogItem): boolean {
  if (save.unlockedSkinIds.includes(skin.id)) return true
  if (skin.unlock.type === 'default') return true
  if (skin.unlock.type === 'chapter') {
    return save.unlockedChapters.includes(skin.unlock.chapterId)
  }
  return false
}

export function unlockSkinWithCost(
  save: SaveGame,
  skinId: string,
): { ok: true; save: SaveGame } | { ok: false; error: string } {
  const skin = getSkin(skinId)
  if (!skin) return { ok: false, error: 'skin not found' }
  if (isSkinUnlocked(save, skin)) {
    return { ok: false, error: 'already unlocked' }
  }
  if (skin.unlock.type === 'cost' && skin.kind === 'wolf_set') {
    const cost = skin.unlock.universal
    if (save.fragments.universal < cost) {
      return { ok: false, error: 'insufficient_universal' }
    }
    return {
      ok: true,
      save: {
        ...save,
        fragments: {
          ...save.fragments,
          universal: save.fragments.universal - cost,
        },
        unlockedSkinIds: [...save.unlockedSkinIds, skin.id],
      },
    }
  }
  if (skin.unlock.type === 'cost' && skin.kind === 'board') {
    const { season, amount } = skin.unlock
    if ((save.fragments.season[season] ?? 0) < amount) {
      return { ok: false, error: 'insufficient_season' }
    }
    return {
      ok: true,
      save: {
        ...save,
        fragments: {
          ...save.fragments,
          season: {
            ...save.fragments.season,
            [season]: save.fragments.season[season] - amount,
          },
        },
        unlockedSkinIds: [...save.unlockedSkinIds, skin.id],
      },
    }
  }
  return { ok: false, error: 'not purchasable' }
}

export function equipSkin(
  save: SaveGame,
  skinId: string,
): { ok: true; save: SaveGame } | { ok: false; error: string } {
  const skin = getSkin(skinId)
  if (!skin) return { ok: false, error: 'not found' }
  if (!isSkinUnlocked(save, skin)) return { ok: false, error: 'locked' }
  if (skin.kind === 'wolf_set') {
    return { ok: true, save: { ...save, equipped: { ...save.equipped, wolfSetId: skin.id } } }
  }
  return { ok: true, save: { ...save, equipped: { ...save.equipped, boardId: skin.id } } }
}

/** Catalog structural validation (file existence checked by script). */
export function validateSkinCatalog(): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  let defaultWolf = 0
  let defaultBoard = 0
  for (const s of SKIN_CATALOG) {
    if (ids.has(s.id)) errors.push(`duplicate id ${s.id}`)
    ids.add(s.id)
    if (s.kind === 'wolf_set') {
      if (!s.assets.wolf || !s.assets.sheep) errors.push(`${s.id} missing wolf/sheep asset`)
      if (s.unlock.type === 'default') defaultWolf++
      if (s.unlock.type === 'cost' && s.unlock.universal < 0) errors.push(`${s.id} bad cost`)
    } else {
      if (!s.assets.boardBg) errors.push(`${s.id} missing boardBg`)
      if (s.unlock.type === 'default') defaultBoard++
      if (s.unlock.type === 'cost' && s.unlock.amount < 0) errors.push(`${s.id} bad cost`)
    }
  }
  if (defaultWolf < 1) errors.push('need default wolf_set')
  if (defaultBoard < 1) errors.push('need default board')
  return errors
}
