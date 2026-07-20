import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))

for (const season of ['spring', 'summer', 'autumn', 'winter']) {
  for (let index = 1; index <= 6; index += 1) {
    const levelId = `${season}-${String(index).padStart(2, '0')}`
    const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
    const args = process.platform === 'win32'
      ? ['-NoProfile', '-Command', `$env:RUN_BALANCE_MATRIX='1'; $env:BALANCE_LEVEL='${levelId}'; pnpm exec vitest run tests/all-level-balance-matrix.test.ts --reporter=verbose`]
      : ['exec', 'vitest', 'run', 'tests/all-level-balance-matrix.test.ts', '--reporter=verbose']
    const result = spawnSync(command, args, {
      cwd,
      env: { ...process.env, RUN_BALANCE_MATRIX: '1', BALANCE_LEVEL: levelId },
      stdio: 'inherit',
    })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
}
