#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const appRoot = join(root, 'apps/player-web')
const roots = ['.next/server', '.next/static', 'public'].map((name) => join(appRoot, name)).filter(existsSync)
const manifestPath = join(appRoot, '.next/fangrush-build.json')

if (!roots.length) {
  console.error('report:player-build: no player build found; run pnpm build:standalone first')
  process.exit(1)
}

if (!existsSync(manifestPath)) {
  console.error('report:player-build: missing fangrush-build.json; use a target build command')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const expected = process.argv.find((arg) => arg.startsWith('--expect='))?.slice('--expect='.length)
if (expected && manifest.target !== expected) {
  console.error(`report:player-build: expected ${expected}, found ${manifest.target}`)
  process.exit(1)
}

const files = []
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collect(path)
    else files.push({ path: relative(appRoot, path), bytes: statSync(path).size })
  }
}
for (const directory of roots) collect(directory)

const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0)
const largest = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 10)
const mib = (bytes) => (bytes / 1024 / 1024).toFixed(2)

console.log(`report:player-build: ${manifest.target} @ ${manifest.revision}; ${files.length} files, ${mib(totalBytes)} MiB on disk`)
console.table(largest.map((file) => ({ file: file.path, MiB: mib(file.bytes) })))
