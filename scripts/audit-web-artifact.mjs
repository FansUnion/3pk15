#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const serverApp = join(root, 'apps/web/.next/server/app')
const strict = process.argv.includes('--strict')

if (!existsSync(serverApp)) {
  console.error('No web build artifact found. Run a web production build first.')
  process.exit(1)
}

function walk(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) walk(path, files)
    else files.push(relative(serverApp, path).split(sep).join('/'))
  }
  return files
}

const files = walk(serverApp)
const forbiddenPrefixes = ['admin/', 'api/admin/']
const forbidden = files.filter((file) => forbiddenPrefixes.some((prefix) => file.startsWith(prefix)))

console.log(`audit:web-artifact: ${files.length} server app files`)
console.log(`audit:web-artifact: ${forbidden.length} Admin/API artifacts`)

if (forbidden.length) {
  for (const file of forbidden) console.log(`FORBIDDEN ${file}`)
  if (strict) {
    console.error('Strict portal audit failed: Admin code is still present in the build artifact.')
    process.exit(1)
  }
  console.warn('Portal runtime blocks Admin, but the current Next build does not physically remove it.')
}

if (!forbidden.length) console.log('audit:web-artifact: PASS')
