#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const publicSkins = join(root, 'apps/web/public')

const required = [
  '/skins/default/wolf.svg',
  '/skins/default/sheep.svg',
  '/skins/frost/wolf.svg',
  '/skins/frost/sheep.svg',
  '/skins/boards/default.svg',
  '/skins/boards/spring.svg',
  '/skins/boards/summer.svg',
  '/skins/boards/autumn.svg',
  '/skins/boards/winter.svg',
]

let failed = false
for (const rel of required) {
  const path = join(publicSkins, rel.replace(/^\//, ''))
  if (!existsSync(path)) {
    console.error('MISSING', rel)
    failed = true
  }
}

if (failed) {
  process.exit(1)
}
console.log('check:skins: OK')
