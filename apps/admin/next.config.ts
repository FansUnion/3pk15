import type { NextConfig } from 'next'
import { join } from 'node:path'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
  webpack(config) {
    config.resolve.alias['@/components/admin/adminBoardTheme'] = join(process.cwd(), 'components/adminBoardTheme.ts')
    return config
  },
}
export default nextConfig
