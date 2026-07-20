import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))
const outputPath = fileURLToPath(new URL('../../../docs/产品核心/验证记录/2026-07-20-ai-v3-玩家画像矩阵.json', import.meta.url))
const tempDir = join(tmpdir(), `fangrush-persona-v3-${process.pid}`)
mkdirSync(tempDir, { recursive: true })
const levels = ['spring', 'summer', 'autumn', 'winter'].flatMap((season) =>
  Array.from({ length: 6 }, (_, index) => `${season}-${String(index + 1).padStart(2, '0')}`))

function runLevel(levelId) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
    const args = process.platform === 'win32'
      ? ['-NoProfile', '-Command', 'pnpm exec vitest run tests/persona-matrix-v3.test.ts --reporter=dot']
      : ['exec', 'vitest', 'run', 'tests/persona-matrix-v3.test.ts', '--reporter=dot']
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        RUN_PERSONA_MATRIX: '1',
        PERSONA_LEVEL: levelId,
        PERSONA_REPORT_PATH: join(tempDir, `${levelId}.json`),
      },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${levelId} matrix failed with ${code}`)))
  })
}

try {
  for (let index = 0; index < levels.length; index += 4) {
    await Promise.all(levels.slice(index, index + 4).map(runLevel))
  }
  const partials = levels.map((levelId) => JSON.parse(readFileSync(join(tempDir, `${levelId}.json`), 'utf8')))
  const output = {
    generatedAt: new Date().toISOString(),
    aiAlgorithmVersion: partials[0].aiAlgorithmVersion,
    seeds: partials[0].seeds,
    reports: partials.flatMap((partial) => partial.reports),
  }
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
