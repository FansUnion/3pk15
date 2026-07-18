import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
  webpack(config) {
    const path = require('node:path')
    config.resolve.alias['@/components/PlayScreen'] = path.join(process.cwd(), 'components/PlayScreen.tsx')
    return config
  },
}

export default nextConfig
