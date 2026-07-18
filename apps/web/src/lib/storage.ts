import {
  defaultSave,
  migrate,
  SAVE_KEY,
  type SaveGame,
} from '@wolf-sheep/game-core'
import type { StoragePort } from '@wolf-sheep/web-shared'

export type IStorage = StoragePort

export const browserStorage: IStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, value)
    } catch (e) {
      console.warn('storage set failed', e)
    }
  },
  removeItem(key) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export function loadSave(storage: IStorage = browserStorage): SaveGame {
  try {
    const raw = storage.getItem(SAVE_KEY)
    if (!raw) return defaultSave()
    return migrate(JSON.parse(raw))
  } catch (e) {
    console.warn('save load failed, using default', e)
    return defaultSave()
  }
}

export function persistSave(save: SaveGame, storage: IStorage = browserStorage): void {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save))
  } catch (e) {
    console.warn('save persist failed', e)
  }
}
