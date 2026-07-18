#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const gates = [
  ['game-core tests', ['--filter', '@wolf-sheep/game-core', 'test']],
  ['web tests', ['--filter', '@wolf-sheep/web', 'test']],
  ['platform boundaries', ['check:platform-boundaries']],
  ['player boundaries', ['check:player-boundaries']],
  ['public assets', ['--filter', '@wolf-sheep/web', 'check:assets']],
  ['production build', ['build:standalone']],
]
const results = []

for (const [name, args] of gates) {
  const started = Date.now()
  console.log(`\n=== ${name} ===`)
  const command = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm'
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', `pnpm ${args.join(' ')}`] : args
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit' })
  const ok = result.status === 0
  results.push({ gate: name, result: ok ? 'PASS' : 'FAIL', seconds: ((Date.now() - started) / 1000).toFixed(1) })
  if (!ok) {
    console.table(results)
    process.exit(result.status ?? 1)
  }
}

console.log('\n=== release check summary ===')
console.table(results)
console.log('release:check: PASS')
