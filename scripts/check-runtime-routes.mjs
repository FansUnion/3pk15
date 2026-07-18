const playerBase = process.env.PLAYER_URL ?? 'http://localhost:5003'
const adminBase = process.env.ADMIN_URL ?? 'http://localhost:5002'
const chapters = ['spring', 'summer', 'autumn', 'winter']
const levelIds = chapters.flatMap((chapter) =>
  Array.from({ length: 6 }, (_, index) => `${chapter}-${String(index + 1).padStart(2, '0')}`),
)

const checks = [
  ...['/', '/chapters', '/levels/spring', ...levelIds.map((id) => `/play/${id}`)].map((path) => ({
    base: playerBase,
    path,
    label: `player ${path}`,
  })),
  ...['/admin/gate', '/admin', '/admin/levels', '/admin/skins', '/admin/ai', ...levelIds.map((id) => `/admin/play/${id}`)].map((path) => ({
    base: adminBase,
    path,
    label: `admin ${path}`,
  })),
]

const failures = []
for (const check of checks) {
  let status = 'request-error'
  try {
    const response = await fetch(new URL(check.path, check.base))
    status = response.status
    if (!response.ok) failures.push(`${check.label}: ${status}`)
  } catch (error) {
    failures.push(`${check.label}: ${error instanceof Error ? error.message : String(error)}`)
  }
  console.log(`${status} ${check.label}`)
}

if (failures.length) {
  console.error(`check:runtime-routes: FAIL (${failures.length}/${checks.length})`)
  process.exit(1)
}

console.log(`check:runtime-routes: PASS (${checks.length} routes)`)
