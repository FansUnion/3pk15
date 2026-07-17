import { describe, expect, it } from 'vitest'
import { buildShareText, type ShareResultData } from './share-result'

const data = {
  levelId: 'spring-01', levelName: 'First Trail', result: 'won', plies: 18,
  eatenSheep: 8, url: 'https://example.test/hunt/spring-01', state: {}, reason: 'Target reached',
} as ShareResultData

describe('buildShareText', () => {
  it('includes reproducible result facts in English', () => {
    expect(buildShareText(data, 'en')).toContain('Wolves win in 18 plies with 8 sheep captured')
    expect(buildShareText(data, 'en')).toContain(data.url)
  })

  it('includes reproducible result facts in Chinese', () => {
    expect(buildShareText(data, 'zh')).toContain('狼方获胜，18 plies，捕食 8 只羊')
  })
})
