/**
 * Seasonal meadow / frost board backgrounds — readable field, not Excel.
 * Run: pnpm --filter @wolf-sheep/web-assets generate:boards
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(__dirname, '../public/skins/boards')

function board(id, { base, mid, deep, line, accent, frost = false }) {
  const blades = frost
    ? `
    <path d="M8 22l1-6M14 24l-1-5M20 21l2-7" stroke="${line}" stroke-width="1.2" opacity="0.25" stroke-linecap="round"/>
    <circle cx="12" cy="10" r="1.4" fill="#ffffff" opacity="0.45"/>
    <circle cx="22" cy="16" r="1" fill="#ffffff" opacity="0.35"/>
    `
    : `
    <path d="M6 24c2-6 4-6 5 0M12 26c1-5 3-5 4 0M18 23c2-7 4-6 5 1M24 25c1-4 3-5 3 0" stroke="${accent}" stroke-width="1.4" opacity="0.4" stroke-linecap="round" fill="none"/>
    <circle cx="8" cy="10" r="1.8" fill="${accent}" opacity="0.35"/>
    <circle cx="20" cy="14" r="1.2" fill="${deep}" opacity="0.25"/>
    `

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g-${id}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${base}"/>
      <stop offset="55%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${deep}"/>
    </linearGradient>
    <pattern id="p-${id}" width="32" height="28" patternUnits="userSpaceOnUse">
      ${blades}
    </pattern>
    <radialGradient id="v-${id}" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.1"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="16" fill="url(#g-${id})"/>
  <rect width="512" height="512" rx="16" fill="url(#p-${id})"/>
  <rect width="512" height="512" rx="16" fill="url(#v-${id})"/>
  <rect x="20" y="20" width="472" height="472" rx="10" fill="none" stroke="${line}" stroke-width="4" opacity="0.4"/>
</svg>
`
}

const boards = {
  default: { base: '#e4f0d8', mid: '#cfe0bc', deep: '#b5cc9a', line: '#4a5c3e', accent: '#7a9a58' },
  spring: { base: '#e8f6d8', mid: '#d0eab0', deep: '#b4d888', line: '#4a7a3a', accent: '#8aba58' },
  summer: { base: '#f2e8c0', mid: '#e4d090', deep: '#c8b060', line: '#6a5a28', accent: '#c4a035' },
  autumn: { base: '#f2dcb8', mid: '#e4b878', deep: '#c88848', line: '#7a4020', accent: '#c47848' },
  winter: { base: '#e8f0f6', mid: '#d0dde8', deep: '#b0c4d4', line: '#3a5566', accent: '#8eb0c0', frost: true },
}

fs.mkdirSync(dir, { recursive: true })
for (const [name, cols] of Object.entries(boards)) {
  fs.writeFileSync(path.join(dir, `${name}.svg`), board(name, cols))
}
console.log('boards ok')
