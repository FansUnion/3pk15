import type { NextConfig } from 'next'
import { join } from 'node:path'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
  webpack(config) {
    config.resolve.alias['@/components/admin/adminBoardTheme'] = join(process.cwd(), 'components/adminBoardTheme.ts')
    config.resolve.alias['@/components/admin/SkinBoardPreview'] = join(process.cwd(), 'components/SkinBoardPreview.tsx')
    config.resolve.alias['@/components/admin/aiFixtures'] = join(process.cwd(), 'components/aiFixtures.ts')
    config.resolve.alias['@/components/admin/AdminPlayScreen'] = join(process.cwd(), 'components/AdminPlayScreen.tsx')
    config.resolve.alias['@/components/admin/AiSimConsole'] = join(process.cwd(), 'components/AiSimConsole.tsx')
    config.resolve.alias['@/components/admin/AdminLevelWorkbench'] = join(process.cwd(), 'components/AdminLevelWorkbench.tsx')
    config.resolve.alias['@/lib/admin-level-reviews'] = join(process.cwd(), 'lib/admin-level-reviews.ts')
    config.resolve.alias['@/lib/play-metrics'] = join(process.cwd(), 'lib/play-metrics.ts')
    return config
  },
}
export default nextConfig
