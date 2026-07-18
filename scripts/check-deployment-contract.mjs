#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const env = readFileSync(join(root, 'apps/player-web/.env.example'), 'utf8')
const standalone = readFileSync(join(root, 'distribution/standalone/README.md'), 'utf8')

const checks = [
  ['standalone shell is configured', /NEXT_PUBLIC_APP_SHELL=standalone/.test(env)],
  ['standalone platform is configured', /NEXT_PUBLIC_PLATFORM=standalone/.test(env)],
  ['production ads are disabled', /NEXT_PUBLIC_ADS_PROVIDER=none/.test(env)],
  ['player env excludes Admin settings', !/ADMIN_ENABLED|ADMIN_ACCESS_KEY/.test(env)],
  ['player artifact audit is documented', /audit:player-artifact/.test(standalone)],
  ['player production start is documented', /@wolf-sheep\/player-web start/.test(standalone)],
  ['rollback is documented', /回滚/.test(standalone)],
]

const failures = checks.filter(([, ok]) => !ok)
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL ${label}`)
  process.exit(1)
}

console.log(`check:deployment-contract: OK (${checks.length} checks)`)
