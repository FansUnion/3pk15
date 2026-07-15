'use client'

import { create } from 'zustand'
import { defaultSave, type DropGrant, type SaveGame } from '@wolf-sheep/game-core'
import { loadSave, persistSave } from '@/lib/storage'

type SaveStore = {
  save: SaveGame
  hydrated: boolean
  hydrate: () => void
  replace: (save: SaveGame) => void
  lastGrant: DropGrant | null
  setLastGrant: (g: DropGrant | null) => void
}

/** 初始必须用 defaultSave，禁止在模块加载时读 localStorage（否则 SSR 与客户端首渲不一致） */
export const useSaveStore = create<SaveStore>((set) => ({
  save: defaultSave(),
  hydrated: false,
  lastGrant: null,
  hydrate() {
    set({ save: loadSave(), hydrated: true })
  },
  replace(save) {
    persistSave(save)
    set({ save, hydrated: true })
  },
  setLastGrant(g) {
    set({ lastGrant: g })
  },
}))
