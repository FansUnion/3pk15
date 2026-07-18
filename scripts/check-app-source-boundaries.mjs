#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs'
import { relative, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const rules = [
  { app: 'player-web', forbidden: [/apps[\\/]admin/, /\.\.[\\/]admin/] },
]
const extensions = /\.(?:ts|tsx|js|mjs)$/
const violations = []

function collect(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.next' || entry.name === '.next-dev' || entry.name === 'node_modules' || entry.name === 'public') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collect(path, files)
    else if (extensions.test(entry.name)) files.push(path)
  }
  return files
}

for (const rule of rules) {
  const appRoot = join(root, 'apps', rule.app)
  for (const file of collect(appRoot)) {
    const source = readFileSync(file, 'utf8')
    for (const pattern of rule.forbidden) {
      if (pattern.test(source)) violations.push(`${relative(root, file)} matches ${pattern}`)
    }
  }
}

if (violations.length) {
  for (const violation of violations) console.error(`FORBIDDEN ${violation}`)
  process.exit(1)
}

console.log('check:app-source-boundaries: OK (player-web does not import Admin sources)')
