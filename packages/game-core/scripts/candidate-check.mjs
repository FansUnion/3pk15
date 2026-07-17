import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))

for (const season of ['spring', 'summer', 'autumn', 'winter']) {
  const result = spawnSync(
    process.platform === 'win32' ? 'powershell.exe' : 'pnpm',
    process.platform === 'win32'
      ? ['-NoProfile', '-Command', `$env:RUN_CANDIDATE_ACCEPTANCE='1'; pnpm exec vitest run tests/candidate-acceptance.test.ts -t '${season} verdicts' --reporter=verbose`]
      : ['exec', 'vitest', 'run', 'tests/candidate-acceptance.test.ts', '-t', `${season} verdicts`, '--reporter=verbose'],
    { cwd, env: { ...process.env, RUN_CANDIDATE_ACCEPTANCE: '1' }, stdio: 'inherit' },
  )
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
