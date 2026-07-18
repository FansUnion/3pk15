#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicRoot = join(webRoot, '../../packages/web-assets/public')
const scanRoots = [join(webRoot, 'src'), join(webRoot, '../../packages/game-core/src')]
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs'])
const assetPattern = /['"](\/[A-Za-z0-9_./-]+\.(?:svg|png|jpe?g|webp|wav|mp3|ogg))['"]/g
const referenced = new Set()

function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) scan(path)
    else if (sourceExtensions.has(extname(entry.name))) {
      const source = readFileSync(path, 'utf8')
      for (const match of source.matchAll(assetPattern)) referenced.add(match[1])
    }
  }
}

for (const root of scanRoots) scan(root)
// The failure-recovery tests deliberately reference these virtual paths.
// They must exercise the fallback renderer without becoming production assets.
const missing = [...referenced].filter(
  (asset) => !asset.startsWith('/__missing__/') && !existsSync(join(publicRoot, asset.slice(1))),
)
if (missing.length) {
  for (const asset of missing) console.error('MISSING', asset)
  process.exit(1)
}
console.log(`check:assets: OK (${referenced.size} referenced files)`)
