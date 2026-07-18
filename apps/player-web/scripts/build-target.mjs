import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const platform = process.argv[2] ?? 'standalone'
const supported = ['standalone', 'poki', 'crazygames']
if (!supported.includes(platform)) {
  console.error(`Unsupported platform "${platform}". Expected one of: ${supported.join(', ')}`)
  process.exit(1)
}

rmSync(join(appRoot, '.next'), { recursive: true, force: true })

const result = spawnSync('pnpm', ['exec', 'next', 'build'], {
  cwd: appRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_SHELL: platform === 'standalone' ? 'standalone' : 'portal',
    NEXT_PUBLIC_PLATFORM: platform,
    NEXT_PUBLIC_ADS_PROVIDER: platform === 'standalone' ? 'none' : 'portal_sdk',
    ADMIN_ENABLED: 'false',
  },
  stdio: 'inherit',
  shell: true,
})
process.exit(result.status ?? 1)
