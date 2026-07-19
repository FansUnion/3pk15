import { describe, expect, it } from 'vitest'
import { defaultSave } from '@wolf-sheep/game-core'
import { resolveHomeContinuation } from './home-continuation'

describe('resolveHomeContinuation', () => {
  it('starts at the first hunt for a new player', () => {
    expect(resolveHomeContinuation(defaultSave())).toEqual({ levelId: 'spring-01', mode: 'start' })
  })

  it('continues the most recently entered unfinished hunt', () => {
    expect(resolveHomeContinuation({ ...defaultSave(), lastPlayedLevelId: 'spring-03' })).toEqual({ levelId: 'spring-03', mode: 'continue' })
  })

  it('names the next hunt after clearing the recent hunt', () => {
    expect(resolveHomeContinuation({ ...defaultSave(), lastPlayedLevelId: 'spring-03', clearedLevels: ['spring-03'] })).toEqual({ levelId: 'spring-04', mode: 'next' })
  })

  it('offers a replay after the final hunt', () => {
    expect(resolveHomeContinuation({ ...defaultSave(), lastPlayedLevelId: 'winter-06', clearedLevels: ['winter-06'] })).toEqual({ levelId: 'winter-06', mode: 'replay' })
  })
})
