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
    config.resolve.alias['@/lib/candidate-baseline'] = join(process.cwd(), 'lib/candidate-baseline.ts')
    config.resolve.alias['@/lib/candidate-counterexamples'] = join(process.cwd(), 'lib/candidate-counterexamples.ts')
    config.resolve.alias['@/lib/candidate-handoff'] = join(process.cwd(), 'lib/candidate-handoff.ts')
    config.resolve.alias['@/lib/candidate-reports'] = join(process.cwd(), 'lib/candidate-reports.ts')
    config.resolve.alias['@/lib/candidate-replay'] = join(process.cwd(), '../player-web/lib/candidate-replay.ts')
    config.resolve.alias['@/lib/share-result'] = join(process.cwd(), '../player-web/lib/share-result.ts')
    config.resolve.alias['@/lib/play-store'] = join(process.cwd(), '../player-web/lib/play-store.ts')
    config.resolve.alias['@/lib/save-store'] = join(process.cwd(), '../player-web/lib/save-store.ts')
    config.resolve.alias['@/lib/sfx'] = join(process.cwd(), '../player-web/lib/sfx.ts')
    config.resolve.alias['@/lib/active-game'] = join(process.cwd(), '../player-web/lib/active-game.ts')
    config.resolve.alias['@/lib/storage'] = join(process.cwd(), '../player-web/lib/storage.ts')
    config.resolve.alias['@/lib/admin-level-reviews'] = join(process.cwd(), 'lib/admin-level-reviews.ts')
    config.resolve.alias['@/lib/play-metrics'] = join(process.cwd(), 'lib/play-metrics.ts')
    return config
  },
}
export default nextConfig
