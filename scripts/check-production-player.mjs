#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.env.PLAYER_PRODUCTION_URL || 'https://fangrush.com').replace(/\/$/, '')
const strict = process.argv.includes('--strict')
const routes = [
  ['/', 'Fangrush'], ['/zh', '四季猎场'], ['/zh/settings', '声音试听'],
  ['/zh/chapters', '选择猎场'], ['/zh/how-to-play', '重复局面会先预警'],
  ['/zh/levels/spring', '切换季节'], ['/zh/levels/summer', '切换季节'],
  ['/zh/levels/autumn', '秋日'], ['/zh/levels/winter', '冬日'],
  ['/zh/hunt/spring-01', '春日 01'], ['/zh/play/spring-01', '__next_f'],
  ['/zh/skins', '花汐猎场'], ['/zh/quests', '手动领取奖励'], ['/zh/privacy', '隐私说明'],
  ['/robots.txt', 'User-Agent'], ['/sitemap.xml', '<urlset'], ['/llms.txt', 'Fangrush'],
]
const sounds = ['step', 'sheep-step', 'capture', 'chain', 'threat', 'trapped', 'win', 'lose', 'draw', 'select', 'invalid', 'ai', 'unlock', 'equip']
const boards = ['spring-blossom', 'summer-stream', 'autumn-harvest']
const failures = []
const outdated = []

for (const [path, marker] of routes) {
  try {
    const response = await fetch(`${base}${path}`, { redirect: 'follow', cache: 'no-store' })
    const body = await response.text()
    const ok = response.ok && body.includes(marker)
    console.log(`${ok ? 'PASS' : 'FAIL'} route ${path} status=${response.status} marker=${JSON.stringify(marker)}`)
    if (!ok) failures.push(`route ${path}`)
  } catch (error) {
    console.log(`FAIL route ${path} ${error instanceof Error ? error.message : String(error)}`)
    failures.push(`route ${path}`)
  }
}

for (const name of sounds) {
  const local = await readFile(join(root, 'packages/web-assets/public/sfx', `${name}.wav`))
  const response = await fetch(`${base}/sfx/${name}.wav`, { cache: 'no-store' })
  const remote = Buffer.from(await response.arrayBuffer())
  const hash = (value) => createHash('sha256').update(value).digest('hex')
  const matches = response.ok && hash(local) === hash(remote)
  console.log(`${matches ? 'PASS' : 'OLD '} sound ${name} status=${response.status} bytes=${remote.length}`)
  if (!response.ok) failures.push(`sound ${name}`)
  else if (!matches) outdated.push(name)
}

for (const name of boards) {
  const local = await readFile(join(root, 'packages/web-assets/public/skins/boards', `${name}.svg`))
  const response = await fetch(`${base}/skins/boards/${name}.svg`, { cache: 'no-store' })
  const remote = Buffer.from(await response.arrayBuffer())
  const hash = (value) => createHash('sha256').update(value).digest('hex')
  const matches = response.ok && hash(local) === hash(remote)
  console.log(`${matches ? 'PASS' : response.ok ? 'OLD ' : 'FAIL'} board ${name} status=${response.status} bytes=${remote.length}`)
  if (!response.ok) failures.push(`board ${name}`)
  else if (!matches) outdated.push(`board:${name}`)
}

console.log(`production audit: ${routes.length} routes, ${sounds.length} sounds, ${boards.length} premium boards, ${failures.length} failures, ${outdated.length} outdated assets`)
if (strict && (failures.length || outdated.length)) process.exit(1)
