import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultSave, SAVE_KEY } from '@wolf-sheep/game-core'
import { loadSave, persistSave, type IStorage } from './storage'

function memoryStorage(value: string | null = null): IStorage & { value: string | null } {
  return {
    value,
    getItem() { return this.value },
    setItem(_key, next) { this.value = next },
    removeItem() { this.value = null },
  }
}

describe('web save storage', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => undefined))
  afterEach(() => vi.restoreAllMocks())

  it('falls back to a valid default for corrupt JSON', () => {
    expect(loadSave(memoryStorage('{bad json'))).toEqual(defaultSave())
  })

  it('survives unavailable browser storage', () => {
    const unavailable: IStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() {} }
    expect(loadSave(unavailable)).toEqual(defaultSave())
    expect(() => persistSave(defaultSave(), unavailable)).not.toThrow()
  })

  it('persists a migratable save under the canonical key', () => {
    const storage = memoryStorage()
    persistSave(defaultSave(), storage)
    expect(storage.value).toContain('schemaVersion')
    expect(loadSave(storage)).toEqual(defaultSave())
    expect(SAVE_KEY).toBe('wolf-sheep-save-v1')
  })
})
