import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))
const outputPath = process.env.CANDIDATE_OUTPUT_PATH
  ?? fileURLToPath(new URL('../../../docs/产品核心/验证记录/2026-07-20-ai-v5-候选验收.json', import.meta.url))
const tempDir = join(tmpdir(), 'fangrush-candidate-v5')
mkdirSync(tempDir, { recursive: true })

const seasons = process.env.CANDIDATE_ONLY_CHAPTER
  ? [process.env.CANDIDATE_ONLY_CHAPTER]
  : ['spring', 'summer', 'autumn', 'winter']
const levels = process.env.CANDIDATE_ONLY_LEVEL
  ? [process.env.CANDIDATE_ONLY_LEVEL]
  : seasons.flatMap((season) =>
    Array.from({ length: 6 }, (_, index) => `${season}-${String(index + 1).padStart(2, '0')}`))
const strategies = ['random', 'mixed', 'chain-aware']
const seedChunks = [
  Array.from({ length: 5 }, (_, index) => 20260717 + index),
  Array.from({ length: 5 }, (_, index) => 20260722 + index),
]
const winterSeedChunks = Array.from({ length: 5 }, (_, chunk) =>
  Array.from({ length: 2 }, (_, index) => 20260717 + chunk * 2 + index))

function chunksForLevel(levelId) {
  return levelId.startsWith('winter-')
    ? winterSeedChunks.map((seeds, index) => ({ seeds, chunk: `w${index}` }))
    : seedChunks.map((seeds, index) => ({ seeds, chunk: String(index) }))
}

function runVitest(env, label) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
    const args = process.platform === 'win32'
      ? ['-NoProfile', '-Command', 'pnpm exec vitest run tests/candidate-acceptance.test.ts -t "production level candidate" --reporter=dot']
      : ['exec', 'vitest', 'run', 'tests/candidate-acceptance.test.ts', '-t', 'production level candidate', '--reporter=dot']
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${label} failed with ${code}`)))
  })
}

let completed = false
try {
  const jobs = levels.flatMap((levelId) => strategies.flatMap((strategy) =>
    chunksForLevel(levelId).map(({ seeds, chunk }) => ({ levelId, strategy, seeds, chunk }))))
  for (let index = 0; index < jobs.length; index += 4) {
    await Promise.all(jobs.slice(index, index + 4).map(({ levelId, strategy, seeds, chunk }) => {
      const reportPath = join(tempDir, `${levelId}-${strategy}-${chunk}.json`)
      if (existsSync(reportPath)) return Promise.resolve()
      return runVitest({
        RUN_CANDIDATE_PARTIAL: '1',
        CANDIDATE_LEVEL: levelId,
        CANDIDATE_STRATEGY: strategy,
        CANDIDATE_SEEDS: JSON.stringify(seeds),
        CANDIDATE_REPORT_PATH: reportPath,
      }, `${levelId}/${strategy}/${chunk}`)
    }))
  }
  await runVitest({
    RUN_CANDIDATE_AGGREGATE: '1',
    CANDIDATE_INPUT_DIR: tempDir,
    CANDIDATE_OUTPUT_PATH: outputPath,
    CANDIDATE_LEVELS: JSON.stringify(levels),
  }, 'candidate aggregate')
  completed = true
} finally {
  if (completed) rmSync(tempDir, { recursive: true, force: true })
}
