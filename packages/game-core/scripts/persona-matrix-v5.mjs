import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))
const outputPath = fileURLToPath(new URL('../../../docs/产品核心/验证记录/2026-07-20-ai-v5-主动对手矩阵.json', import.meta.url))
const tempDir = join(tmpdir(), 'fangrush-persona-v5b')
mkdirSync(tempDir, { recursive: true })
const levels = ['spring', 'summer', 'autumn', 'winter'].flatMap((season) =>
  Array.from({ length: 6 }, (_, index) => `${season}-${String(index + 1).padStart(2, '0')}`))

const seedChunks = [
  Array.from({ length: 5 }, (_, index) => 20260720 + index),
  Array.from({ length: 5 }, (_, index) => 20260725 + index),
]
const autumnSeedChunks = Array.from({ length: 5 }, (_, chunk) =>
  Array.from({ length: 2 }, (_, index) => 20260720 + chunk * 2 + index))
const singleSeedChunks = Array.from({ length: 10 }, (_, index) => [20260720 + index])
const personas = ['novice', 'regular', 'skilled', 'expert']

function chunksForLevel(levelId) {
  if (/^winter-0[3-6]$/.test(levelId)) return personas.flatMap((persona) =>
    singleSeedChunks.map((seeds, index) => ({ seeds, chunk: `wpp-${persona}-${index}`, persona })))
  if (levelId.startsWith('winter-')) return singleSeedChunks.map((seeds, index) => ({ seeds, chunk: `ws${index}` }))
  if (levelId === 'autumn-05' || levelId === 'autumn-06') return singleSeedChunks.map((seeds, index) => ({ seeds, chunk: `as${index}` }))
  if (levelId.startsWith('autumn-')) return autumnSeedChunks.map((seeds, index) => ({ seeds, chunk: `a${index}` }))
  return seedChunks.map((seeds, index) => ({ seeds, chunk: String(index) }))
}

function runLevel(levelId, seeds, chunk, persona) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
    const args = process.platform === 'win32'
      ? ['-NoProfile', '-Command', 'pnpm exec vitest run tests/persona-matrix-v5.test.ts --reporter=dot']
      : ['exec', 'vitest', 'run', 'tests/persona-matrix-v5.test.ts', '--reporter=dot']
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        RUN_PERSONA_MATRIX: '1',
        PERSONA_LEVEL: levelId,
        PERSONA_SEEDS: JSON.stringify(seeds),
        ...(persona ? { PERSONA_NAME: persona } : {}),
        PERSONA_REPORT_PATH: join(tempDir, `${levelId}-${chunk}.json`),
      },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${levelId} matrix failed with ${code}`)))
  })
}

function summarizeGames(games, persona) {
  const selected = games.filter((game) => game.persona === persona)
  const turns = selected.reduce((sum, game) => sum + game.sheepTurns, 0)
  const transitions = selected.reduce((sum, game) => sum + Math.max(0, game.sheepTurns - 1), 0)
  return {
    games: selected.length,
    wolfWins: selected.filter((game) => game.winner === 'wolf').length,
    sheepWins: selected.filter((game) => game.winner === 'sheep').length,
    draws: selected.filter((game) => game.winner === 'draw').length,
    averagePlies: selected.reduce((sum, game) => sum + game.plies, 0) / Math.max(1, selected.length),
    averageEaten: selected.reduce((sum, game) => sum + game.eaten, 0) / Math.max(1, selected.length),
    averageDominantWolfShare: selected.reduce((sum, game) => sum + game.dominantWolfShare, 0) / Math.max(1, selected.length),
    maxSameHunterCaptureStreak: Math.max(0, ...selected.map((game) => game.sameHunterCaptureStreak)),
    dominatedSheepTurns: selected.reduce((sum, game) => sum + game.dominatedSheepTurns, 0),
    higherChainExposureTurns: selected.reduce((sum, game) => sum + game.higherChainExposureTurns, 0),
    degradedSheepTurns: selected.reduce((sum, game) => sum + game.degradedSheepTurns, 0),
    activePressureRate: selected.reduce((sum, game) => sum + game.activePressureTurns, 0) / Math.max(1, turns),
    targetPersistenceRate: selected.reduce((sum, game) => sum + game.targetPersistentTurns, 0) / Math.max(1, transitions),
    noProgressRate: selected.reduce((sum, game) => sum + game.noProgressTurns, 0) / Math.max(1, turns),
    styleAlignmentRate: selected.reduce((sum, game) => sum + game.styleAlignedTurns, 0) / Math.max(1, turns),
    beneficialExchangeTurns: selected.reduce((sum, game) => sum + game.beneficialExchangeTurns, 0),
    trapProgressTurns: selected.reduce((sum, game) => sum + game.trapProgressTurns, 0),
    hunterCounterTurns: selected.reduce((sum, game) => sum + game.hunterCounterTurns, 0),
  }
}

let completed = false
try {
  const jobs = levels.flatMap((levelId) => chunksForLevel(levelId).map(({ seeds, chunk, persona }) => ({ levelId, seeds, chunk, persona })))
  for (let index = 0; index < jobs.length; index += 4) {
    await Promise.all(jobs.slice(index, index + 4).map(({ levelId, seeds, chunk, persona }) => {
      const reportPath = join(tempDir, `${levelId}-${chunk}.json`)
      try {
        readFileSync(reportPath, 'utf8')
        return Promise.resolve()
      } catch {
        return runLevel(levelId, seeds, chunk, persona)
      }
    }))
  }
  const partials = jobs.map(({ levelId, chunk }) => JSON.parse(readFileSync(join(tempDir, `${levelId}-${chunk}.json`), 'utf8')))
  const reports = levels.map((levelId) => {
    const levelPartials = partials.filter((partial) => partial.reports[0].levelId === levelId)
    const first = levelPartials[0].reports[0]
    const games = levelPartials.flatMap((partial) => partial.reports[0].games)
    return {
      levelId,
      aiProfile: first.aiProfile,
      aiStyle: first.aiStyle,
      opponentIntent: first.opponentIntent,
      seeds: [...new Set(chunksForLevel(levelId).flatMap((chunk) => chunk.seeds))],
      games,
      summaries: Object.fromEntries(personas.map((persona) => [persona, summarizeGames(games, persona)])),
    }
  })
  const output = {
    generatedAt: new Date().toISOString(),
    aiAlgorithmVersion: partials[0].aiAlgorithmVersion,
    evidenceScope: '24 levels x 4 independent wolf personas x 10 fixed seeds = 960 proxy games',
    seeds: seedChunks.flat(),
    reports,
  }
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  await new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'powershell.exe' : 'pnpm'
    const args = process.platform === 'win32'
      ? ['-NoProfile', '-Command', 'pnpm exec vitest run tests/persona-matrix-v5.test.ts --reporter=dot']
      : ['exec', 'vitest', 'run', 'tests/persona-matrix-v5.test.ts', '--reporter=dot']
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, RUN_PERSONA_CURVE: '1', PERSONA_CURVE_REPORT_PATH: outputPath },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`curve assessment failed with ${code}`)))
  })
  completed = true
} finally {
  if (completed) rmSync(tempDir, { recursive: true, force: true })
}
