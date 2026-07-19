import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LEVELS, WOLF_STRATEGIES } from '@wolf-sheep/game-core'
import { buildLevelGuidance } from './level-guidance'
import { en, formatRockCount, zh } from './messages'

const bannedPlayerTerms = [
  'gap-eat', 'gap-rush', 'gap-cut', 'pickSheepAction', 'targetEaten', 'maxPlies',
  'Stalemate', '秋密岩', '冬空盘', '第 1 行', 'toward row 1',
]

function stringLeaves(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringLeaves)
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringLeaves)
  return []
}

describe('player-facing copy contract', () => {
  it('uses one understandable rule vocabulary', () => {
    const publicCopy = stringLeaves({
      en,
      zh,
      levels: LEVELS.map((level) => [level.nameEn, level.nameZh, level.blurbEn, level.blurbZh, level.teachingPoint]),
      strategies: WOLF_STRATEGIES,
    }).join('\n')
    for (const term of bannedPlayerTerms) expect(publicCopy).not.toContain(term)

    const llmsSource = readFileSync(resolve(process.cwd(), 'app/llms.txt/route.ts'), 'utf8')
    expect(llmsSource).not.toMatch(/gap-(?:eat|rush|cut)/)
  })

  it('formats rock counts naturally in both languages', () => {
    expect(formatRockCount(0, 'en', en)).toBe('No rocks')
    expect(formatRockCount(1, 'en', en)).toBe('1 rock')
    expect(formatRockCount(2, 'en', en)).toBe('2 rocks')
    expect(formatRockCount(0, 'zh', zh)).toBe('无岩石')
    expect(formatRockCount(1, 'zh', zh)).toBe('1 枚岩石')
    expect(formatRockCount(2, 'zh', zh)).toBe('2 枚岩石')
  })

  it('keeps all 24 three-step hints concise and free of internal terms', () => {
    for (const level of LEVELS) {
      for (const locale of ['en', 'zh'] as const) {
        const guidance = buildLevelGuidance(level, locale)
        expect(guidance).toHaveLength(3)
        expect(new Set(guidance).size).toBe(3)
        for (const line of guidance) {
          expect(line.length).toBeGreaterThan(5)
          expect(line.length).toBeLessThanOrEqual(180)
          for (const term of bannedPlayerTerms) expect(line).not.toContain(term)
        }
      }
    }
  })

  it('keeps locked access, help diagrams, machine links and ads on their intended surfaces', () => {
    const gate = readFileSync(resolve(process.cwd(), 'components/LevelAccessGate.tsx'), 'utf8')
    const list = readFileSync(resolve(process.cwd(), 'components/LevelList.tsx'), 'utf8')
    const help = readFileSync(resolve(process.cwd(), 'components/HelpContent.tsx'), 'utf8')
    const footer = readFileSync(resolve(process.cwd(), 'components/SiteChrome.tsx'), 'utf8')
    const play = readFileSync(resolve(process.cwd(), 'components/PlayScreen.tsx'), 'utf8')

    expect(gate).toContain('isLevelUnlocked')
    expect(list).toContain('isLevelUnlocked')
    expect(help).toContain('<BoardSvg')
    expect(footer).toContain('<details')
    expect(footer).toContain('/llms.txt')
    expect(play).toContain("NEXT_PUBLIC_ADS_PROVIDER !== 'none'")
  })
})
