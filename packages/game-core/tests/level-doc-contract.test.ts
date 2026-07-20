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
      expect(card).toContain(`羊方 AI \`${level.ai}\``)
      expect(card).toContain(`AI 画像：\`${level.aiProfile}\``)
      expect(card).toContain(`\`targetEaten=${targetEaten}\``)
      expect(card).toContain(`\`maxPlies=${maxPlies}\``)
    })
  }
})
