import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '../src/content/levels'

const cardsDir = resolve(process.cwd(), '../../docs/产品核心/24关')

describe('level design card contract', () => {
  for (const level of LEVELS) {
    it(`${level.id} mirrors the player-facing runtime facts`, () => {
      const card = readFileSync(resolve(cardsDir, `${level.id}.md`), 'utf8')
      const targetEaten = level.targetEaten ?? 8
      const maxPlies = level.maxPlies ?? 300

      expect(card).toContain(`# ${level.id} · ${level.nameZh}`)
      expect(card).toContain(`- 前台中文文案：${level.blurbZh}`)
      expect(card).toContain(`AI 画像：\`${level.aiProfile}\``)
      expect(card).toContain(`AI 风格：主 \`${level.aiStyle.primary}\`；辅助 \`${level.aiStyle.secondary}\``)
      expect(card).not.toMatch(/羊方 AI `(?:easy|normal|hard)`/)
      expect(card).toContain(`\`targetEaten=${targetEaten}\``)
      expect(card).toContain(`\`maxPlies=${maxPlies}\``)
      expect(card).toContain('- 羊方主动意图：')
      expect(card).toContain('- 玩家反制方式：')
      expect(card).toContain('- 相邻差异：')
      expect(card).toContain('- 本关禁止体验：')
      expect(card).not.toContain('羊方防守假设：')
      expect(card).not.toMatch(/门禁 `(?:pass|review)`/)
      expect(card).not.toMatch(/(?:面对|使用) hard 羊 AI/)
    })
  }
})
