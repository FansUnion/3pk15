import { describe, expect, it } from 'vitest'
import { buildShareText, type ShareResultData } from './share-result'

const data = {
  levelId: 'spring-01', levelName: 'First Trail', result: 'won', plies: 18,
  eatenSheep: 8, url: 'https://example.test/hunt/spring-01', state: { targetEaten: 8 }, reason: 'Target reached',
} as ShareResultData

describe('buildShareText', () => {
  it('includes reproducible result facts in English', () => {
    expect(buildShareText(data, 'en')).toContain('Wolves win after 18 actions, captured 8/8')
    expect(buildShareText(data, 'en')).toContain(data.url)
  })

  it('includes reproducible result facts in Chinese', () => {
    expect(buildShareText(data, 'zh')).toContain('狼方获胜，行动 18 次，捕获 8/8')
  })
})
