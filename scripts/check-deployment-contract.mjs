#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const env = readFileSync(join(root, 'apps/web/.env.example'), 'utf8')
const guide = readFileSync(join(root, 'apps/web/README.md'), 'utf8')
const standalone = readFileSync(join(root, 'distribution/standalone/README.md'), 'utf8')

const checks = [
  ['standalone shell is documented', /NEXT_PUBLIC_APP_SHELL=standalone/.test(env) && /NEXT_PUBLIC_APP_SHELL[\s|`]*standalone/.test(standalone)],
  ['standalone platform is documented', /NEXT_PUBLIC_PLATFORM=standalone/.test(env) && /NEXT_PUBLIC_PLATFORM[\s|`]*standalone/.test(standalone)],
  ['production ads are disabled', /NEXT_PUBLIC_ADS_PROVIDER=none/.test(env) && /NEXT_PUBLIC_ADS_PROVIDER[\s|`]*none/.test(standalone)],
  ['Admin is disabled for production', /ADMIN_ENABLED[\s|`]*false/.test(standalone) && /Admin.*关闭/.test(guide)],
  ['rollback is documented', /回滚/.test(standalone)],
]

const failures = checks.filter(([, ok]) => !ok)
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL ${label}`)
  process.exit(1)
}

console.log(`check:deployment-contract: OK (${checks.length} checks)`)
