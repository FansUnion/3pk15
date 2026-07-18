#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const buildScript = readFileSync(join(root, 'apps/player-web/scripts/build-target.mjs'), 'utf8')
const playScreen = readFileSync(join(root, 'apps/player-web/components/PlayScreen.tsx'), 'utf8')
const envExample = readFileSync(join(root, 'apps/player-web/.env.example'), 'utf8')
const rootPackage = readFileSync(join(root, 'package.json'), 'utf8')

const checks = [
  ['unsupported platform targets fail explicitly', buildScript, /if \(!supported\.includes\(platform\)\)/],
  ['standalone uses the standalone shell', buildScript, /platform === 'standalone' \? 'standalone' : 'portal'/],
  ['standalone is ad-free', buildScript, /platform === 'standalone' \? 'none' : 'portal_sdk'/],
  ['player builds disable Admin', buildScript, /ADMIN_ENABLED: 'false'/],
  ['target manifest is written', buildScript, /fangrush-build\.json/],
  ['loading completion reaches gameplay', playScreen, /platform\.loadingFinished\(\)/],
  ['gameplay start reaches player input', playScreen, /getPlatform\(\)\.gameplayStart\(\)/],
  ['gameplay stop reaches terminal or cleanup', playScreen, /getPlatform\(\)\.gameplayStop\(\)/],
  ['visibility changes reach platform lifecycle', playScreen, /visibilitychange/],
  ['portal play prevents parent-page wheel scrolling', playScreen, /addEventListener\('wheel'[\s\S]*passive: false/],
  ['player environment defaults to no ads', envExample, /NEXT_PUBLIC_ADS_PROVIDER=none/],
  ['all target verification aliases exist', rootPackage, /verify:player:standalone[\s\S]*verify:player:poki[\s\S]*verify:player:crazygames/],
]

const failures = checks.filter(([, source, pattern]) => !pattern.test(source))
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL ${label}`)
  process.exit(1)
}

console.log(`check:platform-boundaries: OK (${checks.length} checks)`)
