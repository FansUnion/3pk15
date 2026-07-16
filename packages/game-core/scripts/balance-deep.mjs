import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const groups = [
  'spring 1-3', 'spring 4-6',
  'summer 1-3', 'summer 4-6',
  'autumn 1-3', 'autumn 4-6',
  'winter 1-3', 'winter 4-6',
]
const cwd = fileURLToPath(new URL('../', import.meta.url))

for (const group of groups) {
  const args = ['exec', 'vitest', 'run', 'tests/balance-deep.test.ts', '-t', group]
  const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
  const commandArgs = process.platform === 'win32'
    ? ['-NoProfile', '-Command', `$env:RUN_DEEP_BALANCE='1'; $env:PRINT_DEEP_BALANCE='1'; pnpm exec vitest run tests/balance-deep.test.ts -t '${group}'`]
    : args
  const result = spawnSync(
    command,
    commandArgs,
    {
      cwd,
      env: { ...process.env, RUN_DEEP_BALANCE: '1', PRINT_DEEP_BALANCE: '1' },
      stdio: 'inherit',
    },
  )
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
