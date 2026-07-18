import { cpSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
rmSync(join(appRoot, 'public'), { recursive: true, force: true })
cpSync(join(appRoot, '../../packages/web-assets/public'), join(appRoot, 'public'), { recursive: true })
