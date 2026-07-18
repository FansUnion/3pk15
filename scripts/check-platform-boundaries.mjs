#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const buildScript = readFileSync(join(root, 'apps/web/scripts/build-portal.mjs'), 'utf8')
const envExample = readFileSync(join(root, 'apps/web/.env.example'), 'utf8')

const checks = [
  ['standalone uses the standalone shell', buildScript, /NEXT_PUBLIC_APP_SHELL:\s*platform === 'standalone' \? 'standalone' : 'portal'/],
  ['standalone is ad-free in production builds', buildScript, /NEXT_PUBLIC_ADS_PROVIDER:\s*platform === 'standalone' \? 'unavailable' : 'portal_sdk'/],
  ['portal builds disable Admin', buildScript, /ADMIN_ENABLED:\s*'false'/],
  ['environment example defaults to no ads', envExample, /NEXT_PUBLIC_ADS_PROVIDER=none/],
]

const failures = checks.filter(([, source, pattern]) => !pattern.test(source))

if (failures.length) {
  for (const [label] of failures) console.error(`FAIL ${label}`)
  process.exit(1)
}

console.log(`check:platform-boundaries: OK (${checks.length} checks)`)
