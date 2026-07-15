import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const cwd = dirname(fileURLToPath(import.meta.url))
const webRoot = join(cwd, '..')

const env = {
  ...process.env,
  NEXT_PUBLIC_APP_SHELL: 'portal',
  ADMIN_ENABLED: 'false',
}

const result = spawnSync('pnpm', ['exec', 'next', 'build'], {
  cwd: webRoot,
  env,
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 1)
