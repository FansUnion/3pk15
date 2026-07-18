import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const cwd = dirname(fileURLToPath(import.meta.url))
const webRoot = join(cwd, '..')
const requestedPlatform = process.argv[2] ?? 'standalone'
const platform = ['standalone', 'poki', 'crazygames'].includes(requestedPlatform)
  ? requestedPlatform
  : 'standalone'

const env = {
  ...process.env,
  NEXT_PUBLIC_APP_SHELL: platform === 'standalone' ? 'standalone' : 'portal',
  NEXT_PUBLIC_PLATFORM: platform,
  // Standalone production is an ad-free demo. Portal builds keep the
  // provider boundary explicit until a real platform adapter is supplied.
  NEXT_PUBLIC_ADS_PROVIDER: platform === 'standalone' ? 'unavailable' : 'portal_sdk',
  ADMIN_ENABLED: 'false',
}

const result = spawnSync('pnpm', ['exec', 'next', 'build'], {
  cwd: webRoot,
  env,
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 1)
