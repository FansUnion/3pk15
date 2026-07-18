import type { NextConfig } from 'next'
import { join } from 'node:path'

const nextConfig: NextConfig = {
  transpilePackages: ['@wolf-sheep/game-core', '@wolf-sheep/web-shared'],
  webpack(config) {
    config.resolve.alias['@/components/PlayScreen'] = join(process.cwd(), '../player-web/components/PlayScreen.tsx')
    config.resolve.alias['@/components/BoardSvg'] = join(process.cwd(), '../player-web/components/BoardSvg.tsx')
    config.resolve.alias['@/components/HelpContent'] = join(process.cwd(), '../player-web/components/HelpContent.tsx')
    config.resolve.alias['@/components/LocaleSwitcher'] = join(process.cwd(), '../player-web/components/LocaleSwitcher.tsx')
    config.resolve.alias['@/i18n/messages'] = join(process.cwd(), '../player-web/i18n/messages.ts')
    config.resolve.alias['@/i18n/use-client-locale'] = join(process.cwd(), '../player-web/i18n/use-client-locale.ts')
    config.resolve.alias['@/config/locales'] = join(process.cwd(), '../player-web/config/locales.ts')
    config.resolve.alias['@/lib/platform'] = join(process.cwd(), '../player-web/lib/platform.ts')
    config.resolve.alias['@/lib/ads'] = join(process.cwd(), '../player-web/lib/ads.ts')
    config.resolve.alias['@/lib/ai-fault'] = join(process.cwd(), '../player-web/lib/ai-fault.ts')
    config.resolve.alias['@/lib/candidate-replay'] = join(process.cwd(), '../player-web/lib/candidate-replay.ts')
    config.resolve.alias['@/lib/share-result'] = join(process.cwd(), '../player-web/lib/share-result.ts')
    config.resolve.alias['@/lib/play-store'] = join(process.cwd(), '../player-web/lib/play-store.ts')
    config.resolve.alias['@/lib/save-store'] = join(process.cwd(), '../player-web/lib/save-store.ts')
    config.resolve.alias['@/lib/sfx'] = join(process.cwd(), '../player-web/lib/sfx.ts')
    config.resolve.alias['@/lib/active-game'] = join(process.cwd(), '../player-web/lib/active-game.ts')
    config.resolve.alias['@/lib/storage'] = join(process.cwd(), '../player-web/lib/storage.ts')
    return config
  },
}
export default nextConfig
