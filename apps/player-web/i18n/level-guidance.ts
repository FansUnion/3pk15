import { getWolfStrategy, levelTeachingPoint, type LevelConfig } from '@wolf-sheep/game-core'
import type { SupportedLocale } from '@/config/locales'

export function buildLevelGuidance(level: LevelConfig, locale: SupportedLocale): [string, string, string] {
  const primary = getWolfStrategy(level.strategy.primary)
  const secondary = getWolfStrategy(level.strategy.secondary)

  return locale === 'zh'
    ? [primary.signalZh, levelTeachingPoint(level, locale), `${primary.objectiveZh} ${secondary.summaryZh}`]
    : [primary.signalEn, levelTeachingPoint(level, locale), `${primary.objectiveEn} ${secondary.summaryEn}`]
}
