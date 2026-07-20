const { mkdirSync, renameSync, rmSync, statSync } = require('node:fs')
const { resolve } = require('node:path')
const { spawnSync } = require('node:child_process')
const { chromium } = require('playwright')

const root = resolve(__dirname, '..', '..')
const baseArg = process.argv.find((value) => value.startsWith('--base-url='))
const baseUrl = (baseArg?.slice('--base-url='.length) || 'http://localhost:5011').replace(/\/$/, '')
const screenshotDir = resolve(root, 'distribution/common/screenshots/candidates')
const crazyDir = resolve(root, 'distribution/crazygames/assets')
const pokiDir = resolve(root, 'distribution/poki/assets')
const tempDir = resolve(root, 'distribution/.capture-tmp')

for (const dir of [screenshotDir, crazyDir, pokiDir, tempDir]) mkdirSync(dir, { recursive: true })

const allLevels = ['spring', 'summer', 'autumn', 'winter'].flatMap((chapter) =>
  Array.from({ length: 6 }, (_, index) => `${chapter}-${String(index + 1).padStart(2, '0')}`),
)

const save = {
  schemaVersion: 1,
  clearedLevels: allLevels,
  unlockedChapters: ['spring', 'summer', 'autumn', 'winter'],
  fragments: { universal: 99, season: { spring: 99, summer: 99, autumn: 99, winter: 99 } },
  unlockedSkinIds: ['wolf-default', 'board-default', 'board-spring'],
  equipped: { wolfSetId: 'wolf-default', boardId: 'board-default' },
  guide: { spring1Done: true, hintUsage: {}, failureStreak: {} },
  settings: { muted: true },
  buffs: { doubleDropUntil: null },
  quests: { daily: { key: '', progress: {}, claimed: [] }, weekly: { key: '', progress: {}, claimed: [] } },
  lastPlayedLevelId: 'spring-01',
}

async function newContext(browser, options = {}) {
  const context = await browser.newContext({ locale: 'en-US', colorScheme: 'light', ...options })
  await context.addInitScript((preparedSave) => {
    localStorage.clear()
    localStorage.setItem('wolf-sheep-save-v1', JSON.stringify(preparedSave))
  }, save)
  return context
}

async function openLevel(page, levelId) {
  await page.goto(`${baseUrl}/play/${levelId}`, { waitUntil: 'domcontentloaded' })
  await page.locator('svg[role="img"]').waitFor({ timeout: 30000 })
  await page.addStyleTag({
    content: '*{cursor:none!important}.mx-auto.flex.min-h-dvh.max-w-lg{max-width:1100px!important}.game-board-frame{max-width:min(74vh,76vw,760px)!important}',
  })
  const skip = page.getByRole('button', { name: /skip/i })
  if (await skip.isVisible().catch(() => false)) await skip.click()
  await page.waitForTimeout(1200)
}

function boardPos(label) {
  const match = /row (\d+), column (\d+)/.exec(label || '')
  return match ? { r: Number(match[1]), c: Number(match[2]) } : null
}

function safeRemove(path) {
  try {
    rmSync(path, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  } catch (error) {
    console.warn(`Could not remove temporary capture path ${path}: ${error.code || error.message}`)
  }
}

async function makeWolfAction(page) {
  const wolves = page.locator('circle[role="button"][aria-label^="Wolf at row"]')
  for (let index = 0; index < await wolves.count(); index++) {
    await wolves.nth(index).click()
    await page.waitForTimeout(80)

    const danger = page.locator('circle.danger-ring').first()
    if (await danger.count()) {
      const cx = await danger.getAttribute('cx')
      const cy = await danger.getAttribute('cy')
      const target = page.locator(`circle[role="button"][aria-label^="Board position"][cx="${cx}"][cy="${cy}"]`)
      if (await target.count()) {
        await target.click()
        await page.waitForTimeout(420)
        return 'capture'
      }
    }

    const targets = page.locator('circle[role="button"][aria-label^="Board position"]')
    const candidates = []
    for (let targetIndex = 0; targetIndex < await targets.count(); targetIndex++) {
      const target = targets.nth(targetIndex)
      const label = await target.getAttribute('aria-label')
      const pos = boardPos(label)
      if (pos) candidates.push({ target, ...pos })
    }
    candidates.sort((left, right) => left.r - right.r || Math.abs(left.c - 3.5) - Math.abs(right.c - 3.5))
    if (candidates[0]) {
      await candidates[0].target.click()
      await page.waitForTimeout(700)
      return 'step'
    }
  }
  return 'none'
}

async function waitForWolfDecision(page, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await page.locator('circle[role="button"][aria-label^="Wolf at row"]').count()) return true
    const body = await page.locator('body').innerText()
    if (/Hunt complete|Challenge failed|Draw|Victory|Defeat/i.test(body)) return false
    await page.waitForTimeout(100)
  }
  throw new Error('Timed out waiting for the next playable wolf turn')
}

async function boardSignature(page) {
  const labels = await page.locator('[aria-label^="Wolf at row"], [aria-label^="Sheep at row"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('aria-label')).filter(Boolean).sort(),
  )
  const text = await page.locator('body').innerText()
  return `${labels.join('|')}::${/Captured (\d+)\//.exec(text)?.[1] || '0'}`
}

async function captureScreenshots(browser) {
  const context = await newContext(browser, { viewport: { width: 720, height: 900 }, deviceScaleFactor: 1.5 })
  const page = await context.newPage()
  const scenes = [
    ['spring-01', '01-spring-opening-1080x1350.png', true],
    ['summer-04', '02-summer-routes-1080x1350.png', true],
    ['autumn-04', '03-autumn-rocks-1080x1350.png', true],
    ['winter-04', '04-winter-pressure-1080x1350.png', true],
  ]
  for (const [levelId, file, selectWolf] of scenes) {
    await openLevel(page, levelId)
    if (selectWolf) {
      await page.locator('circle[role="button"][aria-label^="Wolf at row"]').first().click()
      await page.waitForTimeout(250)
    }
    await page.screenshot({ path: resolve(screenshotDir, file) })
  }

  await openLevel(page, 'spring-01')
  let captured = false
  for (let turn = 0; turn < 36 && !captured; turn++) {
    const before = await page.locator('body').innerText()
    const beforeCount = Number(/Captured (\d+)\//.exec(before)?.[1] || 0)
    await makeWolfAction(page)
    await page.waitForTimeout(500)
    const after = await page.locator('body').innerText()
    const afterCount = Number(/Captured (\d+)\//.exec(after)?.[1] || 0)
    if (afterCount > beforeCount) {
      await page.screenshot({ path: resolve(screenshotDir, '05-capture-moment-1080x1350.png') })
      captured = true
    }
  }
  await context.close()
  return captured
}

async function record(browser, name, viewport, levelId, seconds, outputPath, outputSize = viewport) {
  const dir = resolve(tempDir, `${name}-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  const context = await newContext(browser, { viewport, recordVideo: { dir, size: viewport } })
  const page = await context.newPage()
  const started = Date.now()
  const trimSeconds = 3
  let actions = 0
  await openLevel(page, levelId)
  while (Date.now() - started < (seconds + trimSeconds) * 1000 - 500) {
    const playable = await waitForWolfDecision(page)
    if (!playable) break
    const before = await boardSignature(page)
    const result = await makeWolfAction(page)
    if (result === 'none') throw new Error(`No wolf action found while ${name} reported a playable wolf turn`)
    const after = await boardSignature(page)
    if (after === before) throw new Error(`Wolf action did not change the recorded position for ${name}`)
    actions += 1
  }
  const minimumActions = seconds <= 6 ? 2 : 5
  if (actions < minimumActions) throw new Error(`${name} recorded only ${actions} actions; expected at least ${minimumActions}`)
  const remaining = (seconds + trimSeconds) * 1000 - (Date.now() - started)
  if (remaining > 0) await page.waitForTimeout(remaining)
  const video = page.video()
  await context.close()
  const source = await video.path()
  const tempMp4 = `${outputPath}.tmp.mp4`
  const scale = outputSize.width === viewport.width && outputSize.height === viewport.height
    ? []
    : ['-vf', `scale=${outputSize.width}:${outputSize.height}`]
  const result = spawnSync('ffmpeg', [
    '-y', '-ss', String(trimSeconds), '-i', source, '-t', String(seconds), '-an', '-r', '60',
    ...scale, '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tempMp4,
  ], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${name}: ${result.stderr}`)
  renameSync(tempMp4, outputPath)
  safeRemove(dir)
  return { bytes: statSync(outputPath).size, actions }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const screenshotsOnly = process.argv.includes('--screenshots-only')
    const videosOnly = process.argv.includes('--videos-only')
    const captured = videosOnly ? false : await captureScreenshots(browser)
    if (screenshotsOnly) {
      console.log(`capture screenshot: ${captured ? 'created' : 'not reached'}`)
      return
    }
    const files = []
    files.push(['CrazyGames landscape', await record(
      browser,
      'crazy-landscape',
      { width: 1280, height: 720 },
      'summer-04',
      18,
      resolve(crazyDir, 'preview-landscape-a-1920x1080.mp4'),
      { width: 1920, height: 1080 },
    )])
    files.push(['CrazyGames portrait', await record(browser, 'crazy-portrait', { width: 1080, height: 1620 }, 'autumn-04', 18, resolve(crazyDir, 'preview-portrait-a-1080x1620.mp4'))])
    files.push(['Poki animated', await record(browser, 'poki-square', { width: 1080, height: 1080 }, 'spring-03', 5, resolve(pokiDir, 'poki-animated-a-1080.mp4'))])
    if (!videosOnly) console.log(`capture screenshot: ${captured ? 'created' : 'not reached'}`)
    for (const [label, result] of files) console.log(`${label}: ${(result.bytes / 1024 / 1024).toFixed(2)} MiB, ${result.actions} wolf actions`)
  } finally {
    await browser.close()
    safeRemove(tempDir)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
