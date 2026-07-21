import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Admin play routing boundary', () => {
  it('keeps Admin links outside player locale prefixes', () => {
    const play = readFileSync(resolve(process.cwd(), '../player-web/components/PlayScreen.tsx'), 'utf8')
    expect(play).toContain('function ScopedLink')
    expect(play).toMatch(/adminMode\s*\?\s*<Link href=\{href\}/)
    expect(play).not.toContain("<LocaleLink href={adminMode ? '/admin/levels'")
  })
})
