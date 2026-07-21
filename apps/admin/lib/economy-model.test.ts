import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { currentQuestRewardBudget, questWeeklyMaximum, simulateEconomyScenario } from '@wolf-sheep/game-core'

describe('Admin economy model', () => {
  it('uses a 40-shard current weekly quest budget and preserves collection runway', () => {
    expect(questWeeklyMaximum(currentQuestRewardBudget())).toBe(40)
    const current = simulateEconomyScenario({ days: 28, activity: 'regular', ads: 'half', questBudget: 'current' })
    const legacy = simulateEconomyScenario({ days: 28, activity: 'regular', ads: 'half', questBudget: 'legacy' })
    expect(current.earned.quests).toBeLessThan(legacy.earned.quests)
    expect(current.nextTarget?.id).toBe('wolf-aurora')
  })

  it('labels activity tiers as models instead of production player analytics', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/admin/economy/page.tsx'), 'utf8')
    expect(source).toContain('不是真实玩家统计')
    expect(source).toContain('当前没有生产玩家数据源')
    expect(source).toContain('假设玩家经济模型')
  })
})
