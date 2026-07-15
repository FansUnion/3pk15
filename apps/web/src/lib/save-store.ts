'use client'

import { create } from 'zustand'
import type { DropGrant, SaveGame } from '@wolf-sheep/game-core'
import { loadSave, persistSave } from '@/lib/storage'

type SaveStore = {
  save: SaveGame
  hydrated: boolean
  hydrate: () => void
  replace: (save: SaveGame) => void
  lastGrant: DropGrant | null
  setLastGrant: (g: DropGrant | null) => void
}

export const useSaveStore = create<SaveStore>((set) => ({
  save: loadSave(),
  hydrated: false,
  lastGrant: null,
  hydrate() {
    set({ save: loadSave(), hydrated: true })
  },
  replace(save) {
    persistSave(save)
    set({ save })
  },
  setLastGrant(g) {
    set({ lastGrant: g })
  },
}))
