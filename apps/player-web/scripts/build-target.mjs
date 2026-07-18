import { spawnSync } from 'node:child_process'
import { cpSync, rmSync, writeFileSync } from 'node:fs'
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
cpSync(join(appRoot, '../web/public'), join(appRoot, 'public'), { recursive: true })

const command = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm'
const commandArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'pnpm exec next build']
  : ['exec', 'next', 'build']
const result = spawnSync(command, commandArgs, {
  cwd: appRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_SHELL: platform === 'standalone' ? 'standalone' : 'portal',
    NEXT_PUBLIC_PLATFORM: platform,
    NEXT_PUBLIC_ADS_PROVIDER: platform === 'standalone' ? 'none' : 'portal_sdk',
    ADMIN_ENABLED: 'false',
  },
  stdio: 'inherit',
})
if (result.error) {
  console.error(`Unable to start player build: ${result.error.message}`)
  process.exit(1)
}
if (result.status !== 0) process.exit(result.status ?? 1)

const revision = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
  cwd: appRoot,
  encoding: 'utf8',
}).stdout?.trim() || 'unknown'
writeFileSync(join(appRoot, '.next/fangrush-build.json'), `${JSON.stringify({
  app: 'player-web',
  target: platform,
  appShell: platform === 'standalone' ? 'standalone' : 'portal',
  adsProvider: platform === 'standalone' ? 'none' : 'portal_sdk',
  adminEnabled: false,
  revision,
}, null, 2)}\n`)
