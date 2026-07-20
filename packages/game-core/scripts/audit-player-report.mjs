import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))
const supplied = process.argv[2]
if (!supplied) {
  console.error('Usage: pnpm report:audit -- <player-report.json>')
  process.exit(2)
}
const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
const args = process.platform === 'win32'
  ? ['-NoProfile', '-Command', 'pnpm exec vitest run tests/player-report-cli.test.ts --reporter=verbose']
  : ['exec', 'vitest', 'run', 'tests/player-report-cli.test.ts', '--reporter=verbose']
const result = spawnSync(command, args, {
  cwd,
  env: { ...process.env, PLAYER_REPORT_PATH: resolve(supplied) },
  stdio: 'inherit',
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
