#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const playerTestArgs = ['--filter', '@wolf-sheep/player-web', 'test', '--', '--reporter=verbose']
if (process.env.GITHUB_ACTIONS === 'true') playerTestArgs.push('--reporter=github-actions')
const allGates = [
  ['core-tests', 'game-core tests', ['--filter', '@wolf-sheep/game-core', 'test']],
  ['core-types', 'game-core typecheck', ['--filter', '@wolf-sheep/game-core', 'lint']],
  ['player-tests', 'player tests', playerTestArgs],
  ['admin-tests', 'admin tests', ['--filter', '@wolf-sheep/admin', 'test', '--', '--reporter=verbose']],
  ['platform-boundaries', 'platform boundaries', ['check:platform-boundaries']],
  ['player-boundaries', 'player boundaries', ['check:player-boundaries']],
  ['source-boundaries', 'application source boundaries', ['check:app-source-boundaries']],
  ['deployment-contract', 'deployment contract', ['check:deployment-contract']],
  ['assets', 'public assets', ['--filter', '@wolf-sheep/web-assets', 'check']],
  ['skins', 'skin catalog', ['check:skins']],
  ['player-build', 'production build', ['build:standalone']],
  ['player-report', 'player build report', ['report:player-build', '--', '--expect=standalone']],
  ['player-artifact', 'player artifact', ['audit:player-artifact']],
  ['external-boundary', 'player external boundary', ['audit:player-portal']],
  ['admin-build', 'admin production build', ['build:admin']],
  ['admin-artifact', 'admin artifact', ['audit:admin-artifact']],
]
const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length)
const gates = only ? allGates.filter(([id]) => id === only) : allGates
if (only && gates.length === 0) {
  console.error(`Unknown release gate: ${only}`)
  process.exit(2)
}
const results = []

for (const [, name, args] of gates) {
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
