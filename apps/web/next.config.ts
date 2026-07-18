import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
  // Keep Turbopack's live cache separate from production builds.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
}

export default nextConfig
