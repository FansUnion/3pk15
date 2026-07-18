#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const appRoot = join(root, 'apps/web/src/app')
const playerRoots = ['chapters', 'how-to-play', 'hunt', 'levels', 'play', 'privacy', 'quests', 'settings', 'skins']
const forbidden = [
  '@/components/admin',
  '/api/admin',
  'components/admin',
]

const files = []
function collect(directory) {
  if (/\.(ts|tsx)$/.test(directory)) {
    files.push(directory)
    return
  }
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collect(path)
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path)
  }
}

for (const rootName of playerRoots) collect(join(appRoot, rootName))
collect(join(appRoot, 'page.tsx'))

const violations = []
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  for (const token of forbidden) {
    if (source.includes(token)) violations.push(`${file}: ${token}`)
  }
}

if (violations.length) {
  for (const violation of violations) console.error(`FORBIDDEN ${violation}`)
  process.exit(1)
}

console.log(`check:player-boundaries: OK (${files.length} player entry files)`)
