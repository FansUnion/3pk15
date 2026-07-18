import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
}

export default nextConfig
