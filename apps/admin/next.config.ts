import type { NextConfig } from 'next'
import { join } from 'node:path'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
  webpack(config) {
    config.resolve.alias['@/components/admin/adminBoardTheme'] = join(process.cwd(), 'components/adminBoardTheme.ts')
    config.resolve.alias['@/components/admin/SkinBoardPreview'] = join(process.cwd(), 'components/SkinBoardPreview.tsx')
    config.resolve.alias['@/components/admin/aiFixtures'] = join(process.cwd(), 'components/aiFixtures.ts')
    return config
  },
}
export default nextConfig
