import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const personaPath = fileURLToPath(new URL('../../../docs/产品核心/验证记录/2026-07-20-ai-v3-玩家画像矩阵.json', import.meta.url))
const candidatePath = fileURLToPath(new URL('../../../docs/产品核心/验证记录/2026-07-20-ai-v3-候选验收.json', import.meta.url))
const persona = JSON.parse(readFileSync(personaPath, 'utf8'))
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'))
const personas = ['novice', 'regular', 'skilled', 'expert']

for (const season of ['spring', 'summer', 'autumn', 'winter']) {
  const reports = persona.reports.filter((report) => report.levelId.startsWith(season))
  console.log(season, Object.fromEntries(personas.map((name) => [name, {
    wolf: reports.reduce((sum, report) => sum + report.summaries[name].wolfWins, 0),
    sheep: reports.reduce((sum, report) => sum + report.summaries[name].sheepWins, 0),
    draw: reports.reduce((sum, report) => sum + report.summaries[name].draws, 0),
  }])))
}

console.log('quality', Object.fromEntries(personas.map((name) => [name, {
  dominated: persona.reports.reduce((sum, report) => sum + report.summaries[name].dominatedSheepTurns, 0),
  higherChainExposure: persona.reports.reduce((sum, report) => sum + report.summaries[name].higherChainExposureTurns, 0),
  degraded: persona.reports.reduce((sum, report) => sum + report.summaries[name].degradedSheepTurns, 0),
}])))
console.log('candidate', candidate.reports.reduce((counts, report) => {
  counts[report.verdict] = (counts[report.verdict] ?? 0) + 1
  return counts
}, {}))
console.table(candidate.reports.map((report) => ({
  level: report.levelId,
  verdict: report.verdict,
  findings: report.findings.map((finding) => finding.code).join(','),
  personas: personas.map((name) => report.levelId && persona.reports
    .find((entry) => entry.levelId === report.levelId).summaries[name].wolfWins).join('/'),
  averagePlies: personas.map((name) => persona.reports
    .find((entry) => entry.levelId === report.levelId).summaries[name].averagePlies.toFixed(0)).join('/'),
  hunterShare: personas.map((name) => persona.reports
    .find((entry) => entry.levelId === report.levelId).summaries[name].averageDominantWolfShare.toFixed(2)).join('/'),
  hunterStreak: personas.map((name) => persona.reports
    .find((entry) => entry.levelId === report.levelId).summaries[name].maxSameHunterCaptureStreak).join('/'),
})))
