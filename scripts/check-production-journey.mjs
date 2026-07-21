import { chromium } from 'playwright'

const playerBase = process.env.FANGRUSH_PLAYER_URL ?? 'https://fangrush.com'
const adminBase = process.env.FANGRUSH_ADMIN_URL ?? 'https://admin.fangrush.com'
const playerRoutes = [
  { path: '/zh', marker: '\u56db\u5b63\u730e\u573a' },
  { path: '/zh/levels/spring', marker: '\u6625\u65e5 01' },
  { path: '/zh/play/spring-01', marker: '\u72fc\u56de\u5408', menu: true },
  { path: '/zh/how-to-play', marker: '\u91cd\u590d\u5c40\u9762' },
  { path: '/zh/settings', marker: '\u58f0\u97f3\u8bd5\u542c' },
  { path: '/zh/skins', marker: '\u730e\u573a' },
  { path: '/zh/quests', marker: '\u9886\u53d6' },
]
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch({ headless: true })
const results = []

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })
    for (const route of playerRoutes) {
      const errors = []
      const onPageError = (error) => errors.push(`pageerror: ${error.message}`)
      page.on('pageerror', onPageError)
      try {
        const response = await page.goto(`${playerBase}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        await page.waitForTimeout(800)
        const pageState = await page.evaluate((marker) => ({
          marker: document.body.innerText.includes(marker),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          title: document.title,
        }), route.marker)
        let menu = null
        if (route.menu) {
          let tutorialSteps = 0
          const tutorialButton = page.locator('div.fixed.inset-0.z-50 button').last()
          while (await tutorialButton.isVisible().catch(() => false)) {
            await tutorialButton.click()
            tutorialSteps += 1
            if (tutorialSteps > 10) throw new Error('onboarding did not finish within 10 steps')
          }
          const trigger = page.getByText('\u66f4\u591a', { exact: true }).first()
          menu = await trigger.isVisible().catch(() => false)
          if (menu) {
            await trigger.click()
            menu = await page.getByText('\u672c\u5c40\u9009\u9879', { exact: true }).isVisible().catch(() => false)
          }
        }
        results.push({
          surface: 'player',
          viewport: viewport.name,
          route: route.path,
          status: response?.status() ?? 0,
          marker: pageState.marker,
          overflow: pageState.overflow,
          menu,
          title: pageState.title,
          errors,
        })
      } catch (error) {
        results.push({ surface: 'player', viewport: viewport.name, route: route.path, error: String(error), errors })
      } finally {
        page.off('pageerror', onPageError)
      }
    }
    await page.close()
  }

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })
    const response = await page.goto(`${adminBase}/admin`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForTimeout(300)
    const pageState = await page.evaluate(() => ({
      gate: location.pathname === '/admin/gate',
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      title: document.title,
    }))
    results.push({
      surface: 'admin',
      viewport: viewport.name,
      route: new URL(page.url()).pathname,
      status: response?.status() ?? 0,
      marker: pageState.gate,
      overflow: pageState.overflow,
      menu: null,
      title: pageState.title,
      errors: [],
    })
    await page.close()
  }
} finally {
  await browser.close()
}

console.table(results.map(({ surface, viewport, route, status, marker, overflow, menu }) => ({
  surface,
  viewport,
  route,
  status,
  marker,
  overflow,
  menu,
})))

const failures = results.filter((result) => (
  result.error
  || result.status !== 200
  || !result.marker
  || result.overflow
  || result.errors.length > 0
  || result.menu === false
))

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2))
  process.exitCode = 1
} else {
  console.log(`production journey: PASS (${results.length} viewport-route checks)`)
}
