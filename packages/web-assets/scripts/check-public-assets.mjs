#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(packageRoot, '../..')
const publicRoot = join(packageRoot, 'public')
const scanRoots = [
  join(repoRoot, 'apps/player-web/app'),
  join(repoRoot, 'apps/player-web/components'),
  join(repoRoot, 'apps/player-web/lib'),
  join(repoRoot, 'apps/admin/app'),
  join(repoRoot, 'apps/admin/components'),
  join(repoRoot, 'apps/admin/lib'),
  join(repoRoot, 'packages/game-core/src'),
]
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs'])
const assetPattern = /['"](\/[A-Za-z0-9_./-]+\.(?:svg|png|jpe?g|webp|wav|mp3|ogg))['"]/g
const referenced = new Set()
const requiredSfx = ['step', 'sheep-step', 'capture', 'chain', 'threat', 'trapped', 'win', 'lose', 'draw', 'select', 'invalid', 'ai', 'unlock', 'equip']

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

for (const name of requiredSfx) {
  const file = join(publicRoot, 'sfx', `${name}.wav`)
  if (!existsSync(file)) {
    console.error('MISSING SFX', name)
    process.exit(1)
  }
  const wav = readFileSync(file)
  const validHeader = wav.length >= 48 && wav.toString('ascii', 0, 4) === 'RIFF' && wav.toString('ascii', 8, 12) === 'WAVE'
  const sampleRate = validHeader ? wav.readUInt32LE(24) : 0
  const dataSize = validHeader ? wav.readUInt32LE(40) : 0
  const duration = sampleRate ? dataSize / 2 / sampleRate : 0
  let peak = 0
  for (let offset = 44; offset + 1 < wav.length; offset += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(offset)))
  if (!validHeader || sampleRate !== 22050 || duration < 0.04 || duration > 1 || peak < 500) {
    console.error('INVALID SFX', name, { sampleRate, duration, peak })
    process.exit(1)
  }
}
console.log(`check:assets: OK (${referenced.size} referenced files, ${requiredSfx.length} verified sounds)`)
